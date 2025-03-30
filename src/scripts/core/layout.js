/**
 * Layout Management for Grimoire Guide
 * Handles sidebar toggling, content resizing, and responsive behavior
 */

document.addEventListener('DOMContentLoaded', function() {
  // Setup page structure if needed
  setupPageStructure();
  
  // Initialize sidebar behavior
  initSidebar();
  
  // Handle window resize events
  window.addEventListener('resize', handleResize);
  
  // Initial check for device size
  handleResize();
  
  // Handle SVG with internal styling
  handleSvgWithInternalStyling();
});

/**
 * Ensures the page has the proper structure for flexbox layout
 */
function setupPageStructure() {
  // Only add the wrapper if it doesn't exist
  if (!document.querySelector('.page-container')) {
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Create sidebar inner container if it doesn't exist
    if (sidebar && !sidebar.querySelector('.sidebar-inner')) {
      const sidebarContents = sidebar.innerHTML;
      sidebar.innerHTML = `<div class="sidebar-inner">${sidebarContents}</div>`;
    }
    
    // Wrap main content in container if needed
    if (mainContent) {
      // Make sure sections have proper flexbox structure
      const sections = mainContent.querySelectorAll('.section');
      sections.forEach(section => {
        // Only add wrapper if content isn't already organized
        if (!section.querySelector('.section-content')) {
          const children = Array.from(section.children);
          const heading = children.find(el => /^h[1-6]$/i.test(el.tagName));
          const hr = children.find(el => el.tagName.toLowerCase() === 'hr');
          
          // Skip heading and initial horizontal rule
          const contentElements = children.filter(el => {
            return el !== heading && el !== hr;
          });
          
          // Create section content wrapper
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'section-content';
          
          // Move content elements to wrapper
          contentElements.forEach(el => {
            contentWrapper.appendChild(el);
          });
          
          // Add wrapper back to section (after heading and hr)
          if (hr) {
            section.insertBefore(contentWrapper, hr.nextSibling);
          } else if (heading) {
            section.insertBefore(contentWrapper, heading.nextSibling);
          } else {
            section.appendChild(contentWrapper);
          }
        }
      });
      
      // Make sure the search container has proper structure
      const searchContainer = mainContent.querySelector('.search-container');
      if (searchContainer) {
        searchContainer.style.display = 'flex';
        searchContainer.style.alignItems = 'center';
      }
    }
  }
}

/**
 * Initialize sidebar toggle behavior
 */
function initSidebar() {
  const toggleButton = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (toggleButton && sidebar && mainContent) {
    // Add body class for styling
    document.body.classList.add('has-sidebar');
    
    // Set initial state based on local storage or default
    const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
    if (sidebarHidden) {
      sidebar.classList.add('sidebar-hidden');
      toggleButton.classList.add('sidebar-hidden');
      document.body.classList.remove('sidebar-active');
    } else {
      document.body.classList.add('sidebar-active');
      mainContent.classList.add('sidebar-active');
    }
    
    // Toggle sidebar on button click
    toggleButton.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-hidden');
      toggleButton.classList.toggle('sidebar-hidden');
      document.body.classList.toggle('sidebar-active');
      mainContent.classList.toggle('sidebar-active');
      
      // Save state to local storage
      localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden'));
      
      // Trigger resize event to adjust content
      window.dispatchEvent(new Event('resize'));
    });
    
    // Close sidebar when clicking on a link (mobile)
    if (window.innerWidth <= 576) {
      const sidebarLinks = sidebar.querySelectorAll('a');
      sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 576) {
            sidebar.classList.add('sidebar-hidden');
            toggleButton.classList.add('sidebar-hidden');
            document.body.classList.remove('sidebar-active');
            mainContent.classList.remove('sidebar-active');
            localStorage.setItem('sidebarHidden', 'true');
          }
        });
      });
    }
  }
}

/**
 * Handle window resize events
 */
function handleResize() {
  const windowWidth = window.innerWidth;
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const toggleButton = document.querySelector('.toggle-sidebar');
  
  // Adjust for mobile view
  if (windowWidth <= 576) {
    // On mobile, sidebar should overlay content when open
    if (sidebar && mainContent && !sidebar.classList.contains('sidebar-hidden')) {
      mainContent.style.opacity = '0.3';
      mainContent.style.pointerEvents = 'none';
    } else if (sidebar && mainContent) {
      mainContent.style.opacity = '1';
      mainContent.style.pointerEvents = 'auto';
    }
  } else {
    // Reset styles for larger screens
    if (mainContent) {
      mainContent.style.opacity = '1';
      mainContent.style.pointerEvents = 'auto';
    }
  }
  
  // Adjust max-height for code blocks on smaller screens
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    if (windowWidth <= 768) {
      block.style.maxHeight = '300px';
    } else {
      block.style.maxHeight = 'none';
    }
  });
}

/**
 * Add special handling for SVG with internal styling
 */
function handleSvgWithInternalStyling() {
  const svgContainer = document.querySelector('.header-svg');
  
  if (svgContainer) {
    // Add a loading class to the container
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
      headerContainer.classList.add('svg-loading');
    }
    
    svgContainer.addEventListener('load', function() {
      try {
        // Get the SVG document
        const svgDoc = svgContainer.contentDocument;
        
        if (svgDoc && svgDoc.documentElement) {
          // Create a link element to load the external CSS
          const linkElem = document.createElement('link');
          linkElem.setAttribute('rel', 'stylesheet');
          linkElem.setAttribute('type', 'text/css');
          linkElem.setAttribute('href', 'svg-header-styles.css');
          
          // Append it to the SVG document head
          const svgHead = svgDoc.querySelector('head') || svgDoc.documentElement;
          svgHead.appendChild(linkElem);
          
          // Add custom style element to ensure variables are passed into SVG
          const styleElem = document.createElement('style');
          const rootStyles = getComputedStyle(document.documentElement);
          
          // Copy CSS variables from root
          const cssVars = [
            '--color-main',
            '--color-primary',
            '--color-secondary',
            '--color-background',
            '--color-link',
            '--color-link-active'
          ];
          
          let styleText = ':root {\n';
          cssVars.forEach(varName => {
            const value = rootStyles.getPropertyValue(varName);
            if (value) {
              styleText += `  ${varName}: ${value};\n`;
            }
          });
          styleText += '}';
          
          styleElem.textContent = styleText;
          svgHead.appendChild(styleElem);
          
          // Remove loading state and add loaded state
          if (headerContainer) {
            headerContainer.classList.remove('svg-loading');
            headerContainer.classList.add('svg-loaded');
          }
        }
        
        // Mark the SVG itself as loaded
        svgContainer.classList.add('svg-loaded');
        
      } catch (error) {
        console.error('Error with SVG styling:', error);
        
        // If there's an error, ensure we show the fallback
        if (headerContainer) {
          headerContainer.classList.remove('svg-loading');
          headerContainer.classList.add('svg-error');
        }
      }
    });
    
    // Handle load errors
    svgContainer.addEventListener('error', function() {
      console.error('Failed to load SVG');
      if (headerContainer) {
        headerContainer.classList.remove('svg-loading');
        headerContainer.classList.add('svg-error');
      }
    });
  }
}
