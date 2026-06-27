const sharp = require('sharp');

const logoPath = 'public/LOGO no bg.webp';
const outputPath = 'public/og-card.webp';

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fff8ef"/>
</svg>`;

async function generateOgCard() {
  const logo = await sharp(logoPath)
    .resize(520, 360, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .linear(0.45, 0)
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: 340, top: 135 }])
    .webp({ quality: 92 })
    .toFile(outputPath);

  console.log(`Generated ${outputPath}`);
}

generateOgCard().catch((error) => {
  console.error(error);
  process.exit(1);
});
