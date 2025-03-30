/**
 * Gallery Component for Grimoire
 * Handles image galleries with lightbox functionality
 * 
 * @module Gallery
 * @author Grimoire Team
 * @version 1.0.0
 */

/**
 * @typedef {Object} GalleryImage
 * @property {string} src - The source URL of the image
 * @property {string} [alt] - Alternative text for the image
 * @property {string} [caption] - Optional caption for the image
 * @property {string} [thumbSrc] - Optional thumbnail source, falls back to src if not provided
 * @property {boolean} [loaded] - Whether the image has been loaded
 */

/**
 * @typedef {Object} GalleryOptions
 * @property {string} [selector='.gallery, [data-gallery]'] - Selector for gallery containers
 * @property {boolean} [lazyLoad=true] - Whether to lazy load images
 * @property {boolean} [preloadAdjacentImages=true] - Whether to preload adjacent images in lightbox
 * @property {number} [animationDuration=300] - Duration of animations in ms
 */

/**
 * @class Gallery
 * @classdesc Creates responsive image galleries with lightbox functionality
 */
class Gallery {
  constructor() {
    /**
     * Current active gallery images
     * @type {Array<HTMLElement>}
     * @private
     */
    this.galleryImages = [];
    
    /**
     * Current active image index in lightbox
     * @type {number}
     * @private
     */
    this.currentIndex = 0;
    
    /**
     * Lightbox element reference
     * @type {HTMLElement|null}
     * @private
     */
    this.lightboxElement = null;
    
    /**
     * Whether gallery is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
  }
  
  /**
   * Initialize the gallery component
   * @returns {void}
   */
  initialize() {
    if (this.initialized) return;
    
    this.createLightbox();
    this.initializeGalleries();
    
    // Set up a mutation observer to detect new content
    this.setupMutationObserver();
    
    this.initialized = true;
    console.log('Gallery component initialized');
  }
  
  /**
   * Initialize galleries in the document
   * @returns {void}
   */
  initializeGalleries() {
    // Find sections that might contain galleries
    document.querySelectorAll('.content-section, .markdown-body, article').forEach(section => {
      this.createGalleryGrid(section);
    });
    
    // Add click listeners to all gallery images
    document.querySelectorAll('.gallery-grid img, img.lightbox-enabled').forEach(img => {
      if (!img.hasAttribute('data-gallery-initialized')) {
        img.addEventListener('click', () => this.openLightbox(img));
        img.setAttribute('data-gallery-initialized', 'true');
        // Add visual indicator that image can be clicked
        img.style.cursor = 'pointer';
      }
    });
  }
  
  /**
   * Set up mutation observer to detect new content
   * @private
   * @returns {void}
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let shouldInit = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            // Check if the added node is an element and contains images
            if (node.nodeType === 1 && (
              node.matches('.content-section, .markdown-body, article') || 
              node.querySelector('img')
            )) {
              shouldInit = true;
            }
          });
        }
      });
      
      if (shouldInit) {
        this.initializeGalleries();
      }
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Create gallery grid for image content
   * @param {HTMLElement} section - The section to convert to a gallery
   * @returns {void}
   */
  createGalleryGrid(section) {
    // Skip if already processed or has no images
    if (section.querySelector('.gallery-grid')) return;
    
    const items = section.querySelectorAll('img:not(.no-gallery):not([data-no-gallery])');
    if (items.length < 2) return; // Only create galleries for multiple images
    
    // Create grid container
    const galleryGrid = document.createElement('div');
    galleryGrid.className = 'gallery-grid';
    
    // Determine grid columns based on image count
    if (items.length <= 2) {
      galleryGrid.classList.add('cols-1');
    } else if (items.length <= 4) {
      galleryGrid.classList.add('cols-2');
    } else {
      galleryGrid.classList.add('cols-3');
    }
    
    // Add images to the grid
    items.forEach(img => {
      // Skip images already in a gallery
      if (img.closest('.gallery-grid')) return;
      
      // Create gallery item
      const item = document.createElement('div');
      item.className = 'gallery-item';
      
      // Get parent node to replace the image with the gallery item
      const parent = img.parentNode;
      
      // If the parent is a figure, move the whole figure
      if (parent.tagName === 'FIGURE') {
        galleryGrid.appendChild(parent);
      } else {
        // Otherwise just move the image
        parent.replaceChild(document.createComment('Moved to gallery'), img);
        item.appendChild(img);
        galleryGrid.appendChild(item);
      }
    });
    
    // Check if we actually added any items
    if (galleryGrid.children.length > 0) {
      section.appendChild(galleryGrid);
    }
  }
  
  /**
   * Create the lightbox for displaying images in fullscreen
   * @private
   * @returns {HTMLElement} The created lightbox element
   */
  createLightbox() {
    // Create lightbox container if it doesn't exist
    if (!this.lightbox) {
      this.lightbox = document.createElement('div');
      this.lightbox.className = 'lightbox';
      this.lightbox.setAttribute('role', 'dialog');
      this.lightbox.setAttribute('aria-modal', 'true');
      this.lightbox.setAttribute('aria-label', 'Image lightbox');
      
      // Create lightbox content
      const content = document.createElement('div');
      content.className = 'lightbox-content';
      
      // Create img element
      const img = document.createElement('img');
      img.className = 'lightbox-img';
      img.setAttribute('alt', ''); // Will be updated when an image is shown
      
      // Create caption
      const caption = document.createElement('div');
      caption.className = 'lightbox-caption';
      caption.setAttribute('aria-live', 'polite');
      
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'lightbox-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close lightbox');
      closeBtn.addEventListener('click', () => this.closeLightbox());
      
      // Create navigation buttons
      const prevBtn = document.createElement('button');
      prevBtn.className = 'lightbox-prev';
      prevBtn.innerHTML = '&#10094;';
      prevBtn.setAttribute('aria-label', 'Previous image');
      prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
      
      const nextBtn = document.createElement('button');
      nextBtn.className = 'lightbox-next';
      nextBtn.innerHTML = '&#10095;';
      nextBtn.setAttribute('aria-label', 'Next image');
      nextBtn.addEventListener('click', () => this.navigateLightbox(1));
      
      // Add elements to DOM
      content.appendChild(img);
      content.appendChild(caption);
      content.appendChild(closeBtn);
      this.lightbox.appendChild(content);
      this.lightbox.appendChild(prevBtn);
      this.lightbox.appendChild(nextBtn);
      document.body.appendChild(this.lightbox);
      
      // Set properties
      this.lightboxImg = img;
      this.lightboxCaption = caption;
      this.lightboxPrevBtn = prevBtn;
      this.lightboxNextBtn = nextBtn;
      
      // Add close on background click
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) {
          this.closeLightbox();
        }
      });
      
      // Add keyboard navigation
      this.handleKeyPress = this.handleKeyPress.bind(this);
      document.addEventListener('keydown', this.handleKeyPress);
    }
    
    return this.lightbox;
  }
  
  /**
   * Handle keyboard events for lightbox navigation
   * @private
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyPress(e) {
    if (!this.lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        this.closeLightbox();
        e.preventDefault();
        break;
      case 'ArrowLeft':
        this.navigateLightbox(-1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.navigateLightbox(1);
        e.preventDefault();
        break;
      case 'Home':
        this.currentIndex = 0;
        this.updateLightboxImage();
        e.preventDefault();
        break;
      case 'End':
        this.currentIndex = this.galleryImages.length - 1;
        this.updateLightboxImage();
        e.preventDefault();
        break;
    }
  }
  
  /**
   * Open the lightbox with a specific image
   * @param {HTMLImageElement} img - The image element to display
   */
  openLightbox(img) {
    const galleryItem = img.closest('.gallery-item');
    if (!galleryItem) return;
    
    // Find index of the clicked image
    const items = Array.from(galleryItem.parentNode.querySelectorAll('.gallery-item'));
    this.currentIndex = items.indexOf(galleryItem);
    this.galleryImages = items.map(item => {
      const image = item.querySelector('img');
      return {
        src: image.getAttribute('data-full-src') || image.src,
        alt: image.alt,
        caption: image.getAttribute('data-caption') || item.querySelector('.gallery-caption')?.textContent || ''
      };
    });
    
    // Show lightbox
    this.createLightbox();
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    this.lightbox.classList.add('active');
    
    // Set focus on lightbox for keyboard navigation
    this.lightbox.setAttribute('tabindex', '-1');
    this.lightbox.focus();
    
    // Update with current image and preload adjacent
    this.updateLightboxImage();
    this.preloadAdjacentImages();
    
    // Announce to screen readers
    this.announceForScreenReaders(`Lightbox opened, showing image ${this.currentIndex + 1} of ${this.galleryImages.length}`);
  }
  
  /**
   * Close the lightbox
   * @returns {void}
   */
  closeLightbox() {
    if (!this.lightboxElement) return;
    
    this.lightboxElement.classList.remove('active');
    
    // Re-enable scrolling
    document.body.style.overflow = '';
  }
  
  /**
   * Navigate to the previous or next image
   * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
   * @returns {void}
   */
  navigateLightbox(direction) {
    if (this.galleryImages.length <= 1) return;
    
    this.currentIndex = (this.currentIndex + direction + this.galleryImages.length) % this.galleryImages.length;
    
    this.updateLightboxImage();
  }
  
  /**
   * Update the lightbox image based on current index
   * @private
   * @returns {void}
   */
  updateLightboxImage() {
    const lightboxImg = this.lightboxElement.querySelector('.lightbox-image');
    const captionEl = this.lightboxElement.querySelector('.lightbox-caption');
    const img = this.galleryImages[this.currentIndex];
    
    // Update image source
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    
    // Update caption from alt text or figcaption
    let caption = img.alt || '';
    const figure = img.closest('figure');
    if (figure) {
      const figcaption = figure.querySelector('figcaption');
      if (figcaption) {
        caption = figcaption.textContent;
      }
    }
    
    captionEl.textContent = caption;
    
    // Preload adjacent images
    this.preloadAdjacentImages();
  }
  
  /**
   * Preload adjacent images for smoother navigation
   * @private
   * @returns {void}
   */
  preloadAdjacentImages() {
    if (this.galleryImages.length <= 1) return;
    
    const nextIndex = (this.currentIndex + 1) % this.galleryImages.length;
    const prevIndex = (this.currentIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    
    // Create image objects to preload
    [prevIndex, nextIndex].forEach(index => {
      const img = new Image();
      img.src = this.galleryImages[index].src;
    });
  }
  
  /**
   * Announce a message to screen readers
   * @private
   * @param {string} message - The message to announce
   */
  announceForScreenReaders(message) {
    let announcer = document.getElementById('gallery-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'gallery-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
    
    // Clear after a delay to ensure it's read only once
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

// Create singleton instance
const gallery = new Gallery();

// Export the singleton
export default gallery; 