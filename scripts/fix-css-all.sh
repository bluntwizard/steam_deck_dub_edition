#!/bin/bash

# CSS Fixing Master Script
# -----------------------
# This script replaces all individual CSS fix scripts with a unified approach

# Display help information
show_help() {
  echo "Steam Deck DUB Edition CSS Fixer"
  echo "--------------------------------"
  echo "Usage: ./fix-css-all.sh [options]"
  echo ""
  echo "Options:"
  echo "  --help            Show this help message"
  echo "  --all             Fix all CSS files (default)"
  echo "  --dir=<directory> Fix CSS files in specified directory"
  echo "  --file=<file>     Fix a specific CSS file"
  echo "  --deep-clean      Perform deep cleaning of problematic files"
  echo "  --report-only     Only report issues without fixing"
  echo ""
  echo "Examples:"
  echo "  ./fix-css-all.sh --all              # Fix all CSS files"
  echo "  ./fix-css-all.sh --dir=src/styles   # Fix files in src/styles"
  echo "  ./fix-css-all.sh --file=src/styles/main.css # Fix specific file"
  echo "  ./fix-css-all.sh --deep-clean       # Perform deep cleaning"
}

# Parse arguments
ARGS=""
for arg in "$@"; do
  if [ "$arg" = "--help" ] || [ "$arg" = "-h" ]; then
    show_help
    exit 0
  elif [ "$arg" = "--all" ]; then
    ARGS=""
  else
    ARGS="$ARGS $arg"
  fi
done

# Check if unified-css-fixer.js exists
if [ ! -f "scripts/unified-css-fixer.js" ]; then
  echo "Error: scripts/unified-css-fixer.js not found!"
  echo "Please make sure the file exists in the scripts directory."
  exit 1
fi

# Check if stylelint is installed
if ! command -v npx &> /dev/null || ! npx stylelint --version &> /dev/null; then
  echo "Warning: stylelint not found. Installing dependencies..."
  npm install stylelint stylelint-config-standard
fi

# Show banner
echo "╔════════════════════════════════════════════════════╗"
echo "║       Steam Deck DUB Edition CSS Fixer              ║"
echo "║       ---------------------------------              ║"
echo "║ This unified tool replaces all previous CSS fixers. ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Run the unified fixer
echo "Starting CSS fix process..."
node scripts/unified-css-fixer.js $ARGS

# Exit with the same status as the fixer
exit $? 