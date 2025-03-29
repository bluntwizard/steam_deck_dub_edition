import styles from './CodeBlocks.module.css';

/**
 * CodeBlocks Component
 * Enhances code blocks with syntax highlighting, copy functionality, and expandable features
 */
export class CodeBlocks {
  constructor(options = {}) {
    /**
     * Whether to add copy buttons to code blocks
     * @type {boolean}
     */
    this.addCopyButtons = options.addCopyButtons !== false;
    
    /**
     * Whether to add line numbers to code blocks
     * @type {boolean}
     */
    this.lineNumbers = options.lineNumbers !== false;
    
    /**
     * Whether to show language label on code blocks
     * @type {boolean}
     */
    this.showLanguage = options.showLanguage || false;
    
    /**
     * Whether to make long code blocks expandable
     * @type {boolean}
     */
    this.expandableLongBlocks = options.expandableLongBlocks !== false;
    
    /**
     * Height threshold for expandable code blocks (in pixels)
     * @type {number}
     */
    this.expandThreshold = options.expandThreshold || 400;
    
    /**
     * Whether to use syntax highlighting
     * @type {boolean}
     */
    this.useSyntaxHighlighting = options.useSyntaxHighlighting !== false;
    
    /**
     * Whether the component is initialized
     * @type {boolean}
     */
    this.initialized = false;
    
    // Auto-initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize code blocks with additional features
   * @param {Object} [options] - Initialization options
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    // Apply any new options
    Object.assign(this, options);
    
    // Set up mutation observer to catch dynamically added code blocks
    this.setupMutationObserver();
    
    // Process existing code blocks
    this.processCodeBlocks();
    
    // Add event listener for content-inserted to handle lazy-loaded content
    document.addEventListener('content-inserted', this.handleContentInserted.bind(this));
    
    this.initialized = true;
    console.log('CodeBlocks component initialized');
  }
  
  /**
   * Set up mutation observer to detect new code blocks
   * @private
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let shouldProcess = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a code block or contains code blocks
              if (node.querySelector('pre code') || 
                  node.matches('pre code') || 
                  node.classList.contains('code-block') ||
                  node.querySelector('.code-block')) {
                shouldProcess = true;
              }
            }
          });
        }
      });
      
      if (shouldProcess) {
        this.processCodeBlocks();
      }
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Handle content-inserted event for lazy-loaded content
   * @private
   * @param {CustomEvent} event - The content-inserted event
   */
  handleContentInserted(event) {
    // Process code blocks in the inserted content
    const section = event.detail.section;
    if (section) {
      setTimeout(() => {
        this.processCodeBlocks(section);
      }, 100); // Small delay to ensure content is fully rendered
    }
  }
  
  /**
   * Process all code blocks in the document or a specific container
   * @param {HTMLElement} [container=document] - The container to search for code blocks
   */
  processCodeBlocks(container = document) {
    // Process <pre><code> blocks
    this.processPrefixedCodeBlocks(container);
    
    // Process .code-block elements
    this.processCodeBlockElements(container);
  }
  
  /**
   * Process <pre><code> elements
   * @private
   * @param {HTMLElement} container - The container to search in
   */
  processPrefixedCodeBlocks(container) {
    container.querySelectorAll('pre code').forEach(codeBlock => {
      // Skip already processed blocks
      if (codeBlock.dataset.processed) return;
      codeBlock.dataset.processed = 'true';
      
      const preElement = codeBlock.parentNode;
      
      // Add class to parent pre element for styling
      preElement.classList.add(styles.codeBlock);
      
      // Add line numbers if enabled
      if (this.lineNumbers) {
        this.addLineNumbers(codeBlock);
      }
      
      // Add language label if enabled
      if (this.showLanguage) {
        this.addLanguageLabel(codeBlock);
      }
      
      // Apply syntax highlighting if available and enabled
      if (this.useSyntaxHighlighting && window.Prism && !codeBlock.classList.contains('language-none')) {
        // Get language from class or default to bash
        const hasLanguageClass = Array.from(codeBlock.classList).some(cls => cls.startsWith('language-'));
        if (!hasLanguageClass) {
          codeBlock.classList.add('language-bash');
        }
        
        window.Prism.highlightElement(codeBlock);
      }
      
      // Add copy button if enabled
      if (this.addCopyButtons) {
        this.addCopyButton(preElement);
      }
      
      // Make expandable if it's a long block and the option is enabled
      if (this.expandableLongBlocks) {
        this.makeExpandableIfLong(preElement);
      }
    });
  }
  
  /**
   * Process .code-block elements
   * @private
   * @param {HTMLElement} container - The container to search in
   */
  processCodeBlockElements(container) {
    container.querySelectorAll('.code-block').forEach(block => {
      // Skip already processed blocks
      if (block.dataset.processed) return;
      block.dataset.processed = 'true';
      
      // Add our component styles
      block.classList.add(styles.codeBlock);
      
      // Add copy button if enabled and not already present
      if (this.addCopyButtons && !block.querySelector('.copy-button')) {
        this.addCopyButton(block);
      }
      
      // Make expandable if it's a long block and the option is enabled
      if (this.expandableLongBlocks) {
        this.makeExpandableIfLong(block);
      }
      
      // Process code elements inside if they exist
      const codeElement = block.querySelector('code');
      if (codeElement && !codeElement.dataset.processed) {
        codeElement.dataset.processed = 'true';
        
        // Add line numbers if enabled
        if (this.lineNumbers) {
          this.addLineNumbers(codeElement);
        }
        
        // Add language label if enabled
        if (this.showLanguage) {
          this.addLanguageLabel(codeElement);
        }
        
        // Apply syntax highlighting if available and enabled
        if (this.useSyntaxHighlighting && window.Prism && !codeElement.classList.contains('language-none')) {
          // Get language from class or default to bash
          const hasLanguageClass = Array.from(codeElement.classList).some(cls => cls.startsWith('language-'));
          if (!hasLanguageClass) {
            codeElement.classList.add('language-bash');
          }
          
          window.Prism.highlightElement(codeElement);
        }
      }
    });
  }
  
  /**
   * Add line numbers to a code block
   * @private
   * @param {HTMLElement} codeBlock - The code block to add line numbers to
   */
  addLineNumbers(codeBlock) {
    // Skip if already has line numbers
    if (codeBlock.parentNode.querySelector(`.${styles.lineNumbers}`)) return;
    
    const lines = codeBlock.textContent.split('\n').length;
    if (lines > 1) {
      const lineNumbers = document.createElement('div');
      lineNumbers.className = styles.lineNumbers;
      
      for (let i = 1; i <= lines; i++) {
        const lineNumber = document.createElement('span');
        lineNumber.textContent = i;
        lineNumbers.appendChild(lineNumber);
      }
      
      codeBlock.parentNode.insertBefore(lineNumbers, codeBlock);
      codeBlock.parentNode.classList.add(styles.hasLineNumbers);
    }
  }
  
  /**
   * Add a language label to a code block
   * @private
   * @param {HTMLElement} codeBlock - The code block to add a language label to
   */
  addLanguageLabel(codeBlock) {
    // Skip if already has language label
    if (codeBlock.parentNode.querySelector(`.${styles.languageLabel}`)) return;
    
    // Get the language from the class
    const languageClass = Array.from(codeBlock.classList).find(cls => cls.startsWith('language-'));
    if (languageClass) {
      const language = languageClass.replace('language-', '');
      if (language !== 'none') {
        const label = document.createElement('div');
        label.className = styles.languageLabel;
        label.textContent = language;
        codeBlock.parentNode.insertBefore(label, codeBlock);
      }
    }
  }
  
  /**
   * Add a copy button to a code block
   * @private
   * @param {HTMLElement} block - The code block container to add a copy button to
   */
  addCopyButton(block) {
    // Skip if already has copy button
    if (block.querySelector(`.${styles.copyButton}`)) return;
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = styles.copyButton;
    copyButton.textContent = 'Copy';
    copyButton.title = 'Copy to clipboard';
    
    // Add the button to the code block
    block.insertBefore(copyButton, block.firstChild);
    
    // Set up click handler
    copyButton.addEventListener('click', () => {
      const codeElement = block.querySelector('code') || block;
      if (!codeElement) return;
      
      // Copy text to clipboard
      navigator.clipboard.writeText(codeElement.textContent).then(() => {
        // Success feedback
        copyButton.textContent = 'Copied!';
        copyButton.classList.add(styles.copied);
        
        // Reset after delay
        setTimeout(() => {
          copyButton.textContent = 'Copy';
          copyButton.classList.remove(styles.copied);
        }, 2000);
      }).catch(err => {
        // Error feedback
        console.error('Failed to copy text: ', err);
        copyButton.textContent = 'Failed';
        
        // Reset after delay
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
  }
  
  /**
   * Make a code block expandable if it's longer than the threshold
   * @private
   * @param {HTMLElement} block - The code block to make expandable
   */
  makeExpandableIfLong(block) {
    // Skip if already expandable
    if (block.classList.contains(styles.expandable) || block.classList.contains(styles.expanded)) return;
    
    const codeElement = block.querySelector('pre') || block;
    
    // Check if code block is long (height > threshold)
    if (codeElement.scrollHeight > this.expandThreshold) {
      // Add expandable class and click functionality
      block.classList.add(styles.expandable);
      
      // Add expand button
      const expandButton = document.createElement('button');
      expandButton.className = styles.expandButton;
      expandButton.textContent = 'Show more';
      
      // Add button to the bottom of the container
      const expandWrapper = document.createElement('div');
      expandWrapper.className = styles.expandWrapper;
      expandWrapper.appendChild(expandButton);
      block.appendChild(expandWrapper);
      
      // Set up click handler
      expandButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Toggle expanded state
        if (block.classList.contains(styles.expanded)) {
          block.classList.remove(styles.expanded);
          expandButton.textContent = 'Show more';
        } else {
          block.classList.add(styles.expanded);
          expandButton.textContent = 'Show less';
        }
      });
      
      // Also allow clicking anywhere on the code block to expand
      block.addEventListener('click', function(e) {
        // Don't trigger when clicking copy button
        if (e.target.classList.contains(styles.copyButton)) return;
        
        // Toggle expanded state
        if (block.classList.contains(styles.expanded)) {
          block.classList.remove(styles.expanded);
          expandButton.textContent = 'Show more';
        } else {
          block.classList.add(styles.expanded);
          expandButton.textContent = 'Show less';
        }
      });
    }
  }
  
  /**
   * Update all expandable code blocks with new state
   * @param {boolean} expanded - Whether the blocks should be expanded
   */
  updateExpandableCodeBlocks(expanded) {
    document.querySelectorAll(`.${styles.expandable}`).forEach(block => {
      const expandButton = block.querySelector(`.${styles.expandButton}`);
      
      if (expanded) {
        block.classList.add(styles.expanded);
        if (expandButton) expandButton.textContent = 'Show less';
      } else {
        block.classList.remove(styles.expanded);
        if (expandButton) expandButton.textContent = 'Show more';
      }
    });
  }
} 