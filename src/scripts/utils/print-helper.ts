/**
 * Print Helper Module
 * Provides utilities for handling print functionality
 */

import Dialog from '../../components/Dialog/Dialog';

/**
 * Configuration options for print helper
 */
interface PrintHelperOptions {
  selector?: string;
  excludeElements?: string[];
  preparePrint?: (() => void) | null;
  afterPrint?: (() => void) | null;
  addPrintButton?: boolean;
  buttonTarget?: string;
  enableShortcut?: boolean;
}

/**
 * Print options selected by the user
 */
interface PrintOptions {
  printImages: boolean;
  printCode: boolean;
  printLinksUrl: boolean;
  printAll: boolean;
  printVisible: boolean;
  printCompleted: boolean;
}

/**
 * Hidden element tracking for print restoration
 */
interface HiddenElement {
  element: HTMLElement;
  display: string;
}

/**
 * Initialize the print helper with custom options
 */
export function initPrintHelper(options: PrintHelperOptions = {}): void {
  const defaultOptions: PrintHelperOptions = {
    selector: 'body',
    excludeElements: ['.no-print', 'header', 'footer', 'nav'],
    preparePrint: null,
    afterPrint: null
  };

  const config: PrintHelperOptions = { ...defaultOptions, ...options };
  
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
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
 */
function showPrintDialog(config: PrintHelperOptions): void {
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
          const printImagesEl = document.getElementById('print-images') as HTMLInputElement;
          const printCodeEl = document.getElementById('print-code') as HTMLInputElement;
          const printLinksUrlEl = document.getElementById('print-links-url') as HTMLInputElement;
          const printAllEl = document.getElementById('print-all') as HTMLInputElement;
          const printVisibleEl = document.getElementById('print-visible') as HTMLInputElement;
          const printCompletedEl = document.getElementById('print-completed') as HTMLInputElement;
          
          const options: PrintOptions = {
            printImages: printImagesEl?.checked || false,
            printCode: printCodeEl?.checked || false,
            printLinksUrl: printLinksUrlEl?.checked || false,
            printAll: printAllEl?.checked || false,
            printVisible: printVisibleEl?.checked || false,
            printCompleted: printCompletedEl?.checked || false
          };
          
          handlePrint(config, options);
          return true; // close dialog
        }
      }
    ]
  });
  
  // Add event listeners for checkboxes
  const printAllCheckbox = document.getElementById('print-all') as HTMLInputElement;
  const printVisibleCheckbox = document.getElementById('print-visible') as HTMLInputElement;
  const printCompletedCheckbox = document.getElementById('print-completed') as HTMLInputElement;
  
  if (printAllCheckbox && printVisibleCheckbox && printCompletedCheckbox) {
    printAllCheckbox.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const isChecked = target.checked;
      printVisibleCheckbox.disabled = isChecked;
      printCompletedCheckbox.disabled = isChecked;
      
      if (isChecked) {
        printVisibleCheckbox.checked = false;
        printCompletedCheckbox.checked = false;
      }
    });
    
    printVisibleCheckbox.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        printAllCheckbox.checked = false;
        printCompletedCheckbox.checked = false;
      }
    });
    
    printCompletedCheckbox.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        printAllCheckbox.checked = false;
        printVisibleCheckbox.checked = false;
      }
    });
  }
  
  // Show the dialog
  dialog.show();
}

/**
 * Handles the print operation with selected options
 */
function handlePrint(config: PrintHelperOptions, options: PrintOptions): void {
  // Store original display values
  const hiddenElements: HiddenElement[] = [];
  
  // Get content container
  const contentContainer = document.querySelector(config.selector || 'body');
  
  if (!contentContainer) {
    console.error(`Print target not found: ${config.selector}`);
    return;
  }
  
  // Hide elements that should be excluded
  if (config.excludeElements) {
    config.excludeElements.forEach(selector => {
      const elements = contentContainer.querySelectorAll(selector);
      elements.forEach(el => {
        const element = el as HTMLElement;
        hiddenElements.push({
          element,
          display: element.style.display
        });
        element.style.display = 'none';
      });
    });
  }
  
  // Handle specific print options
  if (!options.printImages) {
    const images = contentContainer.querySelectorAll('img');
    images.forEach(img => {
      const element = img as HTMLElement;
      hiddenElements.push({
        element,
        display: element.style.display
      });
      element.style.display = 'none';
    });
  }
  
  if (!options.printCode) {
    const codeBlocks = contentContainer.querySelectorAll('pre, code, .code-block');
    codeBlocks.forEach(block => {
      const element = block as HTMLElement;
      hiddenElements.push({
        element,
        display: element.style.display
      });
      element.style.display = 'none';
    });
  }
  
  if (options.printLinksUrl) {
    // Add footnotes for links
    const links = contentContainer.querySelectorAll('a[href]');
    if (links.length > 0) {
      // Create footnotes container
      const footnotes = document.createElement('div');
      footnotes.className = 'print-footnotes';
      
      const footnoteTitle = document.createElement('h3');
      footnoteTitle.textContent = 'Links';
      footnotes.appendChild(footnoteTitle);
      
      const footnoteList = document.createElement('ol');
      footnotes.appendChild(footnoteList);
      
      // Add each link as a footnote
      let footnoteCount = 0;
      links.forEach((link, index) => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          footnoteCount++;
          
          // Add footnote reference to the link
          const superscript = document.createElement('sup');
          superscript.className = 'print-footnote-ref';
          superscript.textContent = footnoteCount.toString();
          link.appendChild(superscript);
          
          // Add footnote to the list
          const footnoteItem = document.createElement('li');
          footnoteItem.textContent = href;
          footnoteList.appendChild(footnoteItem);
        }
      });
      
      // Only add footnotes if there are external links
      if (footnoteCount > 0) {
        contentContainer.appendChild(footnotes);
      }
    }
  }
  
  // Handle section visibility based on options
  if (!options.printAll) {
    const allSections = contentContainer.querySelectorAll('section, article, .section');
    
    allSections.forEach(section => {
      const element = section as HTMLElement;
      const shouldHide = (
        (options.printVisible && !isElementVisible(element)) ||
        (options.printCompleted && !element.classList.contains('completed'))
      );
      
      if (shouldHide) {
        hiddenElements.push({
          element,
          display: element.style.display
        });
        element.style.display = 'none';
      }
    });
  }
  
  // Call prepare print hook if provided
  if (config.preparePrint && typeof config.preparePrint === 'function') {
    config.preparePrint();
  }
  
  // Add print-specific class to the document
  document.body.classList.add('printing');
  
  // Use timeout to ensure DOM is updated before printing
  setTimeout(() => {
    // Trigger browser print dialog
    window.print();
    
    // Remove print-specific class
    document.body.classList.remove('printing');
    
    // Restore hidden elements
    hiddenElements.forEach(item => {
      item.element.style.display = item.display;
    });
    
    // Remove footnotes
    const footnotes = document.querySelector('.print-footnotes');
    if (footnotes) {
      footnotes.remove();
    }
    
    // Remove footnote references
    const refs = document.querySelectorAll('.print-footnote-ref');
    refs.forEach(ref => ref.remove());
    
    // Call after print hook if provided
    if (config.afterPrint && typeof config.afterPrint === 'function') {
      config.afterPrint();
    }
  }, 100);
}

/**
 * Checks if an element is visible in the viewport
 */
function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Export module functions
export default {
  initPrintHelper
}; 