/**
 * Grimoire
 * SVG Header Type Definitions
 */

/**
 * Options for configuring the SvgHeader component
 */
export interface SvgHeaderOptions {
  /**
   * Path to the SVG file
   * @default 'sdde.svg'
   */
  svgPath?: string;

  /**
   * Text to show if SVG fails to load
   * @default 'Grimoire'
   */
  fallbackText?: string;

  /**
   * Accessibility label for the SVG
   * @default 'Grimoire Logo'
   */
  ariaLabel?: string;

  /**
   * Container element to append the header to
   * @default document.body
   */
  container?: HTMLElement;

  /**
   * Path to external CSS for the SVG
   * @default 'svg-header-styles.css'
   */
  cssPath?: string;

  /**
   * CSS variables to pass to the SVG
   * @default ['--color-main', '--color-primary', '--color-secondary', '--color-background', '--color-link', '--color-link-active']
   */
  cssVariables?: string[];

  /**
   * Whether to initialize automatically
   * @default true
   */
  autoInit?: boolean;
}

/**
 * Event details for SVG load events
 */
export interface SvgLoadEventDetail {
  /**
   * Reference to the SvgHeader instance
   */
  svgHeader: any;
  
  /**
   * The SVG document that was loaded
   */
  svgDoc: Document;
}

/**
 * Event details for SVG error events
 */
export interface SvgErrorEventDetail {
  /**
   * Reference to the SvgHeader instance
   */
  svgHeader: any;
} 