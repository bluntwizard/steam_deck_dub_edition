/**
 * Print Helper Module
 * Provides utilities for handling print functionality
 */

import dialogStyles from '../../components/Dialog/Dialog.module.css';

/**
 * Initialize the print helper with custom options
 * @param {Object} options - Configuration options
 */
export function initPrintHelper(options = {}) {
  const defaultOptions = {
    selector: 'body',
    excludeElements: ['.no-print', 'header', 'footer', 'nav'],
    preparePrint: null,
    afterPrint: null
  };

  const config = { ...defaultOptions, ...options };
  
  // Create print button if enabled
  if (options.addPrintButton) {
    const button = document.createElement('button');
    button.textContent = 'Print';
    button.className = 'print-button';
    button.setAttribute('aria-label', 'Print page');
    button.addEventListener('click', () => showPrintDialog(config));
    
    const targetElement = document.querySelector(options.buttonTarget || 'header');
    if (targetElement) {
      targetElement.appendChild(button);
    }
    
    // Add basic hover/active effects
    button.addEventListener('mouseenter', () => {
      button.classList.add('hover');
    });
    
    button.addEventListener('mouseleave', () => {
      button.classList.remove('hover');
    });
    
    button.addEventListener('mousedown', () => {
      button.classList.add('active');
    });
    
    button.addEventListener('mouseup', () => {
      button.classList.remove('active');
    });
  }
  
  // Add keyboard shortcut if enabled
  if (options.enableShortcut) {
    document.addEventListener('keydown', (e) => {
      // Ctrl+P or Cmd+P (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        showPrintDialog(config);
      }
    });
  }
}

/**
 * Shows a dialog with print options
 * @param {Object} config - Print configuration
 */
function showPrintDialog(config) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = dialogStyles.dialogOverlay;
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = dialogStyles.dialog;
  
  // Create dialog content with options
  dialog.innerHTML = `
    <h3 class="${dialogStyles.dialogTitle}">Print Options</h3>
    
    <div class="${dialogStyles.dialogContent}">
      <h4 class="${dialogStyles.dialogSubtitle}">Include in Print:</h4>
      
      <div class="${dialogStyles.checkboxGroup}">
        <label class="${dialogStyles.checkboxLabel}">
          <input type="checkbox" id="print-images" checked>
          Images
        </label>
        
        <label class="${dialogStyles.checkboxLabel}">
          <input type="checkbox" id="print-code" checked>
          Code blocks
        </label>
        
        <label class="${dialogStyles.checkboxLabel}">
          <input type="checkbox" id="print-links-url" checked>
          Link URLs (as footnotes)
        </label>
      </div>
      
      <h4 class="${dialogStyles.dialogSubtitle}">Print Sections:</h4>
      
      <div class="${dialogStyles.checkboxGroup}">
        <label class="${dialogStyles.checkboxLabel}">
          <input type="checkbox" id="print-all" checked>
          All sections
        </label>
        
        <label class="${dialogStyles.checkboxLabel}">
          <input type="checkbox" id="print-visible" disabled>
          Only visible sections
        </label>
        
        <label class="${dialogStyles.checkboxLabel}">
          <input type="checkbox" id="print-completed" disabled>
          Only completed sections
        </label>
      </div>
    </div>
    
    <div class="${dialogStyles.dialogActions}">
      <button id="cancel-print" class="${dialogStyles.buttonSecondary}">Cancel</button>
      <button id="confirm-print" class="${dialogStyles.buttonPrimary}">Print</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Add event listeners
  const printAllCheckbox = document.getElementById('print-all');
  const printVisibleCheckbox = document.getElementById('print-visible');
  const printCompletedCheckbox = document.getElementById('print-completed');
  
  printAllCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    printVisibleCheckbox.disabled = isChecked;
    printCompletedCheckbox.disabled = isChecked;
    
    if (isChecked) {
      printVisibleCheckbox.checked = false;
      printCompletedCheckbox.checked = false;
    }
  });
  
  printVisibleCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      printAllCheckbox.checked = false;
      printCompletedCheckbox.checked = false;
    }
  });
  
  printCompletedCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      printAllCheckbox.checked = false;
      printVisibleCheckbox.checked = false;
    }
  });
  
  document.getElementById('cancel-print').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  document.getElementById('confirm-print').addEventListener('click', () => {
    document.body.removeChild(overlay);
    
    const options = {
      printImages: document.getElementById('print-images').checked,
      printCode: document.getElementById('print-code').checked,
      printLinksUrl: document.getElementById('print-links-url').checked,
      printAll: document.getElementById('print-all').checked,
      printVisible: document.getElementById('print-visible').checked,
      printCompleted: document.getElementById('print-completed').checked
    };
    
    handlePrint(config, options);
  });
}

/**
 * Handles the print operation with selected options
 * @param {Object} config - Print configuration
 * @param {Object} options - Selected print options
 */
function handlePrint(config, options) {
  // Store original display values
  const hiddenElements = [];
  
  // Get content container
  const contentContainer = document.querySelector(config.selector);
  
  if (!contentContainer) {
    console.error(`Print target not found: ${config.selector}`);
    return;
  }
  
  // Hide elements that should be excluded
  config.excludeElements.forEach(selector => {
    const elements = contentContainer.querySelectorAll(selector);
    elements.forEach(el => {
      hiddenElements.push({
        element: el,
        display: el.style.display
      });
      el.style.display = 'none';
    });
  });
  
  // Handle sections based on print options
  if (!options.printAll) {
    const sections = contentContainer.querySelectorAll('section, .section');
    
    sections.forEach(section => {
      const shouldDisplay = 
        (options.printVisible && isElementVisible(section)) ||
        (options.printCompleted && section.classList.contains('completed'));
      
      if (!shouldDisplay) {
        hiddenElements.push({
          element: section,
          display: section.style.display
        });
        section.style.display = 'none';
      }
    });
  }
  
  // Handle images
  if (!options.printImages) {
    const images = contentContainer.querySelectorAll('img');
    
    images.forEach(img => {
      hiddenElements.push({
        element: img,
        display: img.style.display
      });
      img.style.display = 'none';
    });
  }
  
  // Handle code blocks
  if (!options.printCode) {
    const codeBlocks = contentContainer.querySelectorAll('pre, code, .code-block');
    
    codeBlocks.forEach(block => {
      hiddenElements.push({
        element: block,
        display: block.style.display
      });
      block.style.display = 'none';
    });
  }
  
  // Handle link URLs
  let urlDisplayStyle = null;
  
  if (options.printLinksUrl) {
    // Create a style to hide URLs
    urlDisplayStyle = document.createElement('style');
    urlDisplayStyle.textContent = `
      @media print {
        a:after {
          content: " (" attr(href) ")";
          font-size: 0.9em;
          color: #666;
        }
      }
    `;
    
    document.head.appendChild(urlDisplayStyle);
  }
  
  // Run custom prepare function if provided
  if (typeof config.preparePrint === 'function') {
    config.preparePrint();
  }
  
  // Print the page
  window.print();
  
  // Restore original display values
  hiddenElements.forEach(item => {
    item.element.style.display = item.display;
  });
  
  // Remove URL style if added
  if (urlDisplayStyle) {
    document.head.removeChild(urlDisplayStyle);
  }
  
  // Run custom after function if provided
  if (typeof config.afterPrint === 'function') {
    config.afterPrint();
  }
}

/**
 * Check if an element is visible
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if the element is visible
 */
function isElementVisible(element) {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}
