// Script to generate stickerManifest.json from StickersGenshin folder structure
const fs = require('fs');
const path = require('path');

const stickersDir = path.join(__dirname, '../public/StickersGenshin');
const outputManifest = path.join(__dirname, '../src/assets/stickerManifest.json');

function getFolders(dir) {
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
}

function getFiles(dir) {
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
}

function generateManifest() {
  const manifest = {};
  const folders = getFolders(stickersDir);
  folders.forEach(folder => {
    const files = getFiles(path.join(stickersDir, folder));
    manifest[folder] = files;
  });
  return manifest;
}

function main() {
  const manifest = generateManifest();
  fs.writeFileSync(outputManifest, JSON.stringify(manifest, null, 2));
  console.log('stickerManifest.json generated successfully!');
}

main();
