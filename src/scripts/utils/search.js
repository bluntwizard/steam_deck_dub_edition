/**
 * Search Component for Steam Deck DUB Edition
 * Provides search functionality across documentation
 * 
 * @module Search
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import { debounce } from '../utils.js';

/**
 * @class SearchController
 * @classdesc Manages search functionality for the documentation
 */
class SearchController {
  constructor() {
    /**
     * Reference to the search modal element
     * @type {HTMLElement|null}
     * @private
     */
    this.searchModal = null;
    
    /**
     * Reference to the search input element
     * @type {HTMLInputElement|null}
     * @private
     */
    this.searchInput = null;
    
    /**
     * Reference to the search results container
     * @type {HTMLElement|null}
     * @private
     */
    this.resultsContainer = null;
    
    /**
     * Reference to the search overlay
     * @type {HTMLElement|null}
     * @private
     */
    this.searchOverlay = null;
    
    /**
     * Search data indexed by content
     * @type {Array<Object>}
     * @private
     */
    this.searchIndex = [];
    
    /**
     * Whether the search controller is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    /**
     * Current search results
     * @type {Array<Object>}
     * @private
     */
    this.currentResults = [];
    
    /**
     * Currently selected result index
     * @type {number}
     * @private
     */
    this.selectedResultIndex = -1;
    
    /**
     * Debounced search function to limit API calls and DOM updates
     * @type {Function}
     * @private
     */
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
  }
  
  /**
   * Initialize the search controller
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    this.createSearchElements();
    this.setupEventListeners();
    this.buildSearchIndex();
    
    this.initialized = true;
    console.log('Search controller initialized');
  }
  
  /**
   * Create search modal and related elements
   * @private
   * @returns {void}
   */
  createSearchElements() {
    // Create search modal if it doesn't exist
    if (!document.getElementById('search-modal')) {
      // Create search modal container
      this.searchModal = document.createElement('div');
      this.searchModal.id = 'search-modal';
      this.searchModal.className = 'search-modal';
      this.searchModal.setAttribute('role', 'dialog');
      this.searchModal.setAttribute('aria-modal', 'true');
      this.searchModal.setAttribute('aria-labelledby', 'search-title');
      this.searchModal.setAttribute('aria-hidden', 'true');
      
      // Search header with title and close button
      const searchHeader = document.createElement('div');
      searchHeader.className = 'search-header';
      
      const searchTitle = document.createElement('h2');
      searchTitle.id = 'search-title';
      searchTitle.textContent = 'Search Documentation';
      searchHeader.appendChild(searchTitle);
      
      const closeButton = document.createElement('button');
      closeButton.className = 'search-close-btn';
      closeButton.setAttribute('aria-label', 'Close search');
      closeButton.innerHTML = '&times;';
      searchHeader.appendChild(closeButton);
      
      this.searchModal.appendChild(searchHeader);
      
      // Search input container
      const searchInputContainer = document.createElement('div');
      searchInputContainer.className = 'search-input-container';
      
      const searchIcon = document.createElement('span');
      searchIcon.className = 'search-icon';
      searchIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
      searchInputContainer.appendChild(searchIcon);
      
      // Search input
      this.searchInput = document.createElement('input');
      this.searchInput.type = 'search';
      this.searchInput.id = 'search-input';
      this.searchInput.className = 'search-input';
      this.searchInput.placeholder = 'Search for topics, guides, etc.';
      this.searchInput.setAttribute('aria-controls', 'search-results');
      searchInputContainer.appendChild(this.searchInput);
      
      this.searchModal.appendChild(searchInputContainer);
      
      // Search results container
      this.resultsContainer = document.createElement('div');
      this.resultsContainer.id = 'search-results';
      this.resultsContainer.className = 'search-results';
      this.searchModal.appendChild(this.resultsContainer);
      
      // Add the modal to the document
      document.body.appendChild(this.searchModal);
      
      // Create search overlay
      this.searchOverlay = document.createElement('div');
      this.searchOverlay.className = 'search-overlay';
      this.searchOverlay.hidden = true;
      document.body.appendChild(this.searchOverlay);
    } else {
      // If elements already exist, get references
      this.searchModal = document.getElementById('search-modal');
      this.searchInput = document.getElementById('search-input');
      this.resultsContainer = document.getElementById('search-results');
      this.searchOverlay = document.querySelector('.search-overlay');
    }
  }
  
  /**
   * Build the search index from page content
   * @private
   * @returns {void}
   */
  buildSearchIndex() {
    this.searchIndex = [];
    
    // Index main content sections
    document.querySelectorAll('main section[id], main article[id]').forEach(section => {
      const id = section.id;
      const title = section.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || 'Untitled Section';
      const content = section.textContent;
      
      this.searchIndex.push({
        id,
        title,
        content,
        url: `#${id}`,
        element: section
      });
    });
    
    // Index headings
    document.querySelectorAll('main h2[id], main h3[id], main h4[id]').forEach(heading => {
      const id = heading.id;
      const title = heading.textContent;
      const content = '';
      
      this.searchIndex.push({
        id,
        title,
        content,
        url: `#${id}`,
        element: heading
      });
    });
    
    console.log(`Search index built with ${this.searchIndex.length} entries`);
  }
  
  /**
   * Set up event listeners
   * @private
   * @returns {void}
   */
  setupEventListeners() {
    // Close button
    this.searchModal.querySelector('.search-close-btn').addEventListener('click', () => {
      this.closeSearch();
    });
    
    // Close on overlay click
    this.searchOverlay.addEventListener('click', () => {
      this.closeSearch();
    });
    
    // Search input events
    this.searchInput.addEventListener('input', () => {
      this.debouncedSearch();
    });
    
    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectNextResult();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectPreviousResult();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.navigateToSelectedResult();
      }
    });
    
    // Result selection on click
    this.resultsContainer.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.search-result-item');
      if (resultItem) {
        const url = resultItem.dataset.url;
        if (url) {
          this.closeSearch();
          
          const targetId = url.startsWith('#') ? url.substring(1) : '';
          if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
              
              // Focus the target element temporarily
              targetElement.setAttribute('tabindex', '-1');
              targetElement.focus();
              
              // Highlight the section briefly
              targetElement.classList.add('highlight-search-result');
              setTimeout(() => {
                targetElement.classList.remove('highlight-search-result');
                targetElement.removeAttribute('tabindex');
              }, 2000);
            }
          }
        }
      }
    });
    
    // Global keyboard shortcut for search
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Ctrl+/ to open search
      if ((e.ctrlKey && (e.key === 'k' || e.key === '/')) || 
          (e.key === '/' && !(['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)))) {
        e.preventDefault();
        this.openSearch();
      }
    });
    
    // Add click event for search buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-search-toggle]') || e.target.closest('[data-search-toggle]')) {
        e.preventDefault();
        this.openSearch();
      }
    });
  }
  
  /**
   * Perform search based on input value
   * @private
   * @returns {void}
   */
  performSearch() {
    const query = this.searchInput.value.trim().toLowerCase();
    this.resultsContainer.innerHTML = '';
    
    if (!query) {
      this.showNoResults('Type to start searching');
      this.currentResults = [];
      this.selectedResultIndex = -1;
      return;
    }
    
    // Filter search index
    this.currentResults = this.searchIndex
      .filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const contentMatch = item.content.toLowerCase().includes(query);
        return titleMatch || contentMatch;
      })
      .map(item => {
        // Calculate relevance score
        const titleIndex = item.title.toLowerCase().indexOf(query);
        const contentIndex = item.content.toLowerCase().indexOf(query);
        
        // Higher score for title matches, especially at the beginning
        let score = 0;
        if (titleIndex >= 0) {
          score += 10 + (10 - Math.min(10, titleIndex));
        }
        if (contentIndex >= 0) {
          score += 5;
        }
        
        return {
          ...item,
          score
        };
      })
      .sort((a, b) => b.score - a.score);
    
    if (this.currentResults.length === 0) {
      this.showNoResults(`No results found for "${query}"`);
      } else {
      this.displayResults();
    }
    
    // Reset selection
    this.selectedResultIndex = -1;
  }
  
  /**
   * Display search results in the container
   * @private
   * @returns {void}
   */
  displayResults() {
    this.resultsContainer.innerHTML = '';
    
    const query = this.searchInput.value.trim().toLowerCase();
    const resultsList = document.createElement('ul');
    resultsList.className = 'search-results-list';
    
    this.currentResults.forEach((result, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'search-result-item';
      listItem.dataset.url = result.url;
      listItem.dataset.index = index;
      
      // Highlight matching text in title
      let titleHtml = result.title;
      if (query) {
        const titleLower = result.title.toLowerCase();
        const matchIndex = titleLower.indexOf(query);
        if (matchIndex >= 0) {
          titleHtml = result.title.substring(0, matchIndex) +
            `<mark>${result.title.substring(matchIndex, matchIndex + query.length)}</mark>` +
            result.title.substring(matchIndex + query.length);
        }
      }
      
      // Create result content
      const resultTitle = document.createElement('div');
      resultTitle.className = 'search-result-title';
      resultTitle.innerHTML = titleHtml;
      listItem.appendChild(resultTitle);
      
      // Add snippet if content match exists
      if (query && result.content) {
        const contentLower = result.content.toLowerCase();
        const matchIndex = contentLower.indexOf(query);
        
        if (matchIndex >= 0) {
          const snippetStart = Math.max(0, matchIndex - 40);
          const snippetEnd = Math.min(result.content.length, matchIndex + query.length + 40);
          let snippet = result.content.substring(snippetStart, snippetEnd);
          
          // Add ellipsis if truncated
          if (snippetStart > 0) {
            snippet = '...' + snippet;
          }
          if (snippetEnd < result.content.length) {
            snippet = snippet + '...';
          }
          
          // Highlight the query in the snippet
          const snippetLower = snippet.toLowerCase();
          const queryIndexInSnippet = snippetLower.indexOf(query);
          if (queryIndexInSnippet >= 0) {
            const highlightedSnippet = snippet.substring(0, queryIndexInSnippet) +
              `<mark>${snippet.substring(queryIndexInSnippet, queryIndexInSnippet + query.length)}</mark>` +
              snippet.substring(queryIndexInSnippet + query.length);
            
            const resultSnippet = document.createElement('div');
            resultSnippet.className = 'search-result-snippet';
            resultSnippet.innerHTML = highlightedSnippet;
            listItem.appendChild(resultSnippet);
          }
        }
      }
      
      resultsList.appendChild(listItem);
    });
    
    this.resultsContainer.appendChild(resultsList);
    
    // Add summary
    const resultSummary = document.createElement('div');
    resultSummary.className = 'search-result-summary';
    resultSummary.textContent = `${this.currentResults.length} results found`;
    this.resultsContainer.appendChild(resultSummary);
  }
  
  /**
   * Show message when no results found
   * @private
   * @param {string} message - Message to display
   * @returns {void}
   */
  showNoResults(message) {
    this.resultsContainer.innerHTML = '';
    
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.textContent = message;
    
    this.resultsContainer.appendChild(noResults);
  }
  
  /**
   * Open the search modal
   * @returns {void}
   */
  openSearch() {
    // Show overlay
    this.searchOverlay.hidden = false;
    
    // Show modal
    this.searchModal.setAttribute('aria-hidden', 'false');
    this.searchModal.classList.add('open');
    
    // Focus the input after a short delay
    setTimeout(() => {
      this.searchInput.focus();
    }, 100);
    
    // Add class to body to prevent scrolling
    document.body.classList.add('search-active');
    
    // Rebuild index if needed
    if (this.searchIndex.length === 0) {
      this.buildSearchIndex();
    }
  }
  
  /**
   * Close the search modal
   * @returns {void}
   */
  closeSearch() {
    // Hide modal
    this.searchModal.setAttribute('aria-hidden', 'true');
    this.searchModal.classList.remove('open');
    
    // Hide overlay
    this.searchOverlay.hidden = true;
    
    // Remove body class
    document.body.classList.remove('search-active');
    
    // Clear input and results
    this.searchInput.value = '';
    this.resultsContainer.innerHTML = '';
    this.currentResults = [];
    this.selectedResultIndex = -1;
    
    // Return focus to the element that was active before search opened
    const lastFocused = document.querySelector('[data-last-focused="true"]');
    if (lastFocused) {
      lastFocused.focus();
      lastFocused.removeAttribute('data-last-focused');
    }
  }
  
  /**
   * Select the next result in the list
   * @private
   * @returns {void}
   */
  selectNextResult() {
    if (this.currentResults.length === 0) return;
    
    // Remove previous selection
    this.removeResultSelection();
    
    // Update index
    this.selectedResultIndex = (this.selectedResultIndex + 1) % this.currentResults.length;
    
    // Apply selection
    this.applyResultSelection();
  }
  
  /**
   * Select the previous result in the list
   * @private
   * @returns {void}
   */
  selectPreviousResult() {
    if (this.currentResults.length === 0) return;
    
    // Remove previous selection
    this.removeResultSelection();
    
    // Update index
    this.selectedResultIndex = this.selectedResultIndex <= 0 ? 
      this.currentResults.length - 1 : 
      this.selectedResultIndex - 1;
    
    // Apply selection
    this.applyResultSelection();
  }
  
  /**
   * Apply selection to current result
   * @private
   * @returns {void}
   */
  applyResultSelection() {
    if (this.selectedResultIndex < 0) return;
    
    const selectedItem = this.resultsContainer.querySelector(
      `.search-result-item[data-index="${this.selectedResultIndex}"]`
    );
    
    if (selectedItem) {
      selectedItem.classList.add('selected');
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }
  
  /**
   * Remove selection from results
   * @private
   * @returns {void}
   */
  removeResultSelection() {
    this.resultsContainer.querySelectorAll('.search-result-item.selected')
      .forEach(item => item.classList.remove('selected'));
  }
  
  /**
   * Navigate to currently selected result
   * @private
   * @returns {void}
   */
  navigateToSelectedResult() {
    if (this.selectedResultIndex < 0 || this.currentResults.length === 0) return;
    
    const result = this.currentResults[this.selectedResultIndex];
    if (result && result.url) {
      this.closeSearch();
      
      const targetId = result.url.startsWith('#') ? result.url.substring(1) : '';
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          
          // Focus the target element temporarily
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();
          
          // Highlight the section briefly
          targetElement.classList.add('highlight-search-result');
          setTimeout(() => {
            targetElement.classList.remove('highlight-search-result');
            targetElement.removeAttribute('tabindex');
          }, 2000);
        }
      }
    }
  }
  
  /**
   * Refresh the search index when content changes
   * @returns {void}
   */
  refreshIndex() {
    this.buildSearchIndex();
  }
}

// Create singleton instance
const searchController = new SearchController();

// Export singleton
export default searchController;
