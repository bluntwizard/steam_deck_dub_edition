import EventEmitter from '../../utils/EventEmitter';
import DOMUtils from '../../utils/DOMUtils';
import { CLASS_NAMES, EVENTS } from '../../constants';

import './Dialog.css';

/**
 * Dialog component for modal dialogs
 * @class
 */
class Dialog extends EventEmitter {
  /**
   * Create a new Dialog instance
   * @param {Object} options - Dialog options
   * @param {string} [options.title] - Dialog title
   * @param {string|HTMLElement} [options.content] - Dialog content (string or HTML element)
   * @param {Array} [options.buttons] - Array of button configurations
   * @param {boolean} [options.closeOnOverlayClick=true] - Whether clicking the overlay closes the dialog
   * @param {boolean} [options.showCloseButton=true] - Whether to show the close button
   * @param {string} [options.size='medium'] - Dialog size ('small', 'medium', 'large')
   * @param {string} [options.className] - Additional class names for the dialog
   * @param {Function} [options.onOpen] - Callback when dialog opens
   * @param {Function} [options.onClose] - Callback when dialog closes
   * @param {boolean} [options.focusTrap=true] - Whether to trap focus within the dialog
   * @param {boolean} [options.autoFocus=true] - Whether to auto-focus the first focusable element
   * @param {boolean} [options.escapeCloses=true] - Whether pressing Escape closes the dialog
   */
  constructor(options = {}) {
    super({
      target: document,
      debug: options.debug || false
    });

    this.options = Object.assign({
      title: '',
      content: '',
      buttons: [],
      closeOnOverlayClick: true,
      showCloseButton: true,
      size: 'medium',
      className: '',
      onOpen: null,
      onClose: null,
      focusTrap: true,
      autoFocus: true,
      escapeCloses: true
    }, options);

    this.isOpen = false;
    this.elements = {};
    this.previouslyFocused = null;
    this.removeFocusTrap = null;
    
    this._handleEscapeKey = this._handleEscapeKey.bind(this);
    this._handleOverlayClick = this._handleOverlayClick.bind(this);
    
    this._createDOM();
  }

  /**
   * Create the DOM structure for the dialog
   * @private
   */
  _createDOM() {
    // Create overlay
    this.elements.overlay = DOMUtils.createElement('div', {
      className: CLASS_NAMES.DIALOG.OVERLAY
    });

    // Create dialog container
    this.elements.container = DOMUtils.createElement('div', {
      className: `${CLASS_NAMES.DIALOG.CONTAINER} ${this.options.size} ${this.options.className}`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'dialog-title',
      'aria-describedby': 'dialog-content'
    });

    // Create close button if needed
    if (this.options.showCloseButton) {
      this.elements.closeButton = DOMUtils.createElement('button', {
        className: CLASS_NAMES.DIALOG.CLOSE_BUTTON,
        'aria-label': 'Close dialog',
        type: 'button',
        onclick: () => this.close()
      }, '×');
      
      this.elements.container.appendChild(this.elements.closeButton);
    }

    // Create content container
    this.elements.content = DOMUtils.createElement('div', {
      className: CLASS_NAMES.DIALOG.CONTENT
    });
    this.elements.container.appendChild(this.elements.content);

    // Create title if provided
    if (this.options.title) {
      this.elements.title = DOMUtils.createElement('h2', {
        className: CLASS_NAMES.DIALOG.TITLE,
        id: 'dialog-title'
      }, this.options.title);
      
      this.elements.content.appendChild(this.elements.title);
    }

    // Create body
    this.elements.body = DOMUtils.createElement('div', {
      className: CLASS_NAMES.DIALOG.BODY,
      id: 'dialog-content'
    });
    this.elements.content.appendChild(this.elements.body);

    // Set content
    this.setContent(this.options.content);

    // Create buttons if provided
    if (this.options.buttons && this.options.buttons.length > 0) {
      this.elements.actions = DOMUtils.createElement('div', {
        className: CLASS_NAMES.DIALOG.ACTIONS
      });
      
      this.options.buttons.forEach(buttonConfig => {
        const button = DOMUtils.createElement('button', {
          type: 'button',
          className: `button ${buttonConfig.type || 'secondary'}`,
          disabled: buttonConfig.disabled || false,
          onclick: (e) => {
            if (buttonConfig.onClick) {
              buttonConfig.onClick(e);
            }
            
            this.emit(EVENTS.DIALOG.BUTTON_CLICK, {
              buttonId: buttonConfig.id,
              button: buttonConfig
            });
          }
        }, buttonConfig.label);
        
        this.elements.actions.appendChild(button);
      });
      
      this.elements.content.appendChild(this.elements.actions);
    }

    // Add event listeners for overlay
    if (this.options.closeOnOverlayClick) {
      this.elements.overlay.addEventListener('click', this._handleOverlayClick);
    }
  }

  /**
   * Handle overlay click
   * @param {Event} e - Click event
   * @private
   */
  _handleOverlayClick(e) {
    if (e.target === this.elements.overlay) {
      this.close();
    }
  }

  /**
   * Handle escape key press
   * @param {KeyboardEvent} e - Keyboard event
   * @private
   */
  _handleEscapeKey(e) {
    if (e.key === 'Escape' && this.options.escapeCloses) {
      this.close();
    }
  }

  /**
   * Open the dialog
   * @returns {Dialog} This dialog instance
   */
  open() {
    if (this.isOpen) return this;

    // Save currently focused element
    this.previouslyFocused = document.activeElement;

    // Append to body
    document.body.appendChild(this.elements.overlay);
    document.body.appendChild(this.elements.container);

    // Set up focus trap if enabled
    if (this.options.focusTrap) {
      this.removeFocusTrap = DOMUtils.trapFocus(this.elements.container);
    }

    // Auto-focus first element if enabled
    if (this.options.autoFocus) {
      const focusableElements = DOMUtils.getFocusableElements(this.elements.container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        this.elements.container.focus();
      }
    }

    // Add escape key listener if enabled
    if (this.options.escapeCloses) {
      document.addEventListener('keydown', this._handleEscapeKey);
    }

    // Mark as open
    this.isOpen = true;

    // Call onOpen callback if provided
    if (typeof this.options.onOpen === 'function') {
      this.options.onOpen(this);
    }

    // Emit open event
    this.emit(EVENTS.DIALOG.OPENED, { dialog: this });

    return this;
  }

  /**
   * Close the dialog
   * @returns {Dialog} This dialog instance
   */
  close() {
    if (!this.isOpen) return this;

    // Remove from DOM
    if (this.elements.overlay.parentNode) {
      this.elements.overlay.parentNode.removeChild(this.elements.overlay);
    }
    
    if (this.elements.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }

    // Clean up focus trap
    if (this.removeFocusTrap) {
      this.removeFocusTrap();
      this.removeFocusTrap = null;
    }

    // Restore focus
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      this.previouslyFocused.focus();
    }

    // Remove escape key listener
    document.removeEventListener('keydown', this._handleEscapeKey);

    // Mark as closed
    this.isOpen = false;

    // Call onClose callback if provided
    if (typeof this.options.onClose === 'function') {
      this.options.onClose(this);
    }

    // Emit close event
    this.emit(EVENTS.DIALOG.CLOSED, { dialog: this });

    return this;
  }

  /**
   * Set the dialog content
   * @param {string|HTMLElement} content - Content to set
   * @returns {Dialog} This dialog instance
   */
  setContent(content) {
    DOMUtils.clearElement(this.elements.body);

    if (content instanceof HTMLElement) {
      this.elements.body.appendChild(content);
    } else if (typeof content === 'string') {
      this.elements.body.innerHTML = content;
    }

    return this;
  }

  /**
   * Set the dialog title
   * @param {string} title - Title to set
   * @returns {Dialog} This dialog instance
   */
  setTitle(title) {
    if (!this.elements.title) {
      this.elements.title = DOMUtils.createElement('h2', {
        className: CLASS_NAMES.DIALOG.TITLE,
        id: 'dialog-title'
      });
      
      this.elements.content.insertBefore(
        this.elements.title,
        this.elements.content.firstChild
      );
    }

    this.elements.title.textContent = title;
    return this;
  }

  /**
   * Update dialog buttons
   * @param {Array} buttons - New button configurations
   * @returns {Dialog} This dialog instance
   */
  setButtons(buttons) {
    // Remove existing actions container
    if (this.elements.actions && this.elements.actions.parentNode) {
      this.elements.actions.parentNode.removeChild(this.elements.actions);
    }

    // Create new buttons if provided
    if (buttons && buttons.length > 0) {
      this.options.buttons = buttons;
      
      this.elements.actions = DOMUtils.createElement('div', {
        className: CLASS_NAMES.DIALOG.ACTIONS
      });
      
      buttons.forEach(buttonConfig => {
        const button = DOMUtils.createElement('button', {
          type: 'button',
          className: `button ${buttonConfig.type || 'secondary'}`,
          disabled: buttonConfig.disabled || false,
          onclick: (e) => {
            if (buttonConfig.onClick) {
              buttonConfig.onClick(e);
            }
            
            this.emit(EVENTS.DIALOG.BUTTON_CLICK, {
              buttonId: buttonConfig.id,
              button: buttonConfig
            });
          }
        }, buttonConfig.label);
        
        this.elements.actions.appendChild(button);
      });
      
      this.elements.content.appendChild(this.elements.actions);
    }

    return this;
  }

  /**
   * Clean up resources used by the dialog
   */
  destroy() {
    // Close the dialog if open
    if (this.isOpen) {
      this.close();
    }

    // Remove all event listeners
    this.removeAllListeners();
    
    if (this.elements.overlay) {
      this.elements.overlay.removeEventListener('click', this._handleOverlayClick);
    }

    // Clear references
    this.elements = {};
  }
}

export default Dialog; 