/**
 * CSS Indentation Fix Script
 * This script standardizes indentation in all CSS files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all CSS files
const cssFiles = glob.sync('**/*.css', {
  ignore: ['node_modules/**', 'build/**', 'dist/**', 'src/assets/fonts/**']
});

console.log(`Found ${cssFiles.length} CSS files to process for indentation`);

// Process each file
cssFiles.forEach(filePath => {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Split the content into lines
  const lines = content.split('\n');
  const formattedLines = [];
  
  let inComment = false;
  let inSelector = false;
  let inMedia = false;
  let indentLevel = 0;
  
  // Process each line
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine === '') {
      formattedLines.push('');
      return;
    }
    
    // Handle comment blocks
    if (trimmedLine.startsWith('/*')) {
      inComment = !trimmedLine.endsWith('*/');
      formattedLines.push(trimmedLine);
      return;
    }
    
    if (inComment) {
      formattedLines.push(trimmedLine);
      if (trimmedLine.endsWith('*/')) {
        inComment = false;
      }
      return;
    }
    
    // Handle media queries and keyframes
    if ((trimmedLine.includes('@media') || trimmedLine.includes('@keyframes')) && trimmedLine.includes('{')) {
      inMedia = true;
      indentLevel = 1;
      formattedLines.push(trimmedLine);
      return;
    }
    
    // Handle selector blocks
    if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
      // If this is a nested selector inside a media query
      if (inMedia && !inSelector) {
        indentLevel = 2;
      } else if (!inSelector) {
        indentLevel = 1;
      } else {
        // Nested selector
        indentLevel++;
      }
      
      inSelector = true;
      
      // Apply indentation
      const indent = ' '.repeat(Math.max(0, indentLevel - 1) * 2);
      formattedLines.push(`${indent}${trimmedLine}`);
      return;
    }
    
    // Handle closing brackets
    if (trimmedLine.includes('}')) {
      if (inSelector) {
        indentLevel = Math.max(0, indentLevel - 1);
        inSelector = indentLevel > 0;
      } else if (inMedia) {
        inMedia = false;
        indentLevel = 0;
      }
      
      const indent = ' '.repeat(indentLevel * 2);
      formattedLines.push(`${indent}${trimmedLine}`);
      return;
    }
    
    // Regular properties
    if (inSelector || inMedia) {
      const indent = ' '.repeat(indentLevel * 2);
      formattedLines.push(`${indent}${trimmedLine}`);
      return;
    }
    
    // Other lines (like at-rules)
    formattedLines.push(trimmedLine);
  });
  
  // Join the formatted lines
  const formattedContent = formattedLines.join('\n');
  
  // Write back to the file if changed
  if (formattedContent !== content) {
    fs.writeFileSync(filePath, formattedContent, 'utf8');
    console.log(`Fixed indentation in ${filePath}`);
  }
});

console.log('CSS indentation fix completed!'); 