#!/bin/bash

# Run our fix-all script
./fix-all.sh

# Verify results
echo "Verifying results..."

# Check for remaining triple-colon issues
echo "Checking for remaining triple-colon issues:"
grep -r ":::" --include="*.css" . > /dev/null
if [ $? -eq 0 ]; then
    echo "❌ Found triple-colon issues in:"
    grep -r ":::" --include="*.css" . | cut -d: -f1 | sort | uniq
else
    echo "✓ No triple-colon issues found"
fi

# Check JavaScript errors
echo "Checking JavaScript errors:"
npx eslint --quiet "src/**/*.js" main.js preload.js service-worker.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ No JavaScript errors found (warnings may still exist)"
else
    echo "❌ JavaScript errors found"
    npx eslint "src/**/*.js" main.js preload.js service-worker.js
fi

echo ""
echo "Fix process completed! Here's what to do next:"
echo "1. If issues remain, you may need to fix some files manually"
echo "2. For triple-colon issues, manually edit the files listed above"
echo "3. Run './format-code.sh' to ensure consistent formatting"
echo ""
echo "For any remaining warnings, you can choose to ignore them if they don't affect functionality." 