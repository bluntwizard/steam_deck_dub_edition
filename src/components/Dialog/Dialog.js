/**
 * Grimoire
 * Dialog Component
 * 
 * Provides a reusable modal dialog component
 */

import styles from './Dialog.module.css';

class Dialog {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      content: options.content || '',
      closeOnEscape: options.closeOnEscape !== false,
      closeOnOutsideClick: options.closeOnOutsideClick !== false,
      showCloseButton: options.showCloseButton !== false,
      onClose: options.onClose || null,
      width: options.width || null,
      maxWidth: options.maxWidth || '500px',
      actions: options.actions || []
    };
    
    this.dialogElement = null;
    this.overlayElement = null;
    this.isVisible = false;
  }

  /**
   * Create the dialog element
   */
  create() {
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = styles.dialogOverlay;
    
    // Create dialog
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = styles.dialog;
    
    // Apply custom width if specified
    if (this.options.width) {
      this.dialogElement.style.width = this.options.width;
    }
    
    if (this.options.maxWidth) {
      this.dialogElement.style.maxWidth = this.options.maxWidth;
    }
    
    // Add title if provided
    if (this.options.title) {
      const titleElement = document.createElement('h3');
      titleElement.className = styles.dialogTitle;
      titleElement.textContent = this.options.title;
      this.dialogElement.appendChild(titleElement);
    }
    
    // Add close button if enabled
    if (this.options.showCloseButton) {
      const closeButton = document.createElement('button');
      closeButton.className = styles.closeButton;
      closeButton.innerHTML = '&times;';
      closeButton.setAttribute('aria-label', 'Close');
      closeButton.addEventListener('click', () => this.close());
      
      this.dialogElement.appendChild(closeButton);
    }
    
    // Add content
    const contentElement = document.createElement('div');
    contentElement.className = styles.dialogContent;
    
    if (typeof this.options.content === 'string') {
      contentElement.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      contentElement.appendChild(this.options.content);
    }
    
    this.dialogElement.appendChild(contentElement);
    
    // Add action buttons if provided
    if (this.options.actions && this.options.actions.length > 0) {
      const actionsElement = document.createElement('div');
      actionsElement.className = styles.dialogActions;
      
      this.options.actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.text;
        button.className = action.primary 
          ? styles.buttonPrimary 
          : action.danger 
            ? styles.buttonDanger 
            : styles.buttonSecondary;
        
        if (action.onClick) {
          button.addEventListener('click', () => {
            const shouldClose = action.onClick();
            if (shouldClose !== false) {
              this.close();
            }
          });
        } else {
          button.addEventListener('click', () => this.close());
        }
        
        actionsElement.appendChild(button);
      });
      
      this.dialogElement.appendChild(actionsElement);
    }
    
    // Add dialog to overlay
    this.overlayElement.appendChild(this.dialogElement);
    
    // Add to DOM
    document.body.appendChild(this.overlayElement);
    
    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Handle Escape key
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
    
    // Handle clicking outside
    if (this.options.closeOnOutsideClick) {
      this.overlayElement.addEventListener('click', this.handleOutsideClick);
    }
  }

  /**
   * Handle keydown events
   */
  handleKeyDown = (e) => {
    if (e.key === 'Escape' && this.isVisible) {
      this.close();
    }
  }

  /**
   * Handle clicks outside the dialog
   */
  handleOutsideClick = (e) => {
    if (e.target === this.overlayElement) {
      this.close();
    }
  }

  /**
   * Show the dialog
   */
  show() {
    if (!this.dialogElement) {
      this.create();
    }
    
    this.overlayElement.style.display = 'flex';
    this.isVisible = true;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    return this;
  }

  /**
   * Close the dialog
   */
  close() {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
      this.isVisible = false;
      
      // Restore body scrolling
      document.body.style.overflow = '';
      
      // Call onClose callback if provided
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.overlayElement) {
      this.overlayElement.removeEventListener('click', this.handleOutsideClick);
    }
    
    return this;
  }

  /**
   * Destroy the dialog completely
   */
  destroy() {
    this.close();
    
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
    
    this.dialogElement = null;
    this.overlayElement = null;
  }

  /**
   * Update dialog content
   * @param {string|HTMLElement} content - The new content
   */
  setContent(content) {
    if (!this.dialogElement) return this;
    
    const contentElement = this.dialogElement.querySelector(`.${styles.dialogContent}`);
    if (!contentElement) return this;
    
    // Clear existing content
    contentElement.innerHTML = '';
    
    if (typeof content === 'string') {
      contentElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentElement.appendChild(content);
    }
    
    return this;
  }

  /**
   * Update dialog title
   * @param {string} title - The new title
   */
  setTitle(title) {
    if (!this.dialogElement) return this;
    
    let titleElement = this.dialogElement.querySelector(`.${styles.dialogTitle}`);
    
    if (!titleElement) {
      titleElement = document.createElement('h3');
      titleElement.className = styles.dialogTitle;
      this.dialogElement.insertBefore(titleElement, this.dialogElement.firstChild);
    }
    
    titleElement.textContent = title;
    return this;
  }
}

export default Dialog; 