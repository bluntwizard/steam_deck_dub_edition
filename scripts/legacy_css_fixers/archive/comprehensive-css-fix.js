/**
 * Comprehensive CSS Fix Script
 * Fixes common CSS issues identified in the code review:
 * 1. Missing units in numeric values
 * 2. Syntax errors in selectors and rules
 * 3. !important usage analysis
 * 4. Specificity issues detection
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const CSS_DIRS = [
  'src/styles/**/*.css',
  'src/themes/**/*.css'
];

// Stats tracking
const stats = {
  filesProcessed: 0,
  unitsFixes: 0,
  syntaxFixes: 0,
  importantUsages: 0,
  highSpecificitySelectors: 0
};

// Properties that require units when numeric (except 0)
const PROPERTIES_REQUIRING_UNITS = [
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'top', 'right', 'bottom', 'left',
  'font-size', 'line-height',
  'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'gap', 'column-gap', 'row-gap',
  'grid-gap', 'grid-column-gap', 'grid-row-gap',
  'background-position', 'background-size',
  'box-shadow', 'text-shadow'
];

// Properties that should be 0 or have units
const PROPERTIES_ZERO_OR_UNITS = [
  'z-index', 'opacity', 'flex', 'flex-grow', 'flex-shrink',
  'scale', 'rotate', 'translate',
  'order'
];

// Special properties with specific units
const SPECIAL_UNIT_PROPERTIES = {
  'z-index': '',  // No unit
  'opacity': '',  // No unit
  'line-height': '', // Unitless is valid
  'font-weight': '', // Unitless is valid
  'flex': '', // Unitless is valid
  'flex-grow': '', // Unitless is valid
  'flex-shrink': '' // Unitless is valid
};

// Get all CSS files
const cssFiles = [];
CSS_DIRS.forEach(dir => {
  const files = glob.sync(dir);
  cssFiles.push(...files);
});

console.log(`Found ${cssFiles.length} CSS files to process`);

// Process each file
cssFiles.forEach(file => {
  try {
    console.log(`Processing ${file}`);
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // 1. Fix missing units
    content = fixMissingUnits(content);
    
    // 2. Fix syntax errors
    content = fixSyntaxErrors(content);
    
    // 3. Analyze !important usage
    analyzeImportantUsage(content, file);
    
    // 4. Detect high specificity selectors
    detectHighSpecificitySelectors(content, file);
    
    // Write changes if content was modified
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`  Updated ${file}`);
    } else {
      console.log(`  No changes needed in ${file}`);
    }
    
    stats.filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
});

/**
 * Fix missing units in numeric values
 */
function fixMissingUnits(content) {
  // Match property: value pairs
  let unitFixedContent = content;
  
  // Find property-value declarations with missing units
  const propertyValueRegex = /([a-zA-Z\-]+)\s*:\s*(-?[0-9]+)(?![a-zA-Z0-9.%])\s*(;|\}|\!important)/g;
  
  unitFixedContent = unitFixedContent.replace(propertyValueRegex, (match, property, value, ending) => {
    const trimmedProperty = property.trim();
    
    // Check if this property needs units
    if (PROPERTIES_REQUIRING_UNITS.includes(trimmedProperty)) {
      // Skip 0 values - they don't need units
      if (value === '0') {
        return match;
      }
      
      // Determine appropriate unit based on property
      let unit = 'px'; // Default to px for most properties
      
      // Check if property has a special unit
      if (trimmedProperty in SPECIAL_UNIT_PROPERTIES) {
        unit = SPECIAL_UNIT_PROPERTIES[trimmedProperty];
      }
      
      stats.unitsFixes++;
      return `${property}: ${value}${unit}${ending}`;
    }
    
    // Special handling for properties that should be either 0 or have units
    if (PROPERTIES_ZERO_OR_UNITS.includes(trimmedProperty)) {
      // These properties usually don't need units, unless specified
      return match;
    }
    
    // Default: return the original match
    return match;
  });
  
  return unitFixedContent;
}

/**
 * Fix common syntax errors in CSS
 */
function fixSyntaxErrors(content) {
  let fixedContent = content;
  
  // 1. Fix missing closing braces
  // Count opening and closing braces
  const openBraces = (fixedContent.match(/{/g) || []).length;
  const closeBraces = (fixedContent.match(/}/g) || []).length;
  
  // Add missing closing braces if needed
  if (openBraces > closeBraces) {
    const missingBraces = openBraces - closeBraces;
    fixedContent += '\n' + '}'.repeat(missingBraces);
    stats.syntaxFixes += missingBraces;
  }
  
  // 2. Fix duplicate selectors
  const duplicateSelectorRegex = /([a-zA-Z0-9\s\.\#\[\]\:\-\_\>\+\~]+),\s*([a-zA-Z0-9\s\.\#\[\]\:\-\_\>\+\~]+),/g;
  fixedContent = fixedContent.replace(duplicateSelectorRegex, (match, selector1, selector2) => {
    stats.syntaxFixes++;
    return `${selector1}, ${selector2}`;
  });
  
  // 3. Fix missing semicolons
  const missingSemicolonRegex = /([a-zA-Z\-]+)\s*:\s*([^;}]+)\s*(?=\})/g;
  fixedContent = fixedContent.replace(missingSemicolonRegex, (match, property, value) => {
    stats.syntaxFixes++;
    return `${property}: ${value};`;
  });
  
  // 4. Fix broken pseudo-elements (triple colons)
  const triplePseudoRegex = /:::/g;
  fixedContent = fixedContent.replace(triplePseudoRegex, '::');
  
  // 5. Fix media query syntax
  const mediaQueryRegex = /@media\s*([^{]+)\s*{/g;
  fixedContent = fixedContent.replace(mediaQueryRegex, (match, conditions) => {
    if (!conditions.includes('(') && !conditions.includes(')')) {
      stats.syntaxFixes++;
      return `@media (${conditions}) {`;
    }
    return match;
  });
  
  return fixedContent;
}

/**
 * Analyze !important usage in CSS file
 */
function analyzeImportantUsage(content, filename) {
  const importantMatches = content.match(/\!important/g) || [];
  stats.importantUsages += importantMatches.length;
  
  if (importantMatches.length > 0) {
    console.log(`  [WARNING] Found ${importantMatches.length} !important declarations in ${filename}`);
  }
}

/**
 * Detect high specificity selectors
 */
function detectHighSpecificitySelectors(content, filename) {
  // Simple heuristic: count the number of selectors with more than 3 elements
  const selectors = content.match(/[^{]+{/g) || [];
  
  let highSpecificityCount = 0;
  selectors.forEach(selector => {
    // Count spaces, >, +, ~ in the selector (indicates nesting/combinators)
    const nestingLevel = (selector.match(/[\s>+~]/g) || []).length;
    
    // Count IDs in the selector
    const idCount = (selector.match(/#[a-zA-Z0-9\-_]+/g) || []).length;
    
    // High specificity heuristic
    if (nestingLevel > 3 || idCount > 1 || (nestingLevel > 2 && idCount > 0)) {
      highSpecificityCount++;
    }
  });
  
  stats.highSpecificitySelectors += highSpecificityCount;
  
  if (highSpecificityCount > 0) {
    console.log(`  [WARNING] Found ${highSpecificityCount} high specificity selectors in ${filename}`);
  }
}

// Print summary
console.log('\nCSS Fix Summary:');
console.log('---------------');
console.log(`Files processed: ${stats.filesProcessed}`);
console.log(`Missing units fixed: ${stats.unitsFixes}`);
console.log(`Syntax errors fixed: ${stats.syntaxFixes}`);
console.log(`!important declarations detected: ${stats.importantUsages}`);
console.log(`High specificity selectors detected: ${stats.highSpecificitySelectors}`);
console.log('\nNext Steps:');
console.log('1. Manually review !important usages');
console.log('2. Refactor high specificity selectors');
console.log('3. Implement BEM naming convention'); 