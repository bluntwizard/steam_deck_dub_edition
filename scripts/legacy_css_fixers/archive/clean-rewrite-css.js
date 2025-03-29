/**
 * CSS Clean Rewrite Script
 * 
 * This script completely rewrites problematic CSS files with clean syntax.
 * It uses pattern matching to extract selectors and properties, then 
 * reconstructs them with proper formatting.
 */

const fs = require('fs');
const path = require('path');

// Files with syntax errors that need complete rewriting
const filesToFix = [
  'src/styles/progress-tracker.css',
  'src/styles/components/accessibility-controls.css',
  'src/styles/components/lightbox.css',
  'src/styles/components/preferences-dialog.css',
  'src/styles/components/progress-tracker.css',
  'src/styles/layouts/header.css',
  'src/styles/layouts/main-layout.css',
  'src/styles/core/base.css',
  'src/styles/core/consolidated.css'
];

// Counter for fixed files
let fixedCount = 0;

// Process each file
filesToFix.forEach(filePath => {
  console.log(`Clean rewriting ${filePath}`);
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract rules using regex patterns
    const rules = extractRules(content);
    
    // Rewrite the CSS with clean syntax
    const cleanCss = rewriteCleanCss(rules);
    
    // Write the clean CSS back to the file
    fs.writeFileSync(filePath, cleanCss);
    console.log(`  Successfully rewrote ${filePath}`);
    fixedCount++;
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\nSuccessfully rewrote ${fixedCount} CSS files with clean syntax.`);

/**
 * Extract CSS rules from malformed content
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
        currentSelector = currentSelector.replace(/,\./g, ', .')
          .replace(/,\s*$/, '')
          .replace(/:([a-zA-Z\-]+)\s+{/g, ':$1 {')
          .replace(/:\s+:/g, '::')
          .replace(/:\s*:([a-zA-Z\-]+)/g, '::$1')
          .replace(/::([a-zA-Z\-]+)\s*{;/g, '::$1 {')
          .trim();
          
        if (currentSelector.includes(',')) {
          // Properly format comma-separated selectors
          currentSelector = currentSelector.split(',')
            .map(s => s.trim())
            .filter(s => s)
            .join(', ');
        }
        
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
  
  // Handle any unclosed rules
  if (inRule) {
    if (inMedia) {
      rules.push({
        type: 'media',
        query: mediaQuery,
        rules: [{ type: 'rule', selector: currentSelector, properties: properties }]
      });
    } else {
      rules.push({ type: 'rule', selector: currentSelector, properties: properties });
    }
  }
  
  return rules;
}

/**
 * Add property to properties array
 */
function addProperty(line, properties) {
  // Clean up property declaration
  let propLine = line.trim();
  
  // Skip if it's empty
  if (!propLine) return;
  
  // Add semicolons if missing
  if (!propLine.endsWith(';') && !propLine.endsWith('}')) {
    propLine += ';';
  }
  
  // Split multiple properties on the same line
  if (propLine.includes(';')) {
    const propParts = propLine.split(';');
    for (let part of propParts) {
      part = part.trim();
      if (!part) continue;
      
      // Try to extract property and value
      if (part.includes(':')) {
        const [prop, ...valueParts] = part.split(':');
        let value = valueParts.join(':').trim();
        
        // Clean up common issues in property values
        if (value.includes('rgb(') && !value.includes(',')) {
          // Fix RGB notation
          value = value.replace(/rgb\(([0-9]+)\s+([0-9]+)\s+([0-9]+)\s*\/\s*([0-9]+)%\)/g, 
                               'rgba($1, $2, $3, 0.$4)');
        }
        
        // Fix numeric values without units
        value = value.replace(/\b(\d+)($|[^a-zA-Z%])/g, '$1px$2')
                    .replace(/(\d+)px%/g, '$1%')
                    .replace(/(\d+)pxpx/g, '$1px')
                    .replace(/(\d+)pxem/g, '$1em')
                    .replace(/(\d+)pxrem/g, '$1rem')
                    .replace(/0px/g, '0')
                    .replace(/\s+/g, ' ');
        
        if (value.includes('transm')) {
          value = value.replace(/transm/g, 'transform');
        }
        
        // Fix special case properties
        if (prop.trim() === 'transition' && value === 'all 0.2s') {
          value = 'all 0.2s ease';
        }
        
        properties.push({ property: prop.trim(), value: value });
      } else {
        // Might be a malformed property, try to recover
        if (part.match(/^[a-zA-Z\-]+$/)) {
          // Looks like just a property name without value
          properties.push({ property: part, value: 'initial' });
        }
      }
    }
  }
}

/**
 * Rewrite clean CSS from extracted rules
 */
function rewriteCleanCss(rules) {
  let css = '';
  
  for (const rule of rules) {
    switch (rule.type) {
      case 'comment':
        css += `${rule.content.trim()}\n\n`;
        break;
      
      case 'rule':
        const selector = rule.selector.trim();
        css += `${selector} {\n`;
        
        if (rule.properties && rule.properties.length > 0) {
          // Add properties with proper indentation
          for (const prop of rule.properties) {
            css += `  ${prop.property}: ${prop.value};\n`;
          }
        }
        
        css += `}\n\n`;
        break;
      
      case 'media':
        css += `${rule.query} {\n`;
        
        if (rule.rules && rule.rules.length > 0) {
          for (const mediaRule of rule.rules) {
            const selector = mediaRule.selector.trim();
            css += `  ${selector} {\n`;
            
            if (mediaRule.properties && mediaRule.properties.length > 0) {
              // Add properties with proper indentation
              for (const prop of mediaRule.properties) {
                css += `    ${prop.property}: ${prop.value};\n`;
              }
            }
            
            css += `  }\n\n`;
          }
        }
        
        css += `}\n\n`;
        break;
      
      case 'at-rule':
        css += `${rule.content.trim()}\n\n`;
        break;
    }
  }
  
  return css;
} 