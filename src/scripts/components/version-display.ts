/**
 * Version Display Component for Steam Deck DUB Edition
 * Shows the current application version in the UI
 */

// Import electron's ipcRenderer for version retrieval
const { ipcRenderer } = require('electron');

/**
 * VersionDisplay class to manage the version display element
 */
class VersionDisplay {
  private element: HTMLDivElement | null;
  private version: string | null;
  private initialized: boolean;

  constructor() {
    this.element = null;
    this.version = null;
    this.initialized = false;
  }

  /**
   * Initialize the version display
   * Retrieves version and creates display element
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Get the current version
    this.version = await ipcRenderer.invoke('get-version');
    
    // Create version display element
    this.element = document.createElement('div');
    this.element.className = 'version-display';
    this.element.innerHTML = `
      <span class="version-text">v${this.version}</span>
    `;
    
    // Add hover effect to show full version
    this.element.addEventListener('mouseenter', () => {
      if (this.element) {
        this.element.classList.add('expanded');
      }
    });
    
    this.element.addEventListener('mouseleave', () => {
      if (this.element) {
        this.element.classList.remove('expanded');
      }
    });

    // Add to the page
    document.body.appendChild(this.element);

    this.initialized = true;
  }
}

// Create singleton instance
const versionDisplay = new VersionDisplay();

// Export the singleton - using ES module format
export default versionDisplay; 