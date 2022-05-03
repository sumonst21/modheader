import ChromeExtension from 'crx';
import fs from 'fs';
import path from 'path';

const extensionDir = path.join(__dirname, '..', '..');
const distDir = path.join(extensionDir, 'dist');
const buildDir = path.join(__dirname, 'build');

export async function packageExtension() {
  const signerSecrets = fs.readFileSync(path.join(__dirname, 'test-crx.pem'));
  const crx = new ChromeExtension({
    rootDirectory: distDir,
    privateKey: signerSecrets
  });
  const crxBuffer = await crx.pack();
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
  fs.writeFileSync(path.join(buildDir, 'modheader.crx'), crxBuffer);
  return path.join(buildDir, 'modheader.crx');
}
