/**
 * Steam Deck DUB Edition
 * HelpCenter Component
 */

import styles from './HelpCenter.module.css';
import { 
  HelpCenterOptions, 
  HelpCenterInterface, 
  HelpTopic, 
  HelpFAQ, 
  SearchResult,
  ContextualHelpOptions
} from '../../types/help-center';

/**
 * HelpCenter class for providing centralized help functionality
 */
class HelpCenter implements HelpCenterInterface {
  private options: Required<HelpCenterOptions>;
  private isVisible: boolean;
  private searchTerm: string;
  private currentTopic: string | null;
  private helpCenterElement: HTMLElement | null;
  private searchResultsElement: HTMLElement | null;
  private topicContentElement: HTMLElement | null;
  private helpButton: HTMLElement | null;
  private helpCache: Map<string, string>;

  /**
   * Create a new HelpCenter
   * @param options - Configuration options
   */
  constructor(options: HelpCenterOptions = {}) {
    // Default options
    this.options = {
      container: options.container || document.body,
      title: options.title || 'Help Center',
      buttonPosition: options.buttonPosition || 'bottom-right',
      showButton: options.showButton !== false,
      topics: options.topics || [],
      defaultTopic: options.defaultTopic || null,
      searchEnabled: options.searchEnabled !== false,
      autoInit: options.autoInit !== false
    } as Required<HelpCenterOptions>;

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
    
    // Auto-initialize if enabled
    if (this.options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the help center
   */
  initialize(): HelpCenter {
    if (this.options.showButton) {
      this.createHelpButton();
    }
    
    // Set up keyboard listener for F1 key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
  private createHelpButton(): void {
    if (document.querySelector(`.${styles.helpButton}`)) return;
    
    const helpButton = document.createElement('button');
    helpButton.className = `${styles.helpButton} ${styles[this.options.buttonPosition]}`;
    helpButton.innerHTML = '<span>?</span>';
    helpButton.setAttribute('title', 'Help Center');
    helpButton.setAttribute('aria-label', 'Open Help Center');
    
    helpButton.addEventListener('click', this.toggle.bind(this));
    
    this.options.container.appendChild(helpButton);
    this.helpButton = helpButton;
  }
  
  /**
   * Create the help center dialog
   */
  private createHelpCenter(): void {
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
    closeButton.addEventListener('click', this.hide.bind(this));
    
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
      searchInput.addEventListener('input', this.handleSearch.bind(this));
      
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
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
    
    // Initialize first focusable element
    setTimeout(() => {
      const firstFocusable = helpCenter.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable && firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    }, 100);
  }
  
  /**
   * Load a help topic
   * @param topicId - ID of the topic to load
   */
  loadTopic(topicId: string): void {
    if (!this.topicContentElement) return;
    
    const topic = this.options.topics.find(t => t.id === topicId);
    if (!topic) return;
    
    this.currentTopic = topicId;
    
    // Update active state in sidebar
    const topicLinks = document.querySelectorAll(`.${styles.topicLink}`);
    topicLinks.forEach(link => {
      link.classList.remove(styles.active);
      if (link.textContent?.includes(topic.title)) {
        link.classList.add(styles.active);
      }
    });
    
    // Set loading state
    this.topicContentElement.innerHTML = `
      <div class="${styles.loading}">
        <div class="${styles.spinner}"></div>
        <p>Loading content...</p>
      </div>
    `;
    
    // Check if content is already loaded in cache
    if (this.helpCache.has(topicId)) {
      this.topicContentElement.innerHTML = this.helpCache.get(topicId) || '';
      this.initializeAccordions();
      return;
    }
    
    // Handle different content types
    if (!topic.content) {
      // No content defined, show FAQs if available
      if (topic.faqs && topic.faqs.length > 0) {
        this.renderTopicContent(topic);
      } else {
        this.topicContentElement.innerHTML = `
          <div class="${styles.error}">
            <p>No content available for this topic.</p>
          </div>
        `;
      }
      return;
    }
    
    if (typeof topic.content === 'string') {
      // String content
      this.topicContentElement.innerHTML = topic.content;
      this.helpCache.set(topicId, topic.content);
      this.initializeAccordions();
    } else if (typeof topic.content === 'function') {
      // Function that returns content
      try {
        const content = topic.content();
        if (content instanceof Promise) {
          // Handle async content
          content.then((html) => {
            if (this.topicContentElement) {
              this.topicContentElement.innerHTML = html;
              this.helpCache.set(topicId, html);
              this.initializeAccordions();
            }
          }).catch((error) => {
            if (this.topicContentElement) {
              this.topicContentElement.innerHTML = `
                <div class="${styles.error}">
                  <p>Error loading content: ${error.message}</p>
                  <button class="${styles.retryButton}" data-topic-id="${topicId}">Retry</button>
                </div>
              `;
              
              const retryButton = this.topicContentElement.querySelector(`.${styles.retryButton}`);
              if (retryButton) {
                retryButton.addEventListener('click', () => this.loadTopic(topicId));
              }
            }
          });
        } else {
          // Synchronous content
          this.topicContentElement.innerHTML = content;
          this.helpCache.set(topicId, content);
          this.initializeAccordions();
        }
      } catch (error) {
        this.topicContentElement.innerHTML = `
          <div class="${styles.error}">
            <p>Error loading content: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <button class="${styles.retryButton}" data-topic-id="${topicId}">Retry</button>
          </div>
        `;
        
        const retryButton = this.topicContentElement.querySelector(`.${styles.retryButton}`);
        if (retryButton) {
          retryButton.addEventListener('click', () => this.loadTopic(topicId));
        }
      }
    }
  }
  
  /**
   * Render topic content with FAQs
   * @param topic - The topic to render
   */
  private renderTopicContent(topic: HelpTopic): void {
    if (!this.topicContentElement) return;
    
    let html = `<div class="${styles.topicHeader}">`;
    html += `<h3>${topic.title}</h3>`;
    
    if (topic.description) {
      html += `<p>${topic.description}</p>`;
    }
    
    html += '</div>';
    
    // Add FAQs if available
    if (topic.faqs && topic.faqs.length > 0) {
      html += `<div class="${styles.faqContainer}">`;
      
      topic.faqs.forEach(faq => {
        const expandedClass = faq.expanded ? styles.expanded : '';
        html += `
          <div class="${styles.accordion} ${expandedClass}">
            <div class="${styles.accordionHeader}">
              <h4>${faq.question}</h4>
              <span class="${styles.accordionIcon}"></span>
            </div>
            <div class="${styles.accordionContent}">
              ${faq.answer}
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    this.topicContentElement.innerHTML = html;
    this.helpCache.set(topic.id, html);
    this.initializeAccordions();
  }
  
  /**
   * Initialize accordion functionality
   */
  private initializeAccordions(): void {
    if (!this.topicContentElement) return;
    
    const accordions = this.topicContentElement.querySelectorAll(`.${styles.accordion}`);
    accordions.forEach(accordion => {
      const header = accordion.querySelector(`.${styles.accordionHeader}`);
      
      header?.addEventListener('click', () => {
        accordion.classList.toggle(styles.expanded);
        
        // Set aria-expanded
        if (header instanceof HTMLElement) {
          const isExpanded = accordion.classList.contains(styles.expanded);
          header.setAttribute('aria-expanded', isExpanded.toString());
        }
      });
      
      // Set initial aria-expanded
      if (header instanceof HTMLElement) {
        const isExpanded = accordion.classList.contains(styles.expanded);
        header.setAttribute('aria-expanded', isExpanded.toString());
      }
    });
  }
  
  /**
   * Handle search input
   * @param event - Input event
   */
  private handleSearch(event: Event): void {
    if (!this.searchResultsElement) return;
    
    const target = event.target as HTMLInputElement;
    const term = target.value.trim().toLowerCase();
    this.searchTerm = term;
    
    // Hide search results if term is empty
    if (!term) {
      this.searchResultsElement.style.display = 'none';
      return;
    }
    
    // Search in topics and FAQs
    const results: SearchResult[] = [];
    
    this.options.topics.forEach(topic => {
      // Search in topic title and description
      if (topic.title.toLowerCase().includes(term) || 
          (topic.description && topic.description.toLowerCase().includes(term))) {
        results.push({
          topicId: topic.id,
          title: topic.title,
          description: topic.description || 'Help topic',
          type: 'topic',
          score: 10 // Higher score for title/description matches
        });
      }
      
      // Search in keywords
      if (topic.keywords && topic.keywords.some(kw => kw.toLowerCase().includes(term))) {
        // Only add if not already added
        if (!results.some(r => r.topicId === topic.id && r.type === 'topic')) {
          results.push({
            topicId: topic.id,
            title: topic.title,
            description: topic.description || 'Help topic',
            type: 'topic',
            score: 8 // Good score for keyword matches
          });
        }
      }
      
      // Search in FAQs
      if (topic.faqs) {
        topic.faqs.forEach(faq => {
          if (faq.question.toLowerCase().includes(term) || 
              faq.answer.toLowerCase().includes(term)) {
            results.push({
              topicId: topic.id,
              title: topic.title,
              description: this.truncateText(faq.question, 100),
              type: 'faq',
              question: faq.question,
              score: faq.question.toLowerCase().includes(term) ? 9 : 7 // Higher score for question matches
            });
          }
        });
      }
      
      // Search in content
      if (topic.content && typeof topic.content === 'string') {
        if (topic.content.toLowerCase().includes(term)) {
          // Only add if not already added
          if (!results.some(r => r.topicId === topic.id && r.type === 'content')) {
            results.push({
              topicId: topic.id,
              title: topic.title,
              description: 'Content match',
              type: 'content',
              score: 6 // Lower score for content matches
            });
          }
        }
      }
    });
    
    // Sort results by score
    results.sort((a, b) => {
      if (a.score !== b.score) {
        return (b.score || 0) - (a.score || 0);
      }
      return a.title.localeCompare(b.title);
    });
    
    // Display results
    if (results.length === 0) {
      this.searchResultsElement.innerHTML = `
        <div class="${styles.noResults}">
          <p>No results found for "${term}"</p>
        </div>
      `;
    } else {
      let html = `<ul class="${styles.resultsList}">`;
      
      results.forEach(result => {
        html += `
          <li class="${styles.resultItem}" data-topic-id="${result.topicId}" data-type="${result.type}" data-question="${result.question || ''}">
            <div class="${styles.resultTitle}">${result.title}</div>
            <div class="${styles.resultDescription}">${result.description}</div>
          </li>
        `;
      });
      
      html += '</ul>';
      this.searchResultsElement.innerHTML = html;
      
      // Add click event listeners
      const resultItems = this.searchResultsElement.querySelectorAll(`.${styles.resultItem}`);
      resultItems.forEach(item => {
        item.addEventListener('click', () => {
          const topicId = item.getAttribute('data-topic-id');
          const type = item.getAttribute('data-type');
          const question = item.getAttribute('data-question');
          
          if (topicId) {
            this.loadTopic(topicId);
            
            // Scroll to FAQ if applicable
            if (type === 'faq' && question) {
              setTimeout(() => {
                if (this.topicContentElement) {
                  const accordions = this.topicContentElement.querySelectorAll(`.${styles.accordion}`);
                  accordions.forEach(accordion => {
                    const header = accordion.querySelector('h4');
                    if (header && header.textContent === question) {
                      // Expand the accordion
                      accordion.classList.add(styles.expanded);
                      
                      // Scroll to it
                      accordion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      
                      // Highlight temporarily
                      accordion.classList.add(styles.highlighted);
                      setTimeout(() => {
                        accordion.classList.remove(styles.highlighted);
                      }, 3000);
                    }
                  });
                }
              }, 500);
            }
            
            // Hide search results
            this.searchResultsElement.style.display = 'none';
            
            // Clear search input
            const searchInput = this.searchResultsElement.parentElement?.querySelector('input');
            if (searchInput) {
              (searchInput as HTMLInputElement).value = '';
            }
          }
        });
      });
    }
    
    // Show results
    this.searchResultsElement.style.display = 'block';
  }
  
  /**
   * Truncate text to a maximum length
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   */
  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  /**
   * Handle clicks outside the help center
   * @param event - Click event
   */
  private handleOutsideClick(event: MouseEvent): void {
    if (!this.isVisible || !this.helpCenterElement) return;
    
    const target = event.target as Node;
    const isOutside = !this.helpCenterElement.contains(target);
    
    if (isOutside) {
      this.hide();
    }
  }
  
  /**
   * Handle escape key
   * @param event - Keyboard event
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (this.isVisible && event.key === 'Escape') {
      this.hide();
    }
  }
  
  /**
   * Show the help center
   */
  show(): HelpCenter {
    if (!this.helpCenterElement) {
      this.createHelpCenter();
    }
    
    if (this.helpCenterElement) {
      this.helpCenterElement.classList.add(styles.visible);
      this.isVisible = true;
      
      // Trap focus inside the help center
      const focusableElements = this.helpCenterElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
    
    return this;
  }
  
  /**
   * Hide the help center
   */
  hide(): HelpCenter {
    if (this.helpCenterElement) {
      this.helpCenterElement.classList.remove(styles.visible);
      this.isVisible = false;
      
      // Clear search state
      if (this.searchResultsElement) {
        this.searchResultsElement.style.display = 'none';
        
        const searchInput = this.searchResultsElement.parentElement?.querySelector('input');
        if (searchInput) {
          (searchInput as HTMLInputElement).value = '';
        }
      }
      
      // Return focus to the button if it exists
      if (this.helpButton) {
        this.helpButton.focus();
      }
    }
    
    return this;
  }
  
  /**
   * Toggle visibility of the help center
   */
  toggle(): HelpCenter {
    return this.isVisible ? this.hide() : this.show();
  }
  
  /**
   * Get default help topics
   */
  private getDefaultTopics(): HelpTopic[] {
    return [
      {
        id: 'getting-started',
        title: 'Getting Started',
        icon: '🚀',
        description: 'Learn the basics of the Steam Deck DUB Edition.',
        keywords: ['start', 'begin', 'tutorial', 'introduction', 'basics'],
        faqs: [
          {
            question: 'What is Steam Deck DUB Edition?',
            answer: 'Steam Deck DUB Edition is a custom web interface for your Steam Deck that provides enhanced features, performance optimizations, and a better gaming experience.',
            expanded: true
          },
          {
            question: 'How do I navigate the interface?',
            answer: 'You can navigate using touch gestures, the trackpad, or the D-pad. The main menu is accessible from any screen by pressing the menu button or swiping from the left edge.'
          },
          {
            question: 'Can I customize the interface?',
            answer: 'Yes! Go to Settings > Interface to customize colors, layout, and accessibility options.'
          }
        ]
      },
      {
        id: 'features',
        title: 'Key Features',
        icon: '✨',
        description: 'Discover what makes Steam Deck DUB Edition special.',
        keywords: ['features', 'capabilities', 'functions', 'benefits'],
        faqs: [
          {
            question: 'What performance optimizations are included?',
            answer: 'The DUB Edition includes image optimization, deferred loading, memory management improvements, and advanced caching mechanisms for a smoother experience.'
          },
          {
            question: 'What accessibility features are available?',
            answer: 'We support high contrast mode, customizable font sizes, screen reader compatibility, and alternative input methods.'
          },
          {
            question: 'Is there a game recommendation system?',
            answer: 'Yes! Our smart recommendation engine suggests games based on your play history, preferences, and hardware compatibility.'
          }
        ]
      },
      {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        icon: '🔧',
        description: 'Solutions for common issues and problems.',
        keywords: ['problems', 'issues', 'fix', 'error', 'help', 'broken'],
        faqs: [
          {
            question: 'Why is the interface lagging?',
            answer: 'This could be due to low memory, too many background processes, or a pending system update. Try closing unused applications and ensuring your system is up to date.'
          },
          {
            question: 'How do I reset my preferences?',
            answer: 'Go to Settings > Advanced > Reset Preferences. This will restore all interface settings to their defaults but won\'t affect your game data.'
          },
          {
            question: 'The application crashed, what should I do?',
            answer: 'First, restart the application. If the problem persists, try clearing the cache (Settings > Advanced > Clear Cache). If issues continue, check our online support forum for specific error messages.'
          }
        ],
        content: `
          <div class="${styles.topicBody}">
            <h3>Common Issues</h3>
            <div class="${styles.troubleshootingItem}">
              <h4>Performance Problems</h4>
              <p>If you're experiencing slowdowns or stuttering:</p>
              <ul>
                <li>Ensure your Steam Deck is running the latest system update</li>
                <li>Close background applications you're not using</li>
                <li>Check storage space - low storage can impact performance</li>
                <li>Try lowering the interface animation settings</li>
                <li>Restart your device completely</li>
              </ul>
            </div>
            
            <div class="${styles.troubleshootingItem}">
              <h4>Interface Display Issues</h4>
              <p>For problems with the UI display:</p>
              <ul>
                <li>Try toggling between different display modes</li>
                <li>Reset the interface theme to default</li>
                <li>Check if the issue persists in docked vs handheld mode</li>
                <li>Clear the interface cache</li>
              </ul>
            </div>
            
            <div class="${styles.troubleshootingItem}">
              <h4>Connection Issues</h4>
              <p>If you're having problems connecting to services:</p>
              <ul>
                <li>Check your internet connection</li>
                <li>Verify Steam servers are online</li>
                <li>Try toggling the Wi-Fi off and on again</li>
                <li>Restart your router if possible</li>
              </ul>
            </div>
            
            <h3>Still Need Help?</h3>
            <div class="${styles.contactMethod}">
              <h4>Community Forum</h4>
              <p>Join our active community forum where users share tips and solutions.</p>
            </div>
            
            <div class="${styles.contactMethod}">
              <h4>Support Ticket</h4>
              <p>Submit a detailed support ticket with screenshots if possible.</p>
            </div>
            
            <div class="${styles.contactMethod}">
              <h4>Discord Community</h4>
              <p>Our Discord server has dedicated support channels with real-time help.</p>
            </div>
          </div>
        `
      }
    ];
  }
  
  /**
   * Add a new help topic
   * @param topic - Topic to add
   */
  addTopic(topic: HelpTopic): HelpCenter {
    // Validate topic
    if (!topic.id || !topic.title) {
      console.error('Topic must have id and title properties');
      return this;
    }
    
    // Check if topic already exists
    const existingIndex = this.options.topics.findIndex(t => t.id === topic.id);
    if (existingIndex >= 0) {
      // Replace existing topic
      this.options.topics[existingIndex] = topic;
    } else {
      // Add new topic
      this.options.topics.push(topic);
      
      // Add to sidebar if help center is already created
      if (this.helpCenterElement) {
        const topicsList = this.helpCenterElement.querySelector(`.${styles.topicsList}`);
        if (topicsList) {
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
        }
      }
    }
    
    return this;
  }
  
  /**
   * Remove a help topic
   * @param topicId - ID of the topic to remove
   */
  removeTopic(topicId: string): boolean {
    const initialLength = this.options.topics.length;
    this.options.topics = this.options.topics.filter(t => t.id !== topicId);
    
    // Check if topic was removed
    const wasRemoved = initialLength > this.options.topics.length;
    
    // Update sidebar if help center is already created
    if (wasRemoved && this.helpCenterElement) {
      const topicLinks = this.helpCenterElement.querySelectorAll(`.${styles.topicLink}`);
      topicLinks.forEach(link => {
        const listItem = link.parentElement;
        const isTargetTopic = this.options.topics.every(t => !link.textContent?.includes(t.title));
        
        if (isTargetTopic && listItem) {
          listItem.remove();
        }
      });
      
      // If current topic was removed, load another topic
      if (this.currentTopic === topicId && this.options.topics.length > 0) {
        this.loadTopic(this.options.topics[0].id);
      }
    }
    
    return wasRemoved;
  }
  
  /**
   * Get all available topics
   */
  getTopics(): HelpTopic[] {
    return [...this.options.topics];
  }
  
  /**
   * Show contextual help for a specific element
   * @param element - Target element
   * @param helpText - Help text (HTML supported)
   * @param options - Configuration options
   */
  showContextualHelp(
    element: HTMLElement, 
    helpText: string, 
    options: ContextualHelpOptions = {}
  ): HTMLElement {
    const position = options.position || 'bottom';
    const hideAfter = options.hideAfter || 0;
    const className = options.className || '';
    const showCloseButton = options.showCloseButton !== false;
    const offset = options.offset || 10;
    
    // Create help tooltip
    const tooltip = document.createElement('div');
    tooltip.className = `${styles.contextualHelp} ${styles[position]} ${className}`;
    tooltip.innerHTML = helpText;
    
    // Add close button if enabled
    if (showCloseButton) {
      const closeButton = document.createElement('button');
      closeButton.className = styles.contextCloseButton;
      closeButton.innerHTML = '&times;';
      closeButton.setAttribute('aria-label', 'Close help tooltip');
      
      closeButton.addEventListener('click', () => {
        tooltip.classList.add(styles.hiding);
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 300);
      });
      
      tooltip.appendChild(closeButton);
    }
    
    // Position the tooltip
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    switch (position) {
      case 'top':
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top + scrollTop - offset}px`;
        break;
      case 'right':
        tooltip.style.left = `${rect.right + scrollLeft + offset}px`;
        tooltip.style.top = `${rect.top + scrollTop + rect.height / 2}px`;
        break;
      case 'bottom':
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.bottom + scrollTop + offset}px`;
        break;
      case 'left':
        tooltip.style.left = `${rect.left + scrollLeft - offset}px`;
        tooltip.style.top = `${rect.top + scrollTop + rect.height / 2}px`;
        break;
    }
    
    // Add to document
    document.body.appendChild(tooltip);
    
    // Auto-hide if requested
    if (hideAfter > 0) {
      setTimeout(() => {
        tooltip.classList.add(styles.hiding);
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 300);
      }, hideAfter);
    }
    
    return tooltip;
  }
  
  /**
   * Cleanup and remove event listeners
   */
  destroy(): void {
    // Remove help button
    if (this.helpButton && this.helpButton.parentNode) {
      this.helpButton.parentNode.removeChild(this.helpButton);
    }
    
    // Remove help center
    if (this.helpCenterElement && this.helpCenterElement.parentNode) {
      this.helpCenterElement.parentNode.removeChild(this.helpCenterElement);
    }
    
    // Remove event listeners
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleEscapeKey);
    
    // Reset state
    this.helpButton = null;
    this.helpCenterElement = null;
    this.searchResultsElement = null;
    this.topicContentElement = null;
    this.isVisible = false;
    this.helpCache.clear();
  }
}

export default HelpCenter; 