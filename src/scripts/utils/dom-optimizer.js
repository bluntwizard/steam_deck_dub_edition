/**
 * DOM Optimization Utilities
 * Improves performance by reducing layout thrashing and optimizing DOM operations
 */

/**
 * DOM operation batching - Used to group DOM operations to minimize layout thrashing
 */
class DOMBatch {
  constructor() {
    this.readQueue = [];
    this.writeQueue = [];
    this.scheduled = false;
  }
  
  /**
   * Schedule DOM reads (measurements)
   * @param {Function} fn - Function that reads from the DOM
   * @param {Object} context - 'this' context for the function
   * @param {Array} args - Arguments to pass to the function
   * @returns {Promise} - Promise that resolves with the read result
   */
  read(fn, context = null, args = []) {
    return new Promise(resolve => {
      this.readQueue.push({ fn, context, args, resolve });
      this.schedule();
    });
  }
  
  /**
   * Schedule DOM writes (mutations)
   * @param {Function} fn - Function that writes to the DOM
   * @param {Object} context - 'this' context for the function
   * @param {Array} args - Arguments to pass to the function
   * @returns {Promise} - Promise that resolves when the write is complete
   */
  write(fn, context = null, args = []) {
    return new Promise(resolve => {
      this.writeQueue.push({ fn, context, args, resolve });
      this.schedule();
    });
  }
  
  /**
   * Schedule a batch processing
   */
  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    
    requestAnimationFrame(() => {
      this.process();
    });
  }
  
  /**
   * Process all queued DOM operations
   */
  process() {
    // Process all reads first to avoid layout thrashing
    const reads = this.readQueue;
    this.readQueue = [];
    
    reads.forEach(({ fn, context, args, resolve }) => {
      const result = fn.apply(context, args);
      resolve(result);
    });
    
    // Then process all writes
    const writes = this.writeQueue;
    this.writeQueue = [];
    
    writes.forEach(({ fn, context, args, resolve }) => {
      const result = fn.apply(context, args);
      resolve(result);
    });
    
    this.scheduled = false;
    
    // If more operations were added during processing, schedule another batch
    if (this.readQueue.length || this.writeQueue.length) {
      this.schedule();
    }
  }
}

// Export a singleton instance of the DOM batch processor
export const domBatch = new DOMBatch();

/**
 * Optimized element creation with batch DOM operations
 * @param {string} tagName - HTML tag name
 * @param {Object} [attributes] - Element attributes
 * @param {Array|Node} [children] - Child elements
 * @returns {HTMLElement} - The created element
 */
export function createElement(tagName, attributes = {}, children = []) {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([prop, val]) => {
        element.style[prop] = val;
      });
    } else if (key === 'classList' && Array.isArray(value)) {
      value.forEach(cls => element.classList.add(cls));
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          } else {
            element.appendChild(child);
          }
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else {
      element.appendChild(children);
    }
  }
  
  return element;
}

/**
 * Create a document fragment from an array of elements
 * @param {Array} elements - Array of DOM elements
 * @returns {DocumentFragment}
 */
export function createFragment(elements) {
  const fragment = document.createDocumentFragment();
  
  elements.forEach(element => {
    if (element) {
      fragment.appendChild(element);
    }
  });
  
  return fragment;
}

/**
 * Virtual scrolling for large lists
 * @param {Object} options - Configuration options
 * @returns {Object} - Virtual scroller API
 */
export function createVirtualScroller(options) {
  const {
    container,
    itemHeight,
    renderItem,
    itemCount,
    overscan = 5,
    onVisibilityChange = null
  } = options;
  
  if (!container) {
    throw new Error('Container element is required');
  }
  
  let scrollTop = 0;
  let visibleItems = [];
  let renderedItems = new Map();
  
  // Make container a scroll container if it's not already
  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === 'static') {
    container.style.position = 'relative';
  }
  if (computedStyle.overflow === 'visible') {
    container.style.overflow = 'auto';
  }
  
  // Set container height
  const totalHeight = itemCount * itemHeight;
  container.style.height = '100%';
  
  // Create a spacer element to maintain scroll size
  const spacer = createElement('div', {
    style: {
      height: `${totalHeight}px`,
      position: 'relative',
      width: '100%'
    }
  });
  
  container.appendChild(spacer);
  
  // Calculate the visible range of items
  function calculateVisibleItems() {
    scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    );
    
    return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i);
  }
  
  // Render visible items
  function renderVisibleItems() {
    return domBatch.write(() => {
      // Remove all existing items
      renderedItems.forEach((item) => {
        if (!visibleItems.includes(item.index)) {
          item.element.remove();
          renderedItems.delete(item.index);
        }
      });
      
      // Create or update visible items
      const fragment = document.createDocumentFragment();
      
      visibleItems.forEach(index => {
        if (!renderedItems.has(index)) {
          const item = renderItem(index);
          
          // Position the item absolutely
          item.style.position = 'absolute';
          item.style.top = `${index * itemHeight}px`;
          item.style.left = '0';
          item.style.width = '100%';
          item.style.height = `${itemHeight}px`;
          
          renderedItems.set(index, { element: item, index });
          fragment.appendChild(item);
        }
      });
      
      spacer.appendChild(fragment);
    });
  }
  
  // Handle scroll events
  function handleScroll() {
    const newVisibleItems = calculateVisibleItems();
    
    // Only update if the visible items have changed
    if (JSON.stringify(newVisibleItems) !== JSON.stringify(visibleItems)) {
      visibleItems = newVisibleItems;
      renderVisibleItems();
      
      if (onVisibilityChange) {
        onVisibilityChange(visibleItems);
      }
    }
  }
  
  // Initial render
  visibleItems = calculateVisibleItems();
  renderVisibleItems();
  
  // Setup scroll listener
  container.addEventListener('scroll', () => {
    requestAnimationFrame(handleScroll);
  }, { passive: true });
  
  // Public API
  return {
    refresh: () => {
      visibleItems = calculateVisibleItems();
      renderVisibleItems();
    },
    scrollToIndex: (index) => {
      container.scrollTop = index * itemHeight;
    },
    updateItemCount: (count) => {
      itemCount = count;
      spacer.style.height = `${count * itemHeight}px`;
      handleScroll();
    }
  };
}

/**
 * Apply CSS transitions for smoother UI changes
 * @param {HTMLElement} element - Element to apply transition to
 * @param {Object} properties - CSS properties to change
 * @param {Object} [options] - Transition options
 */
export function smoothTransition(element, properties, options = {}) {
  const {
    duration = 300,
    easing = 'ease',
    onComplete = null
  } = options;
  
  return domBatch.write(() => {
    // Save original transition
    const originalTransition = element.style.transition;
    
    // Build transition string for all properties
    const transitionProps = Object.keys(properties).map(prop => {
      // Convert camelCase to kebab-case for CSS properties
      const kebabCase = prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabCase} ${duration}ms ${easing}`;
    }).join(', ');
    
    // Set transition property first
    element.style.transition = transitionProps;
    
    // Force a reflow
    element.offsetHeight;
    
    // Apply all property changes
    Object.entries(properties).forEach(([prop, value]) => {
      element.style[prop] = value;
    });
    
    // Reset transition after animation completes
    setTimeout(() => {
      element.style.transition = originalTransition;
      if (onComplete) onComplete(element);
    }, duration);
  });
}

/**
 * Defer non-critical operations to idle periods
 * @param {Function} fn - Function to execute during idle time
 * @param {Object} [options] - requestIdleCallback options
 */
export function runWhenIdle(fn, options = { timeout: 2000 }) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(fn, options);
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(() => {
      const start = Date.now();
      fn({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1);
  }
}

/**
 * Cancel a previously scheduled idle callback
 * @param {number} id - The ID returned by runWhenIdle
 */
export function cancelIdleTask(id) {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
} 