/**
 * Grimoire Guide Cleanup Script
 * Removes legacy elements and ensures clean DOM structure
 */

/**
 * Initialize the cleanup functionality
 */
export function initCleanup(): void {
  // Run immediately when script loads
  cleanupLegacyElements();
  
  // Also run when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', cleanupLegacyElements);
  
  // Run again after dynamic content is loaded
  window.addEventListener('content-loaded', cleanupLegacyElements);
}

/**
 * Remove legacy elements from the DOM
 */
export function cleanupLegacyElements(): void {
  console.log('Running Grimoire cleanup...');
  
  // Legacy header elements to remove
  const legacySelectors: string[] = [
    '.header:not(.sdde-header)',
    '.header-container:not(.sdde-header .header-container)',
    '.old-nav',
    '.legacy-header',
    // Add more legacy selectors as needed
  ];
  
  // Process each selector
  legacySelectors.forEach(selector => {
    const elements: NodeListOf<Element> = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Removing ${elements.length} legacy elements matching "${selector}"`);
      elements.forEach(el => el.remove());
    }
  });
  
  // Fix any lingering styles
  fixLegacyStyles();
}

/**
 * Fix any lingering style issues
 */
export function fixLegacyStyles(): void {
  const mainContent: HTMLElement | null = document.querySelector('.main-content');
  if (mainContent) {
    // Ensure main content has correct top margin based on header height
    const header: HTMLElement | null = document.querySelector('.sdde-header');
    if (header) {
      const headerHeight: string = header.classList.contains('expanded') ? 
                          getComputedStyle(document.documentElement).getPropertyValue('--header-expanded-height') :
                          getComputedStyle(document.documentElement).getPropertyValue('--header-height');
      
      mainContent.style.marginTop = headerHeight;
    }
  }
  
  // Remove any inline styles that might conflict with our layout
  document.querySelectorAll('[style*="margin-top"]').forEach((el: Element) => {
    // Skip main content which we just set
    if (el === mainContent) return;
    
    // Check if this is a legitimate style we should keep
    if (!el.classList.contains('sdde-header') && 
        !el.classList.contains('header-container') &&
        !el.closest('.sdde-header')) {
      // Remove only margin-top from inline styles
      const style: string | null = el.getAttribute('style');
      if (style) {
        const newStyle: string = style.replace(/margin-top:\s*[^;]+;?/g, '');
        
        if (newStyle.trim() === '') {
          el.removeAttribute('style');
        } else {
          el.setAttribute('style', newStyle);
        }
      }
    }
  });
}

// Call init function by default to maintain backward compatibility
initCleanup();

// Also export functions individually for more modular usage
export default {
  initCleanup,
  cleanupLegacyElements,
  fixLegacyStyles
}; 