/**
 * UI Improvements for SDDE Guide
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if new header exists, otherwise show warning
    if (!document.querySelector('.sdde-header')) {
        console.warn('New header (.sdde-header) not found in the DOM!');
    }
    
    // Remove any lingering old headers
    document.querySelectorAll('.header:not(.sdde-header)').forEach(oldHeader => {
        oldHeader.remove();
    });
    
    // Initialize UI components
    initializeThemeSwitcher();
    initializeResponsiveElements();
    
    // Listen for content loaded event
    window.addEventListener('content-loaded', function() {
        updateUIAfterContentLoad();
    });
});

/**
 * Initialize theme switcher
 */
function initializeThemeSwitcher() {
    const themeSwitcher = document.getElementById('theme-toggle');
    if (!themeSwitcher) return;
    
    // Set initial theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }
    
    // Toggle theme on click
    themeSwitcher.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', isDark ? 'light-theme' : '');
    });
}

/**
 * Initialize responsive elements
 */
function initializeResponsiveElements() {
    // Add responsive classes based on viewport
    updateResponsiveClasses();
    
    // Update on resize
    window.addEventListener('resize', function() {
        updateResponsiveClasses();
    });
}

/**
 * Update responsive classes
 */
function updateResponsiveClasses() {
    const width = window.innerWidth;
    
    // Clear existing responsive classes
    document.body.classList.remove('xs', 'sm', 'md', 'lg', 'xl');
    
    // Add appropriate class
    if (width < 576) {
        document.body.classList.add('xs');
    } else if (width < 768) {
        document.body.classList.add('sm');
    } else if (width < 992) {
        document.body.classList.add('md');
    } else if (width < 1200) {
        document.body.classList.add('lg');
    } else {
        document.body.classList.add('xl');
    }
}

/**
 * Update UI elements after content is loaded
 */
function updateUIAfterContentLoad() {
    // Adjust content spacing for header height
    const header = document.querySelector('.sdde-header');
    const mainContent = document.querySelector('.main-content');
    
    if (header && mainContent) {
        mainContent.style.marginTop = `${header.offsetHeight}px`;
    }
    
    // Initialize any dynamic UI elements in the content
    initializeDetailsElements();
    initializeCodeBlocks();
}

/**
 * Initialize details elements for improved accordion behavior
 */
function initializeDetailsElements() {
    document.querySelectorAll('details').forEach(details => {
        // Skip already initialized
        if (details.dataset.initialized) return;
        details.dataset.initialized = 'true';
        
        // Add animation classes
        details.classList.add('details-animated');
        
        // Handle opening/closing with animation
        details.addEventListener('toggle', function() {
            if (details.open) {
                details.classList.add('details-open');
            } else {
                details.classList.remove('details-open');
            }
        });
    });
}

/**
 * Initialize code blocks with additional features
 */
function initializeCodeBlocks() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
        // Skip already initialized
        if (codeBlock.dataset.initialized) return;
        codeBlock.dataset.initialized = 'true';
        
        // Add line numbers
        const lines = codeBlock.textContent.split('\n').length;
        if (lines > 1) {
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
            for (let i = 1; i <= lines; i++) {
                const lineNumber = document.createElement('span');
                lineNumber.textContent = i;
                lineNumbers.appendChild(lineNumber);
            }
            codeBlock.parentNode.insertBefore(lineNumbers, codeBlock);
            codeBlock.parentNode.classList.add('has-line-numbers');
        }
    });
}

/**
 * UI Improvements for Steam Deck DUB Edition Guide
 * Enhances user experience with additional interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI improvements when content is loaded
    window.addEventListener('content-loaded', initializeUIImprovements);
    
    // Also initialize right away in case the event already happened
    setTimeout(initializeUIImprovements, 500);
    
    // Set up keyboard detection
    detectKeyboardNavigation();
});

// Track initialization to prevent multiple initializations
let uiImprovementsInitialized = false;

/**
 * Main initialization function for UI improvements
 */
function initializeUIImprovements() {
    // Prevent multiple initializations
    if (uiImprovementsInitialized) return;
    uiImprovementsInitialized = true;
    
    console.log('Initializing UI improvements...');
    
    // Add scroll progress indicator
    addScrollProgressIndicator();
    
    // Enhance code blocks with additional features
    enhanceCodeBlocks();
    
    // Add accessibility skip link
    addSkipToContentLink();
    
    // Improve back to top button functionality
    enhanceBackToTopButton();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Add section highlights 
    setupSectionHighlighting();
    
    // Add copy button to code blocks
    setupCodeCopyButtons();
    
    // Add expandable behavior to long code blocks
    setupExpandableCodeBlocks();
    
    // Handle external links
    setupExternalLinks();
    
    // Set up table of contents highlighting
    setupTableOfContentsHighlighting();
    
    console.log('UI improvements initialized successfully');
}

/**
 * Add a scroll progress indicator at the top of the page
 */
function addScrollProgressIndicator() {
    // Remove any existing progress bar to prevent duplicates
    const existingBar = document.querySelector('.scroll-progress');
    if (existingBar) existingBar.remove();
    
    // Create the progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(to right, var(--dracula-purple, #bd93f9), var(--dracula-pink, #ff79c6));
        z-index: 9999;
        transition: width 0.1s ease-out;
    `;
    
    // Add to the DOM
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/**
 * Enhance code blocks with additional interactive features
 */
function enhanceCodeBlocks() {
    document.querySelectorAll('.code-block').forEach(block => {
        // Skip blocks that are already enhanced
        if (block.classList.contains('enhanced')) return;
        block.classList.add('enhanced');
        
        // Add syntax highlighting class if needed
        const codeElement = block.querySelector('code');
        if (codeElement && !codeElement.classList.contains('language-bash')) {
            codeElement.classList.add('language-bash');
        }
        
        // Add tooltip to copy button
        const copyButton = block.querySelector('.copy-button');
        if (copyButton && !copyButton.hasAttribute('title')) {
            copyButton.setAttribute('title', 'Copy to clipboard');
        }
        
        // Add double-tap to copy for mobile
        let tapTimeout;
        block.addEventListener('touchend', (e) => {
            if (tapTimeout) {
                clearTimeout(tapTimeout);
                tapTimeout = null;
                
                // Check if we have a copy button
                const copyButton = block.querySelector('.copy-button');
                if (copyButton) {
                    copyButton.click();
                    e.preventDefault(); // Prevent other actions
                }
            } else {
                tapTimeout = setTimeout(() => {
                    tapTimeout = null;
                }, 300);
            }
        });
    });
}

/**
 * Add a skip to content link for keyboard accessibility
 */
function addSkipToContentLink() {
    // Check if it already exists
    if (document.querySelector('.skip-to-content')) return;
    
    // Create the skip link
    const skipLink = document.createElement('a');
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to content';
    skipLink.href = '#dynamic-content';
    
    // Handle click - scroll to content area
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById('dynamic-content');
        if (target) {
            target.tabIndex = -1;
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Add to the beginning of the body
    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Enhance back to top button behavior
 */
function enhanceBackToTopButton() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    // Set title for accessibility
    backToTop.title = 'Back to top';
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top on click
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Trigger initial check
    window.dispatchEvent(new Event('scroll'));
}

/**
 * Set up keyboard shortcuts for navigation
 */
function setupKeyboardShortcuts() {
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Only enable keyboard shortcuts when no input elements are focused
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || 
            e.target.isContentEditable) {
            return;
        }
            
        switch (e.key) {
            case '/': // Search
                e.preventDefault();
                document.getElementById('search-input').focus();
                break;
                
            case 't': // Toggle theme
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    document.getElementById('theme-toggle').click();
                }
                break;
                
            case 'h': // Show help
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    showKeyboardShortcutsHelp();
                }
                break;
                
            case 'Escape': { // Close help, search, etc.
                const helpDialog = document.querySelector('.keyboard-shortcuts-dialog');
                if (helpDialog && helpDialog.style.display === 'flex') {
                    helpDialog.style.display = 'none';
                    e.preventDefault();
                }
                
                const searchInput = document.getElementById('search-input');
                if (document.activeElement === searchInput) {
                    searchInput.blur();
                    // Clear search if it's activated
                    if (searchInput.value) {
                        searchInput.value = '';
                        const event = new Event('input');
                        searchInput.dispatchEvent(event);
                    }
                    e.preventDefault();
                }
                break;
            }
                
            case 'ArrowUp': // Scroll up a bit
                if (e.ctrlKey) {
                    e.preventDefault();
                    window.scrollBy({
                        top: -100,
                        behavior: 'smooth'
                    });
                }
                break;
                
            case 'ArrowDown': // Scroll down a bit
                if (e.ctrlKey) {
                    e.preventDefault();
                    window.scrollBy({
                        top: 100,
                        behavior: 'smooth'
                    });
                }
                break;
                
            case 'Home': // Scroll to top
                if (e.ctrlKey) {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
                break;
                
            case 'End': // Scroll to bottom
                if (e.ctrlKey) {
                    e.preventDefault();
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                }
                break;
        }
    });
    
    // Add a help button to show keyboard shortcuts
    if (!document.querySelector('.keyboard-shortcuts-button')) {
        const helpButton = document.createElement('button');
        helpButton.className = 'keyboard-shortcuts-button';
        helpButton.innerHTML = '<span>?</span>';
        helpButton.setAttribute('title', 'Keyboard Shortcuts');
        helpButton.setAttribute('aria-label', 'Show Keyboard Shortcuts');
        
        helpButton.addEventListener('click', showKeyboardShortcutsHelp);
        
        document.body.appendChild(helpButton);
    }
}

/**
 * Show keyboard shortcuts help overlay
 */
function showKeyboardShortcutsHelp() {
    // Remove existing help if it exists
    const existingHelp = document.querySelector('.keyboard-shortcuts-help');
    if (existingHelp) {
        existingHelp.remove();
        return;
    }
    
    // Create help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.className = 'keyboard-shortcuts-help';
    helpOverlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--dracula-background, #282a36);
        border: 1px solid var(--dracula-comment, #6272a4);
        border-radius: 8px;
        padding: 20px;
        z-index: 9999;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        max-width: 500px;
        width: 90%;
    `;
    
    // Add content
    helpOverlay.innerHTML = `
        <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0;">Keyboard Shortcuts</h3>
        <div style="margin-bottom: 15px; border-bottom: 1px solid var(--dracula-comment, #6272a4); padding-bottom: 10px;">
            <p style="margin: 0; text-align: right;">
                <button id="close-shortcuts-help" style="background: none; border: none; color: var(--dracula-comment, #6272a4); cursor: pointer;">Close (ESC)</button>
            </p>
        </div>
        <ul style="list-style-type: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 10px;"><kbd>/</kbd> - Focus search box</li>
            <li style="margin-bottom: 10px;"><kbd>?</kbd> - Show/hide this help</li>
            <li style="margin-bottom: 10px;"><kbd>Home</kbd> - Go to top of page</li>
            <li style="margin-bottom: 10px;"><kbd>End</kbd> - Go to bottom of page</li>
            <li style="margin-bottom: 10px;"><kbd>1</kbd> - <kbd>9</kbd> - Jump to section</li>
            <li style="margin-bottom: 10px;"><kbd>Esc</kbd> - Close dialogs or remove focus</li>
        </ul>
    `;
    
    // Add to DOM
    document.body.appendChild(helpOverlay);
    
    // Handle close button
    document.getElementById('close-shortcuts-help').addEventListener('click', () => {
        helpOverlay.remove();
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function closeHelp(e) {
        if (e.key === 'Escape') {
            helpOverlay.remove();
            document.removeEventListener('keydown', closeHelp);
        }
    });
    
    // Close when clicking outside
    document.addEventListener('click', function closeHelp(e) {
        if (!helpOverlay.contains(e.target)) {
            helpOverlay.remove();
            document.removeEventListener('click', closeHelp);
        }
    });
}

/**
 * Highlight the current section in both the TOC and the sidebar
 */
function setupSectionHighlighting() {
    // Get all sections
    const sections = Array.from(document.querySelectorAll('.section'));
    if (sections.length === 0) return;
    
    // Set up intersection observer
    const observerOptions = {
        root: null, // use viewport
        rootMargin: '-100px 0px -50% 0px', // Consider section in view when it's 100px from top and still in top half
        threshold: 0
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When a section comes into view
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Update URL hash (but without scrolling)
                if (history.replaceState) {
                    history.replaceState(null, null, `#${sectionId}`);
                }
                
                // Update sidebar highlighting
                updateActiveSidebarLink(sectionId);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        if (section.id) {
            sectionObserver.observe(section);
        }
    });
    
    // Initial highlight based on URL hash
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        updateActiveSidebarLink(sectionId);
    }
}

/**
 * Update active link in sidebar
 */
function updateActiveSidebarLink(sectionId) {
    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to matching link
    const activeLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Add copy buttons to all code blocks
 */
function setupCodeCopyButtons() {
    document.querySelectorAll('.code-block').forEach(block => {
        // Skip if already has a copy button
        if (block.querySelector('.copy-button')) return;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.title = 'Copy to clipboard';
        
        // Add the button to the code block
        block.insertBefore(copyButton, block.firstChild);
        
        // Set up click handler
        copyButton.addEventListener('click', () => {
            const codeElement = block.querySelector('code');
            if (!codeElement) return;
            
            // Copy text to clipboard
            navigator.clipboard.writeText(codeElement.textContent).then(() => {
                // Success feedback
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');
                
                // Reset after delay
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('copied');
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
    });
}

/**
 * Make long code blocks expandable
 */
function setupExpandableCodeBlocks() {
    document.querySelectorAll('.code-block').forEach(block => {
        const codeElement = block.querySelector('pre');
        if (!codeElement) return;
        
        // Check if code block is long (height > certain threshold)
        if (codeElement.scrollHeight > 400) {
            // Add expandable class and click functionality if not already added
            if (!block.classList.contains('expandable') && !block.classList.contains('expanded')) {
                block.classList.add('expandable');
                
                block.addEventListener('click', function(e) {
                    // Don't trigger when clicking copy button
                    if (e.target.classList.contains('copy-button')) return;
                    
                    // Toggle expanded state
                    if (block.classList.contains('expanded')) {
                        block.classList.remove('expanded');
                    } else {
                        block.classList.add('expanded');
                    }
                });
            }
        }
    });
}

/**
 * Open external links in new tabs
 */
function setupExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        // Skip if already set up
        if (link.hasAttribute('target')) return;
        
        // Set attributes for external links
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Add visual indicator for external links
        if (!link.querySelector('.external-link-icon')) {
            const externalIcon = document.createElement('span');
            externalIcon.className = 'external-link-icon';
            externalIcon.innerHTML = ' ↗';
            externalIcon.style.fontSize = '0.8em';
            externalIcon.style.opacity = '0.7';
            link.appendChild(externalIcon);
        }
    });
}

/**
 * Highlight active items in table of contents
 */
function setupTableOfContentsHighlighting() {
    const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    if (tocLinks.length === 0) return;
    
    // Set up intersection observer for headings
    const headingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const headingId = entry.target.id;
                
                // Update active TOC link
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${headingId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-100px 0px -80% 0px'
    });
    
    // Observe all headings referenced in TOC
    tocLinks.forEach(link => {
        const headingId = link.getAttribute('href').substring(1);
        const heading = document.getElementById(headingId);
        if (heading) {
            headingObserver.observe(heading);
        }
    });
}

/**
 * Detect keyboard navigation to enhance focus styles
 */
function detectKeyboardNavigation() {
    // Add/remove keyboard-user class based on navigation method
    let usingKeyboard = false;
    
    // Set keyboard flag on Tab key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            usingKeyboard = true;
            document.body.classList.add('keyboard-user');
        }
    });
    
    // Clear keyboard flag on mouse use
    document.addEventListener('mousedown', () => {
        usingKeyboard = false;
        document.body.classList.remove('keyboard-user');
    });
    
    // Clear keyboard flag on touch events
    document.addEventListener('touchstart', () => {
        usingKeyboard = false;
        document.body.classList.remove('keyboard-user');
    });
}
