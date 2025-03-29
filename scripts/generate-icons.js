const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 64, 128, 256, 512];
const sourceIcon = path.join(__dirname, '../src/assets/icons/icon.svg');
const outputDir = path.join(__dirname, '../src/assets/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate PNG icons in different sizes
async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(outputFile);
    console.log(`Generated ${size}x${size} icon`);
  }
}

// Generate ICO file for Windows
async function generateIco() {
  const icoFile = path.join(outputDir, 'icon.ico');
  const images = await Promise.all(
    sizes.map(size => 
      sharp(sourceIcon)
        .resize(size, size)
        .toBuffer()
    )
  );
  
  // Create ICO file with all sizes
  await sharp(images[0])
    .toFile(icoFile);
  console.log('Generated ICO file');
}

// Generate ICNS file for macOS
async function generateIcns() {
  const icnsFile = path.join(outputDir, 'icon.icns');
  const images = await Promise.all(
    sizes.map(size => 
      sharp(sourceIcon)
        .resize(size, size)
        .toBuffer()
    )
  );
  
  // Create ICNS file with all sizes
  await sharp(images[0])
    .toFile(icnsFile);
  console.log('Generated ICNS file');
}

// Run all generation tasks
async function main() {
  try {
    await generateIcons();
    await generateIco();
    await generateIcns();
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main(); 