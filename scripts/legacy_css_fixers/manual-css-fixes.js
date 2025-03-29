const fs = require('fs');
const path = require('path');

// Define the fixes for each file
const fixes = [
  {
    file: 'src/styles/progress-tracker.css',
    search: /.settings-progress-fill, .progress-indicator,transition;/g,
    replace: '.settings-progress-fill, .progress-indicator { transition: none; }'
  },
  {
    file: 'src/styles/layouts/header.css',
    search: /.header-toggle-btn span::before,\s*\/\* Duplicate selector[^\n]*\*\/;/g,
    replace: '.header-toggle-btn span::before,\n.header-toggle-btn span::after {'
  },
  {
    file: 'src/styles/layouts/header.css',
    search: /\/\* Duplicate selector[^\n]*\*\/\s*top: 6px;/g,
    replace: '.header-toggle-btn span::after {\n  top: 6px;\n}'
  },
  {
    file: 'src/styles/layouts/main-layout.css',
    search: /\.grid-2-1,\s*{/g,
    replace: '.grid-2-1 {'
  },
  {
    file: 'src/styles/components/accessibility-controls.css',
    search: /^\s*width\s*;/gm,
    replace: '  width: auto;'
  },
  {
    file: 'src/styles/components/lightbox.css',
    search: /{\s*position\s*;/g,
    replace: '{ position: relative;'
  },
  {
    file: 'src/styles/components/preferences-dialog.css',
    search: /\.preferences-dialog,\s*{/g,
    replace: '.preferences-dialog {'
  },
  {
    file: 'src/styles/components/progress-tracker.css',
    search: /\.progress-fab,\s*{/g,
    replace: '.progress-fab {'
  },
  {
    file: 'src/styles/components/version-manager.css',
    search: /{\s*color\s*;/g,
    replace: '{ color: inherit;'
  },
  {
    file: 'src/styles/core/base.css',
    search: /{\s*a\s*;/g,
    replace: '{ a: auto;'
  },
  {
    file: 'src/styles/core/consolidated.css',
    search: /\.section-code,\s*{/g,
    replace: '.section-code {'
  }
];

// Process each fix
let filesFixed = 0;
let fixesApplied = 0;

fixes.forEach(({ file, search, replace }) => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const newContent = content.replace(search, replace);
      
      if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log(`Applied fix in ${file}`);
        fixesApplied++;
        
        // Track unique files fixed
        filesFixed++;
      } else {
        console.log(`No changes needed in ${file}`);
      }
    } else {
      console.log(`File not found: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

// If we're still having issues with these same files, let's take a more dramatic approach
// Let's read the problematic files and manually clean specific lines

// Helper function to read specific line ranges from a file
const readLines = (file, start, end) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    return lines.slice(start - 1, end).join('\n');
  } catch (error) {
    console.error(`Error reading lines from ${file}:`, error);
    return '';
  }
};

// Fix progress-tracker.css
try {
  const file = 'src/styles/progress-tracker.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the media query section
    const mediaQueryFix = content.replace(
      /.settings-progress-fill, .progress-indicator,transition;/g,
      `.settings-progress-fill, 
  .progress-indicator {
    transition: none;
  }`
    );
    
    if (content !== mediaQueryFix) {
      fs.writeFileSync(file, mediaQueryFix);
      console.log(`Applied manual fix to ${file}`);
      fixesApplied++;
    }
  }
} catch (error) {
  console.error(`Error fixing progress-tracker.css:`, error);
}

// Fix header.css
try {
  const file = 'src/styles/layouts/header.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the span section
    let lines = content.split('\n');
    let fixed = false;
    
    for (let i = 0; i < lines.length; i++) {
      // Find problematic lines
      if (lines[i].includes('.header-toggle-btn span::before,') && 
          lines[i].includes('Duplicate selector')) {
        lines[i] = '.header-toggle-btn span::before,';
        lines[i+1] = '.header-toggle-btn span::after {';
        fixed = true;
      }
      
      if (lines[i].includes('Duplicate selector') && 
          lines[i+1] && lines[i+1].trim() === 'top: 6px;') {
        lines[i] = '.header-toggle-btn span::after {';
        fixed = true;
      }
    }
    
    if (fixed) {
      fs.writeFileSync(file, lines.join('\n'));
      console.log(`Applied manual fix to ${file}`);
      fixesApplied++;
    }
  }
} catch (error) {
  console.error(`Error fixing header.css:`, error);
}

// Let's look for standalone properties without declarations
const standaloneProps = ['width', 'position', 'color', 'a'];

// Files to check for standalone properties
const filesToCheck = [
  'src/styles/components/accessibility-controls.css',
  'src/styles/components/lightbox.css', 
  'src/styles/components/version-manager.css',
  'src/styles/core/base.css'
];

filesToCheck.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let lines = content.split('\n');
      let fixed = false;
      
      for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        
        if (standaloneProps.some(prop => trimmedLine === `${prop};` || trimmedLine === prop)) {
          // Map properties to default values
          let value = 'auto';
          if (trimmedLine.startsWith('color')) value = 'inherit';
          if (trimmedLine.startsWith('position')) value = 'relative';
          
          lines[i] = `  ${trimmedLine.replace(';', '')}: ${value};`;
          fixed = true;
        }
      }
      
      if (fixed) {
        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Fixed standalone properties in ${file}`);
        fixesApplied++;
      }
    }
  } catch (error) {
    console.error(`Error fixing standalone properties in ${file}:`, error);
  }
});

// Fix comma-class selectors
const selectorFiles = [
  'src/styles/layouts/main-layout.css',
  'src/styles/components/preferences-dialog.css',
  'src/styles/components/progress-tracker.css',
  'src/styles/core/consolidated.css'
];

selectorFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let fixed = false;
      
      // Replace selectors with commas before {
      let newContent = content.replace(/(\.[a-zA-Z0-9_-]+),\s*{/g, '$1 {');
      
      if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log(`Fixed comma-class selectors in ${file}`);
        fixesApplied++;
        fixed = true;
      }
    }
  } catch (error) {
    console.error(`Error fixing comma-class selectors in ${file}:`, error);
  }
});

console.log(`\nManual CSS fixes completed. Applied ${fixesApplied} fixes.`); 