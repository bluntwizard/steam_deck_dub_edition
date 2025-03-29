/**
 * Fix Specific CSS Errors Script
 *
 * This script targets the exact errors reported by stylelint
 * with direct fixes for each problematic file.
 */

const fs = require('fs');

// Map of files with specific errors to fix
const fileFixMap = {
  'src/styles/progress-tracker.css': content => 
    content.replace(/\bll\b/g, 'all'),
  
  'src/styles/layouts/header.css': content => 
    content.replace(/\bll\b/g, 'all'),
  
  'src/styles/layouts/main-layout.css': content => 
    content.replace(/\buto\b/g, 'auto'),
  
  'src/styles/core/base.css': content => {
    // Fix unexpected close bracket
    let fixed = content;
    const bracketCount = (fixed.match(/{/g) || []).length;
    const closeBracketCount = (fixed.match(/}/g) || []).length;
    
    if (closeBracketCount > bracketCount) {
      // Remove excess closing brackets
      const diff = closeBracketCount - bracketCount;
      for (let i = 0; i < diff; i++) {
        fixed = fixed.replace(/}\s*}\s*$/, '}');
      }
    }
    return fixed;
  },
  
  'src/styles/core/consolidated.css': content => {
    // Fix unexpected close bracket
    let fixed = content;
    const bracketCount = (fixed.match(/{/g) || []).length;
    const closeBracketCount = (fixed.match(/}/g) || []).length;
    
    if (closeBracketCount > bracketCount) {
      // Remove excess closing brackets
      const diff = closeBracketCount - bracketCount;
      for (let i = 0; i < diff; i++) {
        fixed = fixed.replace(/}\s*}\s*$/, '}');
      }
    }
    return fixed;
  },
  
  'src/styles/components/accessibility-controls.css': content => {
    // Fix unexpected close bracket
    let fixed = content;
    const bracketCount = (fixed.match(/{/g) || []).length;
    const closeBracketCount = (fixed.match(/}/g) || []).length;
    
    if (closeBracketCount > bracketCount) {
      // Remove excess closing brackets
      const diff = closeBracketCount - bracketCount;
      for (let i = 0; i < diff; i++) {
        fixed = fixed.replace(/}\s*}\s*$/, '}');
      }
    }
    return fixed;
  },
  
  'src/styles/components/lightbox.css': content => 
    content.replace(/\bbsolute\b/g, 'absolute'),
  
  'src/styles/components/preferences-dialog.css': content => {
    // Fix unexpected close bracket
    let fixed = content;
    const bracketCount = (fixed.match(/{/g) || []).length;
    const closeBracketCount = (fixed.match(/}/g) || []).length;
    
    if (closeBracketCount > bracketCount) {
      // Remove excess closing brackets
      const diff = closeBracketCount - bracketCount;
      for (let i = 0; i < diff; i++) {
        fixed = fixed.replace(/}\s*}\s*$/, '}');
      }
    }
    return fixed;
  },
  
  'src/styles/components/progress-tracker.css': content => 
    content.replace(/\buto\b/g, 'auto'),
};

// Counter for fixed files
let fixedCount = 0;

// Process each file with specific fixes
for (const [filePath, fixFunction] of Object.entries(fileFixMap)) {
  console.log(`Fixing specific errors in ${filePath}`);
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Apply specific fixes
    const fixedContent = fixFunction(content);
    
    // Only write if content changed
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`  Successfully fixed ${filePath}`);
      fixedCount++;
    } else {
      console.log(`  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
}

console.log(`\nSuccessfully fixed ${fixedCount} CSS files with specific errors.`); 