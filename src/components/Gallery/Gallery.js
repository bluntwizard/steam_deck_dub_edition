import styles from './Gallery.module.css';

/**
 * Gallery Component
 * Creates responsive image galleries with lightbox functionality
 */
export class Gallery {
  constructor(options = {}) {
    /**
     * Selector for gallery containers
     * @type {string}
     */
    this.selector = options.selector || '.gallery, [data-gallery]';
    
    /**
     * Whether to lazy load images
     * @type {boolean}
     */
    this.lazyLoad = options.lazyLoad !== false;
    
    /**
     * Whether to preload adjacent images in lightbox
     * @type {boolean}
     */
    this.preloadAdjacentImages = options.preloadAdjacentImages !== false;
    
    /**
     * Duration of animations in ms
     * @type {number}
     */
    this.animationDuration = options.animationDuration || 300;
    
    /**
     * Minimum number of images needed to create a gallery grid
     * @type {number}
     */
    this.minImagesForGrid = options.minImagesForGrid || 2;
    
    /**
     * Current active gallery images
     * @type {Array<Object>}
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
    this.lightbox = null;
    
    /**
     * Lightbox image element reference
     * @type {HTMLImageElement|null}
     * @private
     */
    this.lightboxImg = null;
    
    /**
     * Lightbox caption element reference
     * @type {HTMLElement|null}
     * @private
     */
    this.lightboxCaption = null;
    
    /**
     * Whether gallery is initialized
     * @type {boolean}
     * @private
     */
    this.initialized = false;
    
    // Auto-initialize if specified
    if (options.autoInit) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the gallery component
   * @param {Object} [options] - Initialization options
   * @returns {void}
   */
  initialize(options = {}) {
    if (this.initialized) return;
    
    // Apply any new options
    Object.assign(this, options);
    
    // Create lightbox for image viewing
    this.createLightbox();
    
    // Initialize galleries in the document
    this.initializeGalleries();
    
    // Set up mutation observer to detect new content
    this.setupMutationObserver();
    
    // Bind keyboard event handler
    this.handleKeyPress = this.handleKeyPress.bind(this);
    document.addEventListener('keydown', this.handleKeyPress);
    
    this.initialized = true;
    console.log('Gallery component initialized');
  }
  
  /**
   * Initialize galleries in the document
   * @private
   * @returns {void}
   */
  initializeGalleries() {
    // Find sections that might contain galleries
    document.querySelectorAll('.content-section, .markdown-body, article').forEach(section => {
      this.createGalleryGrid(section);
    });
    
    // Add click listeners to all gallery images
    document.querySelectorAll(`.${styles.galleryItem} img, img[data-lightbox]`).forEach(img => {
      if (!img.dataset.galleryInitialized) {
        img.addEventListener('click', () => this.openLightbox(img));
        img.dataset.galleryInitialized = 'true';
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
            if (node.nodeType === Node.ELEMENT_NODE && (
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
    if (section.querySelector(`.${styles.galleryGrid}`)) return;
    
    const items = section.querySelectorAll('img:not(.no-gallery):not([data-no-gallery])');
    if (items.length < this.minImagesForGrid) return; // Only create galleries for multiple images
    
    // Create grid container
    const galleryGrid = document.createElement('div');
    galleryGrid.className = styles.galleryGrid;
    
    // Add images to the grid
    items.forEach(img => {
      // Skip images already in a gallery
      if (img.closest(`.${styles.galleryGrid}`)) return;
      
      // Create gallery item
      const item = document.createElement('div');
      item.className = styles.galleryItem;
      
      // Get parent node to replace the image with the gallery item
      const parent = img.parentNode;
      
      // Create wrapper for the image
      const imgWrapper = document.createElement('div');
      imgWrapper.className = styles.galleryImageWrapper;
      
      // If the parent is a figure, use the figcaption for the gallery caption
      if (parent.tagName === 'FIGURE') {
        const figcaption = parent.querySelector('figcaption');
        if (figcaption) {
          const caption = document.createElement('div');
          caption.className = styles.galleryCaption;
          caption.textContent = figcaption.textContent;
          item.appendChild(caption);
          
          // Set caption data on image for lightbox
          img.dataset.caption = figcaption.textContent;
        }
        
        parent.replaceChild(document.createComment('Moved to gallery'), img);
        imgWrapper.appendChild(img);
        item.appendChild(imgWrapper);
        galleryGrid.appendChild(item);
      } else {
        // Otherwise just move the image
        parent.replaceChild(document.createComment('Moved to gallery'), img);
        
        // Check for alt text to use as caption
        if (img.alt) {
          const caption = document.createElement('div');
          caption.className = styles.galleryCaption;
          caption.textContent = img.alt;
          item.appendChild(caption);
          
          // Set caption data on image for lightbox
          img.dataset.caption = img.alt;
        }
        
        imgWrapper.appendChild(img);
        item.appendChild(imgWrapper);
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
    // Skip if lightbox already exists
    if (this.lightbox) return this.lightbox;
    
    // Create lightbox container
    this.lightbox = document.createElement('div');
    this.lightbox.className = styles.lightboxOverlay;
    this.lightbox.setAttribute('role', 'dialog');
    this.lightbox.setAttribute('aria-modal', 'true');
    this.lightbox.setAttribute('aria-label', 'Image lightbox');
    this.lightbox.setAttribute('tabindex', '-1');
    this.lightbox.style.display = 'none';
    
    // Create lightbox content
    const content = document.createElement('div');
    content.className = styles.lightboxContent;
    
    // Create img element
    const img = document.createElement('img');
    img.className = styles.lightboxImage;
    img.setAttribute('alt', ''); // Will be updated when an image is shown
    
    // Create caption
    const caption = document.createElement('div');
    caption.className = styles.lightboxCaption;
    caption.setAttribute('aria-live', 'polite');
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = styles.lightboxClose;
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close lightbox');
    closeBtn.addEventListener('click', () => this.closeLightbox());
    
    // Create navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = `${styles.lightboxNav} ${styles.lightboxPrev}`;
    prevBtn.innerHTML = '&#10094;';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
    
    const nextBtn = document.createElement('button');
    nextBtn.className = `${styles.lightboxNav} ${styles.lightboxNext}`;
    nextBtn.innerHTML = '&#10095;';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.addEventListener('click', () => this.navigateLightbox(1));
    
    // Add elements to DOM
    content.appendChild(img);
    content.appendChild(caption);
    this.lightbox.appendChild(content);
    this.lightbox.appendChild(closeBtn);
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
    
    return this.lightbox;
  }
  
  /**
   * Handle keyboard events for lightbox navigation
   * @private
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyPress(e) {
    // Only handle keys when lightbox is active
    if (this.lightbox.style.display !== 'flex') return;

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
    // Find the gallery item containing the image
    const galleryItem = img.closest(`.${styles.galleryItem}`);
    
    if (galleryItem) {
      // Find all items in this gallery
      const container = galleryItem.parentNode;
      const items = Array.from(container.querySelectorAll(`.${styles.galleryItem}`));
      
      // Get index of clicked item
      this.currentIndex = items.indexOf(galleryItem);
      
      // Store all gallery images for navigation
      this.galleryImages = items.map(item => {
        const image = item.querySelector('img');
        const caption = item.querySelector(`.${styles.galleryCaption}`);
        
        return {
          src: image.dataset.fullSrc || image.src,
          alt: image.alt || '',
          caption: image.dataset.caption || (caption ? caption.textContent : '')
        };
      });
    } else {
      // Single image case
      this.galleryImages = [{
        src: img.dataset.fullSrc || img.src,
        alt: img.alt || '',
        caption: img.dataset.caption || ''
      }];
      this.currentIndex = 0;
    }
    
    // Show lightbox
    this.createLightbox();
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    this.lightbox.style.display = 'flex';
    
    // Set focus on lightbox for keyboard navigation
    this.lightbox.focus();
    
    // Update with current image and preload adjacent
    this.updateLightboxImage();
    
    if (this.preloadAdjacentImages) {
      this.preloadAdjacentImages();
    }
    
    // Announce to screen readers
    this.announceForScreenReaders(`Lightbox opened, showing image ${this.currentIndex + 1} of ${this.galleryImages.length}`);
  }
  
  /**
   * Close the lightbox
   * @returns {void}
   */
  closeLightbox() {
    if (!this.lightbox) return;
    
    this.lightbox.style.display = 'none';
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    
    // Announce to screen readers
    this.announceForScreenReaders('Lightbox closed');
  }
  
  /**
   * Navigate to the previous or next image
   * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
   * @returns {void}
   */
  navigateLightbox(direction) {
    // Skip navigation if there's only one image
    if (this.galleryImages.length <= 1) return;
    
    // Update index with wrapping
    this.currentIndex = (this.currentIndex + direction + this.galleryImages.length) % this.galleryImages.length;
    
    // Update displayed image
    this.updateLightboxImage();
    
    // Announce to screen readers
    this.announceForScreenReaders(`Image ${this.currentIndex + 1} of ${this.galleryImages.length}`);
  }
  
  /**
   * Update the lightbox image based on current index
   * @private
   * @returns {void}
   */
  updateLightboxImage() {
    if (!this.lightbox || this.galleryImages.length === 0) return;
    
    const img = this.galleryImages[this.currentIndex];
    
    // Update image source and alt text
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.alt || '';
    
    // Update caption
    this.lightboxCaption.textContent = img.caption || '';
    this.lightboxCaption.style.display = img.caption ? 'block' : 'none';
    
    // Show/hide navigation buttons based on gallery length
    if (this.galleryImages.length <= 1) {
      this.lightboxPrevBtn.style.display = 'none';
      this.lightboxNextBtn.style.display = 'none';
    } else {
      this.lightboxPrevBtn.style.display = 'block';
      this.lightboxNextBtn.style.display = 'block';
    }
    
    // Preload adjacent images if enabled
    if (this.preloadAdjacentImages) {
      this.preloadAdjacentImages();
    }
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
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
    
    // Clear after a delay to ensure it's read only once
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
} 