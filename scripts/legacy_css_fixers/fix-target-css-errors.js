const fs = require('fs');

// Process progress-tracker.css
try {
  const file = 'src/styles/progress-tracker.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix specific issues
    content = content.replace(/\.settings-progress-fill,\s*\.progress-indicator,transition;/g, 
                            '.settings-progress-fill, .progress-indicator { transition: none; }');
    
    content = content.replace(/\.progress-indicator,\.completed/g, 
                            '.progress-indicator.completed');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing progress-tracker.css:`, error);
}

// Process header.css
try {
  const file = 'src/styles/layouts/header.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix specific issues
    content = content.replace(/\.header-toggle-btn span::before,\s*\/\* Duplicate selector[^\n]*\*\/;/g, 
                            '.header-toggle-btn span::before,\n.header-toggle-btn span::after {');
    
    content = content.replace(/\/\* Duplicate selector[^\n]*\*\/\s*top: 6px;/g, 
                            '.header-toggle-btn span::after {\n  top: 6px;\n}');
    
    content = content.replace(/\.expanded,\.sdde-header/g, 
                            '.expanded.sdde-header');
    
    content = content.replace(/body\.has-sidebar,\.sidebar-active/g, 
                            'body.has-sidebar.sidebar-active');
    
    content = content.replace(/\.sdde-header,\.expanded/g, 
                            '.sdde-header.expanded');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing header.css:`, error);
}

// Process main-layout.css
try {
  const file = 'src/styles/layouts/main-layout.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix specific issues
    content = content.replace(/\.grid-2-1,\s*{/g, 
                            '.grid-2-1 {');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing main-layout.css:`, error);
}

// Process accessibility-controls.css
try {
  const file = 'src/styles/components/accessibility-controls.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix by reading the section and looking for the specific error
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === 'width;' || lines[i].trim() === 'width') {
        lines[i] = '  width: auto;';
      }
    }
    content = lines.join('\n');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing accessibility-controls.css:`, error);
}

// Process lightbox.css
try {
  const file = 'src/styles/components/lightbox.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix by reading the section and looking for the specific error
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === 'position;' || lines[i].trim() === 'position') {
        lines[i] = '  position: relative;';
      }
    }
    content = lines.join('\n');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing lightbox.css:`, error);
}

// Process preferences-dialog.css
try {
  const file = 'src/styles/components/preferences-dialog.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix specific issues
    content = content.replace(/\.preferences-dialog,\s*{/g, 
                            '.preferences-dialog {');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing preferences-dialog.css:`, error);
}

// Process progress-tracker.css (component version)
try {
  const file = 'src/styles/components/progress-tracker.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix specific issues
    content = content.replace(/\.progress-fab,\s*{/g, 
                            '.progress-fab {');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing progress-tracker.css (component):`, error);
}

// Process version-manager.css
try {
  const file = 'src/styles/components/version-manager.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix by reading the section and looking for the specific error
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === 'color;' || lines[i].trim() === 'color') {
        lines[i] = '  color: inherit;';
      }
    }
    content = lines.join('\n');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing version-manager.css:`, error);
}

// Process base.css
try {
  const file = 'src/styles/core/base.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix by reading the section and looking for the specific error
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === 'a;' || lines[i].trim() === 'a') {
        lines[i] = '  a: auto;';
      }
    }
    content = lines.join('\n');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing base.css:`, error);
}

// Process consolidated.css
try {
  const file = 'src/styles/core/consolidated.css';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Fix specific issues
    content = content.replace(/\.section-code,\s*{/g, 
                            '.section-code {');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Fixed issues in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  }
} catch (error) {
  console.error(`Error processing consolidated.css:`, error);
}

console.log('Targeted CSS error fixes completed.'); 