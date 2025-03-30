/**
 * Grimoire
 * HelpCenter Component
 */

import styles from './HelpCenter.module.css';

/**
 * HelpCenter class for providing centralized help functionality
 */
class HelpCenter {
  /**
   * Create a new HelpCenter
   * @param {Object} options - Configuration options
   * @param {Element} options.container - Container element (default: document.body)
   * @param {string} options.title - Title for the help center (default: 'Help Center')
   * @param {string} options.buttonPosition - Position for the help button ('bottom-right', 'bottom-left', 'top-right', 'top-left')
   * @param {boolean} options.showButton - Whether to show a floating help button (default: true)
   * @param {Array} options.topics - Array of help topics
   * @param {string} options.defaultTopic - Default selected topic
   * @param {boolean} options.searchEnabled - Whether to enable search functionality (default: true)
   * @param {boolean} options.autoInit - Whether to initialize automatically (default: true)
   */
  constructor(options = {}) {
    // Default options
    this.options = {
      container: document.body,
      title: 'Help Center',
      buttonPosition: 'bottom-right',
      showButton: true,
      topics: [],
      defaultTopic: null,
      searchEnabled: true,
      autoInit: true,
      ...options
    };

    // Initialize state
    this.isVisible = false;
    this.searchTerm = '';
    this.currentTopic = this.options.defaultTopic;
    this.helpCenterElement = null;
    this.searchResultsElement = null;
    this.topicContentElement = null;
    this.helpButton = null;
    this.helpCache = new Map(); // Cache for loaded help content
    
    // Default topics if none provided
    if (!this.options.topics.length) {
      this.options.topics = this.getDefaultTopics();
    }
    
    // Bind methods to preserve 'this' context
    this.toggle = this.toggle.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleEscapeKey = this.handleEscapeKey.bind(this);
    this.loadTopic = this.loadTopic.bind(this);
    
    // Auto-initialize if enabled
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the help center
   */
  initialize() {
    if (this.options.showButton) {
      this.createHelpButton();
    }
    
    // Set up keyboard listener for F1 key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggle();
      }
      
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
    
    // Return this for chaining
    return this;
  }
  
  /**
   * Create the floating help button
   */
  createHelpButton() {
    if (document.querySelector(`.${styles.helpButton}`)) return;
    
    const helpButton = document.createElement('button');
    helpButton.className = `${styles.helpButton} ${styles[this.options.buttonPosition]}`;
    helpButton.innerHTML = '<span>?</span>';
    helpButton.setAttribute('title', 'Help Center');
    helpButton.setAttribute('aria-label', 'Open Help Center');
    
    helpButton.addEventListener('click', this.toggle);
    
    this.options.container.appendChild(helpButton);
    this.helpButton = helpButton;
  }
  
  /**
   * Create the help center dialog
   */
  createHelpCenter() {
    // Main container
    const helpCenter = document.createElement('div');
    helpCenter.className = styles.helpCenter;
    helpCenter.setAttribute('role', 'dialog');
    helpCenter.setAttribute('aria-labelledby', 'help-center-title');
    helpCenter.setAttribute('aria-modal', 'true');
    
    // Help center content
    const helpContent = document.createElement('div');
    helpContent.className = styles.helpContent;
    
    // Header
    const header = document.createElement('div');
    header.className = styles.helpHeader;
    
    const title = document.createElement('h2');
    title.id = 'help-center-title';
    title.className = styles.helpTitle;
    title.textContent = this.options.title;
    
    const closeButton = document.createElement('button');
    closeButton.className = styles.closeButton;
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close Help Center');
    closeButton.addEventListener('click', this.hide);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Search
    let searchContainer = null;
    if (this.options.searchEnabled) {
      searchContainer = document.createElement('div');
      searchContainer.className = styles.searchContainer;
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = styles.searchInput;
      searchInput.placeholder = 'Search help topics...';
      searchInput.addEventListener('input', this.handleSearch);
      
      const searchResults = document.createElement('div');
      searchResults.className = styles.searchResults;
      this.searchResultsElement = searchResults;
      
      searchContainer.appendChild(searchInput);
      searchContainer.appendChild(searchResults);
    }
    
    // Topics sidebar
    const topicsContainer = document.createElement('div');
    topicsContainer.className = styles.topicsContainer;
    
    const topicsList = document.createElement('ul');
    topicsList.className = styles.topicsList;
    
    this.options.topics.forEach(topic => {
      const topicItem = document.createElement('li');
      topicItem.className = styles.topicItem;
      
      const topicLink = document.createElement('button');
      topicLink.className = styles.topicLink;
      topicLink.textContent = topic.title;
      if (topic.icon) {
        const icon = document.createElement('span');
        icon.className = styles.topicIcon;
        icon.textContent = topic.icon;
        topicLink.prepend(icon);
      }
      
      topicLink.addEventListener('click', () => this.loadTopic(topic.id));
      
      topicItem.appendChild(topicLink);
      topicsList.appendChild(topicItem);
    });
    
    topicsContainer.appendChild(topicsList);
    
    // Topic content
    const topicContent = document.createElement('div');
    topicContent.className = styles.topicContent;
    this.topicContentElement = topicContent;
    
    // Assemble
    helpContent.appendChild(header);
    if (searchContainer) {
      helpContent.appendChild(searchContainer);
    }
    
    const mainSection = document.createElement('div');
    mainSection.className = styles.mainSection;
    mainSection.appendChild(topicsContainer);
    mainSection.appendChild(topicContent);
    
    helpContent.appendChild(mainSection);
    helpCenter.appendChild(helpContent);
    
    // Add to container
    this.options.container.appendChild(helpCenter);
    this.helpCenterElement = helpCenter;
    
    // Load default topic if set
    if (this.options.defaultTopic) {
      this.loadTopic(this.options.defaultTopic);
    } else if (this.options.topics.length > 0) {
      this.loadTopic(this.options.topics[0].id);
    }
    
    // Set up event listeners
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('keydown', this.handleEscapeKey);
    
    // Initialize first focusable element
    setTimeout(() => {
      const firstFocusable = helpCenter.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);
  }
  
  /**
   * Load a help topic
   * @param {string} topicId - ID of the topic to load
   */
  loadTopic(topicId) {
    if (!this.topicContentElement) return;
    
    const topic = this.options.topics.find(t => t.id === topicId);
    if (!topic) return;
    
    this.currentTopic = topicId;
    
    // Update active state in sidebar
    const topicLinks = document.querySelectorAll(`.${styles.topicLink}`);
    topicLinks.forEach(link => {
      link.classList.remove(styles.active);
      if (link.textContent.includes(topic.title)) {
        link.classList.add(styles.active);
      }
    });
    
    // Check if content is cached
    if (this.helpCache.has(topicId)) {
      this.topicContentElement.innerHTML = this.helpCache.get(topicId);
      return;
    }
    
    // Show loading state
    this.topicContentElement.innerHTML = `
      <div class="${styles.loading}">
        <div class="${styles.spinner}"></div>
        <p>Loading help content...</p>
      </div>
    `;
    
    // If content is a string, render directly
    if (typeof topic.content === 'string') {
      this.renderTopicContent(topic);
      return;
    }
    
    // If content is a Promise, wait for it to resolve
    if (topic.content instanceof Promise) {
      topic.content
        .then(content => {
          topic.content = content; // Cache the resolved content
          this.renderTopicContent(topic);
        })
        .catch(error => {
          this.topicContentElement.innerHTML = `
            <div class="${styles.error}">
              <p>Error loading help content: ${error.message}</p>
              <button class="${styles.retryButton}" onclick="this.loadTopic('${topicId}')">Retry</button>
            </div>
          `;
        });
      return;
    }
    
    // If content is a function, call it
    if (typeof topic.content === 'function') {
      try {
        const content = topic.content();
        topic.content = content; // Cache the result
        this.renderTopicContent(topic);
      } catch (error) {
        this.topicContentElement.innerHTML = `
          <div class="${styles.error}">
            <p>Error generating help content: ${error.message}</p>
          </div>
        `;
      }
      return;
    }
    
    // If we got here, we don't know how to render the content
    this.topicContentElement.innerHTML = `
      <div class="${styles.error}">
        <p>Unknown help content format.</p>
      </div>
    `;
  }
  
  /**
   * Render a topic's content
   * @param {Object} topic - The topic to render
   */
  renderTopicContent(topic) {
    if (!this.topicContentElement) return;
    
    // Create the topic header
    const html = `
      <div class="${styles.topicHeader}">
        <h3>${topic.title}</h3>
        ${topic.description ? `<p>${topic.description}</p>` : ''}
      </div>
      <div class="${styles.topicBody}">
        ${topic.content}
      </div>
    `;
    
    // Update content and cache
    this.topicContentElement.innerHTML = html;
    this.helpCache.set(topic.id, html);
    
    // Initialize accordion functionality
    this.initializeAccordions();
  }
  
  /**
   * Initialize accordion functionality for FAQs
   */
  initializeAccordions() {
    const accordions = this.topicContentElement.querySelectorAll(`.${styles.accordion}`);
    accordions.forEach(accordion => {
      const header = accordion.querySelector(`.${styles.accordionHeader}`);
      const content = accordion.querySelector(`.${styles.accordionContent}`);
      
      if (header && content && !header._initialized) {
        header._initialized = true;
        header.addEventListener('click', () => {
          const isExpanded = accordion.classList.contains(styles.expanded);
          accordion.classList.toggle(styles.expanded, !isExpanded);
          header.setAttribute('aria-expanded', !isExpanded);
          content.setAttribute('aria-hidden', isExpanded);
        });
      }
    });
  }
  
  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.searchTerm = searchTerm;
    
    if (!this.searchResultsElement) return;
    
    // Clear previous results
    this.searchResultsElement.innerHTML = '';
    
    // Hide results if search term is empty
    if (!searchTerm) {
      this.searchResultsElement.style.display = 'none';
      return;
    }
    
    // Find matching topics and content
    const results = [];
    
    // Search through topics
    this.options.topics.forEach(topic => {
      const titleMatch = topic.title.toLowerCase().includes(searchTerm);
      const descMatch = topic.description && topic.description.toLowerCase().includes(searchTerm);
      
      if (titleMatch || descMatch) {
        results.push({
          type: 'topic',
          topic,
          title: topic.title,
          description: topic.description || '',
          score: titleMatch ? 10 : 5 // Title matches are more relevant
        });
      }
      
      // Search through FAQs if they exist
      if (topic.faqs) {
        topic.faqs.forEach(faq => {
          const questionMatch = faq.question.toLowerCase().includes(searchTerm);
          const answerMatch = faq.answer.toLowerCase().includes(searchTerm);
          
          if (questionMatch || answerMatch) {
            results.push({
              type: 'faq',
              topic,
              faq,
              title: faq.question,
              description: this.truncateText(faq.answer, 100),
              score: questionMatch ? 8 : 3 // Question matches are more relevant than answer matches
            });
          }
        });
      }
    });
    
    // Sort by relevance
    results.sort((a, b) => b.score - a.score);
    
    // Display results
    if (results.length === 0) {
      this.searchResultsElement.innerHTML = `
        <div class="${styles.noResults}">
          <p>No results found for "${searchTerm}"</p>
        </div>
      `;
    } else {
      const resultsList = document.createElement('ul');
      resultsList.className = styles.resultsList;
      
      results.slice(0, 10).forEach(result => { // Limit to top 10 results
        const item = document.createElement('li');
        item.className = styles.resultItem;
        
        const title = document.createElement('div');
        title.className = styles.resultTitle;
        title.textContent = result.title;
        
        const description = document.createElement('div');
        description.className = styles.resultDescription;
        description.textContent = result.description;
        
        item.appendChild(title);
        item.appendChild(description);
        
        // Handle click based on result type
        item.addEventListener('click', () => {
          this.loadTopic(result.topic.id);
          this.searchResultsElement.style.display = 'none';
          
          // If it's a FAQ, scroll to it and highlight it
          if (result.type === 'faq') {
            setTimeout(() => {
              const faqElement = this.topicContentElement.querySelector(`[data-faq-id="${result.faq.id}"]`);
              if (faqElement) {
                faqElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                faqElement.classList.add(styles.highlighted);
                setTimeout(() => {
                  faqElement.classList.remove(styles.highlighted);
                }, 2000);
                
                // Expand the accordion if it's collapsed
                const accordion = faqElement.closest(`.${styles.accordion}`);
                if (accordion && !accordion.classList.contains(styles.expanded)) {
                  accordion.classList.add(styles.expanded);
                  const header = accordion.querySelector(`.${styles.accordionHeader}`);
                  if (header) {
                    header.setAttribute('aria-expanded', 'true');
                  }
                  const content = accordion.querySelector(`.${styles.accordionContent}`);
                  if (content) {
                    content.setAttribute('aria-hidden', 'false');
                  }
                }
              }
            }, 100);
          }
        });
        
        resultsList.appendChild(item);
      });
      
      this.searchResultsElement.appendChild(resultsList);
    }
    
    // Show results
    this.searchResultsElement.style.display = 'block';
  }
  
  /**
   * Truncate text to a certain length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  /**
   * Handle clicks outside the help center
   * @param {Event} event - Click event
   */
  handleOutsideClick(event) {
    if (this.helpCenterElement && 
        !this.helpCenterElement.contains(event.target) && 
        !event.target.classList.contains(styles.helpButton)) {
      this.hide();
    }
  }
  
  /**
   * Handle Escape key press
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleEscapeKey(event) {
    if (event.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  }
  
  /**
   * Show the help center
   */
  show() {
    if (!this.helpCenterElement) {
      this.createHelpCenter();
    }
    
    this.helpCenterElement.classList.add(styles.visible);
    this.isVisible = true;
    
    // Trigger custom event
    const event = new CustomEvent('help-center-opened', {
      bubbles: true,
      detail: { helpCenter: this }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Hide the help center
   */
  hide() {
    if (!this.helpCenterElement) return;
    
    this.helpCenterElement.classList.remove(styles.visible);
    this.isVisible = false;
    
    // Trigger custom event
    const event = new CustomEvent('help-center-closed', {
      bubbles: true,
      detail: { helpCenter: this }
    });
    document.dispatchEvent(event);
    
    // Remove event listeners
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);
  }
  
  /**
   * Toggle help center visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Get default help topics
   * @returns {Array} Default topics
   */
  getDefaultTopics() {
    return [
      {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '🚀',
        description: 'Learn the basics of using this guide',
        content: `
          <h3>Welcome to the Help Center!</h3>
          <p>This guide is designed to help you get the most out of your Steam Deck. Here are some tips for navigating the guide:</p>
          
          <ul>
            <li>Use the sidebar navigation to jump between main sections</li>
            <li>Click on section headers to expand and collapse content</li>
            <li>Press '/' key to quickly search for content</li>
            <li>Press 'F1' at any time to open this help center</li>
          </ul>
          
          <h4>Key Features</h4>
          <ul>
            <li>Comprehensive Steam Deck optimization guides</li>
            <li>Step-by-step tutorials for common tasks</li>
            <li>Troubleshooting help for common issues</li>
            <li>Performance tips and tricks</li>
          </ul>
        `
      },
      {
        id: 'navigation',
        title: 'Navigation',
        icon: '🧭',
        description: 'Learn how to navigate around the guide',
        content: `
          <h3>Navigating the Guide</h3>
          <p>There are several ways to navigate through the guide:</p>
          
          <h4>Main Navigation</h4>
          <p>The main navigation is located in the sidebar on the left. Click on a section to jump to it.</p>
          
          <h4>Search</h4>
          <p>Use the search box at the top of the page to find specific content. You can also press the '/' key anywhere to focus the search box.</p>
          
          <h4>Table of Contents</h4>
          <p>Each major section has a table of contents that shows subsections. Click on an item to jump to it.</p>
          
          <h4>Keyboard Shortcuts</h4>
          <p>Press '?' at any time to see available keyboard shortcuts.</p>
        `
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions',
        icon: '❓',
        description: 'Common questions and answers',
        content: `
          <div class="${styles.faqContainer}">
            <div class="${styles.accordion}" data-faq-id="faq-1">
              <div class="${styles.accordionHeader}" aria-expanded="false">
                <span class="${styles.accordionIcon}"></span>
                <h4>What is Grimoire?</h4>
              </div>
              <div class="${styles.accordionContent}" aria-hidden="true">
                <p>Grimoire is a comprehensive guide and collection of optimizations to enhance your Steam Deck experience. It includes performance tweaks, battery life improvements, and quality-of-life enhancements.</p>
              </div>
            </div>
            
            <div class="${styles.accordion}" data-faq-id="faq-2">
              <div class="${styles.accordionHeader}" aria-expanded="false">
                <span class="${styles.accordionIcon}"></span>
                <h4>Is it safe to apply these optimizations?</h4>
              </div>
              <div class="${styles.accordionContent}" aria-hidden="true">
                <p>Yes, all optimizations in this guide have been thoroughly tested. However, some advanced tweaks may void your warranty or cause stability issues if not followed correctly. We clearly mark these sections with appropriate warnings.</p>
              </div>
            </div>
            
            <div class="${styles.accordion}" data-faq-id="faq-3">
              <div class="${styles.accordionHeader}" aria-expanded="false">
                <span class="${styles.accordionIcon}"></span>
                <h4>Do I need to be technically proficient?</h4>
              </div>
              <div class="${styles.accordionContent}" aria-hidden="true">
                <p>Most optimizations are designed to be user-friendly. We provide step-by-step instructions for all procedures, with clear explanations of what each step does. Some advanced tweaks may require basic command line knowledge.</p>
              </div>
            </div>
            
            <div class="${styles.accordion}" data-faq-id="faq-4">
              <div class="${styles.accordionHeader}" aria-expanded="false">
                <span class="${styles.accordionIcon}"></span>
                <h4>Will these tweaks survive a system update?</h4>
              </div>
              <div class="${styles.accordionContent}" aria-hidden="true">
                <p>Most tweaks will persist through standard system updates. However, major SteamOS updates may revert some changes. We provide instructions for re-applying optimizations after major updates.</p>
              </div>
            </div>
          </div>
        `,
        faqs: [
          {
            id: 'faq-1',
            question: 'What is Grimoire?',
            answer: 'Grimoire is a comprehensive guide and collection of optimizations to enhance your Steam Deck experience. It includes performance tweaks, battery life improvements, and quality-of-life enhancements.'
          },
          {
            id: 'faq-2',
            question: 'Is it safe to apply these optimizations?',
            answer: 'Yes, all optimizations in this guide have been thoroughly tested. However, some advanced tweaks may void your warranty or cause stability issues if not followed correctly. We clearly mark these sections with appropriate warnings.'
          },
          {
            id: 'faq-3',
            question: 'Do I need to be technically proficient?',
            answer: 'Most optimizations are designed to be user-friendly. We provide step-by-step instructions for all procedures, with clear explanations of what each step does. Some advanced tweaks may require basic command line knowledge.'
          },
          {
            id: 'faq-4',
            question: 'Will these tweaks survive a system update?',
            answer: 'Most tweaks will persist through standard system updates. However, major SteamOS updates may revert some changes. We provide instructions for re-applying optimizations after major updates.'
          }
        ]
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        icon: '🔧',
        description: 'Solutions for common issues',
        content: `
          <h3>Common Issues & Solutions</h3>
          
          <div class="${styles.troubleshootingItem}">
            <h4>Guide content not loading</h4>
            <p><strong>Symptoms:</strong> Blank pages, loading spinners that never complete</p>
            <p><strong>Solutions:</strong></p>
            <ol>
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
              <li>Try a different browser</li>
            </ol>
          </div>
          
          <div class="${styles.troubleshootingItem}">
            <h4>Scripts or optimizations not working</h4>
            <p><strong>Symptoms:</strong> Commands return errors, changes don't apply</p>
            <p><strong>Solutions:</strong></p>
            <ol>
              <li>Make sure you're running the latest version of SteamOS</li>
              <li>Check that you're entering commands exactly as shown</li>
              <li>Try rebooting your Steam Deck</li>
              <li>Check for typos in commands or file paths</li>
            </ol>
          </div>
          
          <div class="${styles.troubleshootingItem}">
            <h4>Performance issues after tweaks</h4>
            <p><strong>Symptoms:</strong> Stuttering, crashes, or reduced battery life</p>
            <p><strong>Solutions:</strong></p>
            <ol>
              <li>Revert the most recent change to see if it resolves the issue</li>
              <li>Check our troubleshooting guide for specific tweaks</li>
              <li>Try resetting to default settings</li>
              <li>Update your system and drivers</li>
            </ol>
          </div>
        `
      },
      {
        id: 'accessibility',
        title: 'Accessibility Options',
        icon: '♿',
        description: 'Customize your reading experience',
        content: `
          <h3>Accessibility Features</h3>
          <p>We've built several accessibility features into this guide to make it easier to use for everyone:</p>
          
          <h4>Text & Display</h4>
          <ul>
            <li><strong>Font Size:</strong> Adjust the text size using the settings panel</li>
            <li><strong>High Contrast Mode:</strong> Enable high contrast for better readability</li>
            <li><strong>Dyslexic Font:</strong> Switch to a font designed for readers with dyslexia</li>
            <li><strong>Dark/Light Modes:</strong> Choose your preferred color scheme</li>
          </ul>
          
          <h4>Navigation</h4>
          <ul>
            <li><strong>Keyboard Navigation:</strong> All features are accessible via keyboard</li>
            <li><strong>Screen Reader Support:</strong> Compatible with popular screen readers</li>
            <li><strong>Focus Indicators:</strong> Clear visual indicators for keyboard focus</li>
          </ul>
          
          <h4>How to Access Accessibility Settings</h4>
          <p>Click the settings icon in the top-right corner of the page to open the settings panel, then select the "Accessibility" tab.</p>
        `
      },
      {
        id: 'contact',
        title: 'Contact & Support',
        icon: '📞',
        description: 'Get additional help',
        content: `
          <h3>Need More Help?</h3>
          <p>If you couldn't find what you need in this help center, there are several ways to get additional support:</p>
          
          <div class="${styles.contactMethod}">
            <h4>GitHub Issues</h4>
            <p>Report bugs, suggest features, or ask questions through our GitHub repository:</p>
            <a href="https://github.com/yourusername/steam-deck-dub-edition" target="_blank" rel="noopener noreferrer">steam-deck-dub-edition on GitHub</a>
          </div>
          
          <div class="${styles.contactMethod}">
            <h4>Discord Community</h4>
            <p>Join our Discord server to chat with other users and get real-time help:</p>
            <a href="https://discord.gg/grimoiredub" target="_blank" rel="noopener noreferrer">Steam Deck DUB Discord</a>
          </div>
          
          <div class="${styles.contactMethod}">
            <h4>Email Support</h4>
            <p>For private inquiries, you can email our support team:</p>
            <a href="mailto:support@grimoiredub.com">support@grimoiredub.com</a>
          </div>
        `
      }
    ];
  }
  
  /**
   * Add a new help topic
   * @param {Object} topic - Topic configuration
   */
  addTopic(topic) {
    if (!topic.id || !topic.title || !topic.content) {
      console.error('Topic must have id, title, and content properties');
      return;
    }
    
    // Check if topic already exists
    const existingIndex = this.options.topics.findIndex(t => t.id === topic.id);
    if (existingIndex >= 0) {
      // Update existing topic
      this.options.topics[existingIndex] = topic;
    } else {
      // Add new topic
      this.options.topics.push(topic);
    }
    
    // Rebuild the help center if it's already created
    if (this.helpCenterElement && this.isVisible) {
      this.hide();
      this.helpCenterElement.remove();
      this.helpCenterElement = null;
      this.show();
    }
  }
  
  /**
   * Remove a help topic
   * @param {string} topicId - ID of the topic to remove
   */
  removeTopic(topicId) {
    const index = this.options.topics.findIndex(t => t.id === topicId);
    if (index >= 0) {
      this.options.topics.splice(index, 1);
      
      // Remove from cache
      this.helpCache.delete(topicId);
      
      // Rebuild the help center if it's already created
      if (this.helpCenterElement && this.isVisible) {
        this.hide();
        this.helpCenterElement.remove();
        this.helpCenterElement = null;
        this.show();
      }
    }
  }
  
  /**
   * Get all help topics
   * @returns {Array} Array of topics
   */
  getTopics() {
    return [...this.options.topics];
  }
  
  /**
   * Show contextual help for a specific element
   * @param {Element} element - Element to show help for
   * @param {string} helpText - Help text to display
   * @param {Object} options - Additional options
   */
  showContextualHelp(element, helpText, options = {}) {
    const defaults = {
      position: 'bottom', // top, right, bottom, left
      timeout: 0, // 0 for no auto-hide
      showCloseButton: true,
      className: ''
    };
    
    const settings = { ...defaults, ...options };
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = `${styles.contextualHelp} ${styles[settings.position]} ${settings.className}`;
    tooltip.innerText = helpText;
    
    if (settings.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = styles.contextCloseButton;
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close help tooltip');
      closeBtn.addEventListener('click', () => tooltip.remove());
      tooltip.appendChild(closeBtn);
    }
    
    // Position the tooltip
    const rect = element.getBoundingClientRect();
    
    switch (settings.position) {
      case 'top':
        tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'right':
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.right = `${window.innerWidth - rect.left + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
    }
    
    // Add to document
    document.body.appendChild(tooltip);
    
    // Auto-hide if timeout is set
    if (settings.timeout > 0) {
      setTimeout(() => {
        tooltip.classList.add(styles.hiding);
        setTimeout(() => tooltip.remove(), 300);
      }, settings.timeout);
    }
    
    // Return the tooltip element so it can be manually removed if needed
    return tooltip;
  }
  
  /**
   * Clean up and remove the help center
   */
  destroy() {
    // Remove help button
    if (this.helpButton) {
      this.helpButton.remove();
      this.helpButton = null;
    }
    
    // Remove help center
    if (this.helpCenterElement) {
      this.helpCenterElement.remove();
      this.helpCenterElement = null;
    }
    
    // Remove event listeners
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);
    
    // Clear cache
    this.helpCache.clear();
    
    // Trigger custom event
    const event = new CustomEvent('help-center-destroyed', {
      bubbles: true,
      detail: { helpCenter: this }
    });
    document.dispatchEvent(event);
  }
}

export default HelpCenter; 