#!/bin/bash

echo "Starting comprehensive CSS and JavaScript fix process..."

# Make sure all scripts are executable
chmod +x *.sh
chmod +x fix-*.js

# Fix debug.css parse errors first
echo "Step 1: Fixing parse errors in debug.css..."
node fix-debug-css.js

# Fix general CSS issues
echo "Step 2: Fixing missing CSS units across all files..."
node fix-all-css.js

# Fix indentation in all CSS files
echo "Step 3: Fixing CSS indentation..."
node fix-css-indentation.js

# Fix pseudo-elements
echo "Step 4: Fixing pseudo-elements..."
node fix-pseudo-elements.js

# Fix JavaScript errors
echo "Step 5: Fixing JavaScript issues..."
npx eslint --fix "src/**/*.js" main.js preload.js service-worker.js

# Run the final cleanup
echo "Step 6: Running final cleanup..."
node final-cleanup.js

# Verify results
echo "Verification:"
echo "-------------"

# Check for parse errors in debug.css
echo "Checking for parse errors in debug.css..."
npx stylelint src/styles/utilities/debug.css --quiet

# Check for remaining triple-colon issues
echo "Checking for remaining triple-colon issues..."
grep -r ":::" --include="*.css" . > /dev/null
if [ $? -eq 0 ]; then
    echo "❌ Found triple-colon issues in:"
    grep -r ":::" --include="*.css" . | cut -d: -f1 | sort | uniq
else
    echo "✓ No triple-colon issues found"
fi

# Check JavaScript errors
echo "Checking JavaScript errors..."
npx eslint --quiet "src/**/*.js" main.js preload.js service-worker.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ No JavaScript errors found (warnings may still exist)"
else
    echo "❌ JavaScript errors found"
    npx eslint "src/**/*.js" main.js preload.js service-worker.js
fi

echo ""
echo "Fix process completed!"
echo "----------------------"
echo "1. Most CSS issues should now be fixed"
echo "2. Run 'npx stylelint \"**/*.css\"' to check for any remaining CSS issues"
echo "3. Some minor issues may require manual fixes"
echo ""
echo "For JavaScript warnings about unused variables, you can safely ignore them or"
echo "remove the unused variables if desired." 