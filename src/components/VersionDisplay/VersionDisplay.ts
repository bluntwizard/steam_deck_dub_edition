/**
 * Grimoire
 * VersionDisplay Component
 * 
 * Displays version information for the application with expandable details.
 */
import styles from './VersionDisplay.module.css';

/**
 * Version information interface
 */
export interface VersionInfo {
  /**
   * Semantic version string (e.g., "1.2.3")
   */
  version: string;
  
  /**
   * Build number (optional)
   */
  buildNumber?: string;
  
  /**
   * Release date string (optional)
   */
  releaseDate?: string;
  
  /**
   * Git commit hash (optional)
   */
  commitHash?: string;
  
  /**
   * Branch name (optional)
   */
  branch?: string;
}

/**
 * Options for configuring the VersionDisplay component
 */
export interface VersionDisplayOptions {
  /**
   * Container element to render the version display
   */
  container: HTMLElement;
  
  /**
   * Version information to display
   */
  versionInfo: VersionInfo;
  
  /**
   * Custom CSS class name (optional)
   */
  className?: string;
  
  /**
   * Whether to start in expanded state (optional)
   */
  expanded?: boolean;
  
  /**
   * Whether to initialize automatically (optional)
   */
  autoInit?: boolean;
}

/**
 * VersionDisplay Component
 * Displays version information with expandable details
 */
export class VersionDisplay {
  /**
   * Container element
   */
  private container: HTMLElement;
  
  /**
   * Version information
   */
  private versionInfo: VersionInfo;
  
  /**
   * Custom CSS class name
   */
  private className: string;
  
  /**
   * Whether the details are expanded
   */
  private expanded: boolean;
  
  /**
   * The main element of the component
   */
  private element: HTMLElement | null = null;
  
  /**
   * Whether the component is initialized
   */
  private initialized: boolean = false;
  
  /**
   * Create a new VersionDisplay component
   */
  constructor(options: VersionDisplayOptions) {
    if (!options.container) {
      throw new Error('VersionDisplay: Container element is required');
    }
    
    if (!options.versionInfo || !options.versionInfo.version) {
      throw new Error('VersionDisplay: Version information is required');
    }
    
    this.container = options.container;
    this.versionInfo = options.versionInfo;
    this.className = options.className || '';
    this.expanded = options.expanded || false;
    
    // Auto-initialize if specified
    if (options.autoInit !== false) {
      this.render();
    }
  }
  
  /**
   * Format version information into readable HTML
   */
  formatVersionInfo(info: VersionInfo): string {
    let html = `<div class="${styles.detailItem}">
      <span class="${styles.detailLabel}">Version:</span>
      <span class="${styles.detailValue}">${info.version}</span>
    </div>`;
    
    if (info.buildNumber) {
      html += `<div class="${styles.detailItem}">
        <span class="${styles.detailLabel}">Build:</span>
        <span class="${styles.detailValue}">${info.buildNumber}</span>
      </div>`;
    }
    
    if (info.releaseDate) {
      html += `<div class="${styles.detailItem}">
        <span class="${styles.detailLabel}">Released:</span>
        <span class="${styles.detailValue}">${info.releaseDate}</span>
      </div>`;
    }
    
    if (info.commitHash) {
      html += `<div class="${styles.detailItem}">
        <span class="${styles.detailLabel}">Commit:</span>
        <span class="${styles.detailValue}">${info.commitHash.substring(0, 7)}</span>
      </div>`;
    }
    
    if (info.branch) {
      html += `<div class="${styles.detailItem}">
        <span class="${styles.detailLabel}">Branch:</span>
        <span class="${styles.detailValue}">${info.branch}</span>
      </div>`;
    }
    
    return html;
  }
  
  /**
   * Update version information and re-render
   */
  updateVersionInfo(newInfo: VersionInfo): void {
    this.versionInfo = newInfo;
    
    // Update the displayed information if element exists
    if (this.element) {
      const versionNumber = this.element.querySelector(`.${styles.versionNumber}`);
      if (versionNumber) {
        versionNumber.textContent = newInfo.version;
      }
      
      const versionDetails = this.element.querySelector(`.${styles.versionDetails}`);
      if (versionDetails) {
        versionDetails.innerHTML = this.formatVersionInfo(newInfo);
      }
    }
  }
  
  /**
   * Toggle expanded state
   */
  private toggleExpanded(): void {
    this.expanded = !this.expanded;
    
    if (this.element) {
      if (this.expanded) {
        this.element.classList.add(styles.expanded);
      } else {
        this.element.classList.remove(styles.expanded);
      }
    }
  }
  
  /**
   * Handle click events
   */
  private handleClick = (): void => {
    this.toggleExpanded();
  };
  
  /**
   * Render the version display
   */
  render(): void {
    if (this.element) {
      // Already rendered
      return;
    }
    
    // Create main element
    this.element = document.createElement('div');
    this.element.className = `${styles.versionDisplay} version-display ${this.className}`;
    
    if (this.expanded) {
      this.element.classList.add(styles.expanded);
    }
    
    // Create header with version number
    const header = document.createElement('div');
    header.className = styles.versionHeader;
    
    const icon = document.createElement('div');
    icon.className = styles.versionIcon;
    icon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18.5C11.31 18.5 10.75 17.94 10.75 17.25C10.75 16.56 11.31 16 12 16C12.69 16 13.25 16.56 13.25 17.25C13.25 17.94 12.69 18.5 12 18.5ZM13 14H11V7H13V14Z" fill="currentColor"/>
      </svg>
    `;
    
    const versionNumber = document.createElement('span');
    versionNumber.className = styles.versionNumber;
    versionNumber.textContent = this.versionInfo.version;
    
    header.appendChild(icon);
    header.appendChild(versionNumber);
    
    // Create details section
    const details = document.createElement('div');
    details.className = styles.versionDetails;
    details.innerHTML = this.formatVersionInfo(this.versionInfo);
    
    // Assemble component
    this.element.appendChild(header);
    this.element.appendChild(details);
    
    // Add event listener
    this.element.addEventListener('click', this.handleClick);
    
    // Add to container
    this.container.appendChild(this.element);
    
    this.initialized = true;
  }
  
  /**
   * Clean up event listeners and remove from DOM
   */
  destroy(): void {
    if (this.element) {
      // Remove event listener
      this.element.removeEventListener('click', this.handleClick);
      
      // Remove from DOM
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      
      this.element = null;
    }
    
    this.initialized = false;
  }
} 