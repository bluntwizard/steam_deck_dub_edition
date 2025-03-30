/**
 * UI Improvements Module
 * 
 * Provides various UI enhancements and interactions
 * Steam Deck DUB Edition Guide
 */

import KeyboardShortcuts from '../../components/KeyboardShortcuts/KeyboardShortcuts';

// Define the type for the KeyboardShortcuts class
interface KeyboardShortcutsInstance {
    add(key: string, callback: () => void, description: string): void;
    initialize(): void;
    showHelp(): void;
}

/**
 * Initialize UI improvements when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function(): void {
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
function initializeThemeSwitcher(): void {
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
function initializeResponsiveElements(): void {
    // Add responsive classes based on viewport
    updateResponsiveClasses();
    
    // Update on resize
    window.addEventListener('resize', function() {
        updateResponsiveClasses();
    });
}

/**
 * Update responsive classes based on viewport width
 */
function updateResponsiveClasses(): void {
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
function updateUIAfterContentLoad(): void {
    // Adjust content spacing for header height
    const header = document.querySelector('.sdde-header');
    const mainContent = document.querySelector('.main-content') as HTMLElement | null;
    
    if (header && mainContent) {
        const headerElement = header as HTMLElement;
        mainContent.style.marginTop = `${headerElement.offsetHeight}px`;
    }
    
    // Initialize any dynamic UI elements in the content
    initializeDetailsElements();
    initializeCodeBlocks();
}

/**
 * Initialize details elements for improved accordion behavior
 */
function initializeDetailsElements(): void {
    document.querySelectorAll('details').forEach(details => {
        // Skip already initialized
        if ((details as HTMLDetailsElement).dataset.initialized) return;
        (details as HTMLDetailsElement).dataset.initialized = 'true';
        
        // Add animation classes
        details.classList.add('details-animated');
        
        // Handle opening/closing with animation
        details.addEventListener('toggle', function() {
            if ((details as HTMLDetailsElement).open) {
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
function initializeCodeBlocks(): void {
    document.querySelectorAll('pre code').forEach(codeBlock => {
        // Skip already initialized
        if ((codeBlock as HTMLElement).dataset.initialized) return;
        (codeBlock as HTMLElement).dataset.initialized = 'true';
        
        // Add line numbers
        const lines = codeBlock.textContent?.split('\n').length || 0;
        if (lines > 1) {
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
            for (let i = 1; i <= lines; i++) {
                const lineNumber = document.createElement('span');
                lineNumber.textContent = i.toString();
                lineNumbers.appendChild(lineNumber);
            }
            if (codeBlock.parentNode) {
                const parent = codeBlock.parentNode as HTMLElement;
                parent.insertBefore(lineNumbers, codeBlock);
                parent.classList.add('has-line-numbers');
            }
        }
    });
}

/**
 * Setup focus visible polyfill
 */
function setupFocusVisible(): void {
    // Detect keyboard navigation
    let usingKeyboard = false;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            usingKeyboard = true;
            document.body.classList.add('keyboard-focus');
        }
    });
    
    document.addEventListener('mousedown', function() {
        usingKeyboard = false;
        document.body.classList.remove('keyboard-focus');
    });
    
    // Add focus visible class to focused elements when using keyboard
    document.addEventListener('focusin', function(e) {
        if (usingKeyboard && e.target) {
            (e.target as HTMLElement).classList.add('focus-visible');
        }
    });
    
    document.addEventListener('focusout', function(e) {
        if (e.target) {
            (e.target as HTMLElement).classList.remove('focus-visible');
        }
    });
}

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts(): void {
    // Create keyboard shortcuts instance
    const keyboardShortcuts = new KeyboardShortcuts() as unknown as KeyboardShortcutsInstance;
    
    // Add shortcuts
    keyboardShortcuts.add('?', function() {
        keyboardShortcuts.showHelp();
    }, 'Show keyboard shortcut help');
    
    keyboardShortcuts.add('t', function() {
        document.getElementById('theme-toggle')?.click();
    }, 'Toggle dark/light theme');
    
    keyboardShortcuts.add('/', function() {
        document.getElementById('search-input')?.focus();
    }, 'Focus search box');
    
    keyboardShortcuts.add('esc', function() {
        (document.activeElement as HTMLElement)?.blur();
    }, 'Blur current element');
    
    keyboardShortcuts.add('g h', function() {
        window.location.href = '/';
    }, 'Go to home page');
    
    keyboardShortcuts.add('g t', function() {
        window.location.href = '/tutorials';
    }, 'Go to tutorials');
    
    keyboardShortcuts.add('g d', function() {
        window.location.href = '/downloads';
    }, 'Go to downloads');
    
    keyboardShortcuts.add('g s', function() {
        window.location.href = '/settings';
    }, 'Go to settings');
    
    // Initialize shortcuts
    keyboardShortcuts.initialize();
}

/**
 * Initialize UI improvements
 */
function initializeUIImprovements(): void {
    // Setup focus visible polyfill
    setupFocusVisible();
    
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Additional UI improvements can be added here
}

// Export functions for use in other modules
export {
    initializeThemeSwitcher,
    initializeResponsiveElements,
    updateUIAfterContentLoad,
    initializeDetailsElements,
    initializeCodeBlocks,
    initializeKeyboardShortcuts,
    initializeUIImprovements
}; 