import fs from 'fs-extra';
import child_process from 'child_process';
import archiver from 'archiver';

const PLATFORMS = ['chrome', 'firefox', 'edge', 'opera'];
const GIT_URL = 'https://github.com/bewisse/modheader.git';

function zipDirectory(source, destFile) {
  const output = fs.createWriteStream(destFile);
  const archive = archiver('zip');

  output.on('close', () => {
    console.log(archive.pointer() + ' total bytes');
    console.log(`Finished creating ${destFile}`);
  });

  archive.on('error', (err) => {
    throw err;
  });
  archive.pipe(output);
  archive.directory(source, false);
  archive.finalize();
}

fs.ensureDirSync('releases');
fs.emptyDirSync('releases');
for (const platform of PLATFORMS) {
  child_process.execSync(`npm run build-${platform}`);
  fs.copySync('dist', `releases/${platform}/`);
  zipDirectory(`releases/${platform}`, `releases/${platform}.zip`);
}

child_process.execSync(`git clone ${GIT_URL} releases/master`);
fs.emptyDirSync('releases/master/.git');
zipDirectory('releases/master', 'releases/master.zip');
