// Script to generate stickerManifest.json from StickersGenshin folder structure
const fs = require('fs');
const path = require('path');


const stickersDir = path.join(__dirname, '../public/StickersGenshin');
const outputManifest = path.join(__dirname, '../src/assets/stickerManifest.json');
const CLOUDINARY_CLOUD_NAME = 'dfgbvttov';
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

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
    manifest[folder] = files.map(f => `${CLOUDINARY_BASE}StickersGenshin/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);
  });
  return manifest;
}

function main() {
  const manifest = generateManifest();
  fs.writeFileSync(outputManifest, JSON.stringify(manifest, null, 2));
  console.log('stickerManifest.json generated successfully!');
}

main();
