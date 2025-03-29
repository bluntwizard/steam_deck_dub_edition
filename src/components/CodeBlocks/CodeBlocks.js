/**
 * Code Blocks Component Implementation
 * 
 * Enhances code blocks with syntax highlighting, copy buttons, line numbers, and language labels
 * 
 * @module CodeBlocks
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './CodeBlocks.module.css';

/**
 * Code Blocks Controller
 * @class CodeBlocks
 */
class CodeBlocks {
  /**
   * Create a new CodeBlocks instance
   */
  constructor() {
    /**
     * Whether the controller has been initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Default options
     * @type {Object}
     * @private
     */
    this.options = {
      addCopyButtons: true,
      lineNumbers: true,
      showLanguage: true
    };
  }
  
  /**
   * Initialize the code blocks with enhancements
   * @param {Object} options - Configuration options
   * @param {boolean} [options.addCopyButtons=true] - Whether to add copy buttons
   * @param {boolean} [options.lineNumbers=true] - Whether to add line numbers
   * @param {boolean} [options.showLanguage=true] - Whether to show language labels
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    // Merge options with defaults
    this.options = { ...this.options, ...options };
    
    // Find all code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    if (codeBlocks.length === 0) {
      console.log('No code blocks found to enhance');
      return;
    }
    
    // Enhance each code block
    codeBlocks.forEach(codeBlock => {
      this.enhanceCodeBlock(codeBlock);
    });
    
    // Add event listener for copy buttons
    document.addEventListener('click', this.handleCopyClick.bind(this));
    
    this.initialized = true;
    console.log(`Initialized ${codeBlocks.length} code blocks`);
  }
  
  /**
   * Enhance a single code block with features
   * @param {HTMLElement} codeBlock - The code element to enhance
   * @private
   */
  enhanceCodeBlock(codeBlock) {
    const pre = codeBlock.parentElement;
    
    // Skip if already enhanced
    if (pre.classList.contains(styles['code-block-wrapper'])) {
      return;
    }
    
    // Create wrapper if not already wrapped
    let wrapper = pre;
    if (!pre.classList.contains(styles['code-block-wrapper'])) {
      wrapper = document.createElement('div');
      wrapper.className = styles['code-block-wrapper'];
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    }
    
    // Add line numbers if enabled
    if (this.options.lineNumbers) {
      this.addLineNumbers(wrapper, codeBlock);
    }
    
    // Add copy button if enabled
    if (this.options.addCopyButtons) {
      this.addCopyButton(wrapper);
    }
    
    // Add language label if enabled
    if (this.options.showLanguage) {
      this.addLanguageLabel(wrapper, codeBlock);
    }
  }
  
  /**
   * Add line numbers to a code block
   * @param {HTMLElement} wrapper - The code block wrapper
   * @param {HTMLElement} codeBlock - The code element
   * @private
   */
  addLineNumbers(wrapper, codeBlock) {
    wrapper.classList.add(styles['line-numbers']);
    
    // Count lines
    const content = codeBlock.textContent;
    const lines = content.split('\n').length;
    
    // Create line numbers container
    const lineNumbersWrapper = document.createElement('div');
    lineNumbersWrapper.className = styles['line-numbers-rows'];
    
    // Add spans for each line
    for (let i = 0; i < lines; i++) {
      const lineSpan = document.createElement('span');
      lineNumbersWrapper.appendChild(lineSpan);
    }
    
    wrapper.appendChild(lineNumbersWrapper);
  }
  
  /**
   * Add a copy button to a code block
   * @param {HTMLElement} wrapper - The code block wrapper
   * @private
   */
  addCopyButton(wrapper) {
    const button = document.createElement('button');
    button.className = styles['copy-code-button'];
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.setAttribute('title', 'Copy code to clipboard');
    
    // SVG icon
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;
    
    wrapper.appendChild(button);
  }
  
  /**
   * Add a language label to a code block
   * @param {HTMLElement} wrapper - The code block wrapper
   * @param {HTMLElement} codeBlock - The code element
   * @private
   */
  addLanguageLabel(wrapper, codeBlock) {
    // Extract language from class (e.g., "language-javascript")
    const langClasses = Array.from(codeBlock.classList)
      .filter(cls => cls.startsWith('language-'));
    
    if (langClasses.length === 0) return;
    
    const language = langClasses[0].replace('language-', '');
    if (!language) return;
    
    // Create label
    const label = document.createElement('div');
    label.className = styles['code-language-label'];
    label.textContent = language;
    
    wrapper.appendChild(label);
  }
  
  /**
   * Handle click events on copy buttons
   * @param {Event} event - Click event
   * @private
   */
  handleCopyClick(event) {
    const target = event.target;
    const copyButton = target.closest(`.${styles['copy-code-button']}`);
    
    if (!copyButton) return;
    
    // Get the code content
    const wrapper = copyButton.closest(`.${styles['code-block-wrapper']}`);
    const codeBlock = wrapper.querySelector('code');
    const code = codeBlock.textContent;
    
    // Copy to clipboard
    navigator.clipboard.writeText(code)
      .then(() => {
        // Show success state
        copyButton.classList.add(styles['copy-success']);
        
        // Store original content
        const originalContent = copyButton.innerHTML;
        
        // Update button content
        copyButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        
        // Reset after delay
        setTimeout(() => {
          copyButton.classList.remove(styles['copy-success']);
          copyButton.innerHTML = originalContent;
        }, 2000);
      })
      .catch(error => {
        console.error('Failed to copy code:', error);
        
        // Show error state
        copyButton.classList.add(styles['copy-error']);
        
        // Reset after delay
        setTimeout(() => {
          copyButton.classList.remove(styles['copy-error']);
        }, 2000);
      });
  }
}

export default new CodeBlocks(); 