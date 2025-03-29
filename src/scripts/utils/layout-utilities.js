/**
 * Layout Utilities for SDDE Guide
 * Helper functions for managing page layouts
 */

/**
 * Initialize responsive layout features
 */
function initializeResponsiveLayouts() {
  // Add responsive classes based on viewport width
  updateResponsiveClasses();
  
  // Listen for window resize events
  window.addEventListener('resize', debounce(updateResponsiveClasses, 250));
  
  // Initialize expandable code blocks
  initializeExpandableCodeBlocks();
  
  // Initialize responsive tables
  makeTablesResponsive();
  
  // Initialize responsive images
  optimizeImages();
}

/**
 * Update responsive classes based on viewport size
 */
function updateResponsiveClasses() {
  const width = window.innerWidth;
  const body = document.body;
  
  // Clear existing responsive classes
  body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');
  
  // Add appropriate viewport class
  if (width < 576) {
    body.classList.add('viewport-xs');
  } else if (width < 768) {
    body.classList.add('viewport-sm');
  } else if (width < 992) {
    body.classList.add('viewport-md');
  } else if (width < 1200) {
    body.classList.add('viewport-lg');
  } else {
    body.classList.add('viewport-xl');
  }
}

/**
 * Debounce function to limit execution rate
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Make code blocks expandable with click-to-expand feature
 */
function initializeExpandableCodeBlocks() {
  document.querySelectorAll('.code-block').forEach(codeBlock => {
    // Only add expandable feature to taller code blocks
    if (codeBlock.scrollHeight > 300) {
      codeBlock.classList.add('expandable');
      
      // Add expand/collapse functionality
      codeBlock.addEventListener('click', () => {
        if (codeBlock.classList.contains('expanded')) {
          codeBlock.classList.remove('expanded');
        } else {
          codeBlock.classList.add('expanded');
        }
      });
    }
  });
}

/**
 * Make tables responsive by wrapping them
 */
function makeTablesResponsive() {
  document.querySelectorAll('table').forEach(table => {
    // Skip if already processed
    if (table.parentNode.classList.contains('table-responsive')) return;
    
    // Create responsive wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    
    // Wrap table with the responsive container
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

/**
 * Optimize images with lazy loading and proper sizing
 */
function optimizeImages() {
  document.querySelectorAll('img:not([loading])').forEach(img => {
    // Add lazy loading for images
    img.setAttribute('loading', 'lazy');
    
    // Add error handling
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const errorText = document.createElement('div');
      errorText.className = 'image-error';
      errorText.textContent = '[Image failed to load]';
      img.parentNode.insertBefore(errorText, img.nextSibling);
    });
  });
}

/**
 * Create layout grid with specified columns
 * @param {string} containerSelector - CSS selector for container
 * @param {number} columns - Number of columns
 * @param {string} gap - CSS gap value (e.g., '20px')
 */
function createGrid(containerSelector, columns, gap = '20px') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  container.style.gap = gap;
}

/**
 * Equalize heights of selected elements
 * @param {string} selector - CSS selector for elements to equalize
 */
function equalizeHeights(selector) {
  const elements = document.querySelectorAll(selector);
  if (elements.length < 2) return;
  
  // Reset heights first
  elements.forEach(el => el.style.height = 'auto');
  
  // Get maximum height
  let maxHeight = 0;
  elements.forEach(el => {
    const height = el.offsetHeight;
    if (height > maxHeight) {
      maxHeight = height;
    }
  });
  
  // Apply maximum height to all elements
  elements.forEach(el => el.style.height = `${maxHeight}px`);
}

/**
 * Create a masonry layout
 * @param {string} containerSelector - CSS selector for container
 * @param {string} itemSelector - CSS selector for items
 * @param {number} columns - Number of columns
 */
function createMasonryLayout(containerSelector, itemSelector, columns = 3) {
  const container = document.querySelector(containerSelector);
  const items = container.querySelectorAll(itemSelector);
  if (!container || items.length === 0) return;
  
  // Reset container
  container.style.position = 'relative';
  
  // Reset items positioning
  items.forEach(item => {
    item.style.position = '';
    item.style.top = '';
    item.style.left = '';
  });
  
  // Only apply masonry above a certain viewport width
  if (window.innerWidth < 768) {
    container.style.display = 'block';
    items.forEach(item => {
      item.style.width = '100%';
    });
    return;
  }
  
  // Calculate column width
  const containerWidth = container.offsetWidth;
  const columnWidth = containerWidth / columns;
  
  // Track height of each column
  const columnHeights = Array(columns).fill(0);
  
  // Position each item
  items.forEach(item => {
    // Find column with minimum height
    const minHeight = Math.min(...columnHeights);
    const columnIndex = columnHeights.indexOf(minHeight);
    
    // Position the item
    item.style.position = 'absolute';
    item.style.width = `${columnWidth}px`;
    item.style.top = `${minHeight}px`;
    item.style.left = `${columnIndex * columnWidth}px`;
    
    // Update column height
    columnHeights[columnIndex] += item.offsetHeight + 20; // Add gap
  });
  
  // Update container height
  container.style.height = `${Math.max(...columnHeights)}px`;
}

/**
 * Apply a specific layout template to a container
 * @param {string} containerSelector - CSS selector for container
 * @param {string} layoutType - Type of layout to apply
 */
function applyLayoutTemplate(containerSelector, layoutType) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  // Remove any existing layout classes
  const layoutClasses = ['section-hero', 'section-features', 'section-steps', 
                         'section-cards', 'section-faq', 'section-comparison',
                         'section-code', 'section-gallery', 'section-stats',
                         'section-cta', 'section-timeline', 'section-quote'];
  
  layoutClasses.forEach(cls => container.classList.remove(cls));
  
  // Add the requested layout class
  container.classList.add(`section-${layoutType}`);
  
  // Perform any specific layout initialization
  switch (layoutType) {
    case 'cards':
      // Ensure card heights are equal in each row
      equalizeHeights(`${containerSelector} .card-body`);
      break;
    
    case 'gallery':
      // Initialize lightbox for gallery images
      initializeLightbox(`${containerSelector} .gallery-item`);
      break;
      
    case 'features':
      // Ensure feature items have equal height
      equalizeHeights(`${containerSelector} .feature-item`);
      break;
  }
}

/**
 * Initialize lightbox for gallery images
 * @param {string} selector - CSS selector for gallery items
 */
function initializeLightbox(selector) {
  const items = document.querySelectorAll(selector);
  if (items.length === 0) return;
  
  // Create lightbox container if it doesn't exist
  let lightbox = document.getElementById('sdde-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'sdde-lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">&#10094;</button>
        <button class="lightbox-next">&#10095;</button>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Add event listeners for lightbox controls
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
    
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
      navigateLightbox(-1);
    });
    
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
      navigateLightbox(1);
    });
    
    // Close on outside click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') {
        lightbox.classList.remove('active');
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      }
    });
  }
  
  // Track current gallery items and index
  let currentGallery = [];
  let currentIndex = 0;
  
  // Add click handler to gallery items
  items.forEach(item => {
    if (item._lightboxInitialized) return;
    item._lightboxInitialized = true;
    
    item.addEventListener('click', () => {
      // Get all items in this gallery
      const gallery = item.closest('.gallery-grid');
      currentGallery = Array.from(gallery.querySelectorAll('.gallery-item'));
      currentIndex = currentGallery.indexOf(item);
      
      // Open lightbox with this image
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption');
      
      lightbox.querySelector('.lightbox-image').src = img.src;
      lightbox.querySelector('.lightbox-caption').textContent = caption ? caption.textContent : '';
      
      // Show/hide navigation buttons based on gallery size
      if (currentGallery.length > 1) {
        lightbox.querySelector('.lightbox-prev').style.display = '';
        lightbox.querySelector('.lightbox-next').style.display = '';
      } else {
        lightbox.querySelector('.lightbox-prev').style.display = 'none';
        lightbox.querySelector('.lightbox-next').style.display = 'none';
      }
      
      // Show lightbox
      lightbox.classList.add('active');
    });
  });
  
  // Function to navigate between gallery images
  function navigateLightbox(direction) {
    currentIndex = (currentIndex + direction + currentGallery.length) % currentGallery.length;
    const newItem = currentGallery[currentIndex];
    const img = newItem.querySelector('img');
    const caption = newItem.querySelector('.gallery-caption');
    
    lightbox.querySelector('.lightbox-image').src = img.src;
    lightbox.querySelector('.lightbox-caption').textContent = caption ? caption.textContent : '';
  }
}

// Initialize layouts when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeResponsiveLayouts);

// Initialize layouts when dynamic content is loaded
window.addEventListener('content-loaded', initializeResponsiveLayouts);
