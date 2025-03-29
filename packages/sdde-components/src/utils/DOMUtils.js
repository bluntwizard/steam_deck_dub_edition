/**
 * Utility functions for DOM manipulation
 */
class DOMUtils {
  /**
   * Create a DOM element with attributes and children
   * @param {string} tagName - The HTML tag name
   * @param {Object} [attributes={}] - Attributes to set on the element
   * @param {Array|string|HTMLElement} [children] - Child elements or text content
   * @returns {HTMLElement} The created element
   */
  static createElement(tagName, attributes = {}, children) {
    const element = document.createElement(tagName);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.assign(element.dataset, value);
      } else {
        element.setAttribute(key, value);
      }
    }
    
    // Add children
    if (children !== undefined) {
      this.appendChildren(element, children);
    }
    
    return element;
  }
  
  /**
   * Append children to an element
   * @param {HTMLElement} element - The parent element
   * @param {Array|string|HTMLElement} children - Children to append
   * @returns {HTMLElement} The parent element
   */
  static appendChildren(element, children) {
    if (Array.isArray(children)) {
      for (const child of children) {
        this.appendChildren(element, child);
      }
    } else if (children instanceof HTMLElement) {
      element.appendChild(children);
    } else if (children !== null && children !== undefined) {
      element.appendChild(document.createTextNode(children.toString()));
    }
    
    return element;
  }
  
  /**
   * Remove all children from an element
   * @param {HTMLElement} element - The element to clear
   * @returns {HTMLElement} The cleared element
   */
  static clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    
    return element;
  }
  
  /**
   * Find an element that matches the selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} [context=document] - Element to search within
   * @returns {HTMLElement|null} The found element or null
   */
  static find(selector, context = document) {
    return context.querySelector(selector);
  }
  
  /**
   * Find all elements that match the selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} [context=document] - Element to search within
   * @returns {NodeList} List of matching elements
   */
  static findAll(selector, context = document) {
    return context.querySelectorAll(selector);
  }
  
  /**
   * Add one or more classes to an element
   * @param {HTMLElement} element - The element to modify
   * @param {string|string[]} classes - Classes to add
   * @returns {HTMLElement} The modified element
   */
  static addClass(element, classes) {
    if (!element) return element;
    
    if (Array.isArray(classes)) {
      element.classList.add(...classes);
    } else if (typeof classes === 'string') {
      const classArray = classes.split(' ').filter(Boolean);
      if (classArray.length > 0) {
        element.classList.add(...classArray);
      }
    }
    
    return element;
  }
  
  /**
   * Remove one or more classes from an element
   * @param {HTMLElement} element - The element to modify
   * @param {string|string[]} classes - Classes to remove
   * @returns {HTMLElement} The modified element
   */
  static removeClass(element, classes) {
    if (!element) return element;
    
    if (Array.isArray(classes)) {
      element.classList.remove(...classes);
    } else if (typeof classes === 'string') {
      const classArray = classes.split(' ').filter(Boolean);
      if (classArray.length > 0) {
        element.classList.remove(...classArray);
      }
    }
    
    return element;
  }
  
  /**
   * Toggle one or more classes on an element
   * @param {HTMLElement} element - The element to modify
   * @param {string|string[]} classes - Classes to toggle
   * @param {boolean} [force] - Force adding or removing
   * @returns {HTMLElement} The modified element
   */
  static toggleClass(element, classes, force) {
    if (!element) return element;
    
    if (Array.isArray(classes)) {
      classes.forEach(cls => element.classList.toggle(cls, force));
    } else if (typeof classes === 'string') {
      const classArray = classes.split(' ').filter(Boolean);
      classArray.forEach(cls => element.classList.toggle(cls, force));
    }
    
    return element;
  }
  
  /**
   * Set attributes on an element
   * @param {HTMLElement} element - The element to modify
   * @param {Object} attributes - Attributes to set
   * @returns {HTMLElement} The modified element
   */
  static setAttributes(element, attributes) {
    if (!element || !attributes) return element;
    
    for (const [key, value] of Object.entries(attributes)) {
      if (value === null || value === undefined) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, value);
      }
    }
    
    return element;
  }
  
  /**
   * Set ARIA attributes on an element
   * @param {HTMLElement} element - The element to modify
   * @param {Object} attributes - ARIA attributes to set
   * @returns {HTMLElement} The modified element
   */
  static setAriaAttributes(element, attributes) {
    if (!element || !attributes) return element;
    
    for (const [key, value] of Object.entries(attributes)) {
      if (value === null || value === undefined) {
        element.removeAttribute(`aria-${key}`);
      } else {
        element.setAttribute(`aria-${key}`, value);
      }
    }
    
    return element;
  }
  
  /**
   * Insert an element after a reference element
   * @param {HTMLElement} newElement - Element to insert
   * @param {HTMLElement} referenceElement - Element to insert after
   * @returns {HTMLElement} The inserted element
   */
  static insertAfter(newElement, referenceElement) {
    if (!newElement || !referenceElement || !referenceElement.parentNode) {
      return newElement;
    }
    
    referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
    return newElement;
  }
  
  /**
   * Get the computed style value for an element
   * @param {HTMLElement} element - The element to get style for
   * @param {string} property - The CSS property name
   * @returns {string} The computed style value
   */
  static getComputedStyle(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
  }
  
  /**
   * Trap focus within an element for accessibility
   * @param {HTMLElement} element - Element to trap focus within
   * @returns {Function} Function to remove the trap
   */
  static trapFocus(element) {
    if (!element) return () => {};
    
    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length === 0) return () => {};
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }
  
  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement[]} Array of focusable elements
   */
  static getFocusableElements(container) {
    if (!container) return [];
    
    const focusableSelectors = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    const elements = Array.from(
      container.querySelectorAll(focusableSelectors.join(','))
    );
    
    return elements.filter(el => {
      return el.offsetWidth > 0 && el.offsetHeight > 0;
    });
  }
  
  /**
   * Safely parse HTML and return a document fragment
   * @param {string} html - HTML string to parse
   * @returns {DocumentFragment} Document fragment with parsed HTML
   */
  static parseHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const fragment = document.createDocumentFragment();
    
    while (doc.body.firstChild) {
      fragment.appendChild(doc.body.firstChild);
    }
    
    return fragment;
  }
}

export default DOMUtils; 