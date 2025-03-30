/**
 * @jest-environment jsdom
 */

import { Button } from '../../components/Button';
import { ButtonOptions } from '../../types/button';

describe('Button Component', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  
  test('renders primary button correctly', () => {
    const options: ButtonOptions = {
      text: 'Test Button'
    };
    
    const button = new Button(options);
    const element = button.render();
    document.body.appendChild(element);
    
    expect(element.tagName).toBe('BUTTON');
    expect(element.textContent).toBe('Test Button');
    expect(element.classList.contains('primary')).toBe(true);
  });
  
  test('renders secondary button correctly', () => {
    const options: ButtonOptions = {
      text: 'Secondary Button',
      variant: 'secondary'
    };
    
    const button = new Button(options);
    const element = button.render();
    document.body.appendChild(element);
    
    expect(element.textContent).toBe('Secondary Button');
    expect(element.classList.contains('secondary')).toBe(true);
    expect(element.classList.contains('primary')).toBe(false);
  });
  
  test('renders disabled button correctly', () => {
    const options: ButtonOptions = {
      text: 'Disabled Button',
      disabled: true
    };
    
    const button = new Button(options);
    const element = button.render();
    document.body.appendChild(element);
    
    expect(element.disabled).toBe(true);
    expect(element.classList.contains('disabled')).toBe(true);
  });
  
  test('applies custom classes', () => {
    const options: ButtonOptions = {
      text: 'Custom Button',
      className: 'custom-class another-class'
    };
    
    const button = new Button(options);
    const element = button.render();
    
    expect(element.classList.contains('custom-class')).toBe(true);
    expect(element.classList.contains('another-class')).toBe(true);
  });
  
  test('triggers click event handler', () => {
    const mockClickHandler = jest.fn();
    const options: ButtonOptions = {
      text: 'Clickable Button',
      onClick: mockClickHandler
    };
    
    const button = new Button(options);
    const element = button.render();
    document.body.appendChild(element);
    
    element.click();
    
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });
  
  test('applies correct aria attributes', () => {
    const options: ButtonOptions = {
      text: 'Accessible Button',
      ariaLabel: 'Accessible Button Label',
      ariaExpanded: 'true',
      ariaControls: 'controlled-element'
    };
    
    const button = new Button(options);
    const element = button.render();
    
    expect(element.getAttribute('aria-label')).toBe('Accessible Button Label');
    expect(element.getAttribute('aria-expanded')).toBe('true');
    expect(element.getAttribute('aria-controls')).toBe('controlled-element');
  });
  
  test('renders with an icon', () => {
    const options: ButtonOptions = {
      text: 'Icon Button',
      icon: 'settings'
    };
    
    const button = new Button(options);
    const element = button.render();
    
    const iconElement = element.querySelector('.icon');
    expect(iconElement).not.toBeNull();
  });
}); 