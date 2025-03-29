/**
 * @jest-environment jsdom
 */

import Dialog from '../Dialog';
import { EVENTS } from '../../../constants';

describe('Dialog Component', () => {
  let dialog;
  
  beforeEach(() => {
    // Set up document body for testing
    document.body.innerHTML = '';
    
    // Create a basic dialog
    dialog = new Dialog({
      title: 'Test Dialog',
      content: 'This is a test dialog content',
      buttons: [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        { id: 'confirm', label: 'Confirm', type: 'primary' }
      ]
    });
  });
  
  afterEach(() => {
    // Clean up
    if (dialog) {
      dialog.destroy();
      dialog = null;
    }
  });
  
  test('should create a dialog instance', () => {
    expect(dialog).toBeInstanceOf(Dialog);
    expect(dialog.isOpen).toBe(false);
  });
  
  test('should open dialog and append to document', () => {
    dialog.open();
    
    expect(dialog.isOpen).toBe(true);
    expect(document.querySelector('.dialog-container')).not.toBeNull();
    expect(document.querySelector('.dialog-overlay')).not.toBeNull();
  });
  
  test('should close dialog and remove from document', () => {
    dialog.open();
    dialog.close();
    
    expect(dialog.isOpen).toBe(false);
    expect(document.querySelector('.dialog-container')).toBeNull();
    expect(document.querySelector('.dialog-overlay')).toBeNull();
  });
  
  test('should render title and content', () => {
    dialog.open();
    
    const title = document.querySelector('.dialog-title');
    const body = document.querySelector('.dialog-body');
    
    expect(title.textContent).toBe('Test Dialog');
    expect(body.innerHTML).toBe('This is a test dialog content');
  });
  
  test('should render buttons', () => {
    dialog.open();
    
    const buttons = document.querySelectorAll('.dialog-actions button');
    
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Cancel');
    expect(buttons[1].textContent).toBe('Confirm');
  });
  
  test('should emit events when opening and closing', () => {
    const openSpy = jest.fn();
    const closeSpy = jest.fn();
    
    document.addEventListener(EVENTS.DIALOG.OPENED, openSpy);
    document.addEventListener(EVENTS.DIALOG.CLOSED, closeSpy);
    
    dialog.open();
    expect(openSpy).toHaveBeenCalledTimes(1);
    
    dialog.close();
    expect(closeSpy).toHaveBeenCalledTimes(1);
    
    document.removeEventListener(EVENTS.DIALOG.OPENED, openSpy);
    document.removeEventListener(EVENTS.DIALOG.CLOSED, closeSpy);
  });
  
  test('should emit button click event', () => {
    const buttonClickSpy = jest.fn();
    
    dialog.on(EVENTS.DIALOG.BUTTON_CLICK, buttonClickSpy);
    dialog.open();
    
    const confirmButton = document.querySelector('.dialog-actions button:nth-child(2)');
    confirmButton.click();
    
    expect(buttonClickSpy).toHaveBeenCalledTimes(1);
    expect(buttonClickSpy.mock.calls[0][0].detail.buttonId).toBe('confirm');
  });
  
  test('should close when overlay is clicked if closeOnOverlayClick is true', () => {
    dialog = new Dialog({
      title: 'Test Dialog',
      closeOnOverlayClick: true
    });
    
    dialog.open();
    const overlay = document.querySelector('.dialog-overlay');
    overlay.click();
    
    expect(dialog.isOpen).toBe(false);
  });
  
  test('should not close when overlay is clicked if closeOnOverlayClick is false', () => {
    dialog = new Dialog({
      title: 'Test Dialog',
      closeOnOverlayClick: false
    });
    
    dialog.open();
    const overlay = document.querySelector('.dialog-overlay');
    overlay.click();
    
    expect(dialog.isOpen).toBe(true);
  });
  
  test('should update content', () => {
    dialog.open();
    dialog.setContent('Updated content');
    
    const body = document.querySelector('.dialog-body');
    expect(body.innerHTML).toBe('Updated content');
  });
  
  test('should update title', () => {
    dialog.open();
    dialog.setTitle('Updated Title');
    
    const title = document.querySelector('.dialog-title');
    expect(title.textContent).toBe('Updated Title');
  });
  
  test('should update buttons', () => {
    dialog.open();
    
    dialog.setButtons([
      { id: 'ok', label: 'OK', type: 'primary' }
    ]);
    
    const buttons = document.querySelectorAll('.dialog-actions button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toBe('OK');
  });
  
  test('should call onOpen and onClose callbacks', () => {
    const onOpenSpy = jest.fn();
    const onCloseSpy = jest.fn();
    
    dialog = new Dialog({
      title: 'Test Dialog',
      onOpen: onOpenSpy,
      onClose: onCloseSpy
    });
    
    dialog.open();
    expect(onOpenSpy).toHaveBeenCalledTimes(1);
    
    dialog.close();
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });
}); 