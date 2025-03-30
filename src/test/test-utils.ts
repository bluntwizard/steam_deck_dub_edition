/**
 * Test Utilities
 * Steam Deck DUB Edition Guide
 * 
 * Helper functions for testing components and utilities
 */

/**
 * Simulates a click event on an element
 * @param element Element to click
 */
export function simulateClick(element: Element): void {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}

/**
 * Simulates a keyboard event on an element
 * @param element Element to target
 * @param eventType Keyboard event type
 * @param key Key pressed
 * @param code Code for the key
 */
export function simulateKeyEvent(
  element: Element, 
  eventType: 'keydown' | 'keyup' | 'keypress',
  key: string,
  code: string
): void {
  const event = new KeyboardEvent(eventType, {
    bubbles: true,
    cancelable: true,
    key,
    code
  });
  element.dispatchEvent(event);
}

/**
 * Simulates an input event on a form element
 * @param element Input element to target
 * @param value New value for the input
 */
export function simulateInputChange(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  element.value = value;
  
  const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true
  });
  
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  });
  
  element.dispatchEvent(inputEvent);
  element.dispatchEvent(changeEvent);
}

/**
 * Waits for a specified amount of time
 * @param ms Time to wait in milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Waits for a condition to be true
 * @param condition Function that returns a boolean
 * @param timeout Optional timeout in milliseconds
 * @param interval Optional check interval in milliseconds
 */
export async function waitForCondition(
  condition: () => boolean, 
  timeout = 1000,
  interval = 50
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    await wait(interval);
  }
  
  return false;
}

/**
 * Creates a mock resize observer
 */
export function mockResizeObserver(): void {
  class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  
  // @ts-ignore - Mocking global
  global.ResizeObserver = MockResizeObserver;
}

/**
 * Creates a mock intersection observer
 */
export function mockIntersectionObserver(): void {
  class MockIntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  
  // @ts-ignore - Mocking global
  global.IntersectionObserver = MockIntersectionObserver;
}

/**
 * Creates and appends an element to the DOM
 * @param tag HTML tag
 * @param attributes Attributes to set on the element
 * @param parent Parent element to append to (defaults to body)
 */
export function createElement<T extends HTMLElement>(
  tag: string,
  attributes: Record<string, string> = {},
  parent: HTMLElement = document.body
): T {
  const element = document.createElement(tag) as T;
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  parent.appendChild(element);
  return element;
}

/**
 * Cleans up the DOM after tests
 */
export function cleanupDOM(): void {
  document.body.innerHTML = '';
} 