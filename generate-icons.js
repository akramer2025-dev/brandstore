const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const logo = 'public/logo.png';
  
  // Generate 192x192 icon
  await sharp(logo)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 124, g: 58, b: 237, alpha: 1 }
    })
    .toFile('public/icon-192x192.png');
  
  console.log('✅ Generated icon-192x192.png');

  // Generate 512x512 icon
  await sharp(logo)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 124, g: 58, b: 237, alpha: 1 }
    })
    .toFile('public/icon-512x512.png');
  
  console.log('✅ Generated icon-512x512.png');

  // Generate apple-touch-icon
  await sharp(logo)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 124, g: 58, b: 237, alpha: 1 }
    })
    .toFile('public/apple-touch-icon.png');
  
  console.log('✅ Generated apple-touch-icon.png');

  console.log('\n✨ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
