/**
 * Search functionality for Steam Deck DUB Edition Guide
 * Provides real-time content searching with highlighted results
 */

class SearchEngine {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            searchInputId: 'search-input',
            clearButtonId: 'clear-search',
            contentContainerId: 'dynamic-content',
            noResultsId: 'no-results-message',
            highlightClass: 'search-highlight',
            activeHighlightClass: 'search-highlight-active',
            minSearchLength: 2,
            searchDelay: 300, // ms delay for real-time search
            ...options
        };
        
        // Internal state
        this.searchTimeout = null;
        this.currentSearchTerm = '';
        this.searchResults = [];
        this.currentResultIndex = -1;
        this.contentNodes = [];
        this.searchableElements = [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'li', 'td', 'th', 'dt', 'dd', 'code',
            'summary', 'figcaption', 'button', 'a'
        ];
        
        // Initialize search functionality
        this.init();
    }
    
    /**
     * Initialize search functionality
     */
    init() {
        // Get DOM elements
        this.searchInput = document.getElementById(this.config.searchInputId);
        this.clearButton = document.getElementById(this.config.clearButtonId);
        this.contentContainer = document.getElementById(this.config.contentContainerId);
        this.noResultsMessage = document.getElementById(this.config.noResultsId);
        
        if (!this.searchInput || !this.contentContainer) {
            console.error('Search initialization failed: required elements not found');
            return;
        }
        
        // Create results navigation UI
        this.createSearchNavigationUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Search functionality initialized');
    }
    
    /**
     * Create the search navigation UI
     */
    createSearchNavigationUI() {
        // Create search results counter and navigation
        this.searchNavigation = document.createElement('div');
        this.searchNavigation.className = 'search-navigation';
        this.searchNavigation.style.cssText = `
            display: none;
            position: absolute;
            right: 50px;
            top: 50%;
            transform: translateY(-50%);
            background-color: var(--dracula-current-line, #44475a);
            border-radius: 20px;
            padding: 5px 10px;
            font-size: 0.9rem;
            color: var(--dracula-foreground, #f8f8f2);
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        
        // Add content to navigation UI
        this.searchNavigation.innerHTML = `
            <span class="search-counter">0 results</span>
            <div class="search-nav-buttons">
                <button class="search-prev" title="Previous result">↑</button>
                <button class="search-next" title="Next result">↓</button>
            </div>
        `;
        
        // Get references to navigation elements
        this.searchCounter = this.searchNavigation.querySelector('.search-counter');
        this.prevButton = this.searchNavigation.querySelector('.search-prev');
        this.nextButton = this.searchNavigation.querySelector('.search-next');
        
        // Add search navigation to search container
        const searchContainer = this.searchInput.closest('.search-container');
        if (searchContainer) {
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(this.searchNavigation);
            
            // Style the navigation buttons
            this.styleNavigationButtons();
        }
    }
    
    /**
     * Style the navigation buttons
     */
    styleNavigationButtons() {
        const buttons = this.searchNavigation.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.cssText = `
                background: none;
                border: none;
                color: var(--dracula-purple, #bd93f9);
                cursor: pointer;
                font-size: 1rem;
                padding: 0 5px;
                transition: color 0.2s;
            `;
            
            // Add hover effect
            button.addEventListener('mouseover', () => {
                button.style.color = 'var(--dracula-pink, #ff79c6)';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.color = 'var(--dracula-purple, #bd93f9)';
            });
        });
    }
    
    /**
     * Set up event listeners for search functionality
     */
    setupEventListeners() {
        // Real-time search as user types
        this.searchInput.addEventListener('input', () => {
            const searchTerm = this.searchInput.value.trim();
            
            // Clear existing timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Set timeout for search to avoid excessive searches during typing
            this.searchTimeout = setTimeout(() => {
                this.performSearch(searchTerm);
            }, this.config.searchDelay);
            
            // Show/hide clear button based on input
            if (this.clearButton) {
                this.clearButton.style.display = searchTerm ? 'block' : 'none';
            }
        });
        
        // Clear search when clear button is clicked
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearSearch();
            });
            
            // Initially hide the clear button
            this.clearButton.style.display = 'none';
        }
        
        // Navigation between search results
        this.prevButton.addEventListener('click', () => {
            this.navigateResults('prev');
        });
        
        this.nextButton.addEventListener('click', () => {
            this.navigateResults('next');
        });
        
        // Handle keyboard shortcuts for search navigation
        document.addEventListener('keydown', (e) => {
            // Only if search is active
            if (this.searchResults.length > 0) {
                if (e.key === 'Enter') {
                    // Enter navigates to next result
                    this.navigateResults(e.shiftKey ? 'prev' : 'next');
                    e.preventDefault();
                } else if (e.key === 'Escape') {
                    // Escape clears search
                    this.clearSearch();
                    e.preventDefault();
                }
            }
            
            // F3 focuses search box
            if (e.key === 'F3') {
                this.searchInput.focus();
                e.preventDefault();
            }
        });
        
        // When content changes (either initially loaded or dynamically updated)
        window.addEventListener('content-loaded', () => {
            // If there's an active search, re-run it on the new content
            if (this.currentSearchTerm) {
                this.performSearch(this.currentSearchTerm);
            }
        });
    }
    
    /**
     * Perform search with the given search term
     * @param {string} searchTerm - The term to search for
     */
    performSearch(searchTerm) {
        this.currentSearchTerm = searchTerm;
        
        // Clear previous results
        this.clearHighlights();
        this.searchResults = [];
        this.currentResultIndex = -1;
        
        // If search term is too short, don't search
        if (searchTerm.length < this.config.minSearchLength) {
            this.searchNavigation.style.display = 'none';
            if (this.noResultsMessage) {
                this.noResultsMessage.textContent = '';
                this.noResultsMessage.style.display = 'none';
            }
            return;
        }
        
        // Index all searchable content if we haven't already
        if (this.contentNodes.length === 0) {
            this.indexContent();
        }
        
        // Search through content
        this.searchContent(searchTerm);
        
        // Update UI with results
        this.updateResultsDisplay();
        
        // Navigate to first result if found
        if (this.searchResults.length > 0) {
            this.navigateResults('next');
        }
    }
    
    /**
     * Index all searchable content in the guide
     */
    indexContent() {
        this.contentNodes = [];
        
        // Find all searchable elements in the content area
        this.searchableElements.forEach(tag => {
            const elements = this.contentContainer.querySelectorAll(tag);
            elements.forEach(element => {
                // Skip elements in code blocks that are already highlighted
                if (element.closest(`.${this.config.highlightClass}`)) {
                    return;
                }
                
                // Store reference to text-containing elements
                if (element.textContent.trim()) {
                    this.contentNodes.push(element);
                }
            });
        });
    }
    
    /**
     * Search through indexed content for the search term
     * @param {string} searchTerm - The term to search for
     */
    searchContent(searchTerm) {
        // Create case-insensitive regular expression for searching
        const searchRegex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
        
        // Search through all indexed content nodes
        this.contentNodes.forEach(element => {
            const elementContent = element.textContent;
            
            // Skip if no match
            if (!searchRegex.test(elementContent)) {
                return;
            }
            
            // Replace text with highlighted version
            const originalHTML = element.innerHTML;
            const newHTML = originalHTML.replace(searchRegex, `<span class="${this.config.highlightClass}">$1</span>`);
            
            // Only update if changes were made
            if (newHTML !== originalHTML) {
                element.innerHTML = newHTML;
                
                // Collect all highlights in this element
                const highlights = element.querySelectorAll(`.${this.config.highlightClass}`);
                highlights.forEach(highlight => {
                    this.searchResults.push(highlight);
                });
            }
        });
    }
    
    /**
     * Update the search results display
     */
    updateResultsDisplay() {
        const resultCount = this.searchResults.length;
        
        // Update counter text
        this.searchCounter.textContent = resultCount > 0 
            ? `${resultCount} result${resultCount === 1 ? '' : 's'}`
            : 'No results';
        
        // Show/hide navigation UI
        this.searchNavigation.style.display = resultCount > 0 ? 'flex' : 'none';
        
        // Show/hide no results message
        if (this.noResultsMessage) {
            if (resultCount === 0 && this.currentSearchTerm.length >= this.config.minSearchLength) {
                this.noResultsMessage.textContent = `No results found for "${this.currentSearchTerm}"`;
                this.noResultsMessage.style.display = 'block';
            } else {
                this.noResultsMessage.textContent = '';
                this.noResultsMessage.style.display = 'none';
            }
        }
    }
    
    /**
     * Navigate between search results
     * @param {string} direction - Direction to navigate ('next' or 'prev')
     */
    navigateResults(direction) {
        if (this.searchResults.length === 0) {
            return;
        }
        
        // Remove active highlight from current result
        if (this.currentResultIndex >= 0) {
            this.searchResults[this.currentResultIndex].classList.remove(this.config.activeHighlightClass);
        }
        
        // Calculate new index
        if (direction === 'next') {
            this.currentResultIndex = (this.currentResultIndex + 1) % this.searchResults.length;
        } else {
            this.currentResultIndex = (this.currentResultIndex - 1 + this.searchResults.length) % this.searchResults.length;
        }
        
        // Highlight and scroll to new active result
        const activeResult = this.searchResults[this.currentResultIndex];
        activeResult.classList.add(this.config.activeHighlightClass);
        
        // Scroll the result into view, with some offset
        this.scrollToResult(activeResult);
        
        // Update counter with current position
        this.searchCounter.textContent = `${this.currentResultIndex + 1} of ${this.searchResults.length}`;
    }
    
    /**
     * Scroll to the active search result
     * @param {Element} resultElement - The result element to scroll to
     */
    scrollToResult(resultElement) {
        // Check if result is inside a collapsed details element
        const parentDetails = resultElement.closest('details:not([open])');
        if (parentDetails) {
            // Open the details element to reveal the result
            parentDetails.open = true;
        }
        
        // Scroll the result into view
        resultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    /**
     * Clear all search highlights
     */
    clearHighlights() {
        this.searchResults.forEach(highlight => {
            // Remove highlight by replacing with its text content
            const parent = highlight.parentNode;
            if (parent) {
                const text = document.createTextNode(highlight.textContent);
                parent.replaceChild(text, highlight);
            }
        });
        
        // After directly manipulating the DOM, we need to re-index content
        // for future searches
        this.contentNodes = [];
    }
    
    /**
     * Clear the search
     */
    clearSearch() {
        // Clear input field
        this.searchInput.value = '';
        
        // Clear results and highlights
        this.clearHighlights();
        this.searchResults = [];
        this.currentResultIndex = -1;
        
        // Update UI
        this.searchNavigation.style.display = 'none';
        if (this.clearButton) {
            this.clearButton.style.display = 'none';
        }
        if (this.noResultsMessage) {
            this.noResultsMessage.textContent = '';
            this.noResultsMessage.style.display = 'none';
        }
        
        // Reset current search term
        this.currentSearchTerm = '';
    }
    
    /**
     * Escape special characters in search term for use in regex
     * @param {string} string - The string to escape
     * @returns {string} The escaped string
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize search when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the search engine instance
    window.searchEngine = new SearchEngine();
    
    // If content is already loaded, index it immediately
    if (document.body.classList.contains('content-loaded')) {
        window.searchEngine.indexContent();
    }
});
