/**
 * Grimoire
 * Icon Preparation Script
 * 
 * This script prepares icon files for all platforms (Windows, macOS, Linux)
 * from a source PNG file.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_ICON = path.resolve(__dirname, '../src/assets/icons/icon.png');
const ICONS_DIR = path.resolve(__dirname, '../src/assets/icons');

// Ensure the icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  console.log('Created icons directory');
}

// Check if ImageMagick is installed
function checkImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.warn('ImageMagick is not installed. Please install it to generate icons automatically.');
    console.warn('On Linux: sudo apt-get install imagemagick');
    console.warn('On macOS: brew install imagemagick');
    console.warn('On Windows: https://imagemagick.org/script/download.php');
    return false;
  }
}

// Generate Windows .ico file
function generateWindowsIcon() {
  const icoPath = path.join(ICONS_DIR, 'icon.ico');
  
  if (fs.existsSync(icoPath)) {
    console.log('Windows icon already exists');
    return;
  }

  if (checkImageMagick()) {
    console.log('Generating Windows icon...');
    
    const sizes = [16, 24, 32, 48, 64, 128, 256];
    const command = `convert ${SOURCE_ICON} -define icon:auto-resize=${sizes.join(',')} ${icoPath}`;
    
    try {
      execSync(command);
      console.log('Windows icon generated successfully');
    } catch (error) {
      console.error('Failed to generate Windows icon:', error.message);
    }
  }
}

// Generate macOS .icns file
function generateMacOSIcon() {
  const icnsPath = path.join(ICONS_DIR, 'icon.icns');
  
  if (fs.existsSync(icnsPath)) {
    console.log('macOS icon already exists');
    return;
  }

  if (checkImageMagick()) {
    console.log('Generating macOS icon...');
    
    const iconsetPath = path.join(ICONS_DIR, 'icon.iconset');
    if (!fs.existsSync(iconsetPath)) {
      fs.mkdirSync(iconsetPath, { recursive: true });
    }
    
    // Generate different sizes for macOS
    const sizes = [16, 32, 64, 128, 256, 512, 1024];
    sizes.forEach(size => {
      const doubleSize = size * 2;
      
      // Standard resolution
      execSync(`convert ${SOURCE_ICON} -resize ${size}x${size} ${path.join(iconsetPath, `icon_${size}x${size}.png`)}`);
      
      // High resolution (retina)
      if (doubleSize <= 1024) {
        execSync(`convert ${SOURCE_ICON} -resize ${doubleSize}x${doubleSize} ${path.join(iconsetPath, `icon_${size}x${size}@2x.png`)}`);
      }
    });
    
    try {
      // Use iconutil on macOS to create .icns file
      if (process.platform === 'darwin') {
        execSync(`iconutil -c icns -o ${icnsPath} ${iconsetPath}`);
      } else {
        console.warn('Creating .icns files requires macOS. The iconset has been prepared, but final conversion will need to be done on a Mac.');
      }
      console.log('macOS icon generated successfully');
    } catch (error) {
      console.error('Failed to generate macOS icon:', error.message);
    }
  }
}

// Generate Linux icons (multiple sizes)
function generateLinuxIcons() {
  console.log('Preparing Linux icons...');
  
  if (checkImageMagick()) {
    const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
    
    sizes.forEach(size => {
      const pngPath = path.join(ICONS_DIR, `${size}x${size}.png`);
      
      if (!fs.existsSync(pngPath)) {
        try {
          execSync(`convert ${SOURCE_ICON} -resize ${size}x${size} ${pngPath}`);
          console.log(`Generated ${size}x${size}.png`);
        } catch (error) {
          console.error(`Failed to generate ${size}x${size}.png:`, error.message);
        }
      }
    });
  }
}

// Main function
function main() {
  console.log('Starting icon preparation...');
  
  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Source icon not found: ${SOURCE_ICON}`);
    console.error('Please provide a high-resolution PNG file at the specified path');
    process.exit(1);
  }
  
  generateWindowsIcon();
  generateMacOSIcon();
  generateLinuxIcons();
  
  console.log('Icon preparation completed!');
}

main(); 