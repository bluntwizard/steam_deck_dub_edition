/**
 * Gallery Component for Steam Deck DUB Edition
 * Handles image galleries with lightbox functionality
 * 
 * @module Gallery
 * @author Steam Deck DUB Edition Team
 * @version 1.0.0
 */

import styles from './Gallery.module.css';

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
    document.querySelectorAll(`.${styles['gallery-grid']} img, img.lightbox-enabled`).forEach(img => {
      if (!img.hasAttribute('data-gallery-initialized')) {
        img.addEventListener('click', () => this.openLightbox(img));
        img.setAttribute('data-gallery-initialized', 'true');
        // Add visual indicator that image can be clicked
        img.style.cursor = 'pointer';
      }
    });
  }
  
  /**
   * Create gallery grid for image content
   * @param {HTMLElement} section - The section to convert to a gallery
   * @returns {void}
   */
  createGalleryGrid(section) {
    // Skip if already processed or has no images
    if (section.querySelector(`.${styles['gallery-grid']}`)) return;
    
    const items = section.querySelectorAll('img:not(.no-gallery):not([data-no-gallery])');
    if (items.length < 2) return; // Only create galleries for multiple images
    
    // Create grid container
    const galleryGrid = document.createElement('div');
    galleryGrid.className = styles['gallery-grid'];
    
    // Determine grid columns based on image count
    if (items.length <= 2) {
      galleryGrid.classList.add(styles['cols-1']);
    } else if (items.length <= 4) {
      galleryGrid.classList.add(styles['cols-2']);
    } else {
      galleryGrid.classList.add(styles['cols-3']);
    }
    
    // Add images to the grid
    items.forEach(img => {
      // Skip images already in a gallery
      if (img.closest(`.${styles['gallery-grid']}`)) return;
      
      // Create gallery item
      const item = document.createElement('div');
      item.className = styles['gallery-item'];
      
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
      this.lightbox.className = styles.lightbox;
      this.lightbox.setAttribute('role', 'dialog');
      this.lightbox.setAttribute('aria-modal', 'true');
      this.lightbox.setAttribute('aria-label', 'Image lightbox');
    
      // Create lightbox content
      const content = document.createElement('div');
      content.className = styles['lightbox-content'];
    
      // Create image element
      const img = document.createElement('img');
      img.className = styles['lightbox-img'];
      img.setAttribute('alt', '');
      content.appendChild(img);
    
      // Create caption
      const caption = document.createElement('div');
      caption.className = styles['lightbox-caption'];
      content.appendChild(caption);
    
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = styles['lightbox-close'];
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close lightbox');
      closeBtn.addEventListener('click', () => this.closeLightbox());
    
      // Create navigation buttons
      const prevBtn = document.createElement('button');
      prevBtn.className = styles['lightbox-prev'];
      prevBtn.innerHTML = '&#10094;';
      prevBtn.setAttribute('aria-label', 'Previous image');
      prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
    
      const nextBtn = document.createElement('button');
      nextBtn.className = styles['lightbox-next'];
      nextBtn.innerHTML = '&#10095;';
      nextBtn.setAttribute('aria-label', 'Next image');
      nextBtn.addEventListener('click', () => this.navigateLightbox(1));
    
      // Add keyboard event listener
      document.addEventListener('keydown', this.handleKeyPress.bind(this));
    
      // Append all elements
      this.lightbox.appendChild(content);
      this.lightbox.appendChild(prevBtn);
      this.lightbox.appendChild(nextBtn);
      document.body.appendChild(this.lightbox);
    
      // Store references to elements
      this.lightboxImg = img;
      this.lightboxCaption = caption;
      this.lightboxPrevBtn = prevBtn;
      this.lightboxNextBtn = nextBtn;
    
      // Close lightbox when background is clicked
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) {
          this.closeLightbox();
        }
      });
    }
    
    this.lightboxElement = this.lightbox;
    return this.lightbox;
  }

  /**
   * Open the lightbox with a specific image
   * @param {HTMLImageElement} img - The image element to display in the lightbox
   * @returns {void}
   */
  openLightbox(img) {
    // Get all images in the same gallery
    const parent = img.closest(`.${styles['gallery-grid']}`) || document.body;
    this.galleryImages = Array.from(parent.querySelectorAll('img'));
    
    // Find the index of the clicked image
    this.currentIndex = this.galleryImages.indexOf(img);
    
    // Show lightbox
    this.createLightbox();
    
    this.lightbox.classList.add(styles.active);
    
    // Update image in lightbox
    this.updateLightboxImage();
  }
  
  /**
   * Close the lightbox
   * @returns {void}
   */
  closeLightbox() {
    if (!this.lightboxElement) return;
    
    this.lightboxElement.classList.remove(styles.active);
  }
}

export default Gallery; 