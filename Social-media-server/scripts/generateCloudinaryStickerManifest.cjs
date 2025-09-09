// Script to generate stickerManifest.json from Cloudinary using env variables
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function generateManifest() {
  // You can automate folder discovery, but for now, list your folders here:
  const folders = [
    'Aether', 'Albedo', 'Amber', 'Arataki Itto', 'Ayaka', 'Barbara', 'Beidou', 'Bennett', 'Chongyun', 'Dainsleif', 'Diluc', 'Diona', 'Eula', 'Fischl', 'Ganyu', 'Gorou', 'Hu Tao', 'Jean', 'Kaeya', 'Kazuha', 'Keqing', 'Klee', 'Kokomi', 'Kujo Sara', 'Lisa', 'Lumine', 'Mona', 'Ningguang', 'Noelle', 'Others', 'Paimon', 'Qiqi', 'Raiden Shogun', 'Razor', 'Rosaria', 'Sayu', 'Shenhe', 'Sucrose', 'Tartaglia', 'Thoma', 'Venti', 'Xiangling', 'Xiao', 'Xingqiu', 'Xinyan', 'Yae Miko', 'Yanfei', 'Yoimiya', 'Yun Jin', 'Zhongli'
  ];
  const manifest = {};

  for (const folder of folders) {
    const res = await cloudinary.search
      .expression(`folder:StickersGenshin/${folder}`)
      .max_results(500)
      .execute();
    manifest[folder] = res.resources.map(r => r.secure_url);
  }

  fs.writeFileSync('/workspaces/Social-media/Social-media-client/src/assets/stickerManifest.json', JSON.stringify(manifest, null, 2));
  console.log('Manifest generated!');
}

generateManifest();
