/**
 * Offline Manager Service
 * Handles offline functionality for the Grimoire Guide, including:
 * - Service worker registration and updates
 * - Cache management for offline content
 * - UI for showing offline status
 */

interface CacheStatistics {
  totalItems: number;
  contentItems: number;
  assetItems: number;
}

interface CachedPage {
  url: string;
  title: string;
}

class OfflineManager {
  private config: {
    cacheVersion: string;
    notificationDuration: number;
  };
  private serviceWorkerRegistration: ServiceWorkerRegistration | null;
  private statusButton: HTMLElement | null;
  private initialized: boolean;

  constructor() {
    this.config = {
      cacheVersion: 'v1',
      notificationDuration: 3000 // ms
    };
    
    this.serviceWorkerRegistration = null;
    this.statusButton = null;
    this.initialized = false;
    
    this.init();
  }
  
  /**
   * Initialize offline functionality
   */
  private async init(): Promise<void> {
    // Only initialize once
    if (this.initialized) return;
    this.initialized = true;
    
    try {
      await this.registerServiceWorker();
      this.createOfflineStatusButton();
      this.setupEventListeners();
      this.updateCacheStatus();
    } catch (error) {
      console.error('Failed to initialize offline manager:', error);
    }
  }
  
  /**
   * Register service worker for offline support
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser');
      return;
    }
    
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('Service worker registered successfully:', this.serviceWorkerRegistration);
      
      // Add update handling
      this.checkForServiceWorkerUpdates();
      
      // Set up message handling for the service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
  
  /**
   * Check for service worker updates
   */
  private async checkForServiceWorkerUpdates(): Promise<void> {
    if (!this.serviceWorkerRegistration) return;
    
    try {
      // Check for updates every hour
      setInterval(async () => {
        await this.serviceWorkerRegistration?.update();
      }, 60 * 60 * 1000);
      
      // Also check for updates when the page gets focus
      window.addEventListener('focus', async () => {
        await this.serviceWorkerRegistration?.update();
      });
    } catch (error) {
      console.error('Error checking for service worker updates:', error);
    }
  }
  
  /**
   * Create the offline status button
   */
  private createOfflineStatusButton(): void {
    if (document.getElementById('offline-status-button')) return;
    
    // Create button element
    this.statusButton = document.createElement('div');
    this.statusButton.id = 'offline-status-button';
    this.statusButton.title = 'Offline Status';
    this.statusButton.setAttribute('aria-label', 'Offline Status');
    this.statusButton.setAttribute('role', 'button');
    this.statusButton.setAttribute('tabindex', '0');
    
    // Style the button
    this.statusButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--dracula-background, #282a36);
      border: 2px solid var(--dracula-comment, #6272a4);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;
    
    // Add hover effect
    this.statusButton.addEventListener('mouseenter', () => {
      if (this.statusButton) {
        this.statusButton.style.transform = 'scale(1.1)';
      }
    });
    
    this.statusButton.addEventListener('mouseleave', () => {
      if (this.statusButton) {
        this.statusButton.style.transform = 'scale(1)';
      }
    });
    
    // Add click handler to show cache status
    this.statusButton.addEventListener('click', this.showCacheStatus.bind(this));
    
    // Add keyboard accessibility
    this.statusButton.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showCacheStatus();
      }
    });
    
    // Add to DOM
    document.body.appendChild(this.statusButton);
    
    // Initial update based on online status
    this.updateOfflineIcon(navigator.onLine ? 'online' : 'offline');
  }
  
  /**
   * Set up event listeners for online/offline events
   */
  private setupEventListeners(): void {
    // Handle online/offline events
    window.addEventListener('online', () => {
      this.updateOfflineIcon('online');
      this.showStatusNotification('You are back online', 'online');
    });
    
    window.addEventListener('offline', () => {
      this.updateOfflineIcon('offline');
      this.showStatusNotification('You are offline - showing cached content', 'offline');
    });
  }
  
  /**
   * Handle messages from the service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const data = event.data;
    
    if (!data) return;
    
    if (data.type === 'CACHE_UPDATED') {
      this.updateCacheStatus();
      
      if (data.message) {
        this.showStatusNotification(data.message, 'online');
      }
    }
  }
  
  /**
   * Show a notification about the offline status
   */
  private showStatusNotification(message: string, status: 'online' | 'offline'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'offline-status-notification';
    
    // Style notification
    notification.style.cssText = `
      position: fixed;
      bottom: 70px;
      left: 20px;
      padding: 10px 15px;
      background-color: var(--dracula-background, #282a36);
      color: var(--dracula-foreground, #f8f8f2);
      border-radius: 8px;
      border-left: 4px solid ${status === 'online' ? 'var(--dracula-green, #50fa7b)' : 'var(--dracula-orange, #ffb86c)'};
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s forwards;
    `;
    
    // Add notification icon based on status
    const iconColor = status === 'online' ? 'var(--dracula-green, #50fa7b)' : 'var(--dracula-orange, #ffb86c)';
    const icon = status === 'online' ? 
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><circle cx="12" cy="20" r="1"></circle></svg>' : 
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><circle cx="12" cy="20" r="1"></circle></svg>';
    
    // Add the message with icon
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="color: ${iconColor}; margin-right: 10px;">${icon}</span>
        <span>${message}</span>
      </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s forwards';
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, this.config.notificationDuration);
  }
  
  /**
   * Update the offline status icon
   */
  private updateOfflineIcon(status: 'online' | 'offline'): void {
    if (!this.statusButton) return;
    
    // Clear previous content
    this.statusButton.innerHTML = '';
    
    const iconColor = status === 'online' ? 'var(--dracula-green, #50fa7b)' : 'var(--dracula-orange, #ffb86c)';
    this.statusButton.style.borderColor = iconColor;
    
    // Update the tooltip
    this.statusButton.title = status === 'online' ? 
      'Online - Content available offline' : 
      'Offline - Using cached content';
      
    this.statusButton.setAttribute('aria-label', this.statusButton.title);
    
    // Create the icon based on status
    const icon = document.createElement('div');
    icon.innerHTML = status === 'online' ? 
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><circle cx="12" cy="20" r="1"></circle></svg>' : 
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><circle cx="12" cy="20" r="1"></circle></svg>';
    
    icon.style.color = iconColor;
    
    this.statusButton.appendChild(icon);
  }
  
  /**
   * Update cache status button based on cached content
   */
  async updateCacheStatus(): Promise<void> {
    if (!this.statusButton) return;
    
    try {
      const stats = await this.getCacheStats();
      
      if (stats.totalItems > 0) {
        // Update the icon to show number of cached items
        this.statusButton.innerHTML = '';
        
        const countElement = document.createElement('div');
        countElement.textContent = stats.contentItems.toString();
        countElement.style.cssText = `
          font-size: 14px;
          font-weight: bold;
          color: var(--dracula-foreground, #f8f8f2);
        `;
        
        this.statusButton.appendChild(countElement);
        
        // Update border color based on online status
        const borderColor = navigator.onLine ? 
          'var(--dracula-green, #50fa7b)' : 
          'var(--dracula-orange, #ffb86c)';
        this.statusButton.style.borderColor = borderColor;
        
        // Update the title
        this.statusButton.title = `${stats.contentItems} content pages and ${stats.assetItems} assets cached for offline use. Click to view details.`;
        this.statusButton.setAttribute('aria-label', this.statusButton.title);
      } else {
        // No cached items, show the default icon
        this.updateOfflineIcon(navigator.onLine ? 'online' : 'offline');
      }
    } catch (error) {
      console.error('Error updating cache status:', error);
      this.updateOfflineIcon(navigator.onLine ? 'online' : 'offline');
    }
  }
  
  /**
   * Get statistics about cached content
   */
  private async getCacheStats(): Promise<CacheStatistics> {
    const stats: CacheStatistics = {
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
        
        // Count content pages
        const contentItems = keys.filter(request => 
          request.url.includes('/content/') || 
          request.url.endsWith('.html') || 
          request.url.endsWith('/')
        );
        stats.contentItems += contentItems.length;
        
        // The rest are assets
        stats.assetItems += keys.length - contentItems.length;
      }
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }
    
    return stats;
  }
  
  /**
   * Show detailed cache status dialog
   */
  private async showCacheStatus(): Promise<void> {
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
    const clickOutsideHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!dialog.contains(target) && target.id !== 'cache-status-button') {
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
    const keyHandler = (e: KeyboardEvent) => {
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
      const closeBtn = document.getElementById('close-cache-dialog');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeDialog);
      }
      
      const clearBtn = document.getElementById('clear-cache-button');
      if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
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
              console.error('Error clearing cache:', error instanceof Error ? error : new Error(String(error)));
              alert('Failed to clear cache: ' + (error instanceof Error ? error.message : String(error)));
            }
          }
        });
      }
      
    } catch (error) {
      console.error('Error showing cache status:', error);
      dialog.innerHTML = `
        <h3 style="color: var(--dracula-purple, #bd93f9); margin-top: 0;">Offline Content Status</h3>
        <p style="color: var(--dracula-red, #ff5555);">Error loading cache information: ${error instanceof Error ? error.message : String(error)}</p>
        <button id="close-cache-dialog" style="background: var(--dracula-comment, #6272a4); color: var(--dracula-foreground, #f8f8f2); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: block; margin: 20px auto;">Close</button>
      `;
      
      const closeBtn = document.getElementById('close-cache-dialog');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeDialog);
      }
    }
  }
  
  /**
   * Get list of cached content pages
   */
  private async getCachedPages(): Promise<CachedPage[]> {
    const cachedPages: CachedPage[] = [];
    
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
            let pageName = url.pathname.split('/').pop()?.replace('.html', '') || '';
            
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
  (window as any).offlineManager = new OfflineManager();
}); 