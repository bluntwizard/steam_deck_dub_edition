/**
 * Image Optimization Utilities
 * Improves performance by optimizing image loading and display
 */

/**
 * Type definitions for image optimizer
 */
interface PlaceholderGenerator {
  (img: HTMLImageElement, src: string): void;
}

/**
 * Initialize image optimization features
 */
export function initImageOptimizer(): void {
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
function setupLazyLoading(): void {
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
          const img = entry.target as HTMLImageElement;
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
function applyNativeLazyLoading(): void {
  document.querySelectorAll('img:not([loading])').forEach((img: Element) => {
    const imgElement = img as HTMLImageElement;
    // Skip already loaded images and small icons
    if (imgElement.complete || imgElement.width < 50) return;
    
    // Apply native lazy loading
    imgElement.loading = 'lazy';
    
    // For images using data-src pattern
    const dataSrc = imgElement.getAttribute('data-src');
    const dataSrcset = imgElement.getAttribute('data-srcset');
    
    if (dataSrc) {
      imgElement.src = dataSrc;
      imgElement.removeAttribute('data-src');
    }
    
    if (dataSrcset) {
      imgElement.srcset = dataSrcset;
      imgElement.removeAttribute('data-srcset');
    }
  });
}

/**
 * Fallback lazy loading for browsers without IntersectionObserver
 */
function applyFallbackLazyLoading(): void {
  const lazyImages = Array.from(document.querySelectorAll('img[data-src]')) as HTMLImageElement[];
  
  // Load all images that are in viewport on load
  loadVisibleImages();
  
  // Check for visible images on scroll
  let scrollTimeout: number | undefined;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = window.setTimeout(() => {
      loadVisibleImages();
    }, 200); // Throttle scroll events
  });
  
  function loadVisibleImages(): void {
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
function setupResponsiveImages(): void {
  document.querySelectorAll('img.responsive:not([srcset])').forEach((img: Element) => {
    const imgElement = img as HTMLImageElement;
    // Skip images that already have srcset
    if (imgElement.hasAttribute('srcset')) return;
    
    // Get the base image path and extension
    const src = imgElement.getAttribute('src') || imgElement.getAttribute('data-src') || '';
    if (!src || src.startsWith('data:')) return;
    
    const lastDot = src.lastIndexOf('.');
    if (lastDot === -1) return;
    
    const basePath = src.substring(0, lastDot);
    const extension = src.substring(lastDot);
    
    // Create srcset with multiple resolutions
    // Only if the path contains 'images/' to avoid processing icons
    if (src.includes('images/')) {
      // Use data-src pattern if the original was using it
      const targetAttr = imgElement.hasAttribute('data-src') ? 'data-srcset' : 'srcset';
      
      imgElement.setAttribute(targetAttr, `
        ${basePath}-small${extension} 400w,
        ${basePath}-medium${extension} 800w,
        ${basePath}${extension} 1200w
      `);
      
      // Add sizes attribute if not present
      if (!imgElement.hasAttribute('sizes')) {
        imgElement.setAttribute('sizes', '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw');
      }
    }
  });
}

/**
 * Preload critical images that should be loaded immediately
 */
function preloadCriticalImages(): void {
  const criticalImages = document.querySelectorAll('img.critical');
  
  criticalImages.forEach((img: Element) => {
    const imgElement = img as HTMLImageElement;
    const src = imgElement.getAttribute('data-src') || imgElement.getAttribute('src');
    if (src && !imgElement.complete) {
      // Create a preload link
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
      
      // Also set the actual src if it was using data-src
      if (imgElement.hasAttribute('data-src')) {
        imgElement.src = src;
        imgElement.removeAttribute('data-src');
      }
    }
  });
}

/**
 * Preload specified images
 * @param sources - Array of image URLs to preload
 */
export function preloadImages(sources: string[]): void {
  sources.forEach(src => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;
  });
}

/**
 * Apply low-quality image placeholders
 * @param selector - CSS selector for target images
 * @param placeholderGenerator - Function to generate placeholder
 */
export function applyLQIP(selector: string, placeholderGenerator?: PlaceholderGenerator): void {
  document.querySelectorAll(selector).forEach(img => {
    // Skip if already processed
    if (img.classList.contains('lqip-applied')) return;
    
    // Apply placeholder blur effect
    img.classList.add('img-loading');
    img.classList.add('lqip-applied');
    
    const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
    
    // If a placeholder generator is provided, use it
    if (placeholderGenerator && typeof placeholderGenerator === 'function') {
      placeholderGenerator(img as HTMLImageElement, src);
    } else {
      // Default: apply a blur-up technique
      applyBlurUpEffect(img as HTMLImageElement, src);
    }
  });
}

/**
 * Apply blur-up effect for smooth image loading
 */
function applyBlurUpEffect(img: HTMLImageElement, src: string): void {
  // Skip for data URLs
  if (src.startsWith('data:')) return;
  
  // Create a tiny placeholder image (could be replaced with a real tiny version)
  const tinyPlaceholder = src.replace(/\.\w+$/, '-tiny$&');
  
  // Set a placeholder background
  img.style.backgroundImage = `url(${tinyPlaceholder})`;
  img.style.backgroundSize = 'cover';
  img.style.backgroundPosition = 'center';
  
  // Set up the actual image loading
  if (!img.hasAttribute('data-src')) {
    // For regular images
    const originalSrc = img.src;
    img.src = '';
    
    // Load the full image when needed
    if (img.hasAttribute('loading') && img.loading === 'lazy') {
      // Already has lazy loading, just restore the src
      img.src = originalSrc;
    } else {
      // Manual load handling
      setTimeout(() => {
        img.src = originalSrc;
      }, 100);
    }
  }
  
  // When loaded, fade out the blur
  img.addEventListener('load', () => {
    img.classList.remove('img-loading');
    img.classList.add('img-loaded');
  });
}

/**
 * Generate dominant color placeholder
 */
export function generateColorPlaceholder(img: HTMLImageElement, src: string): void {
  // Default colors for common image types
  const defaultColors: Record<string, string> = {
    'avatar': '#e1e1e1',
    'product': '#f5f5f5',
    'background': '#111111',
    'banner': '#222222'
  };
  
  // Try to guess the image type
  let placeholderColor = '#f0f0f0'; // Default gray
  
  for (const [type, color] of Object.entries(defaultColors)) {
    if (src.includes(type)) {
      placeholderColor = color;
      break;
    }
  }
  
  // Apply the color as background
  img.style.backgroundColor = placeholderColor;
  
  // Set up a proper fade-in when the image loads
  img.addEventListener('load', () => {
    img.classList.remove('img-loading');
    img.classList.add('img-loaded');
  });
} 