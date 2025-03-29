/**
 * Comprehensive CSS Syntax Fixer
 * --------------------------------
 * This script combines multiple CSS fixing strategies to resolve syntax errors in CSS files.
 * It runs stylelint to identify issues, then applies specialized fixes for common problems.
 * 
 * Usage: node fix-css.js [optional: file path pattern]
 * Example: node fix-css.js "src/styles/**/*.css"
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Default file pattern to check
const DEFAULT_FILE_PATTERN = "src/styles/**/*.css";

// Get file pattern from command line args or use default
const filePattern = process.argv[2] || DEFAULT_FILE_PATTERN;

console.log(`🔍 Checking CSS files matching: ${filePattern}`);

// Run stylelint to find errors
exec(`npx stylelint "${filePattern}" --formatter json`, (error, stdout, stderr) => {
  if (stderr) {
    console.error(`⚠️ Error running stylelint: ${stderr}`);
    return;
  }

  // If no output, there are no errors to fix
  if (!stdout.trim()) {
    console.log('✅ No CSS syntax errors found!');
    return;
  }

  let results;
  try {
    results = JSON.parse(stdout);
  } catch (e) {
    console.error(`⚠️ Error parsing stylelint output: ${e.message}`);
    return;
  }

  // Filter results to only include files with errors
  const filesWithErrors = results.filter(result => result.warnings.length > 0);
  
  if (filesWithErrors.length === 0) {
    console.log('✅ No CSS syntax errors found!');
    return;
  }

  console.log(`🛠️ Found ${filesWithErrors.length} files with CSS syntax errors.`);
  
  // Process each file with errors
  let fixedCount = 0;
  filesWithErrors.forEach(fileResult => {
    const filePath = fileResult.source;
    const warnings = fileResult.warnings;
    
    console.log(`\n🔧 Fixing ${filePath} (${warnings.length} issues)`);
    
    try {
      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Apply fixes in order of increasing complexity
      content = fixMissingSemicolons(content);
      content = fixPseudoElements(content);
      content = fixMalformedSelectorsAndDeclarations(content);
      content = fixUnclosedBlocks(content);
      content = removeInvalidContent(content);
      
      // Check if we made any changes
      if (content !== originalContent) {
        // Write changes back to file
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed issues in ${filePath}`);
        fixedCount++;
      } else {
        console.log(`  ⚠️ No automatic fixes applied to ${filePath}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
    }
  });

  console.log(`\n📊 Summary: Fixed ${fixedCount} of ${filesWithErrors.length} files with syntax errors.`);
  
  // Run stylelint again to check if all errors were fixed
  console.log('\n🔍 Running final check for remaining errors...');
  
  exec(`npx stylelint "${filePattern}"`, (error, stdout, stderr) => {
    if (stderr) {
      console.error(`⚠️ Error running final stylelint check: ${stderr}`);
      return;
    }

    if (!stdout.trim()) {
      console.log('🎉 All CSS syntax errors have been fixed!');
    } else {
      console.log('⚠️ Some CSS syntax errors could not be automatically fixed.');
      console.log('📝 Details of remaining errors:');
      console.log(stdout);
    }
  });
});

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
 * Fix malformed pseudo-elements
 */
function fixPseudoElements(content) {
  // Fix malformed pseudo elements like : :before (with a space)
  let fixedContent = content.replace(/:\s+:([a-zA-Z-]+)/g, '::$1');
  
  // Fix malformed pseudo elements with be/* for */ display: block;e pattern
  fixedContent = fixedContent.replace(/::be\/\*\s*for\s*\*\/\s*display:\s*block;e/g, '::before');
  
  // Fix malformed pseudo elements with afterfter pattern
  fixedContent = fixedContent.replace(/::afterfter/g, '::after');
  
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
  
  // Fix text-a { text-decoration: none; } pattern
  fixedContent = fixedContent.replace(/text-a\s*{\s*text-decoration:\s*none;\s*}/g, 'text-align: center;');
  
  // Fix transm: translate pattern
  fixedContent = fixedContent.replace(/transm:\s*translate/g, 'transform: translate');
  
  // Fix malformed color: inherit values
  fixedContent = fixedContent.replace(/color:\s*inherit;\s*-/g, '--');
  fixedContent = fixedContent.replace(/var\(--color:\s*inherit;/g, 'var(--');
  
  // Fix broken "Unknown word uto" pattern
  fixedContent = fixedContent.replace(/([a-zA-Z-]+):\s*([a-zA-Z]+)uto/g, '$1: auto');
  
  // Fix broken "Unknown word ll" pattern
  fixedContent = fixedContent.replace(/([a-zA-Z-]+):\s*([a-zA-Z]+)ll/g, '$1: all');
  
  // Fix unitless numeric values
  fixedContent = fixedContent.replace(/:\s*(\d+)(?!\d*px|\d*%|\d*em|\d*rem|\d*vh|\d*vw|\d*s|\d*ms)([,;\s}]|$)/g, ': $1px$2');
  
  return fixedContent;
}

/**
 * Fix unclosed blocks
 */
function fixUnclosedBlocks(content) {
  // First, count opening and closing braces properly, excluding those in comments
  let depth = 0;
  let inComment = false;
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
 * Remove invalid content
 */
function removeInvalidContent(content) {
  // Remove any remaining malformed content patterns
  let fixedContent = content;
  
  // Remove embedded HTML fragments
  fixedContent = fixedContent.replace(/a\s*{\s*text-decoration:\s*none;\s*}/g, '');
  
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