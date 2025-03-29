/**
 * Script to fix missing CSS units in numeric values
 */

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
  
  // Fix z-index values with units (they should not have units)
  content = content.replace(/(z-index\s*:\s*\d+)(px|em|rem|%)/g, '$1');
  
  // Fix common issues
  // 1. Fix numeric values without units (except for 0 which doesn't need units)
  // This regex looks for properties with numbers without units
  content = content.replace(/([\w-]+)\s*:\s*(\d+)(\s*;|\s*}|\s+!important)/g, (match, property, number, ending) => {
    // Don't add units to 0
    if (number === '0') return match;
    
    // Don't add units to properties that shouldn't have them
    const noUnitProperties = [
      'z-index', 'font-weight', 'line-height', 'opacity', 'flex', 'flex-grow', 
      'flex-shrink', 'order', 'zoom', 'counter-increment', 'counter-reset',
      'animation-iteration-count'
    ];
    
    // Check if property is in the list that shouldn't have units
    if (noUnitProperties.includes(property.toLowerCase().trim())) {
      return match;
    }
    
    // Add px unit
    return `${property}: ${number}px${ending}`;
  });
  
  // 2. Fix duplicate selectors by adding a comment
  // This is a complex problem; let's just flag them for manual review
  const selectorRegex = /^([.#\w\s\[\]='"^~|*>+:,-]+)\s*\{/gm;
  const selectors = new Map();
  let match;
  
  // Find all selectors
  while ((match = selectorRegex.exec(content)) !== null) {
    const selector = match[1].trim();
    const position = match.index;
    
    if (selectors.has(selector)) {
      console.log(`WARNING: Duplicate selector found in ${filePath}: "${selector}"`);
      console.log(`  First occurrence: Line ${content.substring(0, selectors.get(selector)).split('\n').length}`);
      console.log(`  Duplicate: Line ${content.substring(0, position).split('\n').length}`);
    } else {
      selectors.set(selector, position);
    }
  }
  
  // 3. Fix shorthand property redundancies (0px to 0)
  content = content.replace(/0px/g, '0');
  
  // 4. Fix triple colon pseudo-elements
  content = content.replace(/:::(before|after)/g, '::$1');
  
  // Write changes back to file
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('CSS unit fixes completed'); 