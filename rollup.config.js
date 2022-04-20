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
const URL_BASE = process.env.URL_BASE || 'https://modheader.com';

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
      },
      emitCss: false
    }),
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
