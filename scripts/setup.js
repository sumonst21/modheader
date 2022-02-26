const fs = require('fs-extra');
const path = require('path');

fs.copySync(
  path.join(__dirname, '..', 'node_modules/svelte-material-ui/bare.css'),
  path.join(__dirname, '..', 'src/svelte-material-ui.css')
);
