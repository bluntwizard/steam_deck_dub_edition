const fs = require('fs');

// Files with specific errors to fix
const specificFixes = [
  {
    file: 'src/styles/progress-tracker.css',
    pattern: /\.settings-progress-fill,\s*{/g,
    replacement: '.settings-progress-fill {'
  },
  {
    file: 'src/styles/layouts/header.css',
    pattern: /[^a-zA-Z0-9-]span\s*{/g,
    replacement: ' span {'
  },
  {
    file: 'src/styles/layouts/main-layout.css',
    pattern: /\.grid-2-1,\s*{/g,
    replacement: '.grid-2-1 {'
  },
  {
    file: 'src/styles/components/accessibility-controls.css',
    pattern: /^\s*width\s*;/gm,
    replacement: '  width: auto;'
  },
  {
    file: 'src/styles/components/lightbox.css',
    pattern: /{\s*position\s*;/g,
    replacement: '{ position: relative;'
  },
  {
    file: 'src/styles/components/preferences-dialog.css',
    pattern: /\.preferences-dialog,\s*{/g,
    replacement: '.preferences-dialog {'
  },
  {
    file: 'src/styles/components/progress-tracker.css',
    pattern: /\.progress-fab,\s*{/g,
    replacement: '.progress-fab {'
  },
  {
    file: 'src/styles/components/version-manager.css',
    pattern: /{\s*color\s*;/g,
    replacement: '{ color: inherit;'
  },
  {
    file: 'src/styles/core/base.css',
    pattern: /{\s*a\s*;/g,
    replacement: '{ a: auto;'
  },
  {
    file: 'src/styles/core/consolidated.css',
    pattern: /\.section-code,\s*{/g,
    replacement: '.section-code {'
  }
];

// Additional common patterns to fix across all files
const commonFixes = [
  {
    pattern: /([a-zA-Z0-9-]+),\s*{/g,
    replacement: '$1 {'
  },
  {
    pattern: /{\s*([a-zA-Z0-9-]+)\s*;/g,
    replacement: (match, p1) => {
      // Common properties and their default values
      const defaults = {
        'position': 'relative',
        'color': 'inherit',
        'width': 'auto',
        'height': 'auto',
        'margin': '0',
        'padding': '0',
        'display': 'block',
        'font-size': '16px',
        'a': 'auto'  // Special case
      };
      
      if (defaults[p1]) {
        return `{ ${p1}: ${defaults[p1]};`;
      }
      return `{ ${p1}: auto;`;
    }
  },
  {
    pattern: /{\s*([a-zA-Z0-9-]+)\s*}/g,
    replacement: (match, p1) => {
      // Common properties and their default values (same as above)
      const defaults = {
        'position': 'relative',
        'color': 'inherit',
        'width': 'auto',
        'height': 'auto',
        'margin': '0',
        'padding': '0',
        'display': 'block',
        'font-size': '16px',
        'a': 'auto'  // Special case
      };
      
      if (defaults[p1]) {
        return `{ ${p1}: ${defaults[p1]}; }`;
      }
      return `{ ${p1}: auto; }`;
    }
  }
];

// Process each file with specific fixes
specificFixes.forEach(({ file, pattern, replacement }) => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      
      // Apply specific fix
      content = content.replace(pattern, replacement);
      
      // Also apply common fixes
      commonFixes.forEach(({ pattern, replacement }) => {
        content = content.replace(pattern, replacement);
      });
      
      // Save if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Fixed issues in ${file}`);
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

console.log('Specific CSS error fixes completed.'); 