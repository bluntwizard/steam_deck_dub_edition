/**
 * Layout Utilities for SDDE Guide
 * Helper functions for managing page layouts
 */

/**
 * Layout types for the applyLayoutTemplate function
 */
type LayoutType = 'grid' | 'masonry' | 'cards' | 'list' | 'featured' | 'sidebar';

/**
 * Lightbox configuration options
 */
interface LightboxOptions {
  closeOnOverlayClick?: boolean;
  showCounter?: boolean;
  showControls?: boolean;
  enableKeyboard?: boolean;
  slideTransition?: 'fade' | 'slide';
  captionPosition?: 'bottom' | 'top' | 'none';
}

/**
 * Initialize responsive layout features
 */
export function initializeResponsiveLayouts(): void {
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
function updateResponsiveClasses(): void {
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
 * @param func - The function to debounce
 * @param wait - The wait time in milliseconds
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    clearTimeout(timeout as number);
    timeout = window.setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Make code blocks expandable with click-to-expand feature
 */
function initializeExpandableCodeBlocks(): void {
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
function makeTablesResponsive(): void {
  document.querySelectorAll('table').forEach(table => {
    // Skip if already processed
    if (table.parentNode && (table.parentNode as Element).classList.contains('table-responsive')) return;
    
    // Create responsive wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    
    // Wrap table with the responsive container
    if (table.parentNode) {
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

/**
 * Optimize images with lazy loading and proper sizing
 */
function optimizeImages(): void {
  document.querySelectorAll('img:not([loading])').forEach(img => {
    // Add lazy loading for images
    img.setAttribute('loading', 'lazy');
    
    // Add error handling
    img.addEventListener('error', () => {
      (img as HTMLElement).style.display = 'none';
      const errorText = document.createElement('div');
      errorText.className = 'image-error';
      errorText.textContent = '[Image failed to load]';
      if (img.parentNode) {
        img.parentNode.insertBefore(errorText, img.nextSibling);
      }
    });
  });
}

/**
 * Create layout grid with specified columns
 * @param containerSelector - CSS selector for container
 * @param columns - Number of columns
 * @param gap - CSS gap value (e.g., '20px')
 */
export function createGrid(containerSelector: string, columns: number, gap: string = '20px'): void {
  const container = document.querySelector(containerSelector) as HTMLElement | null;
  if (!container) return;
  
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  container.style.gap = gap;
}

/**
 * Equalize heights of selected elements
 * @param selector - CSS selector for elements to equalize
 */
export function equalizeHeights(selector: string): void {
  const elements = document.querySelectorAll<HTMLElement>(selector);
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
 * @param containerSelector - CSS selector for container
 * @param itemSelector - CSS selector for items
 * @param columns - Number of columns
 */
export function createMasonryLayout(containerSelector: string, itemSelector: string, columns: number = 3): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;
  
  const items = container.querySelectorAll<HTMLElement>(itemSelector);
  if (items.length === 0) return;
  
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
  const columnHeights: number[] = Array(columns).fill(0);
  
  // Position each item
  items.forEach(item => {
    // Find column with minimum height
    const minHeight = Math.min(...columnHeights);
    const columnIndex = columnHeights.indexOf(minHeight);
    
    // Calculate position
    const x = columnIndex * columnWidth;
    const y = minHeight;
    
    // Apply position
    item.style.position = 'absolute';
    item.style.width = `${columnWidth}px`;
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    
    // Update column height
    columnHeights[columnIndex] += item.offsetHeight + 20; // Adding gap
  });
  
  // Update container height to match tallest column
  container.style.height = `${Math.max(...columnHeights)}px`;
}

/**
 * Apply a predefined layout template to a container
 * @param containerSelector - CSS selector for container
 * @param layoutType - Type of layout to apply
 */
export function applyLayoutTemplate(containerSelector: string, layoutType: LayoutType): void {
  const container = document.querySelector<HTMLElement>(containerSelector);
  if (!container) return;
  
  // Reset container
  container.className = container.className.replace(/layout-\w+/g, '').trim();
  container.style.cssText = '';
  
  // Add layout class
  container.classList.add(`layout-${layoutType}`);
  
  // Apply specific layout
  switch(layoutType) {
    case 'grid':
      createGrid(containerSelector, 3, '20px');
      break;
    case 'masonry':
      createMasonryLayout(containerSelector, '> *');
      break;
    case 'cards':
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.style.gap = '20px';
      container.querySelectorAll(':scope > *').forEach(child => {
        (child as HTMLElement).style.flex = '1 1 300px';
      });
      break;
    case 'list':
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      break;
    case 'featured':
      // First item is featured (larger)
      const children = container.querySelectorAll<HTMLElement>(':scope > *');
      if (children.length > 0) {
        children[0].style.gridColumn = '1 / -1';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        container.style.gap = '20px';
      }
      break;
    case 'sidebar':
      container.style.display = 'grid';
      container.style.gridTemplateColumns = '250px 1fr';
      container.style.gap = '30px';
      break;
  }
}

/**
 * Initialize lightbox for images
 * @param selector - CSS selector for images
 * @param options - Lightbox options
 */
export function initializeLightbox(selector: string, options: LightboxOptions = {}): void {
  const defaults: LightboxOptions = {
    closeOnOverlayClick: true,
    showCounter: true,
    showControls: true,
    enableKeyboard: true,
    slideTransition: 'fade',
    captionPosition: 'bottom'
  };
  
  const settings = { ...defaults, ...options };
  
  // Find all images that should have lightbox
  const images = document.querySelectorAll<HTMLImageElement>(selector);
  let currentIndex = 0;
  let lightbox: HTMLElement | null = null;
  
  // Create lightbox container once
  function createLightbox(): HTMLElement {
    // If lightbox already exists, return it
    const existing = document.getElementById('lightbox');
    if (existing) return existing as HTMLElement;
    
    // Create lightbox elements
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image lightbox');
    
    // Create lightbox components
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    
    const content = document.createElement('div');
    content.className = 'lightbox-content';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'lightbox-image-container';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close lightbox');
    closeBtn.innerHTML = '&times;';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.textContent = '‹';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.textContent = '›';
    
    const counter = document.createElement('div');
    counter.className = 'lightbox-counter';
    
    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    
    // Add elements to lightbox
    content.appendChild(imageContainer);
    if (settings.showControls) {
      content.appendChild(prevBtn);
      content.appendChild(nextBtn);
    }
    content.appendChild(closeBtn);
    if (settings.showCounter) {
      content.appendChild(counter);
    }
    if (settings.captionPosition !== 'none') {
      content.appendChild(caption);
      content.classList.add(`caption-${settings.captionPosition}`);
    }
    
    lb.appendChild(overlay);
    lb.appendChild(content);
    document.body.appendChild(lb);
    
    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    
    if (settings.closeOnOverlayClick) {
      overlay.addEventListener('click', closeLightbox);
    }
    
    if (settings.showControls) {
      prevBtn.addEventListener('click', () => navigateLightbox(-1));
      nextBtn.addEventListener('click', () => navigateLightbox(1));
    }
    
    if (settings.enableKeyboard) {
      lb.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      });
    }
    
    return lb;
  }
  
  // Open lightbox with specific image
  function openLightbox(index: number): void {
    if (index < 0 || index >= images.length) return;
    
    currentIndex = index;
    lightbox = createLightbox();
    lightbox.style.display = 'flex';
    
    updateLightboxContent();
    
    // Prevent page scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
    
    // Focus the lightbox for keyboard navigation
    lightbox.setAttribute('tabindex', '-1');
    lightbox.focus();
  }
  
  // Close the lightbox
  function closeLightbox(): void {
    if (lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
  
  // Navigate to previous/next image
  function navigateLightbox(direction: number): void {
    const newIndex = (currentIndex + direction + images.length) % images.length;
    currentIndex = newIndex;
    updateLightboxContent();
  }
  
  // Update the lightbox content
  function updateLightboxContent(): void {
    if (!lightbox) return;
    
    const imageContainer = lightbox.querySelector('.lightbox-image-container');
    const counter = lightbox.querySelector('.lightbox-counter');
    const caption = lightbox.querySelector('.lightbox-caption');
    
    if (!imageContainer) return;
    
    // Clear existing content
    imageContainer.innerHTML = '';
    
    // Create new image
    const img = document.createElement('img');
    img.src = images[currentIndex].src;
    img.alt = images[currentIndex].alt;
    
    imageContainer.appendChild(img);
    
    // Update counter
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
    }
    
    // Update caption
    if (caption) {
      caption.textContent = images[currentIndex].alt || '';
    }
  }
  
  // Add click event to each image
  images.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });
    
    // Make images keyboard accessible
    img.setAttribute('tabindex', '0');
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });
}

// Export module
export default {
  initializeResponsiveLayouts,
  createGrid,
  equalizeHeights,
  createMasonryLayout,
  applyLayoutTemplate,
  initializeLightbox
}; 