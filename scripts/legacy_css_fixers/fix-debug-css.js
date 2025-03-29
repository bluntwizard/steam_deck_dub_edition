/**
 * Script to fix parse errors in debug.css
 * This script specifically targets and fixes parse errors in debug.css
 */

const fs = require('fs');
const path = require('path');

const debugCssPath = 'src/styles/utilities/debug.css';

if (fs.existsSync(debugCssPath)) {
  console.log(`Processing ${debugCssPath}`);
  let content = fs.readFileSync(debugCssPath, 'utf8');
  
  // 1. Find and fix parse errors with the /* Duplicate removed: ... */ syntax
  // Parse errors are typically around line 104
  
  // Look for comment blocks that are improperly formatted
  const brokenCommentsPattern = /\/\*\s*Duplicate removed:\s*\/\*\s*/g;
  content = content.replace(brokenCommentsPattern, '/* Duplicate removed: ');
  
  // Look for any selector that might have parse errors - especially around quoted strings
  const problematicSelectorPattern = /([^{]*)\{([^}]*)\}/g;
  content = content.replace(problematicSelectorPattern, (match, selector, rules) => {
    // Fix selectors with unescaped forward slashes by escaping them
    const fixedSelector = selector.replace(/([^\\])\/(?!\*)/g, '$1\\/');
    
    return `${fixedSelector}{${rules}}`;
  });
  
  // 2. Fix duplicate grid selector issues
  // Find and properly comment out duplicate grid selectors
  const gridSelectorContent = content.split("\n");
  let gridSelectorCount = 0;
  let inGridSelector = false;
  let gridSelectorStart = -1;
  let braceCount = 0;
  
  for (let i = 0; i < gridSelectorContent.length; i++) {
    const line = gridSelectorContent[i];
    
    // Look for .debug-layout .grid { pattern
    if (!inGridSelector && line.match(/\.debug-layout\s+\.grid\s*\{/)) {
      gridSelectorCount++;
      
      // If this is already a duplicate, skip
      if (line.includes('/* Duplicate removed:')) continue;
      
      // If this is a second+ instance, mark for commenting out
      if (gridSelectorCount > 1) {
        inGridSelector = true;
        gridSelectorStart = i;
        braceCount = 1; // We've found opening brace
      }
    }
    
    // Track braces if we're in a duplicate grid selector
    if (inGridSelector) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // If we've reached the end of the selector block
      if (braceCount === 0) {
        // Comment out the duplicate selector block
        gridSelectorContent[gridSelectorStart] = `/* Duplicate grid selector removed - start */\n${gridSelectorContent[gridSelectorStart]}`;
        gridSelectorContent[i] = `${gridSelectorContent[i]}\n/* Duplicate grid selector removed - end */`;
        inGridSelector = false;
      }
    }
  }
  
  // 3. Fix any other potential parse errors
  for (let i = 0; i < gridSelectorContent.length; i++) {
    // Fix lines with /* that aren't properly closed
    if (gridSelectorContent[i].includes('/*') && !gridSelectorContent[i].includes('*/') && 
        !gridSelectorContent[i+1]?.includes('*/')) {
      gridSelectorContent[i] = gridSelectorContent[i].replace(/\/\*/g, '');
    }
    
    // Fix missing semicolons after property values
    if (gridSelectorContent[i].match(/^\s*[a-z-]+\s*:\s*[^;{}]+$/)) {
      gridSelectorContent[i] += ';';
    }
  }
  
  // Join the content back together
  content = gridSelectorContent.join('\n');
  
  // 4. Replace any triple colons with double colons
  content = content.replace(/:::/g, '::');
  
  // 5. Fix missing px units
  content = content.replace(/\b(top|right|bottom|left|width|height|margin|padding|font-size|border-radius)\s*:\s*(-?\d+)\b(?!\s*px)/g, '$1: $2px');
  
  // 6. Fix box-shadow values
  content = content.replace(/box-shadow\s*:\s*(\d+)(?!\s*px|\s*\.)/g, 'box-shadow: $1px');
  content = content.replace(/box-shadow\s*:\s*(\d+)px\s+(\d+)(?!\s*px)/g, 'box-shadow: $1px $2px');
  content = content.replace(/box-shadow\s*:\s*(\d+)px\s+(\d+)px\s+(\d+)(?!\s*px)/g, 'box-shadow: $1px $2px $3px');
  
  // 7. Properly comment out complex comment blocks
  content = content.replace(/\/\* Duplicate removed:\s*[\s\S]*?\*\//g, (match) => {
    return match.replace(/\/\*|\*\//g, (m) => {
      if (m === '/*') return '/* COMMENT START: ';
      if (m === '*/') return ' COMMENT END */';
      return m;
    });
  });
  
  // Write changes back to file
  fs.writeFileSync(debugCssPath, content, 'utf8');
  console.log(`✓ Fixed parse errors in ${debugCssPath}`);
} else {
  console.error(`✗ Could not find ${debugCssPath}`);
} 