import styles from './Button.module.css';

export class Button {
  constructor(options = {}) {
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
  
  render() {
    return this.element;
  }
  
  setDisabled(disabled) {
    if (disabled) {
      this.element.classList.add(styles.disabled);
      this.element.disabled = true;
    } else {
      this.element.classList.remove(styles.disabled);
      this.element.disabled = false;
    }
  }
  
  setText(text) {
    // Remove existing text nodes
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    
    // Add new text
    const textNode = document.createTextNode(text);
    this.element.appendChild(textNode);
  }
} 