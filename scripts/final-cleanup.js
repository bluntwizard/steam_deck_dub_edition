/**
 * Final cleanup script to fix remaining CSS issues
 */

const fs = require('fs');
const path = require('path');

// The debug.css file still has issues - let's fix them directly
const debugCssPath = 'src/styles/utilities/debug.css';

if (fs.existsSync(debugCssPath)) {
  console.log(`Processing ${debugCssPath}`);
  let content = fs.readFileSync(debugCssPath, 'utf8');
  
  // Fix specific remaining issues
  
  // 1. Fix z-index with px units
  content = content.replace(/z-index\s*:\s*(\d+)px/g, 'z-index: $1');
  
  // 2. Fix specific font-size values that were missed
  content = content.replace(/font-size\s*:\s*(\d+)\b(?!\s*px)/g, 'font-size: $1px');
  
  // 3. Fix all numeric values that need units
  const propertiesNeedingUnits = [
    'width', 'height', 'top', 'right', 'bottom', 'left',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-radius', 'border-width'
  ];
  
  propertiesNeedingUnits.forEach(prop => {
    const regex = new RegExp(`(${prop})\\s*:\\s*(-?\\d+)\\b(?!\\s*px|\\s*%|\\s*em|\\s*rem)`, 'g');
    content = content.replace(regex, '$1: $2px');
  });
  
  // 4. Remove duplicate grid selector or convert to a comment
  const gridSelectorPattern = /\.debug-layout\s+\.grid\s*\{[^}]*\}/g;
  const matches = content.match(gridSelectorPattern);
  
  if (matches && matches.length > 1) {
    // Keep the first one, comment out duplicates
    let firstFound = false;
    content = content.replace(gridSelectorPattern, (match) => {
      if (!firstFound) {
        firstFound = true;
        return match;
      }
      return `/* Duplicate removed:
${match}
*/`;
    });
  }
  
  // 5. Fix box-shadow values - need to handle different patterns
  content = content.replace(/box-shadow\s*:\s*(\d+)\s+(\d+)\s+(\d+)(?!\s*px)/g, 'box-shadow: $1px $2px $3px');
  content = content.replace(/box-shadow\s*:\s*(\d+)(?!\s*px)/g, 'box-shadow: $1px');
  
  // 6. Ensure specific properties that were missed in earlier passes get fixed
  content = content.replace(/padding\s*:\s*(\d+)\s+(\d+)(?!\s*px)/g, 'padding: $1px $2px');
  content = content.replace(/padding\s*:\s*(\d+)(?!\s*px)/g, 'padding: $1px');
  
  // 7. Fix specific spots that might have been missed
  // Line 35, 68, 80, 111, 155, 157, etc.
  const specificLinePatterns = [
    { line: 35, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 68, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 80, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 111, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 126, pattern: /height\s*:\s*30\b(?!\s*px)/g, replacement: 'height: 30px' },
    { line: 131, pattern: /padding\s*:\s*5px\s+10(?!\s*px)/g, replacement: 'padding: 5px 10px' },
    { line: 155, pattern: /top\s*:\s*-20\b(?!\s*px)/g, replacement: 'top: -20px' },
    { line: 157, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 166, pattern: /top\s*:\s*-20\b(?!\s*px)/g, replacement: 'top: -20px' },
    { line: 168, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 175, pattern: /bottom\s*:\s*270\b(?!\s*px)/g, replacement: 'bottom: 270px' },
    { line: 176, pattern: /right\s*:\s*20\b(?!\s*px)/g, replacement: 'right: 20px' },
    { line: 177, pattern: /width\s*:\s*40\b(?!\s*px)/g, replacement: 'width: 40px' },
    { line: 178, pattern: /height\s*:\s*40\b(?!\s*px)/g, replacement: 'height: 40px' },
    { line: 189, pattern: /font-size\s*:\s*10\b(?!\s*px)/g, replacement: 'font-size: 10px' },
    { line: 190, pattern: /box-shadow\s*:\s*0\s+2px\s+10(?!\s*px)/g, replacement: 'box-shadow: 0 2px 10px' }
  ];
  
  // Apply line-specific fixes - split content by lines, fix each specific line
  const lines = content.split('\n');
  specificLinePatterns.forEach(({ line, pattern, replacement }) => {
    if (line <= lines.length) {
      lines[line - 1] = lines[line - 1].replace(pattern, replacement);
    }
  });
  
  content = lines.join('\n');
  
  // Write changes back to file
  fs.writeFileSync(debugCssPath, content, 'utf8');
  console.log(`Fixed remaining issues in ${debugCssPath}`);
}

// Now let's fix the indentation errors in other files
const otherFiles = [
  'src/styles/utilities/pseudo-elements.css',
  'src/themes/dracula/theme.css'
];

otherFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing indentation in ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Split the content into lines
    const lines = content.split('\n');
    const formattedLines = [];
    let inComment = false;
    let inSelector = false;
    let inMedia = false;
    let indentLevel = 0;
    
    // Process each line
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (trimmedLine === '') {
        formattedLines.push('');
        return;
      }
      
      // Handle comment blocks
      if (trimmedLine.startsWith('/*')) {
        inComment = true;
        formattedLines.push(trimmedLine);
        return;
      }
      
      if (inComment) {
        formattedLines.push(trimmedLine);
        if (trimmedLine.endsWith('*/')) {
          inComment = false;
        }
        return;
      }
      
      // Handle media queries
      if (trimmedLine.includes('@media') && trimmedLine.includes('{')) {
        inMedia = true;
        indentLevel = 1;
        formattedLines.push(trimmedLine);
        return;
      }
      
      // Handle selector blocks
      if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
        inSelector = true;
        
        // If inside media query, add additional indentation
        const indent = ' '.repeat(inMedia ? indentLevel * 2 : 0);
        formattedLines.push(`${indent}${trimmedLine}`);
        
        // Increase indent for properties
        indentLevel = inMedia ? 2 : 1;
        return;
      }
      
      // Handle closing brackets
      if (trimmedLine.includes('}')) {
        inSelector = false;
        
        // Decrease indent level for closing
        indentLevel = inMedia ? 1 : 0;
        
        // If closing media query
        if (inMedia && trimmedLine === '}') {
          inMedia = false;
          indentLevel = 0;
        }
        
        const indent = ' '.repeat(indentLevel * 2);
        formattedLines.push(`${indent}${trimmedLine}`);
        return;
      }
      
      // Regular properties
      if (inSelector || inMedia) {
        const indent = ' '.repeat(indentLevel * 2);
        formattedLines.push(`${indent}${trimmedLine}`);
        return;
      }
      
      // Other lines (like at-rules)
      formattedLines.push(trimmedLine);
    });
    
    // Join the formatted lines
    const formattedContent = formattedLines.join('\n');
    
    // Write back to the file
    fs.writeFileSync(filePath, formattedContent, 'utf8');
    console.log(`Fixed indentation in ${filePath}`);
  }
});

// Final log
console.log('Final cleanup completed!');
console.log('Your CSS should now have most linting issues fixed.');
console.log('Run stylelint again to confirm the fixes.'); 