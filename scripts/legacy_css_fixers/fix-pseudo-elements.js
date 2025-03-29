/**
 * Script to fix triple-colon (:::) pseudo-element issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Target the utilities/pseudo-elements.css file directly
const targetFiles = [
  'src/styles/utilities/pseudo-elements.css',
  'src/styles/utilities/debug.css',
  // Add any other files with the same issue
];

console.log('Fixing triple colon pseudo-elements in specific files...');

targetFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix triple colons by replacing them with double colons
  content = content.replace(/:::(before|after)/g, '::$1');

  // Write changes back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
});

// Now search all CSS files for any remaining triple colons
const allCssFiles = glob.sync('**/*.css', {
  ignore: ['node_modules/**', 'build/**', 'dist/**']
});

console.log('\nChecking all CSS files for any remaining triple-colon issues...');

let fixedCount = 0;
allCssFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Look for triple colons
  if (content.includes(':::')) {
    console.log(`Found triple colons in: ${filePath}`);
    
    // Fix triple colons 
    const originalContent = content;
    content = content.replace(/:::(before|after)/g, '::$1');
    
    // If changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`Fixed ${filePath}`);
    }
  }
});

console.log(`\nFixed ${fixedCount} additional files with triple-colon issues.`);
console.log('Pseudo-element fix completed.'); 