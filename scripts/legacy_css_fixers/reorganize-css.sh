#!/bin/bash

# Create organized directory structure
echo "Creating directory structure..."
mkdir -p src/styles/core
mkdir -p src/styles/layouts
mkdir -p src/styles/components
mkdir -p src/styles/utilities
mkdir -p src/styles/animations
mkdir -p src/themes/dracula
mkdir -p src/themes/light
mkdir -p src/themes/high-contrast

# Create backup directory
mkdir -p backup/css

# Backup original CSS files
echo "Backing up original CSS files..."
cp *.css backup/css/

# Move core styles
echo "Moving core style files..."
mv styles.css src/styles/core/base.css
mv consolidated-styles.css src/styles/core/consolidated.css

# Move layout files
echo "Moving layout files..."
mv layout.css src/styles/layouts/main-layout.css
mv header.css src/styles/layouts/header.css
mv section-layouts.css src/styles/layouts/sections.css

# Move component styles
echo "Moving component style files..."
mv preferences-styles.css src/styles/components/preferences-dialog.css
mv search-styles.css src/styles/components/search.css
mv version-styles.css src/styles/components/version-manager.css
mv progress-styles.css src/styles/components/progress-tracker.css
mv lightbox.css src/styles/components/lightbox.css
mv svg-header-styles.css src/styles/components/svg-header.css

# Move animation files
echo "Moving animation files..."
mv preferences-animations.css src/styles/animations/preferences.css
mv background-effects.css src/styles/animations/background.css

# Move utility styles
echo "Moving utility files..."
mv pseudo-element-fix.css src/styles/utilities/pseudo-elements.css
mv layout-debug.css src/styles/utilities/debug.css

# Move theme files
echo "Moving theme files..."
mv dracula-theme.css src/themes/dracula/theme.css

# Create index files for importing
echo "Creating index files for easy imports..."
echo "// Import all core styles" > src/styles/core/index.css
echo "@import 'base.css';" >> src/styles/core/index.css
echo "@import 'consolidated.css';" >> src/styles/core/index.css

echo "// Import all layout styles" > src/styles/layouts/index.css
echo "@import 'main-layout.css';" >> src/styles/layouts/index.css
echo "@import 'header.css';" >> src/styles/layouts/index.css
echo "@import 'sections.css';" >> src/styles/layouts/index.css

echo "// Import all component styles" > src/styles/components/index.css
echo "@import 'preferences-dialog.css';" >> src/styles/components/index.css
echo "@import 'search.css';" >> src/styles/components/index.css
echo "@import 'version-manager.css';" >> src/styles/components/index.css
echo "@import 'progress-tracker.css';" >> src/styles/components/index.css
echo "@import 'lightbox.css';" >> src/styles/components/index.css
echo "@import 'svg-header.css';" >> src/styles/components/index.css

echo "// Import all animation styles" > src/styles/animations/index.css
echo "@import 'preferences.css';" >> src/styles/animations/index.css
echo "@import 'background.css';" >> src/styles/animations/index.css

echo "// Import all utility styles" > src/styles/utilities/index.css
echo "@import 'pseudo-elements.css';" >> src/styles/utilities/index.css
echo "@import 'debug.css';" >> src/styles/utilities/index.css

# Create main index file
echo "Creating main styles index file..."
echo "/* Main styles index - imports all style modules */" > src/styles/index.css
echo "@import 'core/index.css';" >> src/styles/index.css
echo "@import 'layouts/index.css';" >> src/styles/index.css
echo "@import 'components/index.css';" >> src/styles/index.css
echo "@import 'utilities/index.css';" >> src/styles/index.css
echo "@import 'animations/index.css';" >> src/styles/index.css
echo "@import '../themes/dracula/theme.css';" >> src/styles/index.css

# Update index.html references (create a backup first)
echo "Updating index.html references..."
cp index.html index.html.backup

# Create a script to update the index.html CSS references
cat > update-index-html.js << 'EOF'
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Replace CSS references with the new consolidated file
const updatedHtml = html.replace(
  /<link rel="stylesheet" type="text\/css" href="dracula-theme\.css">\s*<link rel="stylesheet" type="text\/css" href="styles\.css">\s*<link rel="stylesheet" type="text\/css" href="layout\.css">\s*<link rel="stylesheet" type="text\/css" href="background-effects\.css">\s*<link rel="stylesheet" type="text\/css" href="svg-header-styles\.css">\s*<link rel="stylesheet" type="text\/css" href="pseudo-element-fix\.css">\s*<link rel="stylesheet" type="text\/css" href="search-styles\.css">\s*<link rel="stylesheet" type="text\/css" href="version-styles\.css">\s*<link rel="stylesheet" type="text\/css" href="progress-styles\.css">\s*<link rel="stylesheet" type="text\/css" href="preferences-styles\.css">\s*<link rel="stylesheet" type="text\/css" href="preferences-animations\.css">\s*<link rel="stylesheet" type="text\/css" href="section-layouts\.css">\s*<link rel="stylesheet" type="text\/css" href="lightbox\.css">\s*<link rel="stylesheet" type="text\/css" href="layout-debug\.css">\s*<link rel="stylesheet" type="text\/css" href="header\.css">/,
  '<link rel="stylesheet" type="text/css" href="src/styles/index.css">'
);

fs.writeFileSync('index.html.new', updatedHtml);
console.log('Updated index.html has been created as index.html.new');
EOF

echo "Complete! Run 'node update-index-html.js' to update index.html references."
echo "Then review index.html.new before replacing the original."
