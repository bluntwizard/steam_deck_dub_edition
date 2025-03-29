/**
 * @jest-environment jsdom
 */
import KeyboardShortcuts from '../../components/KeyboardShortcuts';

// Mock DOM implementation
document.createElement = jest.fn().mockImplementation(tag => {
  const element = {
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    children: [],
    innerHTML: '',
    textContent: '',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    setAttribute: jest.fn(),
    appendChild: jest.fn(child => {
      element.children.push(child);
      return child;
    }),
    contains: jest.fn(() => false)
  };
  return element;
});

document.body = {
  appendChild: jest.fn(),
  contains: jest.fn(),
  querySelector: jest.fn()
};

document.addEventListener = jest.fn();
document.removeEventListener = jest.fn();
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn(() => []);

// Mock activeElement for isInputFocused tests
Object.defineProperty(document, 'activeElement', {
  value: { tagName: 'DIV', isContentEditable: false },
  writable: true
});

describe('KeyboardShortcuts Component', () => {
  let keyboardShortcuts;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance before each test
    keyboardShortcuts = new KeyboardShortcuts();
  });
  
  test('should initialize with default shortcuts', () => {
    // Check default shortcuts are set
    expect(keyboardShortcuts.shortcuts).toHaveLength(6);
    expect(keyboardShortcuts.shortcuts[0]).toEqual({ keys: ['/'], description: 'Focus search box' });
    expect(keyboardShortcuts.shortcuts[1]).toEqual({ keys: ['?'], description: 'Show/hide keyboard shortcuts' });
    expect(keyboardShortcuts.isVisible).toBe(false);
    expect(keyboardShortcuts.dialogElement).toBeNull();
  });
  
  test('should merge custom shortcuts during initialization', () => {
    // Custom shortcuts to add
    const customShortcuts = [
      { keys: ['Ctrl', 'S'], description: 'Save document' },
      { keys: ['Ctrl', 'P'], description: 'Print page' }
    ];
    
    // Initialize with custom shortcuts
    keyboardShortcuts.init({ shortcuts: customShortcuts });
    
    // Check if custom shortcuts were added
    expect(keyboardShortcuts.shortcuts).toHaveLength(8);
    expect(keyboardShortcuts.shortcuts[6]).toEqual(customShortcuts[0]);
    expect(keyboardShortcuts.shortcuts[7]).toEqual(customShortcuts[1]);
    
    // Check if create help button was called
    expect(document.createElement).toHaveBeenCalledWith('button');
  });
  
  test('should create help button during initialization', () => {
    // Mock querySelector to return null (no existing button)
    document.querySelector.mockReturnValueOnce(null);
    
    // Initialize
    keyboardShortcuts.init();
    
    // Check if button was created
    const createButtonCalls = document.createElement.mock.calls.filter(call => call[0] === 'button');
    expect(createButtonCalls.length).toBeGreaterThan(0);
    
    // Check if button was added to document body
    expect(document.body.appendChild).toHaveBeenCalled();
  });
  
  test('should not create help button if it already exists', () => {
    // Mock querySelector to return an existing button
    const mockButton = document.createElement('button');
    document.querySelector.mockReturnValueOnce(mockButton);
    
    // Initialize
    keyboardShortcuts.createHelpButton();
    
    // Check if button was not created again
    expect(document.createElement).not.toHaveBeenCalledWith('button');
    expect(document.body.appendChild).not.toHaveBeenCalled();
  });
  
  test('should set up keyboard event listener on initialization', () => {
    // Initialize
    keyboardShortcuts.init();
    
    // Check if keyboard event listener was added
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  test('should create dialog when show is called', () => {
    // Call show
    keyboardShortcuts.show();
    
    // Check if dialog was created
    expect(document.createElement).toHaveBeenCalledWith('div');
    
    // Check if dialog was added to DOM
    expect(document.body.appendChild).toHaveBeenCalled();
    
    // Check if dialog is visible
    expect(keyboardShortcuts.isVisible).toBe(true);
    expect(keyboardShortcuts.dialogElement.style.display).toBe('block');
    
    // Check if click outside listener was added
    expect(document.addEventListener).toHaveBeenCalledWith('click', keyboardShortcuts.handleOutsideClick);
  });
  
  test('should hide dialog when hide is called', () => {
    // Create mock dialog
    keyboardShortcuts.dialogElement = document.createElement('div');
    keyboardShortcuts.isVisible = true;
    
    // Hide dialog
    keyboardShortcuts.hide();
    
    // Check if dialog is hidden
    expect(keyboardShortcuts.isVisible).toBe(false);
    expect(keyboardShortcuts.dialogElement.style.display).toBe('none');
    
    // Check if outside click listener is removed
    expect(document.removeEventListener).toHaveBeenCalledWith('click', keyboardShortcuts.handleOutsideClick);
  });
  
  test('should toggle dialog visibility', () => {
    // Create spy for show and hide methods
    const showSpy = jest.spyOn(keyboardShortcuts, 'show');
    const hideSpy = jest.spyOn(keyboardShortcuts, 'hide');
    
    // First toggle should show
    keyboardShortcuts.toggle();
    expect(showSpy).toHaveBeenCalled();
    expect(hideSpy).not.toHaveBeenCalled();
    
    // Reset spies
    showSpy.mockClear();
    hideSpy.mockClear();
    
    // Second toggle should hide
    keyboardShortcuts.isVisible = true;
    keyboardShortcuts.toggle();
    expect(hideSpy).toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();
    
    // Clean up spies
    showSpy.mockRestore();
    hideSpy.mockRestore();
  });
  
  test('should correctly detect if input is focused', () => {
    // Test with non-input element focused
    Object.defineProperty(document, 'activeElement', {
      value: { tagName: 'DIV', isContentEditable: false }
    });
    expect(keyboardShortcuts.isInputFocused()).toBe(false);
    
    // Test with INPUT element focused
    Object.defineProperty(document, 'activeElement', {
      value: { tagName: 'INPUT', isContentEditable: false }
    });
    expect(keyboardShortcuts.isInputFocused()).toBe(true);
    
    // Test with TEXTAREA element focused
    Object.defineProperty(document, 'activeElement', {
      value: { tagName: 'TEXTAREA', isContentEditable: false }
    });
    expect(keyboardShortcuts.isInputFocused()).toBe(true);
    
    // Test with contentEditable element focused
    Object.defineProperty(document, 'activeElement', {
      value: { tagName: 'DIV', isContentEditable: true }
    });
    expect(keyboardShortcuts.isInputFocused()).toBe(true);
  });
  
  test('should handle outside clicks', () => {
    // Create spy for hide method
    const hideSpy = jest.spyOn(keyboardShortcuts, 'hide');
    
    // Create mock dialog
    keyboardShortcuts.dialogElement = document.createElement('div');
    keyboardShortcuts.dialogElement.contains = jest.fn().mockReturnValue(false);
    
    // Create mock event
    const mockEvent = {
      target: { classList: { contains: jest.fn().mockReturnValue(false) } }
    };
    
    // Handle outside click
    keyboardShortcuts.handleOutsideClick(mockEvent);
    
    // Check if hide was called
    expect(hideSpy).toHaveBeenCalled();
    
    // Clean up spy
    hideSpy.mockRestore();
  });
  
  test('should not hide dialog for clicks inside dialog', () => {
    // Create spy for hide method
    const hideSpy = jest.spyOn(keyboardShortcuts, 'hide');
    
    // Create mock dialog
    keyboardShortcuts.dialogElement = document.createElement('div');
    keyboardShortcuts.dialogElement.contains = jest.fn().mockReturnValue(true);
    
    // Create mock event
    const mockEvent = {
      target: { classList: { contains: jest.fn().mockReturnValue(false) } }
    };
    
    // Handle click inside dialog
    keyboardShortcuts.handleOutsideClick(mockEvent);
    
    // Check if hide was not called
    expect(hideSpy).not.toHaveBeenCalled();
    
    // Clean up spy
    hideSpy.mockRestore();
  });
  
  test('should not hide dialog for clicks on help button', () => {
    // Create spy for hide method
    const hideSpy = jest.spyOn(keyboardShortcuts, 'hide');
    
    // Create mock dialog
    keyboardShortcuts.dialogElement = document.createElement('div');
    keyboardShortcuts.dialogElement.contains = jest.fn().mockReturnValue(false);
    
    // Create mock event with helpButton class
    const mockEvent = {
      target: { classList: { contains: jest.fn().mockImplementation(cls => cls === 'helpButton') } }
    };
    
    // Handle click on help button
    keyboardShortcuts.handleOutsideClick(mockEvent);
    
    // Check if hide was not called
    expect(hideSpy).not.toHaveBeenCalled();
    
    // Clean up spy
    hideSpy.mockRestore();
  });
  
  test('should handle ? key press to toggle shortcuts', () => {
    // Create spy for toggle method
    const toggleSpy = jest.spyOn(keyboardShortcuts, 'toggle');
    const isInputFocusedSpy = jest.spyOn(keyboardShortcuts, 'isInputFocused').mockReturnValue(false);
    
    // Initialize to set up keyboard listener
    keyboardShortcuts.init();
    
    // Get the keyboard event handler
    const keydownHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];
    
    // Create mock event for ? key
    const mockEvent = {
      key: '?',
      preventDefault: jest.fn()
    };
    
    // Trigger keyboard event
    keydownHandler(mockEvent);
    
    // Check if toggle was called and event was prevented
    expect(toggleSpy).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Clean up spies
    toggleSpy.mockRestore();
    isInputFocusedSpy.mockRestore();
  });
  
  test('should handle Escape key to hide shortcuts', () => {
    // Create spy for hide method
    const hideSpy = jest.spyOn(keyboardShortcuts, 'hide');
    
    // Set dialog as visible
    keyboardShortcuts.isVisible = true;
    
    // Initialize to set up keyboard listener
    keyboardShortcuts.init();
    
    // Get the keyboard event handler
    const keydownHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];
    
    // Create mock event for Escape key
    const mockEvent = {
      key: 'Escape',
      preventDefault: jest.fn()
    };
    
    // Trigger keyboard event
    keydownHandler(mockEvent);
    
    // Check if hide was called
    expect(hideSpy).toHaveBeenCalled();
    
    // Clean up spy
    hideSpy.mockRestore();
  });
  
  test('should not toggle when ? is pressed and input is focused', () => {
    // Create spy for toggle method
    const toggleSpy = jest.spyOn(keyboardShortcuts, 'toggle');
    const isInputFocusedSpy = jest.spyOn(keyboardShortcuts, 'isInputFocused').mockReturnValue(true);
    
    // Initialize to set up keyboard listener
    keyboardShortcuts.init();
    
    // Get the keyboard event handler
    const keydownHandler = document.addEventListener.mock.calls.find(call => call[0] === 'keydown')[1];
    
    // Create mock event for ? key
    const mockEvent = {
      key: '?',
      preventDefault: jest.fn()
    };
    
    // Trigger keyboard event
    keydownHandler(mockEvent);
    
    // Toggle should not be called if input is focused
    expect(toggleSpy).not.toHaveBeenCalled();
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    
    // Clean up spies
    toggleSpy.mockRestore();
    isInputFocusedSpy.mockRestore();
  });
}); 