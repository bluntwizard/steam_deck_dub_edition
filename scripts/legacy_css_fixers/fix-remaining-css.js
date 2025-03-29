const fs = require('fs');
const path = require('path');

// List of files with specific issues
const fileIssues = [
  {
    file: 'src/styles/progress-tracker.css',
    fixes: [
      {
        find: /\.settings-progress-fill,\s*{/g,
        replace: '.settings-progress-fill {'
      },
      {
        find: /\.settings-progress-fill,\s*\./g,
        replace: '.settings-progress-fill, .'
      }
    ]
  },
  {
    file: 'src/styles/layouts/header.css',
    fixes: [
      {
        find: /:\s*span\s*{/g,
        replace: ' span {'
      }
    ]
  },
  {
    file: 'src/styles/layouts/main-layout.css',
    fixes: [
      {
        find: /\.grid-2-1,\s*{/g,
        replace: '.grid-2-1 {'
      },
      {
        find: /\.grid-2-1,\s*\./g,
        replace: '.grid-2-1, .'
      }
    ]
  },
  {
    file: 'src/styles/components/accessibility-controls.css',
    fixes: [
      {
        find: /^\s*width\s*;/gm,
        replace: '  width: auto;'
      },
      {
        find: /^\s*width\s*}/gm,
        replace: '  width: auto; }'
      }
    ]
  },
  {
    file: 'src/styles/components/lightbox.css',
    fixes: [
      {
        find: /{\s*position\s*;/g,
        replace: '{ position: relative;'
      },
      {
        find: /{\s*position\s*}/g,
        replace: '{ position: relative; }'
      }
    ]
  },
  {
    file: 'src/styles/components/preferences-dialog.css',
    fixes: [
      {
        find: /\.preferences-dialog,\s*{/g,
        replace: '.preferences-dialog {'
      },
      {
        find: /\.preferences-dialog,\s*\./g,
        replace: '.preferences-dialog, .'
      }
    ]
  },
  {
    file: 'src/styles/components/progress-tracker.css',
    fixes: [
      {
        find: /\.progress-fab,\s*{/g,
        replace: '.progress-fab {'
      },
      {
        find: /\.progress-fab,\s*\./g,
        replace: '.progress-fab, .'
      }
    ]
  },
  {
    file: 'src/styles/components/version-manager.css',
    fixes: [
      {
        find: /{\s*color\s*;/g,
        replace: '{ color: inherit;'
      },
      {
        find: /{\s*color\s*}/g,
        replace: '{ color: inherit; }'
      }
    ]
  },
  {
    file: 'src/styles/core/base.css',
    fixes: [
      {
        find: /{\s*a\s*;/g,
        replace: '{ a: auto;'
      },
      {
        find: /{\s*a\s*}/g,
        replace: '{ a: auto; }'
      }
    ]
  },
  {
    file: 'src/styles/core/consolidated.css',
    fixes: [
      {
        find: /\.section-code,\s*{/g,
        replace: '.section-code {'
      },
      {
        find: /\.section-code,\s*\./g,
        replace: '.section-code, .'
      }
    ]
  }
];

// Process each file with its specific fixes
fileIssues.forEach(({ file, fixes }) => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Apply all fixes for this file
      fixes.forEach(({ find, replace }) => {
        content = content.replace(find, replace);
      });
      
      // Save the file if changes were made
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

console.log('Remaining CSS fixes completed.'); 