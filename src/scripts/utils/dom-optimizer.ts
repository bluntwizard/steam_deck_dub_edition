/**
 * DOM Optimization Utilities
 * Improves performance by reducing layout thrashing and optimizing DOM operations
 */

/**
 * Interface for a queued operation
 */
interface QueuedOperation<T> {
  fn: (...args: any[]) => T;
  context: any;
  args: any[];
  resolve: (value: T) => void;
}

/**
 * DOM operation batching - Used to group DOM operations to minimize layout thrashing
 */
class DOMBatch {
  private readQueue: QueuedOperation<any>[] = [];
  private writeQueue: QueuedOperation<any>[] = [];
  private scheduled: boolean = false;
  
  /**
   * Schedule DOM reads (measurements)
   * @param fn - Function that reads from the DOM
   * @param context - 'this' context for the function
   * @param args - Arguments to pass to the function
   * @returns Promise that resolves with the read result
   */
  read<T>(fn: (...args: any[]) => T, context: any = null, args: any[] = []): Promise<T> {
    return new Promise<T>(resolve => {
      this.readQueue.push({ fn, context, args, resolve });
      this.schedule();
    });
  }
  
  /**
   * Schedule DOM writes (mutations)
   * @param fn - Function that writes to the DOM
   * @param context - 'this' context for the function
   * @param args - Arguments to pass to the function
   * @returns Promise that resolves when the write is complete
   */
  write<T>(fn: (...args: any[]) => T, context: any = null, args: any[] = []): Promise<T> {
    return new Promise<T>(resolve => {
      this.writeQueue.push({ fn, context, args, resolve });
      this.schedule();
    });
  }
  
  /**
   * Schedule a batch processing
   */
  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    
    requestAnimationFrame(() => {
      this.process();
    });
  }
  
  /**
   * Process all queued DOM operations
   */
  private process(): void {
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
 * Type definitions for element creation
 */
interface ElementAttributes {
  [key: string]: any;
  style?: { [key: string]: string | number };
  classList?: string[];
  dataset?: { [key: string]: string };
}

/**
 * Optimized element creation with batch DOM operations
 * @param tagName - HTML tag name
 * @param attributes - Element attributes
 * @param children - Child elements
 * @returns The created element
 */
export function createElement(
  tagName: string, 
  attributes: ElementAttributes = {}, 
  children: Array<Node | string> | Node | string = []
): HTMLElement {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([prop, val]) => {
        // Using type assertion to avoid TypeScript issues with indexing
        (element.style as any)[prop] = val;
      });
    } else if (key === 'classList' && Array.isArray(value)) {
      value.forEach(cls => element.classList.add(cls));
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = String(dataValue);
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    } else {
      element.setAttribute(key, String(value));
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
            element.appendChild(child as Node);
          }
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else {
      element.appendChild(children as Node);
    }
  }
  
  return element;
}

/**
 * Create a document fragment from an array of elements
 * @param elements - Array of DOM elements
 * @returns DocumentFragment
 */
export function createFragment(elements: (Node | null | undefined)[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  
  elements.forEach(element => {
    if (element) {
      fragment.appendChild(element);
    }
  });
  
  return fragment;
}

/**
 * Interface for virtual scroller options
 */
interface VirtualScrollerOptions {
  container: HTMLElement;
  itemHeight: number;
  renderItem: (index: number) => HTMLElement;
  itemCount: number;
  overscan?: number;
  onVisibilityChange?: (visibleItems: number[]) => void;
}

/**
 * Interface for a rendered item
 */
interface RenderedItem {
  element: HTMLElement;
  index: number;
}

/**
 * Interface for virtual scroller API
 */
interface VirtualScrollerAPI {
  refresh: (newCount?: number) => void;
  scrollToItem: (index: number, alignToTop?: boolean) => void;
  destroy: () => void;
}

/**
 * Virtual scrolling for large lists
 * @param options - Configuration options
 * @returns Virtual scroller API
 */
export function createVirtualScroller(options: VirtualScrollerOptions): VirtualScrollerAPI {
  const {
    container,
    itemHeight,
    renderItem,
    itemCount: initialItemCount,
    overscan = 5,
    onVisibilityChange = null
  } = options;
  
  if (!container) {
    throw new Error('Container element is required');
  }
  
  let scrollTop = 0;
  let visibleItems: number[] = [];
  let renderedItems = new Map<number, RenderedItem>();
  let itemCount = initialItemCount;
  
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
  function calculateVisibleItems(): number[] {
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
  function renderVisibleItems(): void {
    domBatch.write(() => {
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
  function handleScroll(): void {
    const newVisibleItems = calculateVisibleItems();
    
    // Check if the visible items have changed
    if (newVisibleItems.length !== visibleItems.length ||
        newVisibleItems.some((item, i) => visibleItems[i] !== item)) {
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
  
  // Listen for scroll events
  container.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
  
  // Return API
  return {
    refresh: (newCount?: number) => {
      if (newCount !== undefined) {
        itemCount = newCount;
        spacer.style.height = `${itemCount * itemHeight}px`;
      }
      
      // Clear existing rendered items
      renderedItems.forEach(item => item.element.remove());
      renderedItems.clear();
      
      // Recalculate and render
      visibleItems = calculateVisibleItems();
      renderVisibleItems();
    },
    
    scrollToItem: (index: number, alignToTop = true) => {
      if (index < 0 || index >= itemCount) return;
      
      const position = index * itemHeight;
      container.scrollTo({
        top: alignToTop ? position : position - container.clientHeight + itemHeight,
        behavior: 'smooth'
      });
    },
    
    destroy: () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      
      // Remove all rendered items
      renderedItems.forEach(item => item.element.remove());
      spacer.remove();
    }
  };
}

/**
 * Interface for transition options
 */
interface TransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Apply a smooth transition to an element
 * @param element - The element to transition
 * @param properties - CSS properties to animate
 * @param options - Transition options
 * @returns Promise that resolves when the transition is complete
 */
export function smoothTransition(
  element: HTMLElement,
  properties: { [key: string]: string | number },
  options: TransitionOptions = {}
): Promise<void> {
  const {
    duration = 300,
    easing = 'ease',
    delay = 0,
    onComplete
  } = options;
  
  return new Promise<void>(resolve => {
    // Store original transition
    const originalTransition = element.style.transition;
    
    // Set up transition
    element.style.transition = Object.keys(properties)
      .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
      .join(', ');
    
    // Apply properties
    Object.entries(properties).forEach(([prop, value]) => {
      // Using type assertion for style property access
      (element.style as any)[prop] = value;
    });
    
    // Listen for transition end
    const handleTransitionEnd = (): void => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      element.style.transition = originalTransition;
      
      if (onComplete) {
        onComplete();
      }
      
      resolve();
    };
    
    element.addEventListener('transitionend', handleTransitionEnd);
    
    // Fallback in case the transitionend event doesn't fire
    setTimeout(() => {
      if (element.style.transition !== originalTransition) {
        handleTransitionEnd();
      }
    }, duration + delay + 50);
  });
}

/**
 * Run a function when the browser is idle
 * @param fn - Function to run
 * @param options - Options for requestIdleCallback
 * @returns ID for the idle callback that can be used to cancel it
 */
export function runWhenIdle(
  fn: () => void,
  options: { timeout?: number } = { timeout: 2000 }
): any {
  if (typeof (window as any).requestIdleCallback === 'function') {
    // TypeScript might not know about requestIdleCallback, use a type assertion
    return (window as any).requestIdleCallback(() => fn(), options);
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(fn, 1);
  }
}

/**
 * Cancel an idle task
 * @param id - ID returned from runWhenIdle
 */
export function cancelIdleTask(id: any): void {
  if (typeof (window as any).cancelIdleCallback === 'function') {
    (window as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
} 