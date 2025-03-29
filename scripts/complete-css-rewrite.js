/**
 * Complete CSS Rewrite Script
 *
 * This script completely rewrites all problematic CSS files,
 * removing HTML fragments and fixing common syntax issues.
 */

const fs = require('fs');
const path = require('path');

// List of all files we need to fix
const filesToFix = [
  'src/styles/progress-tracker.css',
  'src/styles/layouts/header.css',
  'src/styles/layouts/main-layout.css',
  'src/styles/components/accessibility-controls.css',
  'src/styles/components/lightbox.css',
  'src/styles/components/preferences-dialog.css', 
  'src/styles/components/progress-tracker.css',
  'src/styles/core/base.css',
  'src/styles/core/consolidated.css'
];

// Counter for fixed files
let fixedCount = 0;

// Process each file
for (const filePath of filesToFix) {
  console.log(`Complete rewrite of ${filePath}`);
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Clean up the CSS content
    const cleanCss = cleanupCss(content);
    
    // Write back to file
    fs.writeFileSync(filePath, cleanCss);
    console.log(`  Successfully rewrote ${filePath}`);
    fixedCount++;
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
}

console.log(`\nSuccessfully rewrote ${fixedCount} CSS files.`);

/**
 * Clean up CSS content
 */
function cleanupCss(content) {
  // Remove embedded HTML fragments
  let cleaned = content
    // Remove HTML anchor fragments
    .replace(/a\s*{\s*text-decoration:\s*none;\s*}/g, '')
    // Fix word fragments
    .replace(/\blign\b/g, 'align')
    .replace(/\buto\b/g, 'auto')
    .replace(/\bbsolute\b/g, 'absolute')
    .replace(/\btransm\b/g, 'transform')
    .replace(/\bll\b/g, 'all');
  
  // Split into lines for line-by-line processing
  const lines = cleaned.split('\n');
  const cleanedLines = [];
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (!line) {
      cleanedLines.push('');
      continue;
    }
    
    // Fix incorrect property-value pairs
    if (line.includes(':') && !line.includes('{') && !line.includes('}')) {
      const colonPos = line.indexOf(':');
      const property = line.substring(0, colonPos).trim();
      let value = line.substring(colonPos + 1).trim();
      
      // Fix common value issues
      if (!value.endsWith(';')) {
        value += ';';
      }
      
      // Fix unitless numeric values
      value = value.replace(/\b(\d+)(?!\d*px|\d*%|\d*em|\d*rem|\d*vh|\d*vw|\d*s|\d*ms|\d*ch|\d*dpi|\d*deg)([,;\s]|$)/g, '$1px$2');
      
      // Fix CSS variables
      if (value.includes('var(--') && value.match(/var\(--[^)]*:[^)]*\)/)) {
        value = value.replace(/var\(--([^:)]+):([^)]+)\)/g, 'var(--$1)');
      }
      
      // Clean up value
      value = value.replace(/;+/g, ';');
      
      line = `${property}: ${value}`;
    }
    
    // Fix malformed selectors
    if (line.includes('{')) {
      const bracePos = line.indexOf('{');
      let selector = line.substring(0, bracePos).trim();
      const rest = line.substring(bracePos);
      
      // Handle comma-separated selectors
      if (selector.includes(',')) {
        selector = selector.split(',')
          .map(s => s.trim())
          .filter(s => s)
          .join(', ');
      }
      
      line = `${selector} ${rest}`;
    }
    
    cleanedLines.push(line);
  }
  
  let result = cleanedLines.join('\n');
  
  // Fix unclosed brackets - make sure they're balanced
  const openBraces = (result.match(/{/g) || []).length;
  const closeBraces = (result.match(/}/g) || []).length;
  
  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    // Add closing braces
    for (let i = 0; i < diff; i++) {
      result += '\n}';
    }
  } else if (closeBraces > openBraces) {
    // Too many closing braces - rebuild the CSS
    result = rebuildCssStructure(result);
  }
  
  return result;
}

/**
 * Completely rebuild CSS structure by extracting valid rules
 */
function rebuildCssStructure(content) {
  const rules = [];
  let buffer = '';
  let inSelector = false;
  let inRule = false;
  let inComment = false;
  
  // Split by meaningful characters
  const tokens = content.split(/([{}])/).map(t => t.trim()).filter(t => t);
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token === '{') {
      inRule = true;
      inSelector = false;
      continue;
    } else if (token === '}') {
      inRule = false;
      if (buffer.trim()) {
        // We have a complete rule
        const rule = buffer.trim();
        buffer = '';
        
        // Extract properties
        const properties = rule.split(';')
          .map(p => p.trim())
          .filter(p => p && p.includes(':'));
          
        if (rules.length > 0 && properties.length > 0) {
          // Add properties to the last rule
          rules[rules.length - 1].properties = properties;
        }
      }
      continue;
    }
    
    if (!inRule && !inSelector) {
      // This must be a selector
      inSelector = true;
      rules.push({
        selector: token,
        properties: []
      });
    } else if (inRule) {
      // This is rule content
      buffer += token;
    }
  }
  
  // Rebuild clean CSS
  let cleanCss = '';
  
  for (const rule of rules) {
    if (rule.selector.startsWith('/*')) {
      // This is a comment
      cleanCss += `${rule.selector}\n\n`;
    } else {
      // This is a regular rule
      cleanCss += `${rule.selector} {\n`;
      
      for (const prop of rule.properties) {
        if (prop.includes(':')) {
          cleanCss += `  ${prop};\n`;
        }
      }
      
      cleanCss += '}\n\n';
    }
  }
  
  return cleanCss;
} 