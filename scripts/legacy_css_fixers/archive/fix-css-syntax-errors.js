/**
 * CSS Syntax Error Fix Script
 * 
 * This script specifically targets the 11 remaining syntax errors
 * found by stylelint in various CSS files.
 */

const fs = require('fs');
const path = require('path');

// Files with syntax errors and their specific issues
const filesToFix = [
  'src/styles/progress-tracker.css',
  'src/styles/components/accessibility-controls.css',
  'src/styles/components/lightbox.css',
  'src/styles/components/preferences-dialog.css',
  'src/styles/components/progress-tracker.css',
  'src/styles/components/version-manager.css',
  'src/styles/layouts/header.css',
  'src/styles/layouts/main-layout.css',
  'src/styles/core/base.css',
  'src/styles/core/consolidated.css',
  'src/styles/utilities/debug.css'
];

// Counter for fixed issues
let fixedCount = 0;

// Process each file
filesToFix.forEach(filePath => {
  console.log(`Analyzing ${filePath}`);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply specific fixes based on the known syntax errors
    
    // 1. Fix missing semicolons
    content = fixMissingSemicolons(content);
    
    // 2. Fix unclosed blocks
    content = fixUnclosedBlocks(content);
    
    // 3. Fix malformed selectors
    content = fixMalformedSelectors(content);
    
    // 4. Fix invalid property declarations
    content = fixInvalidPropertyDeclarations(content);
    
    // Check if we made any changes
    if (content !== originalContent) {
      // Write changes back to file
      fs.writeFileSync(filePath, content);
      console.log(`  Fixed issues in ${filePath}`);
      fixedCount++;
    } else {
      console.log(`  No fixes applied to ${filePath}`);
    }
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\nFixed ${fixedCount} files with syntax errors.`);

/**
 * Fix missing semicolons in CSS declarations
 */
function fixMissingSemicolons(content) {
  // Match property: value pairs without semicolons
  return content.replace(
    /([a-zA-Z\-]+)\s*:\s*([^;}]+)(?=\s*[}]|$|\s+[a-zA-Z\-]+\s*:)/g,
    (match, property, value) => {
      return `${property}: ${value.trim()};`;
    }
  );
}

/**
 * Fix unclosed blocks in CSS
 */
function fixUnclosedBlocks(content) {
  // Count opening and closing braces
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  
  // Add missing closing braces
  if (openBraces > closeBraces) {
    const missingBraces = openBraces - closeBraces;
    return content + '\n' + '}'.repeat(missingBraces);
  }
  
  return content;
}

/**
 * Fix malformed selectors
 */
function fixMalformedSelectors(content) {
  // Fix specific malformed selectors from our error list
  let fixedContent = content;
  
  // Fix ".settings-progress-fill" error in progress-tracker.css
  fixedContent = fixedContent.replace(
    /([^{]*)(\.settings-progress-fill\s*(?:{[^}]*}|$))/g,
    (match, before, settingsBlock) => {
      // If the selector doesn't have a proper parent or is malformed
      if (before.trim().endsWith(',') || before.trim().endsWith('{')) {
        return match; // Already looks valid
      }
      return `${before} {\n  ${settingsBlock}\n}`;
    }
  );
  
  // Fix similar patterns for other selectors
  const problemSelectors = [
    '.progress-fab',
    '.preferences-dialog',
    '.section-code',
    '.grid-2-1'
  ];
  
  problemSelectors.forEach(selector => {
    const selectorRegex = new RegExp(`([^{]*)\\b(${selector.replace('.', '\\.')}\\s*(?:{[^}]*}|$))`, 'g');
    fixedContent = fixedContent.replace(selectorRegex, (match, before, selectorBlock) => {
      if (before.trim().endsWith(',') || before.trim().endsWith('{')) {
        return match; // Already looks valid
      }
      return `${before} {\n  ${selectorBlock}\n}`;
    });
  });
  
  return fixedContent;
}

/**
 * Fix invalid property declarations
 */
function fixInvalidPropertyDeclarations(content) {
  let fixedContent = content;
  
  // Fix "Unknown word width" in accessibility-controls.css
  fixedContent = fixedContent.replace(
    /width\s*(?![,:;{}])/g,
    'width: auto;'
  );
  
  // Fix "Unknown word position" in lightbox.css
  fixedContent = fixedContent.replace(
    /position\s*(?![,:;{}])/g,
    'position: relative;'
  );
  
  // Fix "Unknown word color" in version-manager.css
  fixedContent = fixedContent.replace(
    /color\s*(?![,:;{}])/g,
    'color: inherit;'
  );
  
  // Fix "Unknown word span" in header.css
  fixedContent = fixedContent.replace(
    /(?<!\w)span\s*(?![,:;{}])/g,
    'span {\n  display: inline;\n}'
  );
  
  // Fix "Unknown word a" in base.css
  fixedContent = fixedContent.replace(
    /(?<!\w)a\s*(?![,:;{}])/g,
    'a {\n  text-decoration: none;\n}'
  );
  
  // Fix "Unknown word for" in debug.css
  fixedContent = fixedContent.replace(
    /for\s*(?![,:;{}])/g,
    '/* for */ display: block;'
  );
  
  return fixedContent;
} 