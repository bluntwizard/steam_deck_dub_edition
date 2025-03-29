/**
 * Print helper for the SDDE Guide
 * Provides print functionality with optimal settings
 */

document.addEventListener('DOMContentLoaded', () => {
  createPrintButton();
  
  // Add keyboard shortcut for printing (Ctrl+P already handles system print)
  document.addEventListener('keydown', (e) => {
    // Alt+P as custom print shortcut
    if (e.altKey && e.key === 'p') {
      e.preventDefault();
      printGuide();
    }
  });
});

/**
 * Create a print button in the UI
 */
function createPrintButton() {
  const button = document.createElement('button');
  button.id = 'print-button';
  button.className = 'print-button';
  button.innerHTML = '🖨️';
  button.title = 'Print Guide (Alt+P)';
  
  // Style the button
  button.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--dracula-cyan, #8be9fd);
    color: var(--dracula-background, #282a36);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    cursor: pointer;
    z-index: 990;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, background-color 0.3s;
  `;
  
  // Add hover effect
  button.addEventListener('mouseover', () => {
    button.style.transform = 'translateY(-3px)';
    button.style.backgroundColor = 'var(--dracula-pink, #ff79c6)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.transform = 'translateY(0)';
    button.style.backgroundColor = 'var(--dracula-cyan, #8be9fd)';
  });
  
  // Add click event
  button.addEventListener('click', () => {
    showPrintOptions();
  });
  
  // Add to the document
  document.body.appendChild(button);
  
  // Hide in print view
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      #print-button { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Show print options dialog
 */
function showPrintOptions() {
  // Create dialog element
  const dialog = document.createElement('div');
  dialog.className = 'print-options-dialog';
  
  // Style the dialog
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--dracula-background, #282a36);
    border: 1px solid var(--dracula-current-line, #44475a);
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 500px;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  `;
  
  // Add content to the dialog
  dialog.innerHTML = `
    <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0; margin-bottom: 15px;">Print Options</h3>
    
    <div style="margin-bottom: 20px;">
      <h4 style="color: var(--dracula-cyan, #8be9fd); margin-bottom: 10px;">Include in Print:</h4>
      
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="print-expanded-code" checked>
          <span>Expand all code blocks</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="print-all-details" checked>
          <span>Expand all details sections</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="print-include-urls" checked>
          <span>Include URLs after external links</span>
        </label>
      </div>
      
      <h4 style="color: var(--dracula-cyan, #8be9fd); margin-bottom: 10px;">Print Sections:</h4>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" name="print-sections" id="print-all-sections" checked>
          <span>All sections</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" name="print-sections" id="print-current-section">
          <span>Current section only</span>
        </label>
        
        <label style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" name="print-sections" id="print-visible-sections">
          <span>Visible sections only</span>
        </label>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
      <button id="cancel-print" style="background-color: var(--dracula-comment, #6272a4); padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="confirm-print" style="background-color: var(--dracula-green, #50fa7b); color: var(--dracula-background, #282a36); padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Print</button>
    </div>
  `;
  
  // Add to the document
  document.body.appendChild(dialog);
  
  // Add event listeners
  document.getElementById('cancel-print').addEventListener('click', () => {
    dialog.remove();
  });
  
  document.getElementById('confirm-print').addEventListener('click', () => {
    const options = {
      expandCode: document.getElementById('print-expanded-code').checked,
      expandDetails: document.getElementById('print-all-details').checked,
      includeUrls: document.getElementById('print-include-urls').checked,
      printMode: document.querySelector('input[name="print-sections"]:checked').id
    };
    
    dialog.remove();
    printGuide(options);
  });
  
  // Close on escape key
  document.addEventListener('keydown', function closeOnEsc(e) {
    if (e.key === 'Escape') {
      dialog.remove();
      document.removeEventListener('keydown', closeOnEsc);
    }
  });
  
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closeOnOutsideClick(e) {
      if (!dialog.contains(e.target) && e.target.id !== 'print-button') {
        dialog.remove();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    });
  }, 10);
}

/**
 * Print the guide with the specified options
 */
function printGuide(options = {}) {
  // Default options
  const settings = {
    expandCode: true,
    expandDetails: true,
    includeUrls: true,
    printMode: 'print-all-sections',
    ...options
  };
  
  // Create a print-specific class on body
  document.body.classList.add('preparing-print');
  
  // Store original state to restore later
  const originalStates = {
    codeBlocks: [],
    details: []
  };
  
  // Handle code blocks
  if (settings.expandCode) {
    document.querySelectorAll('.code-block').forEach(block => {
      originalStates.codeBlocks.push({
        element: block,
        wasExpanded: block.classList.contains('expanded')
      });
      
      // Expand for printing
      if (!block.classList.contains('expanded')) {
        block.classList.add('expanded');
      }
    });
  }
  
  // Handle details sections
  if (settings.expandDetails) {
    document.querySelectorAll('details').forEach(details => {
      originalStates.details.push({
        element: details,
        wasOpen: details.hasAttribute('open')
      });
      
      // Open for printing
      if (!details.hasAttribute('open')) {
        details.setAttribute('open', '');
      }
    });
  }
  
  // Handle sections based on print mode
  let hiddenSections = [];
  
  if (settings.printMode === 'print-current-section') {
    // Find the current section (the one most in view)
    const sections = Array.from(document.querySelectorAll('.section'));
    if (sections.length > 0) {
      // Find which section is most visible in the viewport
      const viewportHeight = window.innerHeight;
      let maxVisibleSection = null;
      let maxVisibleArea = 0;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Skip if not in viewport
        if (rect.bottom < 0 || rect.top > viewportHeight) return;
        
        // Calculate visible area
        const top = Math.max(0, rect.top);
        const bottom = Math.min(viewportHeight, rect.bottom);
        const visibleArea = bottom - top;
        
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          maxVisibleSection = section;
        }
      });
      
      if (maxVisibleSection) {
        // Hide all sections except the current one
        sections.forEach(section => {
          if (section !== maxVisibleSection) {
            hiddenSections.push(section);
            section.style.display = 'none';
          }
        });
      }
    }
  } else if (settings.printMode === 'print-visible-sections') {
    // Only print sections that are currently or were previously visible
    const sections = Array.from(document.querySelectorAll('.section'));
    sections.forEach(section => {
      // Check if section has been scrolled to
      const rect = section.getBoundingClientRect();
      const isOrWasVisible = rect.top < window.innerHeight * 2;
      
      if (!isOrWasVisible) {
        hiddenSections.push(section);
        section.style.display = 'none';
      }
    });
  }
  
  // Handle link URLs
  let urlDisplayStyle = null;
  if (!settings.includeUrls) {
    // Create a style to hide URLs
    urlDisplayStyle = document.createElement('style');
    urlDisplayStyle.textContent = `
      @media print {
        a[href^="http"]:after {
          content: "" !important;
        }
      }
    `;
    document.head.appendChild(urlDisplayStyle);
  }
  
  // Wait a moment for the DOM to update
  setTimeout(() => {
    // Trigger print dialog
    window.print();
    
    // Restore original state after printing
    window.addEventListener('afterprint', () => {
      // Remove print class
      document.body.classList.remove('preparing-print');
      
      // Restore code blocks
      originalStates.codeBlocks.forEach(item => {
        if (!item.wasExpanded) {
          item.element.classList.remove('expanded');
        }
      });
      
      // Restore details elements
      originalStates.details.forEach(item => {
        if (!item.wasOpen) {
          item.element.removeAttribute('open');
        }
      });
      
      // Restore hidden sections
      hiddenSections.forEach(section => {
        section.style.display = '';
      });
      
      // Remove URL style if added
      if (urlDisplayStyle) {
        urlDisplayStyle.remove();
      }
    });
  }, 200);
}
