/**
 * Fix Bracket Errors Script
 *
 * This script handles the CSS files with unexpected bracket errors
 * by completely restructuring their content using a full parse/rewrite approach.
 */

const fs = require('fs');

// Files with bracket balance issues
const filesToFix = [
  'src/styles/core/base.css',
  'src/styles/core/consolidated.css',
  'src/styles/components/accessibility-controls.css',
  'src/styles/components/preferences-dialog.css'
];

// Counter for fixed files
let fixedCount = 0;

// Process each file
filesToFix.forEach(filePath => {
  console.log(`Fixing bracket errors in ${filePath}`);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Basic structure extraction
    const rules = [];
    let buffer = '';
    let inRule = false;
    let inComment = false;
    let braceLevel = 0;
    let currentSelector = '';
    
    // Split content into lines
    const lines = content.split('\n');
    
    // First pass - extract valid CSS rules
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Handle comments
      if (line.includes('/*') && !inComment) {
        inComment = true;
        buffer += line + '\n';
        continue;
      }
      
      if (inComment) {
        buffer += line + '\n';
        if (line.includes('*/')) {
          inComment = false;
          rules.push({
            type: 'comment',
            content: buffer.trim()
          });
          buffer = '';
        }
        continue;
      }
      
      // Check for selector/rule start
      if (!inRule && line.includes('{')) {
        inRule = true;
        braceLevel++;
        currentSelector = line.substring(0, line.indexOf('{')).trim();
        buffer = '  ' + line.substring(line.indexOf('{') + 1).trim() + '\n';
        
        // Handle one-line rules
        if (line.includes('}')) {
          inRule = false;
          braceLevel--;
          rules.push({
            type: 'rule',
            selector: currentSelector,
            content: buffer.trim()
          });
          buffer = '';
        }
      } 
      // Handle rule content or nested rules
      else if (inRule) {
        // Track brace level for nested structures
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        
        braceLevel += openBraces - closeBraces;
        
        // Add line to buffer
        buffer += '  ' + line + '\n';
        
        // Rule is complete when we return to initial brace level
        if (braceLevel === 0) {
          inRule = false;
          rules.push({
            type: 'rule',
            selector: currentSelector,
            content: buffer.trim()
          });
          buffer = '';
        }
      }
      // Handle at-rules that don't use braces
      else if (line.startsWith('@') && !line.includes('{')) {
        rules.push({
          type: 'at-rule',
          content: line
        });
      }
      // Handle potential selector without opening brace
      else {
        // This might be a stray property or a selector waiting for a brace
        if (line.includes(':') && !line.includes('{')) {
          // This looks like a property, attach to the last rule if any
          if (rules.length > 0 && rules[rules.length - 1].type === 'rule') {
            rules[rules.length - 1].content += '\n  ' + line;
          }
        } else {
          // This might be a partial selector - store it for next line
          currentSelector = line;
        }
      }
    }
    
    // Second pass - clean up and restructure each rule
    let cleanCss = '';
    
    rules.forEach(rule => {
      if (rule.type === 'comment') {
        cleanCss += rule.content + '\n\n';
      } else if (rule.type === 'at-rule') {
        cleanCss += rule.content + '\n\n';
      } else if (rule.type === 'rule') {
        // Clean up selector
        const selector = rule.selector
          .replace(/\s+/g, ' ')
          .replace(/,([^\s])/g, ', $1')
          .trim();
        
        // Process rule content - restructure properties
        const properties = [];
        const declarations = rule.content
          .replace(/}/g, '') // Remove any stray closing braces
          .split(/;|\n/)     // Split by semicolon or newline
          .map(item => item.trim())
          .filter(item => item && item.includes(':'));
          
        declarations.forEach(declaration => {
          const colonPos = declaration.indexOf(':');
          if (colonPos > 0) {
            const prop = declaration.substring(0, colonPos).trim();
            const value = declaration.substring(colonPos + 1).trim();
            
            if (prop && value) {
              properties.push({ prop, value });
            }
          }
        });
        
        // Write cleaned rule
        cleanCss += `${selector} {\n`;
        properties.forEach(({ prop, value }) => {
          cleanCss += `  ${prop}: ${value};\n`;
        });
        cleanCss += '}\n\n';
      }
    });
    
    // Write cleaned CSS back to file
    fs.writeFileSync(filePath, cleanCss);
    console.log(`  Successfully restructured ${filePath}`);
    fixedCount++;
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\nSuccessfully restructured ${fixedCount} CSS files with bracket errors.`); 