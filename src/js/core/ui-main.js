/**
 * Main UI Controller for Steam Deck DUB Edition
 * Consolidates UI functionality from multiple JS files
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize core UI components
  initSidebar();
  initSearch();
  initNavigation();
  initScrollHandlers();
  
  // Set up event listeners for dynamic content
  window.addEventListener('content-loaded', function() {
    initializeContentElements();
    applyLayoutStyles();
    handleCodeBlocks();
  });
  
  // Initialize lightbox if gallery sections exist
  if (document.querySelector('.gallery-item')) {
    initLightbox();
  }
  
  // Add loaded class when everything is ready
  window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    handleUrlHash();
  });
});

/**
 * Initialize sidebar behavior
 */
function initSidebar() {
  const toggleButton = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (toggleButton && sidebar && mainContent) {
    // Add body class for styling
    document.body.classList.add('has-sidebar');
    
    // Set initial state based on local storage or default
    const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
    if (sidebarHidden) {
      sidebar.classList.add('sidebar-hidden');
      toggleButton.classList.add('sidebar-hidden');
      mainContent.classList.remove('sidebar-active');
    } else {
      mainContent.classList.add('sidebar-active');
    }
    
    // Toggle sidebar on button click
    toggleButton.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-hidden');
      toggleButton.classList.toggle('sidebar-hidden');
      mainContent.classList.toggle('sidebar-active');
      
      // Save state to local storage
      localStorage.setItem('sidebarHidden', sidebar.classList.contains('sidebar-hidden'));
    });
    
    // Close sidebar when clicking on a link on mobile
    if (window.innerWidth <= 576) {
      const sidebarLinks = sidebar.querySelectorAll('a');
      sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
          if (window.innerWidth <= 576) {
            sidebar.classList.add('sidebar-hidden');
            toggleButton.classList.add('sidebar-hidden');
            mainContent.classList.remove('sidebar-active');
            localStorage.setItem('sidebarHidden', 'true');
          }
        });
      });
    }
  } else {
    console.error('Sidebar elements not found in the DOM');
  }
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const clearButton = document.getElementById('clear-search');
  
  if (searchInput && clearButton) {
    // Focus search on '/' key
    document.addEventListener('keydown', function(e) {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
      
      // Clear search on Escape
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    });
    
    // Clear button functionality
    clearButton.addEventListener('click', function() {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      searchInput.focus();
    });
    
    // Show clear button when search has content
    searchInput.addEventListener('input', function() {
      if (searchInput.value.length > 0) {
        clearButton.style.display = 'block';
      } else {
        clearButton.style.display = 'none';
      }
    });
    
    // Initialize search with empty state
    clearButton.style.display = 'none';
  }
}

/**
 * Initialize navigation and active section tracking
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar a');
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
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
          
          // Update active link
          navLinks.forEach(navLink => navLink.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  });
  
  // Highlight active section on scroll
  window.addEventListener('scroll', debounce(function() {
    if (document.querySelectorAll('.section').length === 0) return;
    
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 150;
    
    // Find the current section based on scroll position
    document.querySelectorAll('.section').forEach(section => {
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
  }, 100));
}

/**
 * Initialize scroll-related handlers
 */
function initScrollHandlers() {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (backToTopButton) {
    // Toggle button visibility based on scroll position
    window.addEventListener('scroll', debounce(function() {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }, 100));
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Initialize elements in dynamically loaded content
 */
function initializeContentElements() {
  // Initialize collapsible sections
  document.querySelectorAll('details:not([data-initialized])').forEach(details => {
    details.setAttribute('data-initialized', 'true');
    
    const summary = details.querySelector('summary');
    if (summary) {
      summary.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (details.hasAttribute('open')) {
          details.removeAttribute('open');
        } else {
          details.setAttribute('open', '');
        }
      });
    }
  });
  
  // Make external links open in new tab
  document.querySelectorAll('a[href^="http"]:not([data-initialized])').forEach(link => {
    link.setAttribute('data-initialized', 'true');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

/**
 * Apply layout styles to content sections
 */
function applyLayoutStyles() {
  // Apply flex and grid layouts based on content
  document.querySelectorAll('.section:not([data-layout-applied])').forEach(section => {
    section.setAttribute('data-layout-applied', 'true');
    
    // Identify content pattern and apply appropriate layout
    const headings = section.querySelectorAll('h1, h2, h3');
    const paragraphs = section.querySelectorAll('p');
    const lists = section.querySelectorAll('ul, ol');
    const images = section.querySelectorAll('img');
    
    // Detect section type based on content
    if (images.length >= 3) {
      section.classList.add('section-gallery');
    } else if (lists.length >= 2) {
      section.classList.add('section-features');
    } else if (section.querySelector('code')) {
      section.classList.add('section-code');
    } else if (headings.length >= 3 && paragraphs.length >= 3) {
      section.classList.add('section-steps');
    }
  });
  
  // Ensure proper layout display
  document.querySelectorAll('.section').forEach(section => {
    // Fix any missing display properties
    if (section.classList.contains('section-gallery')) {
      const galleryGrid = section.querySelector('.gallery-grid') || createGalleryGrid(section);
      if (galleryGrid && !galleryGrid.style.display) {
        galleryGrid.style.display = 'grid';
      }
    }
    
    if (section.classList.contains('section-features')) {
      const featuresGrid = section.querySelector('.features-grid') || createFeaturesGrid(section);
      if (featuresGrid && !featuresGrid.style.display) {
        featuresGrid.style.display = 'grid';
      }
    }
  });
}

/**
 * Create gallery grid for image content if it doesn't exist
 */
function createGalleryGrid(section) {
  const images = section.querySelectorAll('img');
  if (images.length < 3) return null;
  
  // Check if grid already exists
  let galleryGrid = section.querySelector('.gallery-grid');
  if (galleryGrid) return galleryGrid;
  
  // Create gallery grid
  galleryGrid = document.createElement('div');
  galleryGrid.className = 'gallery-grid';
  galleryGrid.style.display = 'grid';
  
  // Collect and group images
  const processedImages = new Set();
  
  images.forEach(img => {
    if (processedImages.has(img)) return;
    processedImages.add(img);
    
    // Create gallery item
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    // Get caption if available
    let caption = '';
    const parentFigure = img.closest('figure');
    if (parentFigure && parentFigure.querySelector('figcaption')) {
      caption = parentFigure.querySelector('figcaption').textContent;
      parentFigure.querySelectorAll('*').forEach(el => processedImages.add(el));
    }
    
    // Add image to gallery item
    galleryItem.appendChild(img.cloneNode(true));
    
    // Add caption if available
    if (caption) {
      const galleryCaption = document.createElement('div');
      galleryCaption.className = 'gallery-caption';
      galleryCaption.textContent = caption;
      galleryItem.appendChild(galleryCaption);
    }
    
    galleryGrid.appendChild(galleryItem);
  });
  
  // Find where to insert grid
  const heading = section.querySelector('h2, h3, h4');
  if (heading) {
    heading.after(galleryGrid);
  } else {
    section.appendChild(galleryGrid);
  }
  
  // Remove original images now in gallery
  processedImages.forEach(el => {
    if (el.parentElement && !galleryGrid.contains(el)) {
      const parent = el.parentElement;
      if (parent.tagName === 'FIGURE' || (parent.childNodes.length === 1 && parent.firstChild === el)) {
        parent.remove();
      } else {
        el.remove();
      }
    }
  });
  
  return galleryGrid;
}

/**
 * Create features grid for list content if it doesn't exist
 */
function createFeaturesGrid(section) {
  const lists = section.querySelectorAll('ul, ol');
  if (lists.length < 1) return null;
  
  // Check if grid already exists
  let featuresGrid = section.querySelector('.features-grid');
  if (featuresGrid) return featuresGrid;
  
  // Create features grid
  featuresGrid = document.createElement('div');
  featuresGrid.className = 'features-grid';
  featuresGrid.style.display = 'grid';
  
  // Get a single list to convert
  const list = lists[0];
  const items = list.querySelectorAll('li');
  
  // Create feature items
  items.forEach(item => {
    const featureItem = document.createElement('div');
    featureItem.className = 'feature-item';
    
    // Extract title and description
    const text = item.innerHTML;
    const titleMatch = text.match(/<strong>(.*?)<\/strong>/);
    
    let title = '';
    let description = text;
    let icon = '🔹';
    
    if (titleMatch) {
      title = titleMatch[1];
      description = text.replace(titleMatch[0], '').trim();
      
      // Simple icon selection based on title content
      if (/performance|speed|fast/i.test(title)) icon = '⚡';
      else if (/battery|power/i.test(title)) icon = '🔋';
      else if (/gaming|controller|play/i.test(title)) icon = '🎮';
      else if (/custom|setting|tweak/i.test(title)) icon = '🔧';
      else if (/download|install/i.test(title)) icon = '📥';
      else if (/security|protect/i.test(title)) icon = '🔒';
    }
    
    featureItem.innerHTML = `
      <div class="feature-icon">${icon}</div>
      <h3 class="feature-title">${title || 'Feature'}</h3>
      <p class="feature-description">${description}</p>
    `;
    
    featuresGrid.appendChild(featureItem);
  });
  
  // Insert grid after heading
  const heading = section.querySelector('h2, h3');
  if (heading) {
    heading.after(featuresGrid);
  } else {
    section.insertBefore(featuresGrid, section.firstChild);
  }
  
  // Remove original list
  list.remove();
  
  return featuresGrid;
}

/**
 * Handle code blocks
 */
function handleCodeBlocks() {
  document.querySelectorAll('pre code').forEach(codeBlock => {
    const pre = codeBlock.parentElement;
    
    // Skip already processed code blocks
    if (pre.getAttribute('data-processed')) return;
    pre.setAttribute('data-processed', 'true');
    
    // Add class to pre element if not already there
    if (!pre.classList.contains('code-block')) {
      pre.classList.add('code-block');
    }
    
    // Add copy button if it doesn't exist
    if (!pre.previousElementSibling || !pre.previousElementSibling.classList.contains('copy-button')) {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.onclick = function() { copyToClipboard(this); };
      pre.parentElement.insertBefore(copyButton, pre);
    }
    
    // Make expandable if content is tall
    if (pre.scrollHeight > 300) {
      pre.classList.add('expandable');
      
      pre.addEventListener('click', function() {
        pre.classList.toggle('expanded');
      });
    }
  });
}

/**
 * Initialize lightbox functionality for gallery images
 */
function initLightbox() {
  // Create lightbox container if needed
  if (!document.getElementById('lightbox-container')) {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-container';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="" alt="" class="lightbox-image">
        <div class="lightbox-caption"></div>
        <button class="lightbox-close">×</button>
        <button class="lightbox-prev">‹</button>
        <button class="lightbox-next">›</button>
      </div>
    `;
    document.body.appendChild(lightbox);
    
    // Set up event listeners
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', function() {
      lightbox.classList.remove('active');
    });
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }
  
  // Add click listeners to gallery items
  document.querySelectorAll('.gallery-item').forEach(item => {
    if (item.getAttribute('data-lightbox-initialized')) return;
    item.setAttribute('data-lightbox-initialized', 'true');
    
    item.addEventListener('click', function() {
      const lightbox = document.getElementById('lightbox-container');
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption');
      
      if (lightbox && img) {
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
      }
    });
  });
}

/**
 * Handle URL hash to navigate to section
 */
function handleUrlHash() {
  if (window.location.hash) {
    const targetId = window.location.hash;
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      setTimeout(function() {
        window.scrollTo({
          top: targetElement.offsetTop - 50,
          behavior: 'smooth'
        });
        
        // Open parent details elements if target is inside one
        const parentDetails = targetElement.closest('details');
        if (parentDetails) {
          parentDetails.setAttribute('open', '');
        }
      }, 300);
    }
  }
}

/**
 * Debounce helper function
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}
