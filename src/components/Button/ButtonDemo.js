import { Button } from './Button';

export class ButtonDemo {
  constructor(container) {
    this.container = container;
    this.render();
  }
  
  render() {
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