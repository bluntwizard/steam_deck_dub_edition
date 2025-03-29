document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // NAVIGATION & UI SETUP
    // =====================
    
    // Sidebar Toggle
    const toggleButton = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleButton && sidebar && mainContent) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-hidden');
            toggleButton.classList.toggle('sidebar-hidden');
            mainContent.classList.toggle('sidebar-active');
            
            // Save sidebar state in local storage
            localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden'));
        });
        
        // Restore sidebar state from local storage
        const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
        if (sidebarHidden) {
            sidebar.classList.add('sidebar-hidden');
            toggleButton.classList.add('sidebar-hidden');
        } else {
            mainContent.classList.add('sidebar-active');
        }
    }
    
    // Back to Top Button
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ==================
    // ACTIVE NAVIGATION
    // ==================
    
    // Highlight active section in sidebar
    const navLinks = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.section');
    
    function setActiveNavLink() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200; // Add offset to improve accuracy
        
        // Find the current section based on scroll position
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && 
                scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.id;
            }
        });
        
        // Update active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href === '#' + currentSectionId || 
                (currentSectionId === '' && href === '#top')) {
                link.classList.add('active');
            }
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', debounce(setActiveNavLink, 100));
    
    // Initialize active link on page load
    setActiveNavLink();
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 50,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without reloading the page
                    window.history.pushState(null, null, targetId);
                }
            }
        });
    });
    
    // ==================
    // SEARCH FUNCTIONALITY
    // ==================
    
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            // Reset everything if search term is too short
            if (searchTerm.length < 2) {
                sections.forEach(section => {
                    section.style.display = 'block';
                });
                
                document.querySelectorAll('.guide-section').forEach(item => {
                    item.style.display = 'block';
                    item.open = false;
                });
                return;
            }
            
            // Perform search
            let hasResults = false;
            
            // Search in main sections
            sections.forEach(section => {
                const sectionText = section.textContent.toLowerCase();
                const hasMatch = sectionText.includes(searchTerm);
                
                // Get subsections within this section
                const subsections = section.querySelectorAll('.guide-section');
                let hasSubsectionMatch = false;
                
                // Check each subsection
                subsections.forEach(subsection => {
                    const subsectionText = subsection.textContent.toLowerCase();
                    const subsectionMatch = subsectionText.includes(searchTerm);
                    
                    if (subsectionMatch) {
                        subsection.style.display = 'block';
                        subsection.open = true;
                        hasSubsectionMatch = true;
                        hasResults = true;
                    } else {
                        subsection.style.display = 'none';
                    }
                });
                
                // Show section if it matches or has matching subsections
                if (hasMatch || hasSubsectionMatch) {
                    section.style.display = 'block';
                    hasResults = true;
                } else {
                    section.style.display = 'none';
                }
            });
            
            // Show a message if no results were found
            const noResultsMessage = document.getElementById('no-results-message');
            
            if (noResultsMessage) {
                if (!hasResults && searchTerm.length > 0) {
                    noResultsMessage.style.display = 'block';
                    noResultsMessage.textContent = `No results found for "${searchTerm}"`;
                } else {
                    noResultsMessage.style.display = 'none';
                }
            }
        }, 300));
        
        // Clear search button
        const clearSearchButton = document.getElementById('clear-search');
        if (clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            });
        }
    }
    
    // ==================
    // CODE BLOCKS
    // ==================
    
    // Copy code to clipboard
    window.copyToClipboard = function(button) {
        const codeBlock = button.nextElementSibling;
        const text = codeBlock.textContent.trim();
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Fallback: Could not copy text:', err);
                button.textContent = 'Failed!';
                
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            }
            
            document.body.removeChild(textArea);
        });
    };
    
    // ==================
    // COLLAPSIBLE SECTIONS
    // ==================
    
    // Add functionality to collapsible sections
    document.querySelectorAll('details.guide-section').forEach(details => {
        const summary = details.querySelector('summary');
        
        if (summary) {
            summary.addEventListener('click', (e) => {
                // Prevent default toggling behavior to implement custom animation
                e.preventDefault();
                
                // Toggle the details element
                if (details.hasAttribute('open')) {
                    // Close the details element with animation
                    const content = details.querySelector('.details-content');
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
                    const content = details.querySelector('.details-content');
                    
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
    });
    
    // ==================
    // EXTERNAL LINKS
    // ==================
    
    // Open external links in new tab
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.target) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
    
    // ==================
    // KEYBOARD NAVIGATION
    // ==================
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt+S to toggle sidebar
        if (e.altKey && e.key === 's' && toggleButton) {
            e.preventDefault();
            toggleButton.click();
        }
        
        // Alt+T to scroll to top
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Alt+F to focus search
        if (e.altKey && e.key === 'f' && searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    });
    
    // ==================
    // UTILITY FUNCTIONS
    // ==================
    
    // Debounce function to limit how often a function can run
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // ==================
    // LOAD COMPLETION
    // ==================
    
    // Add a class to body when everything is loaded
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Check if URL has a hash and scroll to it
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                setTimeout(() => {
                    window.scrollTo({
                        top: targetElement.offsetTop - 50,
                        behavior: 'smooth'
                    });
                    
                    // If it's a details element, open it
                    const parentDetails = targetElement.closest('details');
                    if (parentDetails) {
                        parentDetails.open = true;
                    }
                }, 100);
            }
        }
    });
});