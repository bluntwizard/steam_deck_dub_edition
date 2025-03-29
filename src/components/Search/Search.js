/**
 * Search Component for Steam Deck DUB Edition
 * Provides search functionality across documentation
 * 
 * @module Search
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './Search.module.css';
import { debounce } from '../../scripts/utils.js';

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
      this.searchModal.className = styles['search-modal'];
      this.searchModal.setAttribute('role', 'dialog');
      this.searchModal.setAttribute('aria-modal', 'true');
      this.searchModal.setAttribute('aria-labelledby', 'search-title');
      this.searchModal.setAttribute('aria-hidden', 'true');
      
      // Search header with title and close button
      const searchHeader = document.createElement('div');
      searchHeader.className = styles['search-header'];
      
      const searchTitle = document.createElement('h2');
      searchTitle.id = 'search-title';
      searchTitle.textContent = 'Search Documentation';
      searchHeader.appendChild(searchTitle);
      
      const closeButton = document.createElement('button');
      closeButton.className = styles['search-close-btn'];
      closeButton.setAttribute('aria-label', 'Close search');
      closeButton.innerHTML = '&times;';
      searchHeader.appendChild(closeButton);
      
      this.searchModal.appendChild(searchHeader);
      
      // Search input container
      const searchInputContainer = document.createElement('div');
      searchInputContainer.className = styles['search-input-container'];
      
      const searchIcon = document.createElement('span');
      searchIcon.className = styles['search-icon'];
      searchIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
      searchInputContainer.appendChild(searchIcon);
      
      // Search input
      this.searchInput = document.createElement('input');
      this.searchInput.type = 'search';
      this.searchInput.id = 'search-input';
      this.searchInput.className = styles['search-input'];
      this.searchInput.placeholder = 'Search for topics, guides, etc.';
      this.searchInput.setAttribute('aria-controls', 'search-results');
      searchInputContainer.appendChild(this.searchInput);
      
      this.searchModal.appendChild(searchInputContainer);
      
      // Search results container
      this.resultsContainer = document.createElement('div');
      this.resultsContainer.id = 'search-results';
      this.resultsContainer.className = styles['search-results'];
      this.searchModal.appendChild(this.resultsContainer);
      
      // Add the modal to the document
      document.body.appendChild(this.searchModal);
      
      // Create search overlay
      this.searchOverlay = document.createElement('div');
      this.searchOverlay.className = styles['search-overlay'];
      this.searchOverlay.hidden = true;
      document.body.appendChild(this.searchOverlay);
    } else {
      // If elements already exist, get references
      this.searchModal = document.getElementById('search-modal');
      this.searchInput = document.getElementById('search-input');
      this.resultsContainer = document.getElementById('search-results');
      this.searchOverlay = document.querySelector(`.${styles['search-overlay']}`);
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
      const content = heading.parentElement?.textContent || '';
      
      this.searchIndex.push({
        id,
        title,
        content,
        url: `#${id}`,
        element: heading
      });
    });
    
    console.log(`Built search index with ${this.searchIndex.length} entries`);
  }
  
  /**
   * Set up event listeners for search functionality
   * @private
   * @returns {void}
   */
  setupEventListeners() {
    // Search input event listener
    this.searchInput.addEventListener('input', () => {
      this.debouncedSearch();
    });
    
    // Close button event listener
    const closeButton = this.searchModal.querySelector(`.${styles['search-close-btn']}`);
    closeButton.addEventListener('click', () => {
      this.closeSearch();
    });
    
    // Overlay click event listener
    this.searchOverlay.addEventListener('click', () => {
      this.closeSearch();
    });
    
    // Key event listeners
    this.searchModal.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          this.closeSearch();
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.selectNextResult();
          e.preventDefault();
          break;
        case 'ArrowUp':
          this.selectPreviousResult();
          e.preventDefault();
          break;
        case 'Enter':
          this.navigateToSelectedResult();
          e.preventDefault();
          break;
      }
    });
    
    // Add keyboard shortcut for search (Ctrl+K or Command+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        this.openSearch();
        e.preventDefault();
      }
    });
    
    // Click event listeners for search results
    this.resultsContainer.addEventListener('click', (e) => {
      const resultItem = e.target.closest(`.${styles['search-result-item']}`);
      if (resultItem) {
        const url = resultItem.getAttribute('data-url');
        if (url) {
          this.closeSearch();
          window.location.href = url;
        }
      }
    });
  }
}

export default SearchController; 