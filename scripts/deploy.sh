#!/bin/bash

# Steam Deck DUB Edition - Deployment Script
# -------------------------------------------
# This script builds and packages the application for distribution

set -e  # Exit on error

# Display help information
show_help() {
  echo "Steam Deck DUB Edition Deployment Script"
  echo "----------------------------------------"
  echo "Usage: ./scripts/deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  --help, -h       Show this help message"
  echo "  --web            Build for web only"
  echo "  --electron       Build for Electron only (default: both)"
  echo "  --platform=X     Build for specific platform (linux, win, mac, all)"
  echo "  --analyze        Analyze bundle size"
  echo ""
  echo "Examples:"
  echo "  ./scripts/deploy.sh                    # Build everything"
  echo "  ./scripts/deploy.sh --web              # Build for web only"
  echo "  ./scripts/deploy.sh --platform=linux   # Build for Linux only"
}

# Default values
BUILD_WEB=true
BUILD_ELECTRON=true
PLATFORM="all"
ANALYZE=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --help|-h)
      show_help
      exit 0
      ;;
    --web)
      BUILD_WEB=true
      BUILD_ELECTRON=false
      ;;
    --electron)
      BUILD_WEB=false
      BUILD_ELECTRON=true
      ;;
    --platform=*)
      PLATFORM="${arg#*=}"
      ;;
    --analyze)
      ANALYZE=true
      ;;
    *)
      echo "Unknown option: $arg"
      show_help
      exit 1
      ;;
  esac
done

echo "╔════════════════════════════════════════════════╗"
echo "║       Steam Deck DUB Edition Deployment         ║"
echo "╚════════════════════════════════════════════════╝"

# Clean up previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Run tests
echo "🧪 Running tests..."
npm test

# Lint the code
echo "🔍 Linting code..."
npm run lint

# Build for web if requested
if [ "$BUILD_WEB" = true ]; then
  echo "🌐 Building for web..."
  if [ "$ANALYZE" = true ]; then
    npm run analyze
  else
    npm run build:web:prod
  fi
  echo "✅ Web build complete! Files in dist/ directory"
fi

# Build for electron if requested
if [ "$BUILD_ELECTRON" = true ]; then
  echo "⚡ Building for Electron..."
  
  case $PLATFORM in
    linux)
      echo "🐧 Building for Linux..."
      npm run build:linux
      ;;
    win)
      echo "🪟 Building for Windows..."
      npm run build:win
      ;;
    mac)
      echo "🍎 Building for macOS..."
      npm run build:mac
      ;;
    all)
      echo "🌍 Building for all platforms..."
      npm run build
      ;;
    *)
      echo "⚠️ Unknown platform: $PLATFORM"
      exit 1
      ;;
  esac
  
  echo "✅ Electron build complete! Installers in dist/ directory"
fi

echo "🎉 Deployment complete!" 