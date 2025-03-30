/**
 * Search Component for Steam Deck DUB Edition
 * Provides search functionality across documentation
 */

import { debounce } from '../utils.js';

/**
 * Interface representing a search result item
 */
interface SearchResultItem {
  id: string;
  title: string;
  content: string;
  url: string;
  element: HTMLElement;
  relevance?: number;
}

/**
 * Manages search functionality for the documentation
 */
class SearchController {
  private searchModal: HTMLElement | null;
  private searchInput: HTMLInputElement | null;
  private resultsContainer: HTMLElement | null;
  private searchOverlay: HTMLElement | null;
  private searchIndex: SearchResultItem[];
  private initialized: boolean;
  private currentResults: SearchResultItem[];
  private selectedResultIndex: number;
  private debouncedSearch: Function;
  
  constructor() {
    /**
     * Reference to the search modal element
     */
    this.searchModal = null;
    
    /**
     * Reference to the search input element
     */
    this.searchInput = null;
    
    /**
     * Reference to the search results container
     */
    this.resultsContainer = null;
    
    /**
     * Reference to the search overlay
     */
    this.searchOverlay = null;
    
    /**
     * Search data indexed by content
     */
    this.searchIndex = [];
    
    /**
     * Whether the search controller is initialized
     */
    this.initialized = false;
    
    /**
     * Current search results
     */
    this.currentResults = [];
    
    /**
     * Currently selected result index
     */
    this.selectedResultIndex = -1;
    
    /**
     * Debounced search function to limit API calls and DOM updates
     */
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
  }
  
  /**
   * Initialize the search controller
   */
  initialize(): void {
    if (this.initialized) return;
    
    this.createSearchElements();
    this.setupEventListeners();
    this.buildSearchIndex();
    
    this.initialized = true;
    console.log('Search controller initialized');
  }
  
  /**
   * Create search modal and related elements
   */
  private createSearchElements(): void {
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
      this.searchInput = document.getElementById('search-input') as HTMLInputElement;
      this.resultsContainer = document.getElementById('search-results');
      this.searchOverlay = document.querySelector('.search-overlay');
    }
  }
  
  /**
   * Build the search index from page content
   */
  private buildSearchIndex(): void {
    this.searchIndex = [];
    
    // Index main content sections
    document.querySelectorAll('main section[id], main article[id]').forEach(section => {
      const id = section.id;
      const titleElement = section.querySelector('h1, h2, h3, h4, h5, h6');
      const title = titleElement ? titleElement.textContent || 'Untitled Section' : 'Untitled Section';
      const content = section.textContent || '';
      
      this.searchIndex.push({
        id,
        title,
        content,
        url: `#${id}`,
        element: section as HTMLElement
      });
    });
    
    // Index headings
    document.querySelectorAll('main h2[id], main h3[id], main h4[id]').forEach(heading => {
      const id = heading.id;
      const title = heading.textContent || '';
      const content = '';
      
      this.searchIndex.push({
        id,
        title,
        content,
        url: `#${id}`,
        element: heading as HTMLElement
      });
    });
    
    console.log(`Search index built with ${this.searchIndex.length} entries`);
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.searchModal || !this.searchInput || !this.searchOverlay) {
      console.error('Search elements not properly initialized');
      return;
    }
    
    // Close button
    const closeButton = this.searchModal.querySelector('.search-close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeSearch();
      });
    }
    
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
    
    // Global keyboard shortcut (Ctrl+K or /)
    document.addEventListener('keydown', (e) => {
      // If user is typing in an input, don't capture
      if (document.activeElement && 
         (document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA' || 
          document.activeElement.getAttribute('contenteditable') === 'true')) {
        return;
      }
      
      if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
        e.preventDefault();
        this.openSearch();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.searchModal && !this.searchModal.hasAttribute('aria-hidden')) {
        this.closeSearch();
      }
    });
  }
  
  /**
   * Perform search based on input
   */
  private performSearch(): void {
    if (!this.searchInput || !this.resultsContainer) return;
    
    const query = this.searchInput.value.trim().toLowerCase();
    
    if (!query) {
      this.currentResults = [];
      this.displayResults();
      return;
    }
    
    // Split the query into keywords
    const keywords = query.split(/\s+/);
    
    // Search through the index
    this.currentResults = this.searchIndex
      .map(item => {
        // Calculate relevance score
        let relevance = 0;
        
        // Check title matches (higher weight)
        keywords.forEach(keyword => {
          if (item.title.toLowerCase().includes(keyword)) {
            relevance += 10;
            
            // Exact title match has highest relevance
            if (item.title.toLowerCase() === keyword) {
              relevance += 50;
            }
          }
          
          // Check content matches
          if (item.content.toLowerCase().includes(keyword)) {
            relevance += 5;
          }
        });
        
        return {
          ...item,
          relevance
        };
      })
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance! - a.relevance!);
    
    // Display the results
    this.displayResults();
  }
  
  /**
   * Display search results in the results container
   */
  private displayResults(): void {
    if (!this.resultsContainer) return;
    
    // Clear previous results
    this.resultsContainer.innerHTML = '';
    
    // Reset selection
    this.selectedResultIndex = -1;
    
    if (this.currentResults.length === 0) {
      this.showNoResults(this.searchInput && this.searchInput.value ? 'No results found' : 'Type to search');
      return;
    }
    
    // Create results list
    const resultsList = document.createElement('ul');
    resultsList.className = 'search-results-list';
    resultsList.setAttribute('role', 'listbox');
    
    // Add each result
    this.currentResults.forEach((result, index) => {
      const resultItem = document.createElement('li');
      resultItem.className = 'search-result-item';
      resultItem.setAttribute('role', 'option');
      resultItem.setAttribute('aria-selected', 'false');
      resultItem.dataset.resultIndex = index.toString();
      
      // Create result link
      const resultLink = document.createElement('a');
      resultLink.href = result.url;
      resultLink.className = 'search-result-link';
      
      // Add title
      const titleElement = document.createElement('div');
      titleElement.className = 'search-result-title';
      titleElement.textContent = result.title;
      resultLink.appendChild(titleElement);
      
      // Add content preview if there is content
      if (result.content.trim()) {
        const previewElement = document.createElement('div');
        previewElement.className = 'search-result-preview';
        
        // Get a snippet of content around the search term
        const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
        let snippet = this.getContentSnippet(result.content, query);
        
        previewElement.textContent = snippet;
        resultLink.appendChild(previewElement);
      }
      
      // Add click event
      resultLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSearch();
        
        // Navigate to the result
        window.location.href = result.url;
        
        // Scroll to element
        setTimeout(() => {
          result.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Highlight the element briefly
          result.element.classList.add('search-highlighted');
          setTimeout(() => {
            result.element.classList.remove('search-highlighted');
          }, 2000);
        }, 100);
      });
      
      resultItem.appendChild(resultLink);
      resultsList.appendChild(resultItem);
    });
    
    this.resultsContainer.appendChild(resultsList);
  }
  
  /**
   * Get a relevant snippet of content containing the search query
   */
  private getContentSnippet(content: string, query: string): string {
    const maxLength = 100;
    const contentLower = content.toLowerCase();
    
    // Find the position of the query in the content
    const index = contentLower.indexOf(query);
    
    if (index === -1) {
      // If query not found, just return the first part of the content
      return content.substring(0, maxLength) + '...';
    }
    
    // Calculate start and end positions for the snippet
    let start = Math.max(0, index - 40);
    let end = Math.min(content.length, index + query.length + 40);
    
    // Adjust to word boundaries
    while (start > 0 && content[start - 1] !== ' ' && content[start - 1] !== '.') {
      start--;
    }
    
    while (end < content.length && content[end] !== ' ' && content[end] !== '.') {
      end++;
    }
    
    let snippet = content.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) {
      snippet = '...' + snippet;
    }
    
    if (end < content.length) {
      snippet = snippet + '...';
    }
    
    return snippet;
  }
  
  /**
   * Show a message when there are no results
   */
  private showNoResults(message: string): void {
    if (!this.resultsContainer) return;
    
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.textContent = message;
    
    this.resultsContainer.appendChild(noResults);
  }
  
  /**
   * Open the search modal
   */
  openSearch(): void {
    if (!this.searchModal || !this.searchInput || !this.searchOverlay) return;
    
    // Show the modal
    this.searchModal.removeAttribute('aria-hidden');
    this.searchModal.classList.add('active');
    
    // Show the overlay
    this.searchOverlay.hidden = false;
    
    // Focus the input
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.focus();
        
        // If there's already a value, perform the search
        if (this.searchInput.value.trim()) {
          this.performSearch();
        }
      }
    }, 100);
    
    // Disable body scrolling
    document.body.classList.add('search-open');
    
    // Announce for screen readers
    this.announceForScreenReader('Search dialog opened');
  }
  
  /**
   * Close the search modal
   */
  closeSearch(): void {
    if (!this.searchModal || !this.searchOverlay) return;
    
    // Hide the modal
    this.searchModal.setAttribute('aria-hidden', 'true');
    this.searchModal.classList.remove('active');
    
    // Hide the overlay
    this.searchOverlay.hidden = true;
    
    // Enable body scrolling
    document.body.classList.remove('search-open');
    
    // Announce for screen readers
    this.announceForScreenReader('Search dialog closed');
    
    // Return focus to the element that opened the search
    // For simplicity, we'll focus the main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      
      // Remove tabindex after focus
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 100);
    }
  }
  
  /**
   * Announce a message for screen readers
   */
  private announceForScreenReader(message: string): void {
    let announcer = document.getElementById('search-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'search-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
    
    // Clear after a short delay
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  }
  
  /**
   * Select the next result
   */
  private selectNextResult(): void {
    if (this.currentResults.length === 0) return;
    
    // Remove current selection
    this.removeResultSelection();
    
    // Select next result
    this.selectedResultIndex = (this.selectedResultIndex + 1) % this.currentResults.length;
    
    // Apply new selection
    this.applyResultSelection();
  }
  
  /**
   * Select the previous result
   */
  private selectPreviousResult(): void {
    if (this.currentResults.length === 0) return;
    
    // Remove current selection
    this.removeResultSelection();
    
    // Select previous result
    this.selectedResultIndex = this.selectedResultIndex <= 0 
      ? this.currentResults.length - 1 
      : this.selectedResultIndex - 1;
    
    // Apply new selection
    this.applyResultSelection();
  }
  
  /**
   * Apply the current result selection
   */
  private applyResultSelection(): void {
    if (!this.resultsContainer || this.selectedResultIndex < 0) return;
    
    const resultItems = this.resultsContainer.querySelectorAll('.search-result-item');
    if (resultItems.length === 0) return;
    
    const selectedItem = resultItems[this.selectedResultIndex] as HTMLElement;
    if (!selectedItem) return;
    
    // Add selected class
    selectedItem.classList.add('selected');
    selectedItem.setAttribute('aria-selected', 'true');
    
    // Scroll into view if needed
    selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  /**
   * Remove the current result selection
   */
  private removeResultSelection(): void {
    if (!this.resultsContainer) return;
    
    const selectedItem = this.resultsContainer.querySelector('.search-result-item.selected');
    if (selectedItem) {
      selectedItem.classList.remove('selected');
      selectedItem.setAttribute('aria-selected', 'false');
    }
  }
  
  /**
   * Navigate to the currently selected result
   */
  private navigateToSelectedResult(): void {
    if (this.selectedResultIndex < 0 || !this.currentResults[this.selectedResultIndex]) {
      // If no result is selected, try to select the first one
      if (this.currentResults.length > 0) {
        this.selectedResultIndex = 0;
      } else {
        return;
      }
    }
    
    const selectedResult = this.currentResults[this.selectedResultIndex];
    
    // Close the search modal
    this.closeSearch();
    
    // Navigate to the result
    window.location.href = selectedResult.url;
    
    // Scroll to element
    setTimeout(() => {
      selectedResult.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Highlight the element briefly
      selectedResult.element.classList.add('search-highlighted');
      setTimeout(() => {
        selectedResult.element.classList.remove('search-highlighted');
      }, 2000);
    }, 100);
  }
  
  /**
   * Refresh the search index
   */
  refreshIndex(): void {
    // Rebuild the search index
    this.buildSearchIndex();
    
    // If search is active, re-run the search
    if (this.searchInput && this.searchInput.value.trim() && 
        this.searchModal && !this.searchModal.hasAttribute('aria-hidden')) {
      this.performSearch();
    }
  }
}

// Create singleton instance
const searchController = new SearchController();

// Export the singleton
export default searchController; 