#!/bin/bash

# Script to generate placeholder PWA icon files
# This script generates simple colored squares with size text
# for development purposes

# Ensure directories exist
mkdir -p icons
mkdir -p screenshots

# Define icon sizes
ICON_SIZES=(72 96 128 144 152 192 384 512)

# Function to generate a placeholder icon with ImageMagick
generate_icon() {
  local size=$1
  local color="#1a9fff"  # Blue color matching our theme
  local output_path="icons/icon-${size}x${size}.png"
  
  echo "Generating $output_path..."
  
  # Use ImageMagick to create a colored square with text
  convert -size "${size}x${size}" xc:"$color" \
    -gravity center \
    -pointsize $(( size / 5 )) \
    -fill white \
    -font "Arial" \
    -draw "text 0,0 '${size}px'" \
    "$output_path"
}

# Generate each icon size
for size in "${ICON_SIZES[@]}"; do
  generate_icon "$size"
done

# Generate maskable icon (with padding for safe area)
echo "Generating maskable icon..."
convert -size "192x192" xc:"#1a9fff" \
  -gravity center \
  -fill "#1a9fff" \
  -draw "roundrectangle 0,0 192,192 30,30" \
  -fill white \
  -pointsize 30 \
  -draw "text 0,0 'SDDE'" \
  "icons/maskable-icon.png"

# Generate badge icon for notifications
echo "Generating badge icon..."
convert -size "96x96" xc:"#1a9fff" \
  -gravity center \
  -fill white \
  -pointsize 40 \
  -draw "text 0,0 'SDDE'" \
  "icons/badge-icon.png"

# Generate demo screenshot for desktop
echo "Generating desktop screenshot placeholder..."
convert -size "1280x720" xc:"#121212" \
  -gravity center \
  -fill "#1a9fff" \
  -pointsize 40 \
  -draw "text 0,0 'SDDE Desktop Screenshot'" \
  "screenshots/desktop.png"

# Generate demo screenshot for mobile
echo "Generating mobile screenshot placeholder..."
convert -size "750x1334" xc:"#121212" \
  -gravity center \
  -fill "#1a9fff" \
  -pointsize 40 \
  -draw "text 0,0 'SDDE Mobile Screenshot'" \
  "screenshots/mobile.png"

# Generate demo icon for shortcuts
echo "Generating demo icon..."
convert -size "192x192" xc:"#1a9fff" \
  -gravity center \
  -fill white \
  -pointsize 30 \
  -draw "text 0,0 'Demo'" \
  "icons/demo-icon.png"

# Generate docs icon for shortcuts
echo "Generating docs icon..."
convert -size "192x192" xc:"#1a9fff" \
  -gravity center \
  -fill white \
  -pointsize 30 \
  -draw "text 0,0 'Docs'" \
  "icons/docs-icon.png"

echo "Icon generation complete!"
echo "Note: This script requires ImageMagick to be installed."
echo "If you see any errors, please install ImageMagick with:"
echo "  sudo apt-get install imagemagick  # For Ubuntu/Debian"
echo "  brew install imagemagick          # For macOS with Homebrew" 