/**
 * Content Loader for SDDE Guide
 * Loads HTML fragments into the main content area
 */

/**
 * Represents the ContentLoader class that handles loading of content fragments
 */
class ContentLoader {
    /**
     * The container element where content will be loaded
     */
    private contentContainer: HTMLElement;
    
    /**
     * Cache for loaded content to avoid reloading
     */
    private contentCache: Record<string, string>;
    
    /**
     * Currently active section
     */
    private currentSection: string | null;
    
    /**
     * Queue for loading operations to ensure proper sequence
     */
    private loadingQueue: Promise<any>;
    
    /**
     * Creates a new ContentLoader
     * @param contentContainer - The DOM element to load content into
     */
    constructor(contentContainer: HTMLElement) {
        this.contentContainer = contentContainer;
        this.contentCache = {};
        this.currentSection = null;
        this.loadingQueue = Promise.resolve();
    }
    
    /**
     * Load a content file into the container
     * @param contentFile - Path to the HTML content file
     * @param append - Whether to append or replace content
     * @returns Promise that resolves when content is loaded
     */
    async loadContent(contentFile: string, append = false): Promise<HTMLElement> {
        // Queue this load operation
        this.loadingQueue = this.loadingQueue.then(() => this._loadContentInternal(contentFile, append));
        return this.loadingQueue;
    }
    
    /**
     * Internal method to handle content loading
     */
    private async _loadContentInternal(contentFile: string, append: boolean): Promise<HTMLElement> {
        try {
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="spinner"></div>
                <p>Loading ${contentFile.split('/').pop()?.replace('.html', '') || ''}...</p>
            `;
            
            // We'll track if loading indicator was added to DOM
            let loadingIndicatorAdded = false;
            
            if (!append) {
                // Only clear and show loading if replacing content
                this.contentContainer.innerHTML = '';
                this.contentContainer.appendChild(loadingIndicator);
                loadingIndicatorAdded = true;
            }
            
            // Check cache first
            let htmlContent: string;
            if (this.contentCache[contentFile]) {
                htmlContent = this.contentCache[contentFile];
                console.log(`Loaded ${contentFile} from cache`);
            } else {
                // Fetch the content file
                const response = await fetch(contentFile);
                if (!response.ok) {
                    throw new Error(`Failed to load ${contentFile}: ${response.status} ${response.statusText}`);
                }
                
                htmlContent = await response.text();
                
                // Cache the content
                this.contentCache[contentFile] = htmlContent;
                console.log(`Loaded ${contentFile} from server`);
            }
            
            // Create a temporary container
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = htmlContent;
            
            // Remove the loading indicator safely
            if (loadingIndicatorAdded && loadingIndicator.parentNode === this.contentContainer) {
                try {
                    this.contentContainer.removeChild(loadingIndicator);
                } catch (e) {
                    console.warn('Could not remove loading indicator: already removed');
                }
            }
            
            // Append or replace content
            if (append) {
                // Move all child nodes to the content container
                while (tempContainer.firstChild) {
                    this.contentContainer.appendChild(tempContainer.firstChild);
                }
            } else {
                // Replace content
                this.contentContainer.innerHTML = tempContainer.innerHTML;
            }
            
            // Initialize any dynamic elements in the newly loaded content
            this.initializeLoadedContent();
            
            // Process content layout
            processContentLayout(this.contentContainer);
            
            // Return the content container for chaining
            return this.contentContainer;
        } catch (error) {
            console.error('Error loading content:', error);
            
            // Show error message in the container
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `
                <h3>Error Loading Content</h3>
                <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
                <button onclick="window.location.reload()">Reload Page</button>
            `;
            
            // Safe removal of loading indicator
            try {
                const loadingIndicator = this.contentContainer.querySelector('.loading-indicator');
                if (loadingIndicator && loadingIndicator.parentNode === this.contentContainer) {
                    this.contentContainer.removeChild(loadingIndicator);
                }
            } catch (e) {
                console.warn('Could not remove loading indicator during error handling');
            }
            
            if (!append) {
                this.contentContainer.innerHTML = '';
            }
            this.contentContainer.appendChild(errorElement);
            
            throw error;
        }
    }
    
    /**
     * Initialize dynamic elements in newly loaded content
     */
    private initializeLoadedContent(): void {
        interface ExtendedElement extends Element {
            _initialized?: boolean;
        }
        
        // Re-initialize code block copy buttons
        document.querySelectorAll('.code-block .copy-button').forEach(button => {
            const extendedButton = button as ExtendedElement;
            if (!extendedButton._initialized) {
                extendedButton._initialized = true;
                // Copy functionality is handled globally by copyToClipboard function
            }
        });
        
        // Handle details elements for animations
        document.querySelectorAll('details.guide-section').forEach(details => {
            const summary = details.querySelector('summary');
            
            if (summary) {
                const extendedSummary = summary as ExtendedElement;
                if (!extendedSummary._initialized) {
                    extendedSummary._initialized = true;
                    summary.addEventListener('click', (e) => {
                        // Prevent default toggling behavior to implement custom animation
                        e.preventDefault();
                        
                        // Toggle the details element
                        if (details.hasAttribute('open')) {
                            // Close the details element with animation
                            const content = details.querySelector('.details-content') as HTMLElement;
                            if (!content) return;
                            
                            const contentHeight = content.offsetHeight;
                            
                            // Set explicit height for animation
                            content.style.height = contentHeight + 'px';
                            
                            // Force a reflow
                            content.offsetHeight;
                            
                            // Start animation
                            content.style.height = '0';
                            content.style.opacity = '0';
                            
                            // Remove the open attribute after animation completes
                            setTimeout(() => {
                                details.removeAttribute('open');
                                content.style.height = '';
                                content.style.opacity = '';
                            }, 300);
                        } else {
                            // Open the details element
                            details.setAttribute('open', '');
                            const content = details.querySelector('.details-content') as HTMLElement;
                            if (!content) return;
                            
                            // Start with height 0 and animate to full height
                            content.style.height = '0';
                            content.style.opacity = '0';
                            
                            // Force a reflow
                            content.offsetHeight;
                            
                            // Get the full height
                            const contentHeight = content.scrollHeight;
                            
                            // Animate to full height
                            content.style.height = contentHeight + 'px';
                            content.style.opacity = '1';
                            
                            // Clean up after animation
                            setTimeout(() => {
                                content.style.height = '';
                            }, 300);
                        }
                    });
                }
            }
        });
        
        // Initialize section links for navigation
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            const extendedLink = link as ExtendedElement & HTMLAnchorElement;
            if (!extendedLink._initialized) {
                extendedLink._initialized = true;
                extendedLink.addEventListener('click', (e) => {
                    const targetId = extendedLink.getAttribute('href');
                    if (targetId && targetId.startsWith('#')) {
                        e.preventDefault();
                        
                        const targetElement = document.querySelector(targetId) as HTMLElement;
                        if (targetElement) {
                            window.scrollTo({
                                top: targetElement.offsetTop - 50,
                                behavior: 'smooth'
                            });
                            
                            // Update URL without reloading the page
                            window.history.pushState('', '', targetId);
                            
                            // If it's in a details element, open it
                            const parentDetails = targetElement.closest('details');
                            if (parentDetails) {
                                parentDetails.open = true;
                            }
                        }
                    }
                });
            }
        });
        
        // Handle external links
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            const anchorLink = link as HTMLAnchorElement;
            if (!anchorLink.target) {
                anchorLink.target = '_blank';
                anchorLink.rel = 'noopener noreferrer';
            }
        });
    }
    
    /**
     * Load the initial content structure
     */
    async loadInitialContent(): Promise<boolean> {
        try {
            // First load the introduction
            await this.loadContent('src/content/sections/intro.html');
            
            // Add a small delay between loads to ensure DOM stability
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Then load each section sequentially
            const sections = [
                'src/content/sections/section-i.html',
                'src/content/sections/section-ii.html',
                'src/content/sections/section-iii.html',
                'src/content/sections/section-iv.html',
                'src/content/sections/references.html'
            ];
            
            for (const section of sections) {
                await this.loadContent(section, true);
                // Small delay between sections to ensure DOM stability
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log('All content loaded successfully');
            
            // Add loaded class to body
            document.body.classList.add('content-loaded');
            
            // Initialize navigation based on URL hash if present
            if (window.location.hash) {
                const targetId = window.location.hash.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // If it's in a details element, open it
                        const parentDetails = targetElement.closest('details');
                        if (parentDetails) {
                            parentDetails.open = true;
                        }
                    }, 500);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load initial content:', error);
            return false;
        }
    }
}

/**
 * Process section content to apply appropriate layout classes
 * @param contentElement - The content element to process
 */
function processContentLayout(contentElement: HTMLElement): void {
    // Process hero sections - first section of major content areas
    const firstSections = contentElement.querySelectorAll('.section:first-of-type');
    firstSections.forEach(section => {
        if (!section.classList.contains('section-hero')) {
            // Check if this is a major section that should have hero layout
            const headingEl = section.querySelector('h1, h2');
            if (headingEl && headingEl.tagName === 'H1') {
                section.classList.add('section-hero');
                
                // Reorganize content into hero layout
                const heroContent = document.createElement('div');
                heroContent.className = 'hero-content';
                
                // Move heading and initial paragraphs to hero-content
                const heading = section.querySelector('h1');
                const subheading = section.querySelector('h2') || section.querySelector('h3');
                const paragraphs = Array.from(section.querySelectorAll('p')).slice(0, 2);
                
                if (heading) heroContent.appendChild(heading.cloneNode(true));
                if (subheading) heroContent.appendChild(subheading.cloneNode(true));
                
                const heroDescription = document.createElement('div');
                heroDescription.className = 'hero-description';
                paragraphs.forEach(p => heroDescription.appendChild(p.cloneNode(true)));
                heroContent.appendChild(heroDescription);
                
                // Find or create hero image
                const heroImage = document.createElement('div');
                heroImage.className = 'hero-image';
                const existingImage = section.querySelector('img');
                if (existingImage) {
                    heroImage.appendChild(existingImage.cloneNode(true));
                }
                
                // Clear section and add new structure
                const contentToKeep = Array.from(section.children).slice(paragraphs.length + (subheading ? 2 : 1));
                section.innerHTML = '';
                section.appendChild(heroContent);
                section.appendChild(heroImage);
                
                // Create a container for remaining content
                if (contentToKeep.length > 0) {
                    const remainingContent = document.createElement('div');
                    remainingContent.className = 'section-content';
                    contentToKeep.forEach(el => remainingContent.appendChild(el.cloneNode(true)));
                    section.appendChild(remainingContent);
                }
            }
        }
    });
    
    // Process feature sections - lists of features/benefits
    const listSections = contentElement.querySelectorAll('.section ul:first-of-type:not(:only-child)');
    listSections.forEach(listElement => {
        const parentSection = listElement.closest('.section');
        if (parentSection && !parentSection.classList.contains('section-features')) {
            // This might be a feature list if it has several list items
            const listItems = listElement.querySelectorAll('li');
            if (listItems.length >= 3 && listItems.length <= 8) {
                parentSection.classList.add('section-features');
                
                // Create features grid
                const featuresGrid = document.createElement('div');
                featuresGrid.className = 'features-grid';
                
                // Convert list items to feature items
                listItems.forEach(item => {
                    const featureItem = document.createElement('div');
                    featureItem.className = 'feature-item';
                    
                    // Extract title and description
                    const itemText = item.innerHTML;
                    const itemParts = itemText.split('</strong>');
                    
                    let title = '';
                    let description = itemText;
                    let icon = '🔹';
                    
                    // Try to extract title and description if formatted with <strong>
                    if (itemParts.length > 1) {
                        title = itemParts[0].replace('<strong>', '');
                        description = itemParts[1].trim();
                    }
                    
                    // Try to identify an appropriate icon
                    if (title.toLowerCase().includes('performance')) icon = '⚡';
                    else if (title.toLowerCase().includes('battery')) icon = '🔋';
                    else if (title.toLowerCase().includes('control')) icon = '🎮';
                    else if (title.toLowerCase().includes('custom')) icon = '🔧';
                    else if (title.toLowerCase().includes('gaming')) icon = '🎯';
                    else if (title.toLowerCase().includes('storage')) icon = '💾';
                    else if (title.toLowerCase().includes('download')) icon = '📥';
                    else if (title.toLowerCase().includes('security')) icon = '🔒';
                    
                    featureItem.innerHTML = `
                        <div class="feature-icon">${icon}</div>
                        <h3 class="feature-title">${title}</h3>
                        <p class="feature-description">${description}</p>
                    `;
                    
                    featuresGrid.appendChild(featureItem);
                });
                
                // Replace the original list with the features grid
                if (listElement.parentNode) {
                    listElement.parentNode.replaceChild(featuresGrid, listElement);
                }
            }
        }
    });
    
    // Process step-by-step sections - numbered steps or instructions
    const stepSections = contentElement.querySelectorAll('.section ol:not(:only-child)');
    stepSections.forEach(stepList => {
        const parentSection = stepList.closest('.section');
        if (parentSection && !parentSection.classList.contains('section-steps')) {
            parentSection.classList.add('section-steps');
            
            // Convert ordered list to step items
            const stepItems = stepList.querySelectorAll('li');
            const stepsContainer = document.createElement('div');
            stepsContainer.className = 'steps-container';
            
            stepItems.forEach(step => {
                const stepItem = document.createElement('div');
                stepItem.className = 'step-item';
                
                // Extract title and content
                const stepText = step.innerHTML;
                const colonIndex = stepText.indexOf(':');
                let title = '';
                let content = stepText;
                
                if (colonIndex > 0) {
                    title = stepText.substring(0, colonIndex).trim();
                    content = stepText.substring(colonIndex + 1).trim();
                }
                
                stepItem.innerHTML = `
                    <h3 class="step-title">${title || 'Step'}</h3>
                    <div class="step-content">
                        <p>${content}</p>
                    </div>
                `;
                
                stepsContainer.appendChild(stepItem);
            });
            
            // Replace the original list with the steps container
            if (stepList.parentNode) {
                stepList.parentNode.replaceChild(stepsContainer, stepList);
            }
        }
    });
}

// Initialize the content loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Find the main content container
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) {
        console.error('Main content container not found');
        return;
    }
    
    // Find or create the content container
    let contentContainer = document.getElementById('dynamic-content');
    if (!contentContainer) {
        contentContainer = document.createElement('div');
        contentContainer.id = 'dynamic-content';
        mainContent.appendChild(contentContainer);
    }
    
    // Initialize the content loader
    window.contentLoader = new ContentLoader(contentContainer);
    
    // Load initial content
    window.contentLoader.loadInitialContent().then(success => {
        if (success) {
            console.log('Content loaded successfully');
            
            // Notify other scripts that content is loaded
            window.dispatchEvent(new CustomEvent('content-loaded'));
        }
    });
});

// Add global type declaration for contentLoader
declare global {
    interface Window {
        contentLoader: ContentLoader;
    }
}

export default ContentLoader; 