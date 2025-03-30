/**
 * Steam Deck DUB Edition
 * Renderer - UI rendering and interaction handling
 */

// Type declaration for enhanced Element interface with id
declare global {
  interface Element {
    id: string;
  }
}

/**
 * Initialize UI renderer when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function(): void {
  // Set up sidebar functionality
  initializeSidebar();
  
  // Set up "back to top" button
  initializeBackToTop();
  
  // Set up navigation highlighting
  initializeNavigationHighlighting();
  
  // Set up search functionality
  initializeSearch();
  
  // Set up expandable sections
  initializeExpandableSections();
  
  // Set up external links
  setupExternalLinks();
  
  // Handle hash navigation
  handleHashNavigation();
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts();
});

/**
 * Initialize sidebar toggling functionality
 */
function initializeSidebar(): void {
  const toggleButton = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (!toggleButton || !sidebar || !mainContent) {
    console.warn('Sidebar elements not found');
    return;
  }
  
  // Toggle sidebar visibility
  toggleButton.addEventListener('click', (): void => {
    sidebar.classList.toggle('sidebar-hidden');
    mainContent.classList.toggle('full-width');
    
    // Save sidebar state in localStorage
    try {
      localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden') ? 'true' : 'false');
    } catch (error) {
      console.warn('Could not save sidebar state to localStorage', error);
    }
  });
  
  // Apply saved sidebar state
  try {
    const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
    if (sidebarHidden) {
      sidebar.classList.add('sidebar-hidden');
      mainContent.classList.add('full-width');
    }
  } catch (error) {
    console.warn('Could not retrieve sidebar state from localStorage', error);
  }
}

/**
 * Initialize "back to top" button
 */
function initializeBackToTop(): void {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (!backToTopButton) {
    console.warn('Back to top button not found');
    return;
  }
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', (): void => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
  
  // Scroll to top when clicked
  backToTopButton.addEventListener('click', (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Initialize navigation link highlighting
 */
function initializeNavigationHighlighting(): void {
  const navLinks = document.querySelectorAll('.sidebar a');
  const sections = document.querySelectorAll('.section');
  
  if (navLinks.length === 0 || sections.length === 0) {
    console.warn('Navigation links or sections not found');
    return;
  }
  
  /**
   * Set the active navigation link based on scroll position
   */
  function setActiveNavLink(): void {
    // Get current scroll position
    const scrollPosition = window.scrollY + 100; // Add offset for better UX
    
    // Find the current section
    let currentSection: Element | null = null;
    
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionBottom = sectionTop + (section as HTMLElement).offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = section;
      }
    });
    
    // Update active class on navigation links
    if (currentSection) {
      const sectionId = currentSection.getAttribute('id') || '';
      
      navLinks.forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href && href === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }
  
  // Add click handler to nav links for smooth scrolling
  navLinks.forEach((link) => {
    link.addEventListener('click', (e): void => {
      const href = link.getAttribute('href');
      
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href;
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
          
          // Update URL but don't scroll (already handled)
          history.pushState(null, '', href);
          
          // Update active link
          navLinks.forEach((navLink) => navLink.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
  
  // Update active link on scroll
  window.addEventListener('scroll', debounce(setActiveNavLink, 100));
  
  // Set initial active link
  setActiveNavLink();
}

/**
 * Initialize search functionality
 */
function initializeSearch(): void {
  const searchInput = document.getElementById('search-input');
  
  if (!searchInput) {
    console.warn('Search input not found');
    return;
  }
  
  searchInput.addEventListener('input', debounce((): void => {
    const searchTerm = (searchInput as HTMLInputElement).value.toLowerCase().trim();
    
    // Get all guide sections
    document.querySelectorAll('.guide-section').forEach(item => {
      const title = item.querySelector('h2, h3, h4')?.textContent?.toLowerCase() || '';
      const content = item.textContent?.toLowerCase() || '';
      
      // Check if search term exists in title or content
      const matchFound = searchTerm === '' || 
                         title.includes(searchTerm) || 
                         content.includes(searchTerm);
      
      // Show/hide based on match
      if (matchFound) {
        (item as HTMLElement).style.display = '';
        
        // Highlight matching text if search term is not empty
        if (searchTerm !== '') {
          highlightText(item, searchTerm);
        } else {
          // Remove highlights when search is cleared
          removeHighlights(item);
        }
      } else {
        (item as HTMLElement).style.display = 'none';
        removeHighlights(item);
      }
    });
    
    // Show "no results" message if needed
    updateNoResultsMessage(searchTerm);
    
    // Show/hide clear button
    toggleClearSearchButton(searchTerm);
  }, 300));
  
  /**
   * Highlight matching text within an element
   */
  function highlightText(element: Element, searchTerm: string): void {
    // Skip if no text content
    if (!element.textContent) return;
    
    // Don't highlight within already highlighted spans
    const children = Array.from(element.childNodes);
    
    children.forEach(node => {
      // Only process text nodes, skip elements
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        
        if (text.toLowerCase().includes(searchTerm)) {
          // Create a new span with highlighted text
          const highlightedText = document.createElement('span');
          highlightedText.className = 'search-highlight';
          highlightedText.innerHTML = text.replace(
            new RegExp(`(${searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'),
            '<mark>$1</mark>'
          );
          
          // Replace text node with highlighted version
          if (node.parentNode) {
            node.parentNode.replaceChild(highlightedText, node);
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Attempt to process element nodes safely
        try {
          const elem = node as Element;
          if (!elem.classList.contains('search-highlight')) {
            // Recursively process child elements that aren't highlights
            highlightText(elem, searchTerm);
          }
        } catch (e) {
          // Skip elements without classList or that can't be processed
          console.warn('Could not process element for highlighting', e);
        }
      }
    });
  }
  
  /**
   * Remove all highlights from an element
   */
  function removeHighlights(element: Element): void {
    // Find all highlight spans
    const highlights = element.querySelectorAll('.search-highlight');
    
    highlights.forEach(span => {
      // Replace with original text
      const text = span.textContent || '';
      const textNode = document.createTextNode(text);
      if (span.parentNode) {
        span.parentNode.replaceChild(textNode, span);
      }
    });
    
    // Also remove all mark tags
    const marks = element.querySelectorAll('mark');
    marks.forEach(mark => {
      const text = mark.textContent || '';
      const textNode = document.createTextNode(text);
      if (mark.parentNode) {
        mark.parentNode.replaceChild(textNode, mark);
      }
    });
  }
  
  /**
   * Update the no results message
   */
  function updateNoResultsMessage(searchTerm: string): void {
    const noResultsMessage = document.getElementById('no-results-message');
    if (!noResultsMessage) return;
    
    const visibleItems = document.querySelectorAll('.guide-section:not([style*="display: none"])');
    
    if (searchTerm && visibleItems.length === 0) {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none';
    }
  }
  
  /**
   * Toggle the clear search button
   */
  function toggleClearSearchButton(searchTerm: string): void {
    const clearSearchButton = document.getElementById('clear-search');
    if (!clearSearchButton) return;
    
    if (searchTerm) {
      clearSearchButton.style.display = 'inline-block';
    } else {
      clearSearchButton.style.display = 'none';
    }
    
    // Add click handler to clear search (if not already added)
    if (!clearSearchButton.getAttribute('data-initialized')) {
      clearSearchButton.setAttribute('data-initialized', 'true');
      
      clearSearchButton.addEventListener('click', (): void => {
        if (searchInput) {
          (searchInput as HTMLInputElement).value = '';
          
          // Trigger the input event to update search results
          const inputEvent = new Event('input', { bubbles: true });
          searchInput.dispatchEvent(inputEvent);
          
          // Focus back on the search input
          searchInput.focus();
        }
      });
    }
  }
}

/**
 * Initialize expandable sections (details/summary)
 */
function initializeExpandableSections(): void {
  // Find all details elements
  document.querySelectorAll('details.guide-section').forEach(details => {
    const summary = details.querySelector('summary');
    
    if (summary) {
      // Add click handler to prevent default behavior and add animation
      summary.addEventListener('click', (e): void => {
        e.preventDefault();
        
        // Toggle 'open' attribute and open/closed class
        const isOpen = details.hasAttribute('open');
        
        if (isOpen) {
          details.classList.add('closing');
          
          // Add a small delay before closing to allow animation
          setTimeout((): void => {
            details.removeAttribute('open');
            details.classList.remove('closing');
          }, 300); // Match transition duration
        } else {
          details.setAttribute('open', '');
          details.classList.add('opening');
          
          // Remove opening class after animation completes
          setTimeout((): void => {
            details.classList.remove('opening');
          }, 300); // Match transition duration
        }
      });
      
      // Add expanded/collapsed icons
      const icon = document.createElement('span');
      icon.className = 'expand-icon';
      summary.prepend(icon);
    }
  });
  
  // Expand section if it matches the current URL hash
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      // Find the parent details element
      const parentDetails = targetSection.closest('details');
      if (parentDetails) {
        parentDetails.setAttribute('open', '');
      }
    }
  }
}

/**
 * Setup external links to open in new tab
 */
function setupExternalLinks(): void {
  // Find all external links
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    const href = link.getAttribute('href') || '';
    
    // Check if link is to an external site
    if (href.startsWith('http') && 
        !href.includes(window.location.hostname)) {
      
      // Add attributes for external links
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // Add external link icon if not already present
      if (!link.classList.contains('has-external-icon')) {
        link.classList.add('has-external-icon');
        
        const icon = document.createElement('span');
        icon.className = 'external-link-icon';
        icon.innerHTML = '↗';
        icon.setAttribute('aria-hidden', 'true');
        
        link.appendChild(icon);
      }
    }
  });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e): void => {
    // Only handle keyboard shortcuts if not in an input field
    if (isInputElement(document.activeElement)) return;
    
    switch (e.key) {
      case '/': // Focus search
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
        break;
        
      case 'Escape': // Clear search/blur inputs
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
          activeElement.blur();
        }
        break;
        
      case 't': // Toggle theme
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.click();
        break;
        
      case 's': // Toggle sidebar
        const toggleButton = document.querySelector('.toggle-sidebar');
        if (toggleButton) (toggleButton as HTMLElement).click();
        break;
        
      case 'Home': // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
        
      case 'End': // Scroll to bottom
        window.scrollTo({ 
          top: document.body.scrollHeight, 
          behavior: 'smooth' 
        });
        break;
    }
  });
}

/**
 * Check if an element is an input element
 * @param element - The element to check
 * @returns Whether the element is an input
 */
function isInputElement(element: Element | null): boolean {
  return Boolean(
    element && 
    (element.tagName === 'INPUT' || 
     element.tagName === 'TEXTAREA' || 
     element.getAttribute('contenteditable') === 'true')
  );
}

/**
 * Handle navigation to hash links on page load
 */
function handleHashNavigation(): void {
  window.addEventListener('load', (): void => {
    // Check if URL has a hash
    if (window.location.hash) {
      // Get target element
      const targetElement = document.querySelector(window.location.hash);
      
      if (targetElement) {
        // Delay scrolling slightly to ensure DOM is fully loaded
        setTimeout((): void => {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  });
}

/**
 * Debounce function to limit how often a function is called
 * @param func - The function to debounce
 * @param wait - The time to wait in milliseconds
 * @returns Debounced function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout((): void => func.apply(context, args), wait);
  };
} 