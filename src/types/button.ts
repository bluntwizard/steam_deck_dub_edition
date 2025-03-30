/**
 * Button Component Types
 * Steam Deck DUB Edition Guide
 */

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'info' | 'link';

/**
 * Button size options
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button icon position
 */
export type IconPosition = 'left' | 'right';

/**
 * Button component options
 */
export interface ButtonOptions {
  /** Text content of the button */
  text: string;
  
  /** CSS class names to add to the button */
  className?: string;
  
  /** Button variant style */
  variant?: ButtonVariant;
  
  /** Button size */
  size?: ButtonSize;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Icon name/identifier to use */
  icon?: string;
  
  /** Position of the icon relative to text */
  iconPosition?: IconPosition;
  
  /** Click event handler */
  onClick?: (event: MouseEvent) => void;
  
  /** Whether the button is full width */
  fullWidth?: boolean;
  
  /** Whether the button should have a loading state */
  loading?: boolean;
  
  /** Button type attribute (submit, button, reset) */
  type?: 'submit' | 'button' | 'reset';
  
  /** Button ID attribute */
  id?: string;
  
  /** Accessible name for the button */
  ariaLabel?: string;
  
  /** Indicates if the button controls another element */
  ariaControls?: string;
  
  /** Indicates the expanded state of the controlled element */
  ariaExpanded?: string;
  
  /** Indicates the pressed state of a toggle button */
  ariaPressed?: string;
  
  /** Additional data attributes to add to the button */
  dataAttributes?: Record<string, string>;
} 