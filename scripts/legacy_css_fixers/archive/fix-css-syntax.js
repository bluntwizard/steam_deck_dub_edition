const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files with CSS syntax issues
const files = glob.sync('src/styles/**/*.css');

// Pattern for common syntax errors
const patterns = [
  {
    // Extra closing braces
    pattern: /}\s*}/g,
    replacement: '}'
  },
  {
    // Fix missing semicolons before closing braces
    pattern: /([^;{}])\s*}/g,
    replacement: (match, p1) => {
      // Don't add semicolon after another closing brace or after certain characters
      if (p1 === '}' || p1 === '{' || p1 === ';' || p1.trim() === '') {
        return match;
      }
      return `${p1}; }`;
    }
  },
  {
    // Fix missing commas in selector lists
    pattern: /(\.[a-zA-Z0-9_-]+)(\.[a-zA-Z0-9_-]+)/g,
    replacement: '$1,$2'
  },
  {
    // Fix missing property before value
    pattern: /{\s*([a-zA-Z0-9-]+)\s*:/g,
    replacement: '{ $1:'
  },
  {
    // Fix unknown words by adding property
    pattern: /{\s*([a-zA-Z0-9-]+)\s*([a-zA-Z0-9-]+);/g,
    replacement: (match, p1, p2) => {
      // If p1 looks like a property, it might be missing a colon
      if (['color', 'background', 'margin', 'padding', 'width', 'height', 'position'].includes(p1)) {
        return `{ ${p1}: ${p2};`;
      }
      return match;
    }
  }
];

let fixedFiles = 0;
let totalErrors = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let errors = 0;
    
    // Apply all patterns
    patterns.forEach(({ pattern, replacement }) => {
      const beforeCount = (content.match(pattern) || []).length;
      content = content.replace(pattern, replacement);
      const afterCount = (content.match(pattern) || []).length;
      errors += (beforeCount - afterCount);
    });
    
    // Additional targeted fixes for specific files and issues
    if (file.includes('progress-tracker.css')) {
      content = content.replace(/\.settings-progress-fill,\s*{/g, '.settings-progress-fill {');
    }
    
    if (file.includes('lightbox.css')) {
      content = content.replace(/{\s*position\s*}/g, '{ position: relative; }');
    }
    
    if (file.includes('version-manager.css')) {
      content = content.replace(/{\s*color\s*}/g, '{ color: inherit; }');
    }
    
    if (file.includes('header.css')) {
      content = content.replace(/:\s*span\s*{/g, '::span {');
      content = content.replace(/:\s*span\s*{/g, ' span {');
    }
    
    if (file.includes('consolidated.css')) {
      content = content.replace(/\.section-code,\s*{/g, '.section-code {');
    }
    
    // Balance braces
    const openCount = (content.match(/{/g) || []).length;
    const closeCount = (content.match(/}/g) || []).length;
    
    if (openCount > closeCount) {
      content += '\n}'.repeat(openCount - closeCount);
    } else if (closeCount > openCount) {
      // Remove extra closing braces
      let curContent = content;
      for (let i = 0; i < (closeCount - openCount); i++) {
        const lastBraceIndex = curContent.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
          curContent = curContent.substring(0, lastBraceIndex) + 
                       curContent.substring(lastBraceIndex + 1);
        }
      }
      content = curContent;
    }
    
    // Write changes if content was modified
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed ${errors} issues in ${file}`);
      fixedFiles++;
      totalErrors += errors;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log(`\nCompleted CSS syntax fixes in ${fixedFiles} files, ${totalErrors} total errors fixed.`); 