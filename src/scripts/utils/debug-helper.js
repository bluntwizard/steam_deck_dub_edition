/**
 * Debug Helper for Grimoire Guide
 * Provides tools for diagnosing layout and rendering issues
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Create debug toggle button
  createDebugToggle();
  
  // Add keyboard shortcut for debug mode (Alt+D)
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'd') {
      toggleDebugMode();
    }
  });
  
  // Create error logger
  createErrorLogger();
  
  // Check for common rendering issues
  checkForRenderingIssues();
  
  // Listen for dynamic content loading
  window.addEventListener('content-loaded', function() {
    checkForRenderingIssues();
  });

  // Add DOM mutation monitoring in debug mode
  if (localStorage.getItem('debugMode') === 'true') {
    monitorNodeRemovals();
    document.body.classList.add('debug-layout');
  }

  // Add pseudo elements debug toggle
  addPseudoElementsDebugToggle();
});

/**
 * Create debug mode toggle button
 */
function createDebugToggle() {
  const button = document.createElement('button');
  button.id = 'debug-toggle-button';
  button.textContent = 'DEBUG';
  button.title = 'Toggle Debug Mode (Alt+D)';
  
  button.addEventListener('click', toggleDebugMode);
  
  document.body.appendChild(button);
}

/**
 * Toggle debug mode on/off
 */
function toggleDebugMode() {
  document.body.classList.toggle('debug-layout');
  
  // Add debug info to console
  if (document.body.classList.contains('debug-layout')) {
    console.log('=== DEBUG MODE ENABLED ===');
    logLayoutInfo();
  } else {
    console.log('Debug mode disabled');
  }
}

/**
 * Log information about the current layout
 */
function logLayoutInfo() {
  console.group('Layout Information');
  
  // Log section count and types
  const sections = document.querySelectorAll('.section');
  console.log(`Total sections: ${sections.length}`);
  
  const layoutTypes = {};
  sections.forEach(section => {
    const classes = Array.from(section.classList);
    const layoutClass = classes.find(cls => cls.startsWith('section-'));
    
    if (layoutClass) {
      layoutTypes[layoutClass] = (layoutTypes[layoutClass] || 0) + 1;
    } else {
      layoutTypes['no-layout'] = (layoutTypes['no-layout'] || 0) + 1;
    }
    
    // Check for display property issues
    const computedStyle = window.getComputedStyle(section);
    const display = computedStyle.getPropertyValue('display');
    
    if (layoutClass && !display.includes('grid') && !display.includes('flex')) {
      console.warn(`Section with ${layoutClass} has display: ${display}`, section);
    }
  });
  
  console.log('Section layout types:', layoutTypes);
  
  // Check for grid display issues
  document.querySelectorAll('.gallery-grid, .features-grid, .cards-grid').forEach(grid => {
    const computedStyle = window.getComputedStyle(grid);
    const display = computedStyle.getPropertyValue('display');
    
    if (display !== 'grid') {
      console.error(`Grid element has incorrect display: ${display} instead of grid`, grid);
    }
  });
  
  console.groupEnd();
}

/**
 * Create error logger to capture JS errors
 */
function createErrorLogger() {
  // Store original console error method
  const originalConsoleError = console.error;
  
  // Override console.error to capture errors
  console.error = function() {
    // Call original function
    originalConsoleError.apply(console, arguments);
    
    // Log to error display if in debug mode
    if (document.body.classList.contains('debug-layout')) {
      const errorMessage = Array.from(arguments).join(' ');
      showErrorMessage(errorMessage);
    }
  };
  
  // Capture JS errors
  window.addEventListener('error', function(event) {
    if (document.body.classList.contains('debug-layout')) {
      showErrorMessage(`JS ERROR: ${event.message} at ${event.filename}:${event.lineno}`);
    }
  });
}

/**
 * Show error message in UI
 */
function showErrorMessage(message) {
  // Check if error container exists
  let errorContainer = document.getElementById('debug-error-container');
  
  if (!errorContainer) {
    // Create error container
    errorContainer = document.createElement('div');
    errorContainer.id = 'debug-error-container';
    errorContainer.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      max-width: 80%;
      max-height: 200px;
      overflow-y: auto;
      background: rgba(40, 42, 54, 0.9);
      color: #ff5555;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      border: 1px solid #ff5555;
    `;
    document.body.appendChild(errorContainer);
  }
  
  // Add error message
  const errorElement = document.createElement('div');
  errorElement.textContent = message;
  errorElement.style.marginBottom = '5px';
  errorContainer.appendChild(errorElement);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.parentNode.removeChild(errorElement);
    }
    
    // Remove container if empty
    if (errorContainer.children.length === 0 && errorContainer.parentNode) {
      errorContainer.parentNode.removeChild(errorContainer);
    }
  }, 10000);
}

/**
 * Check for common rendering issues
 */
function checkForRenderingIssues() {
  // Check for sections with no layout class
  document.querySelectorAll('.section').forEach(section => {
    const hasLayoutClass = Array.from(section.classList).some(cls => cls.startsWith('section-'));
    if (!hasLayoutClass) {
      console.warn('Section without layout class:', section);
    }
  });
  
  // Check for grid containers with no grid-template-columns
  document.querySelectorAll('.gallery-grid, .features-grid, .cards-grid').forEach(grid => {
    const computedStyle = window.getComputedStyle(grid);
    const gridTemplateColumns = computedStyle.getPropertyValue('grid-template-columns');
    
    if (gridTemplateColumns === 'none') {
      console.error('Grid container has no grid-template-columns:', grid);
      
      // Try to fix the issue
      if (grid.classList.contains('gallery-grid')) {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
      } else if (grid.classList.contains('features-grid') || grid.classList.contains('cards-grid')) {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      }
    }
  });
  
  // Check for z-index stacking issues
  const elementsWithZIndex = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = window.getComputedStyle(el);
    return style.getPropertyValue('z-index') !== 'auto';
  });
  
  // Sort by z-index
  elementsWithZIndex.sort((a, b) => {
    const zIndexA = parseInt(window.getComputedStyle(a).getPropertyValue('z-index'));
    const zIndexB = parseInt(window.getComputedStyle(b).getPropertyValue('z-index'));
    return zIndexB - zIndexA;
  });
  
  if (elementsWithZIndex.length > 20) {
    console.warn('Many elements with z-index found, possible stacking issues:', elementsWithZIndex.slice(0, 5));
  }
}

/**
 * Monitor DOM node removals to catch "not a child" errors
 */
function monitorNodeRemovals() {
    // Store original removeChild method
    const originalRemoveChild = Node.prototype.removeChild;
    
    // Override removeChild to add safety checks
    Node.prototype.removeChild = function(child) {
        // Check if the child is actually a child of this node
        if (!this.contains(child)) {
            console.error('DOM Error: Attempted to remove a node that is not a child of the parent', {
                parent: this,
                child: child
            });
            
            // Don't throw, just log the error and return
            return child;
        }
        
        // Execute the original method if the check passes
        return originalRemoveChild.call(this, child);
    };
    
    console.log('DOM node removal monitoring enabled');
}

/**
 * Add toggle for debugging pseudo-elements
 */
function addPseudoElementsDebugToggle() {
  const debugToggleButton = document.getElementById('debug-toggle-button');
  if (!debugToggleButton) return;
  
  // Create pseudo-element debug button
  const pseudoElementDebugButton = document.createElement('button');
  pseudoElementDebugButton.id = 'pseudo-debug-toggle';
  pseudoElementDebugButton.title = 'Debug Pseudo-Elements';
  pseudoElementDebugButton.style.cssText = `
    position: fixed;
    bottom: 320px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(139, 233, 253, 0.8);
    color: #282a36;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10000;
    font-size: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  `;
  pseudoElementDebugButton.innerHTML = 'P';
  
  // Add click event
  pseudoElementDebugButton.addEventListener('click', function() {
    document.body.classList.toggle('debug-pseudo-elements');
    
    if (document.body.classList.contains('debug-pseudo-elements')) {
      console.log('Pseudo-element debugging enabled');
      pseudoElementDebugButton.style.backgroundColor = 'rgba(255, 85, 85, 0.8)';
    } else {
      console.log('Pseudo-element debugging disabled');
      pseudoElementDebugButton.style.backgroundColor = 'rgba(139, 233, 253, 0.8)';
    }
  });
  
  document.body.appendChild(pseudoElementDebugButton);
}
