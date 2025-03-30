/**
 * Type definitions for the HelpCenter component
 */

/**
 * Help topic structure
 */
export interface HelpTopic {
  /**
   * Unique identifier for the topic
   */
  id: string;
  
  /**
   * Display title for the topic
   */
  title: string;
  
  /**
   * Optional icon for the topic (text or HTML)
   */
  icon?: string;
  
  /**
   * Topic content - can be HTML string or a function returning content
   */
  content?: string | (() => string | Promise<string>);
  
  /**
   * Whether the topic content is already loaded
   */
  loaded?: boolean;
  
  /**
   * Optional array of FAQ items
   */
  faqs?: HelpFAQ[];
  
  /**
   * Optional keywords for search functionality
   */
  keywords?: string[];
  
  /**
   * Optional description for search results
   */
  description?: string;
}

/**
 * FAQ item structure
 */
export interface HelpFAQ {
  /**
   * Question text
   */
  question: string;
  
  /**
   * Answer text (HTML allowed)
   */
  answer: string;
  
  /**
   * Whether the FAQ is expanded by default
   */
  expanded?: boolean;
}

/**
 * Contextual help options
 */
export interface ContextualHelpOptions {
  /**
   * Position of the help tooltip
   */
  position?: 'top' | 'right' | 'bottom' | 'left';
  
  /**
   * Auto-hide delay in milliseconds
   */
  hideAfter?: number;
  
  /**
   * Custom classes to add to the tooltip
   */
  className?: string;
  
  /**
   * Whether to show a close button
   */
  showCloseButton?: boolean;
  
  /**
   * Custom offset from the target element
   */
  offset?: number;
}

/**
 * HelpCenter configuration options
 */
export interface HelpCenterOptions {
  /**
   * Container element for the help center
   */
  container?: HTMLElement;
  
  /**
   * Title for the help center
   */
  title?: string;
  
  /**
   * Position for the help button
   */
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /**
   * Whether to show a floating help button
   */
  showButton?: boolean;
  
  /**
   * Array of help topics
   */
  topics?: HelpTopic[];
  
  /**
   * Default selected topic ID
   */
  defaultTopic?: string | null;
  
  /**
   * Whether to enable search functionality
   */
  searchEnabled?: boolean;
  
  /**
   * Whether to initialize automatically
   */
  autoInit?: boolean;
}

/**
 * Search result item structure
 */
export interface SearchResult {
  /**
   * Topic ID the result belongs to
   */
  topicId: string;
  
  /**
   * Topic title
   */
  title: string;
  
  /**
   * Result description
   */
  description: string;
  
  /**
   * Type of result (topic, faq, or content)
   */
  type: 'topic' | 'faq' | 'content';
  
  /**
   * Original FAQ question if type is 'faq'
   */
  question?: string;
  
  /**
   * Match score for ranking
   */
  score?: number;
}

/**
 * HelpCenter interface
 */
export interface HelpCenterInterface {
  /**
   * Initialize the help center
   */
  initialize(): HelpCenterInterface;
  
  /**
   * Show the help center
   */
  show(): HelpCenterInterface;
  
  /**
   * Hide the help center
   */
  hide(): HelpCenterInterface;
  
  /**
   * Toggle visibility of the help center
   */
  toggle(): HelpCenterInterface;
  
  /**
   * Load a specific help topic
   */
  loadTopic(topicId: string): void;
  
  /**
   * Add a new help topic
   */
  addTopic(topic: HelpTopic): HelpCenterInterface;
  
  /**
   * Remove a help topic
   */
  removeTopic(topicId: string): boolean;
  
  /**
   * Get all available topics
   */
  getTopics(): HelpTopic[];
  
  /**
   * Show contextual help for a specific element
   */
  showContextualHelp(
    element: HTMLElement, 
    helpText: string, 
    options?: ContextualHelpOptions
  ): HTMLElement;
  
  /**
   * Cleanup and remove event listeners
   */
  destroy(): void;
} 