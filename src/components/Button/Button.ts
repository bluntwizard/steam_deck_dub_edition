/**
 * Button Component - TypeScript Version
 */
import styles from './Button.module.css';

/**
 * Button configuration options
 */
export interface ButtonOptions {
  text?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: string;
  iconAlt?: string;
  onClick?: (event: MouseEvent) => void;
}

/**
 * Button component for user interactions
 */
export class Button {
  /**
   * The DOM element for the button
   */
  private element: HTMLButtonElement;
  
  /**
   * Creates a new Button instance
   * @param options - Configuration options for the button
   */
  constructor(options: ButtonOptions = {}) {
    this.element = document.createElement('button');
    this.element.className = styles.button;
    
    // Set variant
    if (options.variant === 'secondary') {
      this.element.classList.add(styles.secondary);
    } else {
      this.element.classList.add(styles.primary);
    }
    
    // Set disabled state
    if (options.disabled) {
      this.element.classList.add(styles.disabled);
      this.element.disabled = true;
    }
    
    // Set content
    if (options.icon) {
      const icon = document.createElement('img');
      icon.src = options.icon;
      icon.alt = options.iconAlt || '';
      icon.className = styles.icon;
      this.element.appendChild(icon);
    }
    
    if (options.text) {
      const text = document.createTextNode(options.text);
      this.element.appendChild(text);
    }
    
    // Add click handler
    if (options.onClick) {
      this.element.addEventListener('click', options.onClick);
    }
  }
  
  /**
   * Get the button element
   * @returns The button DOM element
   */
  render(): HTMLButtonElement {
    return this.element;
  }
  
  /**
   * Set the disabled state of the button
   * @param disabled - Whether the button should be disabled
   */
  setDisabled(disabled: boolean): void {
    if (disabled) {
      this.element.classList.add(styles.disabled);
      this.element.disabled = true;
    } else {
      this.element.classList.remove(styles.disabled);
      this.element.disabled = false;
    }
  }
  
  /**
   * Set the text content of the button
   * @param text - The new text content
   */
  setText(text: string): void {
    // Remove existing text nodes
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    
    // Add new text
    const textNode = document.createTextNode(text);
    this.element.appendChild(textNode);
  }
} 