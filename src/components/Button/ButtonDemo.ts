/**
 * Button Demo Component - TypeScript Version
 */
import { Button } from './Button';

/**
 * Demonstrates various button styles and states
 */
export class ButtonDemo {
  /**
   * Container element where buttons will be rendered
   */
  private container: HTMLElement;
  
  /**
   * Creates a new ButtonDemo instance
   * @param container - The container element to render buttons in
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }
  
  /**
   * Renders a set of example buttons in the container
   */
  render(): void {
    // Create primary button
    const primaryButton = new Button({
      text: 'Primary Button',
      onClick: () => console.log('Primary clicked')
    });
    
    // Create secondary button
    const secondaryButton = new Button({
      text: 'Secondary Button',
      variant: 'secondary',
      onClick: () => console.log('Secondary clicked')
    });
    
    // Create disabled button
    const disabledButton = new Button({
      text: 'Disabled Button',
      disabled: true
    });
    
    // Create button with icon
    const iconButton = new Button({
      text: 'Button with Icon',
      icon: '/assets/icons/star.svg',
      iconAlt: 'Star icon'
    });
    
    // Add buttons to container
    this.container.appendChild(primaryButton.render());
    this.container.appendChild(secondaryButton.render());
    this.container.appendChild(disabledButton.render());
    this.container.appendChild(iconButton.render());
  }
} 