import css from 'rollup-plugin-css-only';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import zip from 'rollup-plugin-zip';
import svelte from 'rollup-plugin-svelte';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import cssModules from 'svelte-preprocess-cssmodules';
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension';
import { emptyDir } from 'rollup-plugin-empty-dir';

const production = !process.env.ROLLUP_WATCH;
const URL_BASE = production ? 'https://modheader.com' : 'http://localhost:3005';
const CHECK_LOGIN_URL = production
  ? 'https://modheader.com/u/extension-signed-in'
  : 'http://localhost/u/extension-signed-in';

function insertCssPlugin() {
  return {
    name: 'insert-css',
    generateBundle(options, bundle) {
      if (bundle && bundle['popup.html']) {
        const popupHtml = bundle['popup.html'].source;
        this.emitFile({
          type: 'asset',
          fileName: 'popup.html',
          source: popupHtml.replace('</head>', '<link rel="stylesheet" href="bundle.css"></head>')
        });
      }
    }
  };
}

export default {
  input: 'src/manifest.json',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.BROWSER': JSON.stringify(process.env.BROWSER),
      'process.env.CHECK_LOGIN_URL': JSON.stringify(CHECK_LOGIN_URL),
      'process.env.URL_BASE': JSON.stringify(URL_BASE)
    }),
    chromeExtension({
      extendManifest: (manifest) => {
        if (!production) {
          manifest.externally_connectable.matches.push('*://localhost/*');
        }
        if (process.env.BROWSER === 'firefox') {
          manifest.browser_specific_settings = {
            gecko: {
              id: '{ed630365-1261-4ba9-a676-99963d2b4f54}',
              strict_min_version: '68.0'
            }
          };
        }
        return manifest;
      }
    }),
    simpleReloader(),
    svelte({
      preprocess: [cssModules()],
      compilerOptions: {
        dev: !production
      }
    }),
    css({
      output: 'bundle.css'
    }),
    insertCssPlugin(),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    // Empties the output dir before a new build
    emptyDir(),
    // If we're building for production, minify
    production && terser(),
    // Outputs a zip file in ./releases
    production && zip({ dir: 'releases' })
  ]
};
