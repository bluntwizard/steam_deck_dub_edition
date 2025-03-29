/**
 * Script to fix indentation issues in CSS files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Target these specific files that have indentation issues
const targetFiles = [
  'src/styles/utilities/pseudo-elements.css',
  'src/styles/utilities/debug.css',
  'src/themes/dracula/theme.css'
];

console.log('Fixing indentation issues in CSS files...');

targetFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

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
      inComment = true;
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
    
    // Handle media queries
    if (trimmedLine.includes('@media') && trimmedLine.includes('{')) {
      inMedia = true;
      indentLevel = 1;
      formattedLines.push(trimmedLine);
      return;
    }
    
    // Handle selector blocks
    if (trimmedLine.includes('{') && !trimmedLine.includes('}')) {
      inSelector = true;
      
      // If inside media query, add additional indentation
      const indent = ' '.repeat(inMedia ? indentLevel * 2 : 0);
      formattedLines.push(`${indent}${trimmedLine}`);
      
      // Increase indent for properties
      indentLevel = inMedia ? 2 : 1;
      return;
    }
    
    // Handle closing brackets
    if (trimmedLine.includes('}')) {
      inSelector = false;
      
      // Decrease indent level for closing
      indentLevel = inMedia ? 1 : 0;
      
      // If closing media query
      if (inMedia && trimmedLine === '}') {
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
  
  // Write back to the file
  fs.writeFileSync(filePath, formattedContent, 'utf8');
  console.log(`Fixed indentation in ${filePath}`);
});

console.log('Indentation fix completed!'); 