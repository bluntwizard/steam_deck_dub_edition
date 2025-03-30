/**
 * Grimoire
 * KeyboardShortcuts Component
 * 
 * Provides a reusable keyboard shortcuts dialog component
 */

import styles from './KeyboardShortcuts.module.css';

class KeyboardShortcuts {
  constructor() {
    this.dialogElement = null;
    this.isVisible = false;
    this.shortcuts = [
      { keys: ['/'], description: 'Focus search box' },
      { keys: ['?'], description: 'Show/hide keyboard shortcuts' },
      { keys: ['Home'], description: 'Go to top of page' },
      { keys: ['End'], description: 'Go to bottom of page' },
      { keys: ['1', '9'], description: 'Jump to section' },
      { keys: ['Esc'], description: 'Close dialogs or remove focus' }
    ];
  }

  /**
   * Initialize the keyboard shortcuts dialog
   * @param {Object} options - Configuration options
   * @param {Array} options.shortcuts - Additional shortcuts to include
   */
  init(options = {}) {
    // Merge custom shortcuts with defaults
    if (options.shortcuts) {
      this.shortcuts = [...this.shortcuts, ...options.shortcuts];
    }

    // Create help button
    this.createHelpButton();
    
    // Set up keyboard listener for '?' key
    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !this.isInputFocused()) {
        e.preventDefault();
        this.toggle();
      }
      
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Create the help button
   */
  createHelpButton() {
    if (document.querySelector(`.${styles.helpButton}`)) return;
    
    const helpButton = document.createElement('button');
    helpButton.className = styles.helpButton;
    helpButton.innerHTML = '<span>?</span>';
    helpButton.setAttribute('title', 'Keyboard Shortcuts');
    helpButton.setAttribute('aria-label', 'Show Keyboard Shortcuts');
    
    helpButton.addEventListener('click', () => this.toggle());
    
    document.body.appendChild(helpButton);
  }

  /**
   * Create the dialog element
   */
  createDialog() {
    // Create overlay
    this.dialogElement = document.createElement('div');
    this.dialogElement.className = styles.shortcutsDialog;
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    
    // Create header
    const header = document.createElement('div');
    header.className = styles.shortcutsHeader;
    
    const title = document.createElement('h3');
    title.className = styles.shortcutsTitle;
    title.textContent = 'Keyboard Shortcuts';
    
    const closeButton = document.createElement('button');
    closeButton.className = styles.closeButton;
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.addEventListener('click', () => this.hide());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    dialogContent.appendChild(header);
    
    // Create shortcuts list
    const shortcutsList = document.createElement('ul');
    shortcutsList.className = styles.shortcutsList;
    
    this.shortcuts.forEach(shortcut => {
      const listItem = document.createElement('li');
      listItem.className = styles.shortcutItem;
      
      // Create key elements
      if (Array.isArray(shortcut.keys)) {
        if (shortcut.keys.length === 2 && shortcut.keys[0] === '1' && shortcut.keys[1] === '9') {
          // Special case for ranges
          const keySpan = document.createElement('span');
          const key1 = document.createElement('kbd');
          key1.className = styles.shortcutKey;
          key1.textContent = shortcut.keys[0];
          
          const rangeSeparator = document.createTextNode(' - ');
          
          const key2 = document.createElement('kbd');
          key2.className = styles.shortcutKey;
          key2.textContent = shortcut.keys[1];
          
          keySpan.appendChild(key1);
          keySpan.appendChild(rangeSeparator);
          keySpan.appendChild(key2);
          listItem.appendChild(keySpan);
        } else {
          // Multiple keys (e.g., key combinations)
          shortcut.keys.forEach(key => {
            const keyElement = document.createElement('kbd');
            keyElement.className = styles.shortcutKey;
            keyElement.textContent = key;
            listItem.appendChild(keyElement);
          });
        }
      } else {
        // Single key
        const keyElement = document.createElement('kbd');
        keyElement.className = styles.shortcutKey;
        keyElement.textContent = shortcut.keys;
        listItem.appendChild(keyElement);
      }
      
      // Add description
      const descriptionText = document.createTextNode(` - ${shortcut.description}`);
      listItem.appendChild(descriptionText);
      
      shortcutsList.appendChild(listItem);
    });
    
    dialogContent.appendChild(shortcutsList);
    this.dialogElement.appendChild(dialogContent);
    
    // Add to DOM
    document.body.appendChild(this.dialogElement);
    
    // Add click outside listener
    document.addEventListener('click', this.handleOutsideClick);
  }

  /**
   * Handle clicks outside the dialog
   */
  handleOutsideClick = (e) => {
    if (this.dialogElement && !this.dialogElement.contains(e.target) && 
        !e.target.classList.contains(styles.helpButton)) {
      this.hide();
    }
  }

  /**
   * Show the keyboard shortcuts dialog
   */
  show() {
    if (!this.dialogElement) {
      this.createDialog();
    }
    
    this.dialogElement.style.display = 'block';
    this.isVisible = true;
  }

  /**
   * Hide the keyboard shortcuts dialog
   */
  hide() {
    if (this.dialogElement) {
      this.dialogElement.style.display = 'none';
      this.isVisible = false;
    }
    
    document.removeEventListener('click', this.handleOutsideClick);
  }

  /**
   * Toggle the visibility of the keyboard shortcuts dialog
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if an input element is currently focused
   */
  isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.isContentEditable;
  }
}

export default KeyboardShortcuts; 