import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import zip from 'rollup-plugin-zip';
import svelte from 'rollup-plugin-svelte';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension';
import { emptyDir } from 'rollup-plugin-empty-dir';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/manifest.json',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [
    copy({
      targets: [
        {
          src: 'svelte-material-ui/bare.css',
          dest: 'src/svelte-material-ui.css',
          copyOnce: true
        }
      ]
    }),
    replace({
      preventAssignment: true,
      'process.env.BROWSER': JSON.stringify(process.env.BROWSER)
    }),
    chromeExtension({
      extendManifest: (manifest) => {
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
      compilerOptions: {
        dev: !production
      }
    }),
    postcss({ minimize: production }),
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
