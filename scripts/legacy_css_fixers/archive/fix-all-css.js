/**
 * Comprehensive CSS fix script
 * This script addresses all remaining CSS issues:
 * 1. Missing units on numeric values
 * 2. Property values that should not have units (z-index, opacity, etc.)
 * 3. Keyframe name formatting
 * 4. Single-line declaration blocks
 * 5. Duplicate selectors
 * 6. Basic indentation
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all CSS files
const cssFiles = glob.sync('**/*.css', {
  ignore: ['node_modules/**', 'build/**', 'dist/**', 'src/assets/fonts/**']
});

console.log(`Found ${cssFiles.length} CSS files to process`);

// Properties that should NOT have units
const noUnitProperties = [
  'z-index', 'font-weight', 'line-height', 'opacity', 'flex', 'flex-grow', 
  'flex-shrink', 'order', 'zoom', 'counter-increment', 'counter-reset',
  'animation-iteration-count'
];

// Properties that SHOULD have px units
const pxUnitProperties = [
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'top', 'right', 'bottom', 'left', 'margin', 'margin-top', 'margin-right', 
  'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 
  'padding-bottom', 'padding-left', 'border-radius', 'border-width',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'background-size', 'box-shadow', 'grid-template-columns', 'grid-auto-rows',
  'grid-column', 'column-width', 'column-gap', 'font-size', 'transform',
  'gap', 'grid-gap', 'column-gap', 'row-gap', 'scroll-margin-top'
];

// Special properties that need handling
const specialProps = {
  'aspect-ratio': true,  // Should not have px
  'grid-template-columns': true, // Often needs px but not always
  'transform': true // Needs special handling for translate, scale, etc.
};

// Process each file
cssFiles.forEach(filePath => {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. Fix keyframe names to kebab-case
  const keyframeMatches = content.match(/@keyframes\s+([a-zA-Z][a-zA-Z0-9]*)\s*\{/g);
  if (keyframeMatches) {
    keyframeMatches.forEach(match => {
      const keyframeName = match.match(/@keyframes\s+([a-zA-Z][a-zA-Z0-9]*)\s*\{/)[1];
      // Only convert camelCase to kebab-case
      if (keyframeName.match(/[a-z][A-Z]/)) {
        const kebabName = keyframeName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const newKeyframe = match.replace(keyframeName, kebabName);
        content = content.replace(match, newKeyframe);
        console.log(`  Fixed keyframe: ${keyframeName} → ${kebabName}`);
        modified = true;
      }
    });
  }
  
  // 2. Fix multiple declarations in single-line blocks
  // - Split declarations enclosed in { } with multiple ;
  const singleLineBlockPattern = /\{([^{}]*?;[^{}]*?;[^{}]*?)\}/g;
  let match;
  while ((match = singleLineBlockPattern.exec(content)) !== null) {
    const declarations = match[1].split(';').filter(d => d.trim());
    if (declarations.length > 1) {
      const indentation = '  '; // Standard indentation
      const newBlock = `{\n${declarations.map(d => `${indentation}${d.trim()};`).join('\n')}\n}`;
      content = content.replace(match[0], newBlock);
      modified = true;
    }
  }
  
  // 3. Fix numeric values without units or with incorrect units
  
  // 3a. First remove units from properties that shouldn't have them
  noUnitProperties.forEach(prop => {
    const regex = new RegExp(`(${prop}\\s*:\\s*)(\\d+)(?:px|em|rem|%)(\\s*;|\\s*}|\\s+!important)`, 'g');
    const newContent = content.replace(regex, '$1$2$3');
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  });
  
  // 3b. Add px units to properties that need them
  pxUnitProperties.forEach(prop => {
    // Match "property: number" without a unit, not preceded by a decimal point (which could be like opacity: 0.5)
    const regex = new RegExp(`(${prop}\\s*:\\s*-?\\d+)(?!\\s*px|\\s*%|\\s*em|\\s*rem|\\s*vh|\\s*vw|\\s*vmin|\\s*vmax|\\s*ch|\\s*\\.)(\\s*;|\\s*}|\\s+!important)`, 'g');
    const newContent = content.replace(regex, '$1px$2');
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  });
  
  // 4. Fix specific cases for opacity
  content = content.replace(/opacity\s*:\s*1px/g, 'opacity: 1');
  
  // 5. Fix aspect-ratio property (should not have px)
  content = content.replace(/aspect-ratio\s*:\s*(\d+)px/g, 'aspect-ratio: $1');
  
  // 6. Fix transform values that need px
  content = content.replace(/(transform\s*:\s*translate(?:X|Y)?\()(\d+)(?!\s*px|\s*%|\s*em|\s*rem)(\))/g, '$1$2px$3');
  
  // 7. Fix special case for box-shadow
  content = content.replace(/(box-shadow\s*:\s*(?:[^\(;]*)?)(\d+)(?!\s*px|\d|\.)(\s+\d+|\s*;|\s*}|\s+!important)/g, '$1$2px$3');
  
  // 8. Fix special case for media queries
  // Change something like (max-width: 480) to (max-width: 480px)
  content = content.replace(/\(\s*(min-width|max-width)\s*:\s*(\d+)\s*\)/g, '($1: $2px)');
  
  // 9. Fix specific case for grid-template-columns
  content = content.replace(/(grid-template-columns\s*:\s*(?:repeat\s*\(\s*\d+\s*,\s*)?)(\d+)(?!\s*px|\s*%|\s*fr|\s*em|\s*rem)(\s*\)|(?!\s*\())([^;]*);/g, '$1$2px$3$4;');
  
  // 10. Fix triple colons (should be double colons)
  content = content.replace(/:::(before|after)/g, '::$1');
  
  // 11. Comment out duplicate selectors
  const selectors = new Map();
  const selectorLines = content.split('\n');
  const processedLines = [];
  
  let inComment = false;
  let selectorStartLine = -1;
  let currentSelector = '';
  let skipUntilClose = false;
  let braceLevel = 0;
  
  selectorLines.forEach((line, index) => {
    // Handle comment blocks
    if (line.includes('/*') && !line.includes('*/')) {
      inComment = true;
      processedLines.push(line);
      return;
    }
    
    if (inComment) {
      processedLines.push(line);
      if (line.includes('*/')) {
        inComment = false;
      }
      return;
    }
    
    // Skip if we're still in a selector block that's being skipped
    if (skipUntilClose) {
      if (line.includes('{')) braceLevel++;
      if (line.includes('}')) {
        braceLevel--;
        if (braceLevel === 0) {
          skipUntilClose = false;
        }
      }
      processedLines.push(line);
      return;
    }
    
    // Check for selector start
    const selectorMatch = line.match(/^([^{}/]+)\s*\{/);
    if (selectorMatch) {
      const selector = selectorMatch[1].trim();
      braceLevel = 1;
      
      // Check if it's a duplicate
      if (selectors.has(selector)) {
        console.log(`  Found duplicate selector: ${selector}`);
        processedLines.push(`/* Duplicate selector (first used on line ${selectors.get(selector) + 1}): ${selector} */`);
        if (!line.includes('}')) {
          skipUntilClose = true;
        }
      } else {
        selectors.set(selector, index);
        processedLines.push(line);
      }
    } else {
      processedLines.push(line);
    }
    
    // Track brace level
    if (line.includes('{') && !selectorMatch) braceLevel++;
    if (line.includes('}')) braceLevel--;
  });
  
  // Write the processed content if modified
  if (processedLines.length > 0) {
    content = processedLines.join('\n');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Fixed issues in ${filePath}`);
  }
});

console.log('All CSS fixes completed!'); 