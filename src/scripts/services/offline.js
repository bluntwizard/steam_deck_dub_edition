/**
 * Offline functionality manager for the Grimoire Guide
 * Handles offline detection and related UI interactions
 */

class OfflineManager {
  constructor() {
    this.offlineClass = 'app-offline';
    this.offlineBannerClass = 'offline-banner';
    this.offlineBannerId = 'offline-status-banner';
    this.init();
  }
  
  /**
   * Initialize offline functionality
   */
  init() {
    // Check initial network state
    this.updateOfflineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Create cache status button
    this.createCacheStatusButton();
    
    console.log('Offline manager initialized');
  }
  
  /**
   * Update the UI based on current network state
   */
  updateOfflineStatus() {
    if (navigator.onLine) {
      document.body.classList.remove(this.offlineClass);
      this.removeOfflineBanner();
    } else {
      document.body.classList.add(this.offlineClass);
      this.showOfflineBanner();
    }
  }
  
  /**
   * Handle transition to online state
   */
  handleOnline() {
    console.log('Application is online');
    document.body.classList.remove(this.offlineClass);
    this.removeOfflineBanner();
    
    // Show notification
    this.showStatusNotification('You are back online', 'online');
    
    // Update cache status
    this.updateCacheStatus();
  }
  
  /**
   * Handle transition to offline state
   */
  handleOffline() {
    console.log('Application is offline');
    document.body.classList.add(this.offlineClass);
    this.showOfflineBanner();
    
    // Show notification
    this.showStatusNotification('You are now offline - using cached content', 'offline');
  }
  
  /**
   * Show a temporary status notification
   */
  showStatusNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `status-notification ${type}-notification`;
    notification.textContent = message;
    
    // Style notification based on type
    const bgColor = type === 'online' ? 
      'var(--dracula-green, #50fa7b)' : 
      'var(--dracula-orange, #ffb86c)';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${bgColor};
      color: var(--dracula-background, #282a36);
      padding: 10px 15px;
      border-radius: 4px;
      font-weight: bold;
      z-index: 10000;
      animation: fadeOut 3s forwards;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
  
  /**
   * Show persistent offline banner
   */
  showOfflineBanner() {
    // Check if banner already exists
    if (document.getElementById(this.offlineBannerId)) {
      return;
    }
    
    const banner = document.createElement('div');
    banner.id = this.offlineBannerId;
    banner.className = this.offlineBannerClass;
    banner.innerHTML = `
      <div class="offline-banner-content">
        <span class="offline-icon">📡</span>
        <span class="offline-message">You're currently offline. Some content may not be available.</span>
        <button class="offline-retry-button">Retry Connection</button>
      </div>
    `;
    
    // Style banner
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: var(--dracula-orange, #ffb86c);
      color: var(--dracula-background, #282a36);
      z-index: 9999;
      text-align: center;
      padding: 8px 15px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      transform: translateY(-100%);
      animation: slideDown 0.3s forwards;
    `;
    
    // Style banner content
    const bannerContent = banner.querySelector('.offline-banner-content');
    bannerContent.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      max-width: 1200px;
      width: 100%;
    `;
    
    // Style retry button
    const retryButton = banner.querySelector('.offline-retry-button');
    retryButton.style.cssText = `
      background-color: var(--dracula-background, #282a36);
      color: var(--dracula-foreground, #f8f8f2);
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      margin-left: auto;
    `;
    
    document.body.appendChild(banner);
    
    // Add slide down animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Add retry event
    retryButton.addEventListener('click', () => {
      // Try to fetch the main page to test connection
      fetch(window.location.href, { method: 'HEAD' })
        .then(() => {
          // If successful, we're online
          this.handleOnline();
        })
        .catch(() => {
          // Still offline
          this.showStatusNotification('Still offline. Please check your connection.', 'offline');
        });
    });
  }
  
  /**
   * Remove offline banner
   */
  removeOfflineBanner() {
    const banner = document.getElementById(this.offlineBannerId);
    if (banner) {
      // Add exit animation
      banner.style.animation = 'slideUp 0.3s forwards';
      
      // Add slide up animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideUp {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
      `;
      document.head.appendChild(style);
      
      // Remove after animation
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 300);
    }
  }
  
  /**
   * Create cache status button
   */
  createCacheStatusButton() {
    // Check if button already exists
    if (document.getElementById('cache-status-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'cache-status-button';
    button.className = 'cache-status-button';
    
    // Style button
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background-color: var(--dracula-purple, #bd93f9);
      color: var(--dracula-background, #282a36);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.2em;
      z-index: 1000;
      opacity: 0.7;
      transition: opacity 0.3s, transform 0.3s;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    `;
    
    // Add hover effects
    button.addEventListener('mouseover', () => {
      button.style.opacity = '1';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.opacity = '0.7';
    });
    
    // Show tooltip on hover
    button.title = 'Offline Content Status';
    
    // Initially set the icon
    button.innerHTML = '💾';
    
    // Add click event to show cache status
    button.addEventListener('click', () => this.showCacheStatus());
    
    document.body.appendChild(button);
    
    // Update initial cache status
    this.updateCacheStatus();
  }
  
  /**
   * Update the cache status button state
   */
  updateCacheStatus() {
    const button = document.getElementById('cache-status-button');
    if (!button) return;
    
    // Check for service worker and caches
    if ('serviceWorker' in navigator && 'caches' in window) {
      this.getCacheStats().then(stats => {
        button.title = `${stats.totalItems} pages and assets cached for offline use`;
        
        // Update icon based on content amount
        if (stats.totalItems > 20) {
          button.innerHTML = '📱';
          button.style.backgroundColor = 'var(--dracula-green, #50fa7b)';
        } else if (stats.totalItems > 5) {
          button.innerHTML = '💾';
          button.style.backgroundColor = 'var(--dracula-purple, #bd93f9)';
        } else {
          button.innerHTML = '🔄';
          button.style.backgroundColor = 'var(--dracula-orange, #ffb86c)';
        }
      });
    } else {
      button.innerHTML = '❌';
      button.style.backgroundColor = 'var(--dracula-red, #ff5555)';
      button.title = 'Offline mode not supported in this browser';
    }
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const stats = {
      totalItems: 0,
      contentItems: 0,
      assetItems: 0
    };
    
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        stats.totalItems += keys.length;
        
        // Count content items
        keys.forEach(key => {
          if (key.url.includes('/content/')) {
            stats.contentItems++;
          } else {
            stats.assetItems++;
          }
        });
      }
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }
    
    return stats;
  }
  
  /**
   * Show detailed cache status dialog
   */
  async showCacheStatus() {
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'cache-status-dialog';
    
    // Style dialog
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--dracula-background, #282a36);
      border: 1px solid var(--dracula-comment, #6272a4);
      border-radius: 8px;
      padding: 20px;
      z-index: 10001;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    
    // Show loading state
    dialog.innerHTML = `
      <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0;">Offline Content Status</h3>
      <div style="display: flex; justify-content: center; padding: 20px;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(189, 147, 249, 0.2); border-radius: 50%; border-top-color: var(--dracula-purple, #bd93f9); animation: spin 1s linear infinite;"></div>
      </div>
      <p style="text-align: center;">Loading cached content information...</p>
    `;
    
    // Add animation for spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(dialog);
    
    // Add click outside to close
    const clickOutsideHandler = (e) => {
      if (!dialog.contains(e.target) && e.target.id !== 'cache-status-button') {
        closeDialog();
      }
    };
    
    // Close handler
    const closeDialog = () => {
      document.removeEventListener('click', clickOutsideHandler);
      dialog.style.animation = 'fadeOut 0.3s forwards';
      
      // Add fade out animation
      const fadeStyle = document.createElement('style');
      fadeStyle.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(fadeStyle);
      
      // Remove after animation
      setTimeout(() => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      }, 300);
    };
    
    // Add ESC key handler
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    
    // Add event listeners
    setTimeout(() => {
      document.addEventListener('click', clickOutsideHandler);
      document.addEventListener('keydown', keyHandler);
    }, 100);
    
    try {
      // Get cache stats
      const stats = await this.getCacheStats();
      
      // Get list of cached pages
      const contentPages = await this.getCachedPages();
      
      // Format the content for the dialog
      let dialogContent = `
        <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0;">Offline Content Status</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <h4 style="color: var(--dracula-cyan, #8be9fd); margin: 0;">Content Pages</h4>
            <p style="margin: 5px 0;">${stats.contentItems} cached</p>
          </div>
          <div>
            <h4 style="color: var(--dracula-green, #50fa7b); margin: 0;">Assets</h4>
            <p style="margin: 5px 0;">${stats.assetItems} cached</p>
          </div>
          <div>
            <h4 style="color: var(--dracula-pink, #ff79c6); margin: 0;">Total</h4>
            <p style="margin: 5px 0;">${stats.totalItems} items</p>
          </div>
        </div>
      `;
      
      // Add connection status
      dialogContent += `
        <div style="margin: 20px 0; padding: 10px; background-color: ${navigator.onLine ? 'var(--dracula-green-transparent, rgba(80, 250, 123, 0.2))' : 'var(--dracula-orange-transparent, rgba(255, 184, 108, 0.2))'}; border-radius: 4px;">
          <p style="margin: 0;"><strong>Status:</strong> ${navigator.onLine ? 'Online - New content will be cached as you browse' : 'Offline - Showing cached content only'}</p>
        </div>
      `;
      
      // Add cached pages list if we have any
      if (contentPages.length > 0) {
        dialogContent += `
          <h4 style="color: var(--dracula-cyan, #8be9fd);">Cached Pages</h4>
          <ul style="list-style: none; padding: 0; margin: 0; max-height: 200px; overflow-y: auto;">
        `;
        
        contentPages.forEach(page => {
          dialogContent += `
            <li style="padding: 8px 0; border-bottom: 1px solid var(--dracula-current-line, #44475a);">
              <a href="${page.url}" style="color: var(--dracula-green, #50fa7b); text-decoration: none; display: block;">
                ${page.title}
              </a>
            </li>
          `;
        });
        
        dialogContent += '</ul>';
      } else {
        dialogContent += `
          <p style="color: var(--dracula-comment, #6272a4); font-style: italic; text-align: center;">
            No content pages have been cached yet.<br>
            Visit some pages while online to make them available offline.
          </p>
        `;
      }
      
      // Add a button to clear the cache
      dialogContent += `
        <div style="margin-top: 20px; display: flex; justify-content: space-between;">
          <button id="close-cache-dialog" style="background: var(--dracula-comment, #6272a4); color: var(--dracula-foreground, #f8f8f2); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
          <button id="clear-cache-button" style="background: var(--dracula-red, #ff5555); color: var(--dracula-foreground, #f8f8f2); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Clear Cache</button>
        </div>
      `;
      
      // Update dialog content
      dialog.innerHTML = dialogContent;
      
      // Add event listeners for buttons
      document.getElementById('close-cache-dialog').addEventListener('click', closeDialog);
      
      document.getElementById('clear-cache-button').addEventListener('click', async () => {
        // Show confirmation
        if (confirm('Are you sure you want to clear all cached content? You will need to be online to reload the guide.')) {
          try {
            // Clear all caches
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            
            // Update status
            this.updateCacheStatus();
            
            // Close dialog
            closeDialog();
            
            // Show notification
            this.showStatusNotification('Cache cleared successfully', 'online');
          } catch (error) {
            console.error('Error clearing cache:', error);
            alert('Failed to clear cache: ' + error.message);
          }
        }
      });
      
    } catch (error) {
      console.error('Error showing cache status:', error);
      dialog.innerHTML = `
        <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0;">Offline Content Status</h3>
        <p style="color: var(--dracula-red, #ff5555);">Error loading cache information: ${error.message}</p>
        <button id="close-cache-dialog" style="background: var(--dracula-comment, #6272a4); color: var(--dracula-foreground, #f8f8f2); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: block; margin: 20px auto;">Close</button>
      `;
      
      document.getElementById('close-cache-dialog').addEventListener('click', closeDialog);
    }
  }
  
  /**
   * Get list of cached content pages
   */
  async getCachedPages() {
    const cachedPages = [];
    
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        if (cacheName.includes('content')) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          // Filter for HTML content
          const contentRequests = keys.filter(request => 
            request.url.includes('/content/') && 
            request.url.endsWith('.html')
          );
          
          for (const request of contentRequests) {
            const url = new URL(request.url);
            let pageName = url.pathname.split('/').pop().replace('.html', '');
            
            // Format the page name
            pageName = pageName.split('-').map(part => {
              if (part === 'i') return 'Section I';
              if (part === 'ii') return 'Section II';
              if (part === 'iii') return 'Section III';
              if (part === 'iv') return 'Section IV';
              return part.charAt(0).toUpperCase() + part.slice(1);
            }).join(' ');
            
            cachedPages.push({
              url: url.pathname,
              title: pageName
            });
          }
          
          // Check for index/home page
          const homePage = keys.find(request => 
            request.url.endsWith('/') || 
            request.url.endsWith('/index.html')
          );
          
          if (homePage) {
            cachedPages.unshift({
              url: '/',
              title: 'Home Page'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting cached pages:', error);
    }
    
    return cachedPages;
  }
}

// Initialize offline manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.offlineManager = new OfflineManager();
});
