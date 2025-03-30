/**
 * Dialog component type definitions
 */

/**
 * Dialog action button
 */
export interface DialogAction {
  /**
   * Button text
   */
  text: string;
  
  /**
   * Whether this is a primary action button
   */
  primary?: boolean;
  
  /**
   * Whether this is a danger/destructive action button
   */
  danger?: boolean;
  
  /**
   * Click handler for the action
   * Return false to prevent dialog from closing
   */
  onClick?: () => boolean | void;
}

/**
 * Dialog configuration options
 */
export interface DialogOptions {
  /**
   * Dialog title
   */
  title?: string;
  
  /**
   * Dialog content - can be HTML string or HTMLElement
   */
  content?: string | HTMLElement;
  
  /**
   * Whether to close the dialog when the Escape key is pressed
   * @default true
   */
  closeOnEscape?: boolean;
  
  /**
   * Whether to close the dialog when clicking outside of it
   * @default true
   */
  closeOnOutsideClick?: boolean;
  
  /**
   * Whether to show the close (X) button
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Callback function when dialog is closed
   */
  onClose?: () => void;
  
  /**
   * Fixed width of the dialog
   * @example "400px"
   */
  width?: string | null;
  
  /**
   * Maximum width of the dialog
   * @default "500px"
   */
  maxWidth?: string;
  
  /**
   * Dialog action buttons
   */
  actions?: DialogAction[];
}

/**
 * Dialog interface
 */
export interface DialogInterface {
  /**
   * Creates the dialog DOM elements
   */
  create(): void;
  
  /**
   * Shows the dialog
   */
  show(): DialogInterface;
  
  /**
   * Closes the dialog
   */
  close(): DialogInterface;
  
  /**
   * Destroys the dialog and removes it from the DOM
   */
  destroy(): void;
  
  /**
   * Update dialog content
   * @param content - New content (string or HTMLElement)
   */
  setContent(content: string | HTMLElement): DialogInterface;
  
  /**
   * Update dialog title
   * @param title - New title
   */
  setTitle(title: string): DialogInterface;
} 