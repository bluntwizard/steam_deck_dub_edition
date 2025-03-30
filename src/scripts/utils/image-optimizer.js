/**
 * Image Optimization Utilities
 * Improves performance by optimizing image loading and display
 */

/**
 * Initialize image optimization features
 */
export function initImageOptimizer() {
  // Setup IntersectionObserver for lazy loading
  setupLazyLoading();
  
  // Apply responsive image techniques
  setupResponsiveImages();
  
  // Pre-load critical images
  preloadCriticalImages();
}

/**
 * Setup lazy loading for images
 */
function setupLazyLoading() {
  // Check if native lazy loading is supported
  const hasNativeLazyLoading = 'loading' in HTMLImageElement.prototype;
  
  // If native lazy loading is available, use it
  if (hasNativeLazyLoading) {
    applyNativeLazyLoading();
    return;
  }
  
  // Otherwise use IntersectionObserver
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          const dataSrcset = img.getAttribute('data-srcset');
          
          // Set the actual src/srcset from data attributes
          if (dataSrc) {
            img.src = dataSrc;
          }
          
          if (dataSrcset) {
            img.srcset = dataSrcset;
          }
          
          // Remove placeholder blur effect if present
          img.classList.remove('img-loading');
          img.classList.add('img-loaded');
          
          // Stop observing the image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Load images when they're 50px from viewport
      threshold: 0.01, // Start loading when 1% of the image is visible
    });
    
    // Observe all images with data-src attributes
    document.querySelectorAll('img[data-src]').forEach(img => {
      // Apply a placeholder or blur effect
      if (!img.classList.contains('img-loading')) {
        img.classList.add('img-loading');
      }
      
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    applyFallbackLazyLoading();
  }
}

/**
 * Apply native lazy loading to images
 */
function applyNativeLazyLoading() {
  document.querySelectorAll('img:not([loading])').forEach(img => {
    // Skip already loaded images and small icons
    if (img.complete || img.width < 50) return;
    
    // Apply native lazy loading
    img.loading = 'lazy';
    
    // For images using data-src pattern
    const dataSrc = img.getAttribute('data-src');
    const dataSrcset = img.getAttribute('data-srcset');
    
    if (dataSrc) {
      img.src = dataSrc;
      img.removeAttribute('data-src');
    }
    
    if (dataSrcset) {
      img.srcset = dataSrcset;
      img.removeAttribute('data-srcset');
    }
  });
}

/**
 * Fallback lazy loading for browsers without IntersectionObserver
 */
function applyFallbackLazyLoading() {
  const lazyImages = Array.from(document.querySelectorAll('img[data-src]'));
  
  // Load all images that are in viewport on load
  loadVisibleImages();
  
  // Check for visible images on scroll
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
      loadVisibleImages();
    }, 200); // Throttle scroll events
  });
  
  function loadVisibleImages() {
    const viewportHeight = window.innerHeight;
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + viewportHeight;
    
    lazyImages.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const imageTop = rect.top + viewportTop;
      const imageBottom = imageTop + rect.height;
      
      // Check if image is in viewport
      if (imageBottom >= viewportTop && imageTop <= viewportBottom) {
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc) {
          img.src = dataSrc;
          img.removeAttribute('data-src');
          img.classList.remove('img-loading');
          img.classList.add('img-loaded');
          
          // Remove from array
          lazyImages.splice(index, 1);
        }
      }
    });
  }
}

/**
 * Setup responsive images using srcset and sizes
 */
function setupResponsiveImages() {
  document.querySelectorAll('img.responsive:not([srcset])').forEach(img => {
    // Skip images that already have srcset
    if (img.hasAttribute('srcset')) return;
    
    // Get the base image path and extension
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    if (!src || src.startsWith('data:')) return;
    
    const lastDot = src.lastIndexOf('.');
    if (lastDot === -1) return;
    
    const basePath = src.substring(0, lastDot);
    const extension = src.substring(lastDot);
    
    // Create srcset with multiple resolutions
    // Only if the path contains 'images/' to avoid processing icons
    if (src.includes('images/')) {
      // Use data-src pattern if the original was using it
      const targetAttr = img.hasAttribute('data-src') ? 'data-srcset' : 'srcset';
      
      img.setAttribute(targetAttr, `
        ${basePath}-small${extension} 400w,
        ${basePath}-medium${extension} 800w,
        ${basePath}${extension} 1200w
      `);
      
      // Add sizes attribute if not present
      if (!img.hasAttribute('sizes')) {
        img.setAttribute('sizes', '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw');
      }
    }
  });
}

/**
 * Preload critical images that should be loaded immediately
 */
function preloadCriticalImages() {
  const criticalImages = document.querySelectorAll('img.critical');
  
  criticalImages.forEach(img => {
    const src = img.getAttribute('data-src') || img.getAttribute('src');
    if (src && !img.complete) {
      // Create a preload link
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
      
      // Also set the actual src if it was using data-src
      if (img.hasAttribute('data-src')) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    }
  });
}

/**
 * Apply low-quality image placeholders
 * @param {string} selector - CSS selector for target images
 * @param {Function} placeholderGenerator - Function to generate placeholder
 */
export function applyLQIP(selector, placeholderGenerator) {
  document.querySelectorAll(selector).forEach(img => {
    // Skip if already processed
    if (img.classList.contains('lqip-applied')) return;
    
    // Apply placeholder blur effect
    img.classList.add('img-loading');
    img.classList.add('lqip-applied');
    
    const src = img.getAttribute('data-src') || img.getAttribute('src');
    
    // If a placeholder generator is provided, use it
    if (placeholderGenerator && typeof placeholderGenerator === 'function') {
      placeholderGenerator(img, src);
    } else {
      // Default: apply a blur-up technique
      applyBlurUpEffect(img, src);
    }
  });
}

/**
 * Apply blur-up effect for smooth image loading
 */
function applyBlurUpEffect(img, src) {
  // Skip for data URLs
  if (src.startsWith('data:')) return;
  
  // Create a tiny placeholder image (could be replaced with a real tiny version)
  const placeholder = new Image();
  placeholder.src = src;
  placeholder.classList.add('lqip-placeholder');
  
  // Set placeholder onload
  placeholder.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create a tiny version and blur it
    canvas.width = 20;
    canvas.height = 20 * (placeholder.height / placeholder.width);
    
    ctx.drawImage(placeholder, 0, 0, canvas.width, canvas.height);
    
    // Apply a blur filter
    ctx.filter = 'blur(4px)';
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    
    // Generate a data URL
    const dataURL = canvas.toDataURL('image/jpeg', 0.1);
    
    // Use the tiny blurred image as placeholder
    if (img.hasAttribute('data-src')) {
      img.style.backgroundImage = `url(${dataURL})`;
      img.style.backgroundSize = 'cover';
    } else {
      const originalSrc = img.src;
      img.src = dataURL;
      img.dataset.originalSrc = originalSrc;
      
      // Load the actual image
      const actualImage = new Image();
      actualImage.src = originalSrc;
      actualImage.onload = () => {
        img.src = originalSrc;
        img.classList.remove('img-loading');
        img.classList.add('img-loaded');
      };
    }
  };
} 