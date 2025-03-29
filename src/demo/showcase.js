/**
 * Component Showcase Enhancer
 * Adds theme switching, code copying, and navigation functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeThemeToggle();
    addCodeCopyButtons();
    createComponentNav();
    countComponents();
});

/**
 * Initializes theme toggle functionality
 */
function initializeThemeToggle() {
    // Create theme toggle button if it doesn't exist
    if (!document.querySelector('.theme-toggle')) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle dark/light theme');
        themeToggle.innerHTML = '🌙';
        document.body.appendChild(themeToggle);
    }

    const themeToggle = document.querySelector('.theme-toggle');
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('showcase-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '🌙';
    }

    // Add event listener for theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('showcase-theme', newTheme);
        
        themeToggle.innerHTML = newTheme === 'light' ? '☀️' : '🌙';
    });
}

/**
 * Adds copy buttons to all code examples
 */
function addCodeCopyButtons() {
    const codeExamples = document.querySelectorAll('.code-example');
    
    codeExamples.forEach(example => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        
        example.appendChild(copyButton);
        
        copyButton.addEventListener('click', () => {
            const code = example.querySelector('code').textContent;
            
            navigator.clipboard.writeText(code)
                .then(() => {
                    // Show success state
                    copyButton.textContent = 'Copied!';
                    copyButton.style.backgroundColor = 'var(--success-color)';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                        copyButton.style.backgroundColor = '';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    copyButton.textContent = 'Error!';
                    copyButton.style.backgroundColor = 'var(--error-color)';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                        copyButton.style.backgroundColor = '';
                    }, 2000);
                });
        });
    });
}

/**
 * Creates a navigation sidebar for components
 */
function createComponentNav() {
    const container = document.querySelector('.container');
    const componentSections = document.querySelectorAll('.component-section');
    
    // Only create nav if we have more than 3 components
    if (componentSections.length > 3) {
        const nav = document.createElement('nav');
        nav.className = 'component-nav';
        nav.innerHTML = '<h3>Components</h3><ul></ul>';
        
        const navList = nav.querySelector('ul');
        
        componentSections.forEach((section, index) => {
            const title = section.querySelector('.component-title').textContent;
            const id = `component-${title.toLowerCase().replace(/\s+/g, '-')}`;
            
            // Add ID to the section for linking
            section.id = id;
            
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = title;
            
            listItem.appendChild(link);
            navList.appendChild(listItem);
            
            // Add event listener to scroll to section
            link.addEventListener('click', (event) => {
                event.preventDefault();
                section.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Update URL hash
                history.pushState(null, null, `#${id}`);
            });
        });
        
        // Insert nav before container
        container.parentNode.insertBefore(nav, container);
        
        // Add styles for the nav
        const style = document.createElement('style');
        style.textContent = `
            .component-nav {
                position: sticky;
                top: 20px;
                width: 200px;
                padding: 1rem;
                background-color: var(--card-background);
                border-radius: 6px;
                margin-right: 20px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                border: 1px solid var(--border-color);
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                float: left;
            }
            
            .component-nav h3 {
                margin-top: 0;
                color: var(--primary-color);
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 0.5rem;
            }
            
            .component-nav ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .component-nav li {
                margin-bottom: 0.5rem;
            }
            
            .component-nav a {
                color: var(--text-color);
                text-decoration: none;
                display: block;
                padding: 0.25rem 0;
                border-left: 2px solid transparent;
                padding-left: 0.5rem;
                transition: border-color 0.2s;
            }
            
            .component-nav a:hover,
            .component-nav a:focus {
                color: var(--primary-color);
                border-left-color: var(--primary-color);
            }
            
            @media (max-width: 768px) {
                .component-nav {
                    float: none;
                    width: auto;
                    margin-bottom: 1rem;
                    position: relative;
                    top: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Make container flow around nav
        container.style.marginLeft = '220px';
        
        // For mobile
        const mediaQuery = document.createElement('style');
        mediaQuery.textContent = `
            @media (max-width: 768px) {
                .container {
                    margin-left: 0;
                }
            }
        `;
        document.head.appendChild(mediaQuery);
    }
}

/**
 * Counts and displays the number of components
 */
function countComponents() {
    const componentSections = document.querySelectorAll('.component-section');
    const header = document.querySelector('header');
    
    if (componentSections.length > 0 && header) {
        const count = document.createElement('div');
        count.className = 'component-count';
        count.textContent = `${componentSections.length} modular components available`;
        header.appendChild(count);
    }
}

/**
 * Creates a table of contents if more than 5 components
 */
function createTableOfContents() {
    const componentSections = document.querySelectorAll('.component-section');
    
    if (componentSections.length > 5) {
        const container = document.querySelector('.container');
        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h2>Table of Contents</h2><ul></ul>';
        
        const tocList = toc.querySelector('ul');
        
        componentSections.forEach(section => {
            const title = section.querySelector('.component-title').textContent;
            const id = section.id || `component-${title.toLowerCase().replace(/\s+/g, '-')}`;
            
            // Ensure section has ID
            if (!section.id) {
                section.id = id;
            }
            
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = title;
            
            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });
        
        // Insert at the beginning of the container
        container.insertBefore(toc, container.firstChild);
    }
}

// Run table of contents function after a small delay to ensure DOM is fully processed
setTimeout(createTableOfContents, 100); 