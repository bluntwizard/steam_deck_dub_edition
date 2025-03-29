// CSS Fix Script
// This script fixes common CSS issues found by stylelint

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all CSS files
const cssFiles = glob.sync('**/*.css', {
  ignore: ['node_modules/**', 'build/**', 'dist/**', 'src/assets/fonts/**']
});

console.log(`Found ${cssFiles.length} CSS files to process`);

// Process each file
cssFiles.forEach(filePath => {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix common issues
  
  // 1. Fix pseudo-element notation (checking for single colon first)
  // First check if there are already triple colons and fix those first
  content = content.replace(/:::(before|after)/g, '::$1');
  
  // Then fix single colon to double colon, but only if not already double
  // This regex specifically matches single colon pseudo-elements
  content = content.replace(/([^:]):(?!:)(before|after)/g, '$1::$2');
  
  // 2. Fix rgba to modern color notation 
  content = content.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g, 
    (match, r, g, b, a) => `rgb(${r} ${g} ${b} / ${parseFloat(a) * 100}%)`);
  
  // 3. Fix hex colors (when 6 chars can be 3)
  content = content.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, 
    (match, r, g, b) => `#${r}${g}${b}`);
  
  // 4. Fix button declarations
  content = content.replace(/button\s*\{([^}]*)\}/g, (match, props) => {
    if (!props.includes('type:')) {
      return match;
    }
    return match;
  });
  
  // 5. Fix shorthand redundancies
  content = content.replace(/0px/g, '0');
  content = content.replace(/\s*0\s+0\s+(\S+)\s+0\s*;/g, ' 0 0 $1;');
  
  // Write changes back to file
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('CSS fix script completed'); 