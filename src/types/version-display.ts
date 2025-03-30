/**
 * Steam Deck DUB Edition
 * VersionDisplay Component Types
 */

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
 * VersionDisplay component interface
 */
export interface VersionDisplayInterface {
  /**
   * Format version information into readable HTML
   */
  formatVersionInfo(info: VersionInfo): string;
  
  /**
   * Update version information and re-render
   */
  updateVersionInfo(newInfo: VersionInfo): void;
  
  /**
   * Render the version display
   */
  render(): void;
  
  /**
   * Clean up event listeners and remove from DOM
   */
  destroy(): void;
} 