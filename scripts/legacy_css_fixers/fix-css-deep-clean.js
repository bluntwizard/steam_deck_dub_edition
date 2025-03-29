/**
 * Deep CSS Cleanup Script
 * 
 * This script performs a more aggressive cleanup of CSS files
 * with severe syntax issues that stylelint can't handle.
 */

const fs = require('fs');
const path = require('path');

// Files with syntax errors that need deep cleaning
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
  console.log(`Deep cleaning ${filePath}`);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 1. Fix CSS comments
    content = fixCssComments(content);
    
    // 2. Fix malformed pseudo-elements
    content = fixPseudoElements(content);
    
    // 3. Fix malformed selectors and declarations
    content = fixMalformedSelectorsAndDeclarations(content);
    
    // 4. Fix unclosed blocks
    content = fixUnclosedBlocks(content);
    
    // 5. Fix missing semicolons
    content = fixMissingSemicolons(content);
    
    // 6. Remove invalid content
    content = removeInvalidContent(content);
    
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

console.log(`\nDeep cleaned ${fixedCount} files with syntax errors.`);

/**
 * Fix CSS comments that are incorrectly formatted
 */
function fixCssComments(content) {
  // Fix malformed comments or non-comment asterisks at the beginning
  let fixedContent = content.replace(/^\s*\*([^\/])/gm, '/* $1');
  
  // Fix unclosed comments
  fixedContent = fixedContent.replace(/\/\*(?!\s*\*\/)/g, '/* ');
  
  // Fix unterminated comments
  fixedContent = fixedContent.replace(/\/\*([^*]*[^\/]*)\n/g, '/* $1 */\n');
  
  // Fix "/* for */ display: block;" pattern that's appearing frequently
  fixedContent = fixedContent.replace(/\/\*\s*for\s*\*\/\s*display:\s*block;/g, '');
  
  return fixedContent;
}

/**
 * Fix malformed pseudo-elements
 */
function fixPseudoElements(content) {
  // Fix malformed pseudo elements like : :before (with a space)
  let fixedContent = content.replace(/:\s+:([a-zA-Z-]+)/g, '::$1');
  
  // Fix malformed pseudo elements with be/* for */ display: block;e pattern
  fixedContent = fixedContent.replace(/::be\/\*\s*for\s*\*\/\s*display:\s*block;e/g, '::before');
  
  // Fix malformed pseudo elements with a {... pattern
  fixedContent = fixedContent.replace(/::a\s*{[\s\S]*?text-decoration:\s*none;\s*}/g, '::after');
  
  // Fix other pseudo element issues
  fixedContent = fixedContent.replace(/:\s*:([a-zA-Z-]+)\s*{;/g, '::$1 {');
  
  return fixedContent;
}

/**
 * Fix malformed selectors and declarations
 */
function fixMalformedSelectorsAndDeclarations(content) {
  let fixedContent = content;
  
  // Fix position: a {...} pattern
  fixedContent = fixedContent.replace(/position:\s*a\s*{[\s\S]*?text-decoration:\s*none;\s*}/g, 'position: absolute;');
  
  // Fix orphaned property values
  fixedContent = fixedContent.replace(/^\s*(top|left|right|bottom|width|height|margin|padding|color|background|font-size|display):/gm, '\n  $1:');
  
  // Fix content: attr(...) patterns
  fixedContent = fixedContent.replace(/content:\s*a\s*{[\s\S]*?}\s*ttr/g, 'content: attr');
  
  // Fix duplicate selector comment but missing selector
  fixedContent = fixedContent.replace(/\/\*\s*Duplicate selector[^\*]+\*\/\s*position:/g, '{\n  position:');
  
  // Fix selector,.class pattern (missing space after comma)
  fixedContent = fixedContent.replace(/([a-zA-Z0-9-_]+),\.([a-zA-Z0-9-_]+)/g, '$1, .$2');
  
  // Fix broken "Unknown word uto" pattern
  fixedContent = fixedContent.replace(/([a-zA-Z-]+):\s*([a-zA-Z]+)uto/g, '$1: auto');
  
  // Fix broken "Unknown word ll" pattern
  fixedContent = fixedContent.replace(/([a-zA-Z-]+):\s*([a-zA-Z]+)ll/g, '$1: all');
  
  // Fix broken comments
  fixedContent = fixedContent.replace(/\*\\\//g, '*/');
  
  // Fix unknown word "deck" and "debug"
  fixedContent = fixedContent.replace(/Unknown word (Deck|Debug)/g, '/* Steam $1 */');
  
  return fixedContent;
}

/**
 * Fix unclosed blocks
 */
function fixUnclosedBlocks(content) {
  // First, count opening and closing braces properly, excluding those in comments
  let depth = 0;
  let inComment = false;
  let needsClosing = false;
  let result = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1] || '';
    
    // Check for comment start
    if (char === '/' && nextChar === '*' && !inComment) {
      inComment = true;
      result += '/*';
      i++; // Skip the next character
      continue;
    }
    
    // Check for comment end
    if (char === '*' && nextChar === '/' && inComment) {
      inComment = false;
      result += '*/';
      i++; // Skip the next character
      continue;
    }
    
    // Only count braces outside comments
    if (!inComment) {
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        // Handle negative depth (more closing than opening)
        if (depth < 0) {
          depth = 0;
        }
      }
    }
    
    result += char;
  }
  
  // Close any unclosed blocks
  if (depth > 0) {
    result += '\n' + '}'.repeat(depth);
  }
  
  return result;
}

/**
 * Fix missing semicolons
 */
function fixMissingSemicolons(content) {
  // Fix property values without semicolons 
  return content.replace(/([a-zA-Z-]+)\s*:\s*([^;{}]*)(?=\s*[}]|\s+[a-zA-Z-]+\s*:)/g, (match, prop, value) => {
    return `${prop}: ${value.trim()};`;
  });
}

/**
 * Remove invalid content
 */
function removeInvalidContent(content) {
  // Remove any remaining malformed content patterns
  let fixedContent = content;
  
  // Remove text fragments that appear to be part of broken comments
  fixedContent = fixedContent.replace(/\*\\\/[\s\S]*?$/gm, '*/\n');
  
  // Clean up any orphaned property values without properties
  fixedContent = fixedContent.replace(/^\s*:\s*[^;{}]+;\s*$/gm, '');
  
  // Remove lines with only property names and no values
  fixedContent = fixedContent.replace(/^\s*[a-zA-Z-]+:\s*$/gm, '');
  
  // Remove double semicolons
  fixedContent = fixedContent.replace(/;;/g, ';');
  
  // Clean up empty rules
  fixedContent = fixedContent.replace(/[^{}]*{\s*}/g, '');
  
  // Fix any trailing commas in selector lists
  fixedContent = fixedContent.replace(/,\s*{/g, ' {');
  
  return fixedContent;
} 