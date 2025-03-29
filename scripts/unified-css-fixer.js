/**
 * Unified CSS Fixer
 * -----------------
 * A comprehensive tool to fix, validate, and maintain CSS files.
 * Combines the best features from all existing CSS fix scripts.
 * 
 * Usage:
 *   Basic fix:            node unified-css-fixer.js
 *   Specific directory:   node unified-css-fixer.js --dir="src/styles/components"
 *   Specific file:        node unified-css-fixer.js --file="src/styles/core/base.css"
 *   Deep cleaning:        node unified-css-fixer.js --deep-clean
 *   Fix and report only:  node unified-css-fixer.js --report-only
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const glob = require('glob');

// Configuration
const DEFAULT_CSS_PATTERNS = [
  'src/styles/**/*.css',
  'src/themes/**/*.css'
];

// Parse command line arguments
const args = process.argv.slice(2);
let options = {
  targetDir: null,
  targetFile: null,
  deepClean: false,
  reportOnly: false
};

args.forEach(arg => {
  if (arg.startsWith('--dir=')) {
    options.targetDir = arg.substring(6);
  } else if (arg.startsWith('--file=')) {
    options.targetFile = arg.substring(7);
  } else if (arg === '--deep-clean') {
    options.deepClean = true;
  } else if (arg === '--report-only') {
    options.reportOnly = true;
  }
});

// Determine files to process
let cssFilesToProcess = [];

if (options.targetFile) {
  if (fs.existsSync(options.targetFile)) {
    cssFilesToProcess.push(options.targetFile);
  } else {
    console.error(`Error: File ${options.targetFile} not found`);
    process.exit(1);
  }
} else if (options.targetDir) {
  const dirPattern = path.join(options.targetDir, '**/*.css');
  cssFilesToProcess = glob.sync(dirPattern);
  if (cssFilesToProcess.length === 0) {
    console.error(`Error: No CSS files found in ${options.targetDir}`);
    process.exit(1);
  }
} else {
  // Use default patterns
  DEFAULT_CSS_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern);
    cssFilesToProcess.push(...files);
  });
}

// Remove duplicates
cssFilesToProcess = [...new Set(cssFilesToProcess)];

// Stats tracking
const stats = {
  filesProcessed: 0,
  filesWithErrors: 0,
  unitsFixes: 0,
  syntaxFixes: 0,
  indentationFixes: 0,
  selectorFixes: 0,
  importantUsages: 0,
  highSpecificitySelectors: 0
};

console.log(`Found ${cssFilesToProcess.length} CSS files to process`);

// First, run stylelint to detect issues
const stylelintCommand = `npx stylelint "${cssFilesToProcess.join('" "')}" --formatter json`;
exec(stylelintCommand, (error, stdout, stderr) => {
  if (stderr) {
    console.error(`⚠️ Error running stylelint: ${stderr}`);
    return;
  }

  let results = [];
  if (stdout.trim()) {
    try {
      results = JSON.parse(stdout);
    } catch (e) {
      console.error(`⚠️ Error parsing stylelint output: ${e.message}`);
      console.log(stdout);
      return;
    }
  }

  // Group files by severity of issues
  const filesWithErrors = results.filter(result => 
    result.warnings.some(warning => warning.severity === 'error')
  );
  
  const filesWithWarnings = results.filter(result => 
    !filesWithErrors.some(f => f.source === result.source) && 
    result.warnings.some(warning => warning.severity === 'warning')
  );
  
  const filesWithoutIssues = cssFilesToProcess.filter(file => 
    !results.some(result => result.source === file)
  );

  console.log(`\n📊 CSS Files Status:`);
  console.log(`  ✅ ${filesWithoutIssues.length} files with no issues`);
  console.log(`  ⚠️ ${filesWithWarnings.length} files with warnings`);
  console.log(`  ❌ ${filesWithErrors.length} files with errors`);

  stats.filesWithErrors = filesWithErrors.length;

  // Skip further processing if report-only mode
  if (options.reportOnly) {
    console.log("\nDetailed report of issues (report-only mode):");
    reportIssues(results);
    return;
  }

  // Process files with issues, prioritizing those with errors
  const filesToFix = [...filesWithErrors, ...filesWithWarnings];
  
  console.log(`\n🔧 Processing ${filesToFix.length} files with issues...`);
  
  // Process each file with issues
  filesToFix.forEach(fileResult => {
    const filePath = fileResult.source;
    const warnings = fileResult.warnings;
    
    console.log(`\n📝 Fixing ${filePath} (${warnings.length} issues)`);
    
    try {
      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Determine if this file needs deep cleaning based on error count or option
      const needsDeepCleaning = options.deepClean || 
                               warnings.length > 20 || 
                               warnings.some(w => w.rule === 'CssSyntaxError');
      
      if (needsDeepCleaning) {
        console.log(`  🧹 Performing deep cleaning for ${filePath}`);
        content = deepCleanCss(content);
      } else {
        // Apply standard fixes
        content = fixMissingSemicolons(content);
        content = fixPseudoElements(content);
        content = fixMissingUnits(content);
        content = fixIndentation(content);
        content = fixMalformedSelectorsAndDeclarations(content);
        content = fixUnclosedBlocks(content);
        content = removeInvalidContent(content);
      }
      
      // Check if we made any changes
      if (content !== originalContent) {
        if (!options.reportOnly) {
          // Write changes back to file
          fs.writeFileSync(filePath, content);
          console.log(`  ✅ Fixed issues in ${filePath}`);
        } else {
          console.log(`  🔍 Changes detected but not applied (report-only mode)`);
        }
      } else {
        console.log(`  ⚠️ No automatic fixes applied to ${filePath}`);
      }
      
      stats.filesProcessed++;
      
      // Analyze for warnings
      analyzeImportantUsage(content, filePath);
      detectHighSpecificitySelectors(content, filePath);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
    }
  });

  // Run stylelint again to check if all errors were fixed
  console.log('\n🔍 Running final check for remaining issues...');
  
  exec(`npx stylelint "${cssFilesToProcess.join('" "')}"`, (error, stdout, stderr) => {
    if (stderr) {
      console.error(`⚠️ Error running final stylelint check: ${stderr}`);
      return;
    }

    if (!stdout.trim()) {
      console.log('🎉 All CSS syntax errors have been fixed!');
    } else {
      console.log('⚠️ Some CSS issues could not be automatically fixed.');
      console.log('📝 Details of remaining issues:');
      console.log(stdout);
    }
    
    // Print summary
    printSummary();
  });
});

/**
 * Deep clean CSS by completely rewriting it with proper syntax
 */
function deepCleanCss(content) {
  // Extract rules
  const rules = extractRules(content);
  
  // Rewrite with clean syntax
  return rewriteCleanCss(rules);
}

/**
 * Extract CSS rules from potentially malformed content
 */
function extractRules(content) {
  const rules = [];
  let currentSelector = '';
  let inComment = false;
  let inRule = false;
  let inMedia = false;
  let mediaQuery = '';
  let properties = [];
  let buffer = '';
  
  // Split content into lines for easier processing
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip if line is empty
    if (!line) continue;
    
    // Handle comments
    if (line.includes('/*') && !inComment) {
      inComment = true;
      // Extract comment and add to rules
      const commentText = line.substring(line.indexOf('/*'));
      if (commentText.includes('*/')) {
        inComment = false;
        rules.push({ type: 'comment', content: commentText });
        line = line.substring(0, line.indexOf('/*')).trim();
        if (!line) continue;
      } else {
        rules.push({ type: 'comment', content: commentText });
        continue;
      }
    }
    
    if (inComment) {
      if (line.includes('*/')) {
        inComment = false;
        const commentText = line.substring(0, line.indexOf('*/') + 2);
        rules[rules.length - 1].content += ' ' + commentText;
        line = line.substring(line.indexOf('*/') + 2).trim();
        if (!line) continue;
      } else {
        rules[rules.length - 1].content += ' ' + line;
        continue;
      }
    }
    
    // Handle media queries
    if (line.includes('@media') && !inMedia) {
      inMedia = true;
      mediaQuery = line;
      if (line.includes('{')) {
        mediaQuery = line.substring(0, line.indexOf('{')).trim();
        line = line.substring(line.indexOf('{') + 1).trim();
      } else {
        continue;
      }
    }
    
    // Handle selectors and properties
    if (!inRule) {
      if (line.includes('{')) {
        inRule = true;
        currentSelector = line.substring(0, line.indexOf('{')).trim();
        
        // Clean up common issues in selectors
        currentSelector = cleanupSelector(currentSelector);
          
        properties = [];
        line = line.substring(line.indexOf('{') + 1).trim();
        
        if (line.includes('}')) {
          if (line.trim() !== '}') {
            const propLine = line.substring(0, line.indexOf('}')).trim();
            if (propLine) {
              addProperty(propLine, properties);
            }
          }
          inRule = false;
          if (inMedia) {
            rules.push({
              type: 'media',
              query: mediaQuery,
              rules: [{ type: 'rule', selector: currentSelector, properties: properties }]
            });
          } else {
            rules.push({ type: 'rule', selector: currentSelector, properties: properties });
          }
          line = line.substring(line.indexOf('}') + 1).trim();
          if (inMedia && line.includes('}')) {
            inMedia = false;
            line = line.substring(line.indexOf('}') + 1).trim();
          }
          if (line) {
            // Process the rest of the line
            i--; // Reprocess this line
          }
          continue;
        }
      } else if (line.startsWith('}')) {
        if (inMedia) {
          inMedia = false;
        }
        line = line.substring(1).trim();
        if (line) {
          // Process the rest of the line
          i--; // Reprocess this line
        }
        continue;
      } else if (line.startsWith('@')) {
        // Handle other at-rules like @keyframes
        const atRule = line;
        rules.push({ type: 'at-rule', content: atRule });
        continue;
      } else {
        // Might be a malformed line or continuation, try to recover
        if (properties.length > 0) {
          addProperty(line, properties);
        } else {
          // Try to extract selector and continue
          if (line.includes(';')) {
            const propLine = line.trim();
            if (propLine) {
              // This might be an orphaned property, add it to the last rule if any
              if (rules.length > 0 && rules[rules.length - 1].type === 'rule') {
                addProperty(propLine, rules[rules.length - 1].properties);
              }
            }
          } else {
            // This might be part of a selector
            buffer += ' ' + line;
            // Check if the buffer now contains a valid selector
            if (buffer.includes('{')) {
              inRule = true;
              currentSelector = buffer.substring(0, buffer.indexOf('{')).trim();
              properties = [];
              line = buffer.substring(buffer.indexOf('{') + 1).trim();
              buffer = '';
              i--; // Reprocess with this content
              continue;
            }
          }
        }
      }
    } else { // In rule
      if (line.includes('}')) {
        const propLine = line.substring(0, line.indexOf('}')).trim();
        if (propLine) {
          addProperty(propLine, properties);
        }
        inRule = false;
        
        if (inMedia) {
          const mediaRules = rules.find(r => r.type === 'media' && r.query === mediaQuery);
          if (mediaRules) {
            mediaRules.rules.push({ type: 'rule', selector: currentSelector, properties: properties });
          } else {
            rules.push({
              type: 'media',
              query: mediaQuery,
              rules: [{ type: 'rule', selector: currentSelector, properties: properties }]
            });
          }
        } else {
          rules.push({ type: 'rule', selector: currentSelector, properties: properties });
        }
        
        line = line.substring(line.indexOf('}') + 1).trim();
        if (inMedia && line.includes('}')) {
          inMedia = false;
          line = line.substring(line.indexOf('}') + 1).trim();
        }
        if (line) {
          // Process the rest of the line
          i--; // Reprocess this line
        }
      } else {
        addProperty(line, properties);
      }
    }
  }
  
  return rules;
}

/**
 * Clean up common issues in selector syntax
 */
function cleanupSelector(selector) {
  return selector.replace(/,\./g, ', .')
    .replace(/,\s*$/, '')
    .replace(/:([a-zA-Z\-]+)\s+{/g, ':$1 {')
    .replace(/:\s+:/g, '::')
    .replace(/:\s*:([a-zA-Z\-]+)/g, '::$1')
    .replace(/::([a-zA-Z\-]+)\s*{;/g, '::$1 {')
    .trim();
}

/**
 * Add property to properties array after parsing
 */
function addProperty(line, properties) {
  // Handle multiple properties in one line
  const propertyLines = line.split(';').filter(p => p.trim());
  
  for (const propLine of propertyLines) {
    if (propLine.includes(':')) {
      const [property, ...valueParts] = propLine.split(':');
      const value = valueParts.join(':').trim();
      
      if (property && value) {
        properties.push({
          property: property.trim(),
          value: value
        });
        stats.syntaxFixes++;
      }
    }
  }
}

/**
 * Rewrite CSS with clean syntax
 */
function rewriteCleanCss(rules) {
  let css = '';
  
  rules.forEach(rule => {
    if (rule.type === 'comment') {
      css += rule.content + '\n';
    } else if (rule.type === 'rule') {
      css += rule.selector + ' {\n';
      
      rule.properties.forEach(prop => {
        css += `  ${prop.property}: ${prop.value};\n`;
      });
      
      css += '}\n\n';
    } else if (rule.type === 'media') {
      css += rule.query + ' {\n';
      
      rule.rules.forEach(nestedRule => {
        css += '  ' + nestedRule.selector + ' {\n';
        
        nestedRule.properties.forEach(prop => {
          css += `    ${prop.property}: ${prop.value};\n`;
        });
        
        css += '  }\n';
      });
      
      css += '}\n\n';
    } else if (rule.type === 'at-rule') {
      css += rule.content + '\n\n';
    }
  });
  
  return css;
}

/**
 * Fix missing semicolons in CSS declarations
 */
function fixMissingSemicolons(content) {
  const result = content.replace(
    /([a-zA-Z\-]+)\s*:\s*([^;}]+)(?=\s*[}]|$|\s+[a-zA-Z\-]+\s*:)/g,
    (match, property, value) => {
      stats.syntaxFixes++;
      return `${property}: ${value.trim()};`;
    }
  );
  return result;
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
  
  if (fixedContent !== content) {
    stats.selectorFixes++;
  }
  
  return fixedContent;
}

/**
 * Fix missing units in numeric values
 */
function fixMissingUnits(content) {
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
    
    // Default: return the original match
    return match;
  });
  
  return unitFixedContent;
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
  
  // Fix duplicate selectors
  const duplicateSelectorRegex = /([a-zA-Z0-9\s\.\#\[\]\:\-\_\>\+\~]+),\s*([a-zA-Z0-9\s\.\#\[\]\:\-\_\>\+\~]+),/g;
  fixedContent = fixedContent.replace(duplicateSelectorRegex, (match, selector1, selector2) => {
    stats.selectorFixes++;
    return `${selector1}, ${selector2}`;
  });
  
  // Fix broken pseudo-elements (triple colons)
  const triplePseudoRegex = /:::/g;
  fixedContent = fixedContent.replace(triplePseudoRegex, '::');
  
  // Fix media query syntax
  const mediaQueryRegex = /@media\s*([^{]+)\s*{/g;
  fixedContent = fixedContent.replace(mediaQueryRegex, (match, conditions) => {
    if (!conditions.includes('(') && !conditions.includes(')')) {
      stats.syntaxFixes++;
      return `@media (${conditions}) {`;
    }
    return match;
  });
  
  if (fixedContent !== content) {
    stats.selectorFixes++;
  }
  
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
    stats.syntaxFixes += depth;
  }
  
  return result;
}

/**
 * Fix indentation issues in CSS
 */
function fixIndentation(content) {
  let lines = content.split('\n');
  let indentLevel = 0;
  let inComment = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      result.push('');
      continue;
    }
    
    // Handle comments
    if (line.includes('/*') && !line.includes('*/')) {
      inComment = true;
      result.push('  '.repeat(indentLevel) + line);
      continue;
    }
    
    if (inComment) {
      if (line.includes('*/')) {
        inComment = false;
      }
      result.push('  '.repeat(indentLevel) + line);
      continue;
    }
    
    // Handle braces to determine indentation
    if (line.includes('{')) {
      // This is a selector or start of a block
      result.push('  '.repeat(indentLevel) + line);
      indentLevel++;
    } else if (line.includes('}')) {
      // This is the end of a block
      indentLevel = Math.max(0, indentLevel - 1);
      result.push('  '.repeat(indentLevel) + line);
    } else {
      // This is a property or other content
      result.push('  '.repeat(indentLevel) + line);
    }
  }
  
  stats.indentationFixes++;
  return result.join('\n');
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

/**
 * Format and print detailed report of issues
 */
function reportIssues(results) {
  results.forEach(result => {
    const filePath = result.source;
    const warnings = result.warnings;
    
    if (warnings.length > 0) {
      console.log(`\n${filePath}:`);
      
      // Group warnings by rule
      const warningsByRule = {};
      warnings.forEach(warning => {
        if (!warningsByRule[warning.rule]) {
          warningsByRule[warning.rule] = [];
        }
        warningsByRule[warning.rule].push(warning);
      });
      
      // Display warnings grouped by rule
      Object.keys(warningsByRule).forEach(rule => {
        console.log(`  ${rule} (${warningsByRule[rule].length} issues):`);
        
        // Display up to 3 examples per rule
        warningsByRule[rule].slice(0, 3).forEach(warning => {
          console.log(`    Line ${warning.line}:${warning.column} - ${warning.text}`);
        });
        
        if (warningsByRule[rule].length > 3) {
          console.log(`    ... and ${warningsByRule[rule].length - 3} more`);
        }
      });
    }
  });
}

/**
 * Print summary of all fixes and issues
 */
function printSummary() {
  console.log('\n📊 CSS Fix Summary:');
  console.log('------------------');
  console.log(`Files processed: ${stats.filesProcessed} of ${cssFilesToProcess.length}`);
  console.log(`Files with errors: ${stats.filesWithErrors}`);
  console.log(`Missing units fixed: ${stats.unitsFixes}`);
  console.log(`Syntax errors fixed: ${stats.syntaxFixes}`);
  console.log(`Indentation issues fixed: ${stats.indentationFixes}`);
  console.log(`Selector issues fixed: ${stats.selectorFixes}`);
  console.log(`!important declarations detected: ${stats.importantUsages}`);
  console.log(`High specificity selectors detected: ${stats.highSpecificitySelectors}`);
  
  console.log('\n✅ Next Steps:');
  console.log('1. Run the script with --deep-clean flag to fully rewrite problematic files');
  console.log('2. Manually review and refactor high specificity selectors');
  console.log('3. Consider reducing !important usage');
  console.log('4. Follow BEM naming convention for new CSS');
} 