/**
 * Print Helper Module
 * Provides utilities for handling print functionality
 */

import Dialog from '../../components/Dialog/Dialog';

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
  // Create dialog content
  const content = document.createElement('div');
  
  // Print options
  const printOptions = document.createElement('div');
  
  // Include section
  const includeSection = document.createElement('div');
  const includeTitle = document.createElement('h4');
  includeTitle.textContent = 'Include in Print:';
  includeSection.appendChild(includeTitle);
  
  const checkboxGroupInclude = document.createElement('div');
  
  // Images checkbox
  const imagesLabel = document.createElement('label');
  const imagesCheckbox = document.createElement('input');
  imagesCheckbox.type = 'checkbox';
  imagesCheckbox.id = 'print-images';
  imagesCheckbox.checked = true;
  imagesLabel.appendChild(imagesCheckbox);
  imagesLabel.append(' Images');
  checkboxGroupInclude.appendChild(imagesLabel);
  
  // Code blocks checkbox
  const codeLabel = document.createElement('label');
  const codeCheckbox = document.createElement('input');
  codeCheckbox.type = 'checkbox';
  codeCheckbox.id = 'print-code';
  codeCheckbox.checked = true;
  codeLabel.appendChild(codeCheckbox);
  codeLabel.append(' Code blocks');
  checkboxGroupInclude.appendChild(codeLabel);
  
  // Link URLs checkbox
  const linksLabel = document.createElement('label');
  const linksCheckbox = document.createElement('input');
  linksCheckbox.type = 'checkbox';
  linksCheckbox.id = 'print-links-url';
  linksCheckbox.checked = true;
  linksLabel.appendChild(linksCheckbox);
  linksLabel.append(' Link URLs (as footnotes)');
  checkboxGroupInclude.appendChild(linksLabel);
  
  includeSection.appendChild(checkboxGroupInclude);
  printOptions.appendChild(includeSection);
  
  // Print sections
  const sectionsSection = document.createElement('div');
  const sectionsTitle = document.createElement('h4');
  sectionsTitle.textContent = 'Print Sections:';
  sectionsSection.appendChild(sectionsTitle);
  
  const checkboxGroupSections = document.createElement('div');
  
  // All sections checkbox
  const allLabel = document.createElement('label');
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.id = 'print-all';
  allCheckbox.checked = true;
  allLabel.appendChild(allCheckbox);
  allLabel.append(' All sections');
  checkboxGroupSections.appendChild(allLabel);
  
  // Visible sections checkbox
  const visibleLabel = document.createElement('label');
  const visibleCheckbox = document.createElement('input');
  visibleCheckbox.type = 'checkbox';
  visibleCheckbox.id = 'print-visible';
  visibleCheckbox.disabled = true;
  visibleLabel.appendChild(visibleCheckbox);
  visibleLabel.append(' Only visible sections');
  checkboxGroupSections.appendChild(visibleLabel);
  
  // Completed sections checkbox
  const completedLabel = document.createElement('label');
  const completedCheckbox = document.createElement('input');
  completedCheckbox.type = 'checkbox';
  completedCheckbox.id = 'print-completed';
  completedCheckbox.disabled = true;
  completedLabel.appendChild(completedCheckbox);
  completedLabel.append(' Only completed sections');
  checkboxGroupSections.appendChild(completedLabel);
  
  sectionsSection.appendChild(checkboxGroupSections);
  printOptions.appendChild(sectionsSection);
  
  content.appendChild(printOptions);
  
  // Create dialog using the Dialog component
  const dialog = new Dialog({
    title: 'Print Options',
    content: content,
    actions: [
      {
        text: 'Cancel',
        primary: false
      },
      {
        text: 'Print',
        primary: true,
        onClick: () => {
          const options = {
            printImages: document.getElementById('print-images').checked,
            printCode: document.getElementById('print-code').checked,
            printLinksUrl: document.getElementById('print-links-url').checked,
            printAll: document.getElementById('print-all').checked,
            printVisible: document.getElementById('print-visible').checked,
            printCompleted: document.getElementById('print-completed').checked
          };
          
          handlePrint(config, options);
          return true; // close dialog
        }
      }
    ]
  });
  
  // Add event listeners for checkboxes
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
  
  // Show the dialog
  dialog.show();
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
