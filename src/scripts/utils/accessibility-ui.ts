/**
 * Accessibility UI component for Grimoire
 * Provides user interface elements for controlling accessibility features
 * 
 * @module AccessibilityUI
 * @author Grimoire Team
 * @version 1.0.0
 */

import accessibilityManager from './accessibility';

/**
 * Configuration options for accessibility UI
 */
interface AccessibilityUIOptions {
  containerSelector?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLabels?: boolean;
  initiallyExpanded?: boolean;
}

/**
 * Accessibility feature toggle button configuration
 */
interface FeatureToggle {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  isActive: () => boolean;
}

/**
 * Manages accessibility UI controls and interactions
 */
class AccessibilityUI {
  /**
   * Whether the UI has been initialized
   */
  private initialized: boolean = false;
  
  /**
   * Reference to the accessibility panel element
   */
  private accessibilityPanel: HTMLElement | null = null;
  
  /**
   * Configuration options
   */
  private options: AccessibilityUIOptions;
  
  /**
   * List of feature toggles
   */
  private featureToggles: FeatureToggle[] = [];
  
  /**
   * Creates a new AccessibilityUI instance
   * @param options Configuration options
   */
  constructor(options: AccessibilityUIOptions = {}) {
    this.options = {
      containerSelector: 'body',
      position: 'bottom-right',
      showLabels: true,
      initiallyExpanded: false,
      ...options
    };
  }

  /**
   * Initialize the accessibility UI
   * @returns {void}
   */
  initialize(): void {
    if (this.initialized) return;
    
    console.log('Initializing accessibility UI...');
    
    // Initialize accessibility manager first
    accessibilityManager.initialize();
    
    // Find or create accessibility panel
    this.accessibilityPanel = document.getElementById('accessibility-panel');
    
    if (!this.accessibilityPanel) {
      this.createAccessibilityPanel();
    }
    
    // Register default features
    this.registerDefaultFeatures();
    
    // Render features
    this.renderFeatureToggles();
    
    // Add event listeners
    this.addEventListeners();
    
    this.initialized = true;
  }
  
  /**
   * Create the accessibility panel element
   */
  private createAccessibilityPanel(): void {
    this.accessibilityPanel = document.createElement('div');
    this.accessibilityPanel.id = 'accessibility-panel';
    this.accessibilityPanel.className = `accessibility-panel ${this.options.position}`;
    this.accessibilityPanel.setAttribute('aria-label', 'Accessibility Controls');
    this.accessibilityPanel.setAttribute('role', 'region');
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'accessibility-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle accessibility panel');
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v4"></path>
        <path d="M12 16h.01"></path>
      </svg>
    `;
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'accessibility-content';
    
    if (!this.options.initiallyExpanded) {
      contentContainer.style.display = 'none';
    }
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Accessibility Options';
    contentContainer.appendChild(title);
    
    // Create features container
    const featuresContainer = document.createElement('div');
    featuresContainer.className = 'accessibility-features';
    contentContainer.appendChild(featuresContainer);
    
    // Add toggle and content to panel
    this.accessibilityPanel.appendChild(toggleButton);
    this.accessibilityPanel.appendChild(contentContainer);
    
    // Add to DOM
    const container = document.querySelector(this.options.containerSelector || 'body');
    if (container) {
      container.appendChild(this.accessibilityPanel);
    } else {
      document.body.appendChild(this.accessibilityPanel);
    }
  }
  
  /**
   * Register default accessibility features
   */
  private registerDefaultFeatures(): void {
    // High contrast mode
    this.registerFeature({
      id: 'high-contrast',
      label: 'High Contrast',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v20M2 12h20"></path></svg>',
      description: 'Enable high contrast mode for better visibility',
      action: () => accessibilityManager.setHighContrast(!accessibilityManager.getPreferences().highContrast),
      isActive: () => accessibilityManager.getPreferences().highContrast
    });
    
    // Font size increase
    this.registerFeature({
      id: 'font-size',
      label: 'Larger Text',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
      description: 'Increase font size for better readability',
      action: () => {
        const currentSize = accessibilityManager.getPreferences().fontSize;
        const sizes: Array<'small' | 'medium' | 'large' | 'xlarge'> = ['small', 'medium', 'large', 'xlarge'];
        const currentIndex = sizes.indexOf(currentSize);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        accessibilityManager.setFontSize(nextSize);
      },
      isActive: () => accessibilityManager.getPreferences().fontSize !== 'small'
    });
    
    // Reduced motion
    this.registerFeature({
      id: 'reduced-motion',
      label: 'Reduce Motion',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>',
      description: 'Reduce animations and motion effects',
      action: () => {
        document.body.classList.toggle('reduced-motion');
        // Since this might not be in the accessibility manager, we'll handle it directly
      },
      isActive: () => document.body.classList.contains('reduced-motion')
    });
    
    // Dyslexic font mode
    this.registerFeature({
      id: 'dyslexic-font',
      label: 'Dyslexic Font',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
      description: 'Use font that is easier to read for people with dyslexia',
      action: () => accessibilityManager.setDyslexicFont(!accessibilityManager.getPreferences().dyslexicFont),
      isActive: () => accessibilityManager.getPreferences().dyslexicFont
    });
  }
  
  /**
   * Register a new accessibility feature
   * @param feature The feature to register
   */
  registerFeature(feature: FeatureToggle): void {
    // Check if feature already exists
    const existingIndex = this.featureToggles.findIndex(f => f.id === feature.id);
    
    if (existingIndex >= 0) {
      // Update existing feature
      this.featureToggles[existingIndex] = feature;
    } else {
      // Add new feature
      this.featureToggles.push(feature);
    }
    
    // Re-render if already initialized
    if (this.initialized && this.accessibilityPanel) {
      this.renderFeatureToggles();
    }
  }
  
  /**
   * Render the feature toggles in the panel
   */
  private renderFeatureToggles(): void {
    if (!this.accessibilityPanel) return;
    
    const featuresContainer = this.accessibilityPanel.querySelector('.accessibility-features');
    if (!featuresContainer) return;
    
    // Clear existing toggles
    featuresContainer.innerHTML = '';
    
    // Add each feature toggle
    this.featureToggles.forEach(feature => {
      const toggle = document.createElement('button');
      toggle.className = `feature-toggle ${feature.isActive() ? 'active' : ''}`;
      toggle.id = `accessibility-toggle-${feature.id}`;
      toggle.setAttribute('aria-pressed', feature.isActive().toString());
      toggle.setAttribute('aria-label', feature.description);
      toggle.setAttribute('title', feature.description);
      
      // Add icon if available
      if (feature.icon) {
        const iconContainer = document.createElement('span');
        iconContainer.className = 'feature-icon';
        iconContainer.innerHTML = feature.icon;
        toggle.appendChild(iconContainer);
      }
      
      // Add label if enabled
      if (this.options.showLabels) {
        const label = document.createElement('span');
        label.className = 'feature-label';
        label.textContent = feature.label;
        toggle.appendChild(label);
      }
      
      // Add event listener
      toggle.addEventListener('click', () => {
        feature.action();
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-pressed', feature.isActive().toString());
      });
      
      featuresContainer.appendChild(toggle);
    });
  }
  
  /**
   * Add event listeners to the panel
   */
  private addEventListeners(): void {
    if (!this.accessibilityPanel) return;
    
    const toggleButton = this.accessibilityPanel.querySelector('.accessibility-toggle');
    const contentContainer = this.accessibilityPanel.querySelector('.accessibility-content') as HTMLElement;
    
    if (toggleButton && contentContainer) {
      toggleButton.addEventListener('click', () => {
        const isExpanded = contentContainer.style.display !== 'none';
        contentContainer.style.display = isExpanded ? 'none' : 'block';
        toggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
      });
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (event) => {
      if (this.accessibilityPanel && 
          !this.accessibilityPanel.contains(event.target as Node) && 
          contentContainer && 
          contentContainer.style.display !== 'none') {
        contentContainer.style.display = 'none';
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && 
          contentContainer && 
          contentContainer.style.display !== 'none') {
        contentContainer.style.display = 'none';
        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
}

// Export singleton instance
const accessibilityUI = new AccessibilityUI();
export default accessibilityUI; 