import { ProgressTracker } from '../../components/ProgressTracker';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn(index => {
      return Object.keys(store)[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

// Mock DOM functions
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
window.MutationObserver = jest.fn(function MockMutationObserver(callback) {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
  this.trigger = mockedMutations => callback(mockedMutations, this);
});

document.querySelectorAll = jest.fn(() => []);
document.querySelector = jest.fn(() => null);
document.getElementById = jest.fn(() => null);
document.createElement = jest.fn(() => {
  const element = {
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    appendChild: jest.fn(),
    insertBefore: jest.fn(),
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
    querySelector: jest.fn()
  };
  return element;
});

describe('ProgressTracker', () => {
  // Clean up and reset DOM and mocks before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset localStorage
    localStorageMock.clear();
    
    // Create a mock container for progress items
    document.body = document.createElement('body');
    
    // Setup basic mocks
    document.querySelectorAll.mockReturnValue([]);
    document.querySelector.mockReturnValue(null);
    document.getElementById.mockReturnValue(null);
    
    // Custom element factory to create DOM elements with the necessary properties
    document.createElement = jest.fn(tagName => {
      const element = {
        tagName,
        style: {},
        children: [],
        innerHTML: '',
        textContent: '',
        className: '',
        dataset: {},
        parentNode: null,
        firstChild: null,
        classList: {
          add: jest.fn(className => {
            element.className += ` ${className}`;
          }),
          remove: jest.fn(className => {
            element.className = element.className.replace(new RegExp(`\\b${className}\\b`, 'g'), '');
          }),
          contains: jest.fn(className => {
            return element.className.includes(className);
          })
        },
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        appendChild: jest.fn(child => {
          element.children.push(child);
          child.parentNode = element;
          return child;
        }),
        insertBefore: jest.fn((newChild, referenceChild) => {
          element.children.unshift(newChild);
          newChild.parentNode = element;
          return newChild;
        }),
        closest: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn(() => null),
        addEventListener: jest.fn((event, handler) => {
          // Store the event handler to allow triggering it in tests
          if (!element._eventHandlers) {
            element._eventHandlers = {};
          }
          if (!element._eventHandlers[event]) {
            element._eventHandlers[event] = [];
          }
          element._eventHandlers[event].push(handler);
        }),
        click: jest.fn(() => {
          // Trigger click event handlers if any
          if (element._eventHandlers && element._eventHandlers.click) {
            element._eventHandlers.click.forEach(handler => handler());
          }
        }),
        // Add change event triggering
        triggerChangeEvent: jest.fn(value => {
          if (tagName === 'input') {
            element.checked = value;
          }
          if (element._eventHandlers && element._eventHandlers.change) {
            element._eventHandlers.change.forEach(handler => handler());
          }
        })
      };
      
      // Add checkbox-specific properties if input
      if (tagName === 'input') {
        element.type = '';
        element.checked = false;
      }
      
      return element;
    });
    
    // Mock dispatch event
    document.dispatchEvent = jest.fn();
  });
  
  test('should initialize with default options', () => {
    const progressTracker = new ProgressTracker();
    
    expect(progressTracker.storageKeyPrefix).toBe('sdde_progress_');
    expect(progressTracker.trackableSelectors).toBe(
      '.tutorial-section ol > li, .steps-section ol > li, .guide-section ol > li, [data-track-progress] li'
    );
    expect(progressTracker.initialized).toBe(false);
    expect(progressTracker.trackedElements).toEqual([]);
    expect(progressTracker.progressItems.size).toBe(0);
  });
  
  test('should initialize with custom options', () => {
    const options = {
      storageKeyPrefix: 'custom_prefix_',
      trackableSelectors: '.custom-selector',
      autoInit: true
    };
    
    // Mock the initialize method
    ProgressTracker.prototype.initialize = jest.fn();
    
    const progressTracker = new ProgressTracker(options);
    
    expect(progressTracker.storageKeyPrefix).toBe('custom_prefix_');
    expect(progressTracker.trackableSelectors).toBe('.custom-selector');
    expect(ProgressTracker.prototype.initialize).toHaveBeenCalled();
  });
  
  test('should load progress from localStorage', () => {
    // Setup localStorage with test data
    const prefix = 'sdde_progress_';
    localStorageMock.setItem(`${prefix}test_item_1`, 'true');
    localStorageMock.setItem(`${prefix}test_item_2`, 'true');
    localStorageMock.setItem('non_progress_item', 'true');
    
    const progressTracker = new ProgressTracker();
    progressTracker.loadProgressFromStorage();
    
    expect(progressTracker.progressItems.size).toBe(2);
    expect(progressTracker.progressItems.get(`${prefix}test_item_1`)).toBe(true);
    expect(progressTracker.progressItems.get(`${prefix}test_item_2`)).toBe(true);
    expect(progressTracker.progressItems.has('non_progress_item')).toBe(false);
  });
  
  test('should initialize progress checkboxes', () => {
    // Setup mock tutorial steps
    const mockSteps = [
      document.createElement('li'),
      document.createElement('li'),
      document.createElement('li')
    ];
    
    // Add text content for IDs
    mockSteps[0].textContent = 'Step 1';
    mockSteps[1].textContent = 'Step 2';
    mockSteps[2].textContent = 'Step 3';
    
    document.querySelectorAll.mockReturnValue(mockSteps);
    
    // Mock closest to simulate section
    mockSteps.forEach(step => {
      step.closest = jest.fn().mockReturnValue({ id: 'tutorial-section' });
      step.parentNode = { children: mockSteps };
    });
    
    // Override Array.from to work with our mock
    const originalArrayFrom = Array.from;
    Array.from = jest.fn(collection => collection);
    
    const progressTracker = new ProgressTracker();
    progressTracker.initProgressCheckboxes();
    
    // Restore Array.from
    Array.from = originalArrayFrom;
    
    expect(progressTracker.trackedElements.length).toBe(3);
    expect(document.createElement).toHaveBeenCalledWith('input');
    
    // Should create checkboxes for each step
    const calls = document.createElement.mock.calls.filter(call => call[0] === 'input');
    expect(calls.length).toBe(3);
    
    // Checkbox should be inserted into each step
    mockSteps.forEach(step => {
      expect(step.insertBefore).toHaveBeenCalled();
    });
  });
  
  test('should generate unique item IDs', () => {
    // Setup mock element
    const mockElement = document.createElement('li');
    mockElement.textContent = 'Test Step';
    
    // Mock parent with children
    const siblings = [
      document.createElement('li'),
      mockElement,
      document.createElement('li')
    ];
    mockElement.parentNode = { children: siblings };
    
    // Mock section
    const mockSection = document.createElement('section');
    mockSection.id = 'tutorial-section';
    mockElement.closest = jest.fn().mockReturnValue(mockSection);
    
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/test-page' };
    
    // Override Array.from to work with our mock
    const originalArrayFrom = Array.from;
    Array.from = jest.fn(collection => collection);
    
    const progressTracker = new ProgressTracker();
    const id = progressTracker.generateItemId(mockElement);
    
    // Restore mocks
    Array.from = originalArrayFrom;
    window.location = originalLocation;
    
    expect(id).toBe('sdde_progress_/test-page_tutorial-section_1_Test Step');
  });
  
  test('should update progress when checkbox is toggled', () => {
    // Setup mock checkbox
    const mockCheckbox = document.createElement('input');
    mockCheckbox.type = 'checkbox';
    mockCheckbox.dataset.progressId = 'sdde_progress_test_item';
    
    // Setup mock parent item
    const mockListItem = document.createElement('li');
    mockListItem.appendChild(mockCheckbox);
    mockCheckbox.parentNode = mockListItem;
    
    // Setup mock event target
    mockCheckbox.closest = jest.fn().mockReturnValue(mockListItem);
    
    const progressTracker = new ProgressTracker();
    progressTracker.trackedElements = [mockListItem];
    progressTracker.updateProgressSummary = jest.fn();
    progressTracker.announceProgressUpdate = jest.fn();
    
    // Test checking the checkbox
    progressTracker.updateProgress('sdde_progress_test_item', true);
    
    expect(progressTracker.progressItems.get('sdde_progress_test_item')).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('sdde_progress_test_item', 'true');
    expect(progressTracker.updateProgressSummary).toHaveBeenCalled();
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(progressTracker.announceProgressUpdate).toHaveBeenCalledWith('completed');
    
    // Reset mocks
    jest.clearAllMocks();
    progressTracker.updateProgressSummary.mockClear();
    progressTracker.announceProgressUpdate.mockClear();
    
    // Test unchecking the checkbox
    progressTracker.updateProgress('sdde_progress_test_item', false);
    
    expect(progressTracker.progressItems.get('sdde_progress_test_item')).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('sdde_progress_test_item');
    expect(progressTracker.updateProgressSummary).toHaveBeenCalled();
    expect(document.dispatchEvent).toHaveBeenCalled();
    expect(progressTracker.announceProgressUpdate).toHaveBeenCalledWith('marked as incomplete');
  });
  
  test('should calculate correct progress summary', () => {
    const progressTracker = new ProgressTracker();
    
    // Add mock tracked elements
    progressTracker.trackedElements = [
      document.createElement('li'),
      document.createElement('li'),
      document.createElement('li'),
      document.createElement('li')
    ];
    
    // Set up progress items (2 of 4 completed)
    progressTracker.progressItems.set('sdde_progress_item1', true);
    progressTracker.progressItems.set('sdde_progress_item2', true);
    progressTracker.progressItems.set('sdde_progress_item3', false);
    progressTracker.progressItems.set('sdde_progress_item4', false);
    
    const summary = progressTracker.getProgressSummary();
    
    expect(summary.total).toBe(4);
    expect(summary.completed).toBe(2);
    expect(summary.percentage).toBe(50);
  });
  
  test('should create progress summary element', () => {
    const progressTracker = new ProgressTracker();
    
    // Add mock tracked elements
    progressTracker.trackedElements = [
      document.createElement('li'),
      document.createElement('li')
    ];
    
    // Set up progress items (1 of 2 completed)
    progressTracker.progressItems.set('sdde_progress_item1', true);
    progressTracker.progressItems.set('sdde_progress_item2', false);
    
    // Create a target element to append the summary to
    const targetElement = document.createElement('div');
    
    // Create the summary
    progressTracker.createProgressSummary(targetElement);
    
    // Should create elements for summary
    expect(document.createElement).toHaveBeenCalledWith('div'); // summary container
    expect(document.createElement).toHaveBeenCalledWith('h3'); // title
    expect(document.createElement).toHaveBeenCalledWith('div'); // progress bar
    
    // Should insert the summary into the target
    expect(targetElement.insertBefore).toHaveBeenCalled();
  });
  
  test('should reset progress for current page', () => {
    // Setup localStorage with test data
    const prefix = 'sdde_progress_';
    localStorageMock.setItem(`${prefix}/page1_item1`, 'true');
    localStorageMock.setItem(`${prefix}/page1_item2`, 'true');
    localStorageMock.setItem(`${prefix}/page2_item1`, 'true');
    
    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/page1' };
    
    const progressTracker = new ProgressTracker();
    progressTracker.loadProgressFromStorage();
    progressTracker.updateProgressSummary = jest.fn();
    progressTracker.setupMutationObserver = jest.fn(); // Avoid actually setting up observer during test
    
    // Create mock checkboxes
    const mockCheckboxes = [
      document.createElement('input'),
      document.createElement('input')
    ];
    mockCheckboxes[0].checked = true;
    mockCheckboxes[1].checked = true;
    
    document.querySelectorAll.mockReturnValue(mockCheckboxes);
    
    // Reset progress for current page
    progressTracker.resetPageProgress();
    
    // Should remove items for current page only
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${prefix}/page1_item1`);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${prefix}/page1_item2`);
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(`${prefix}/page2_item1`);
    
    // Should update checkboxes
    expect(mockCheckboxes[0].checked).toBe(false);
    expect(mockCheckboxes[1].checked).toBe(false);
    
    // Should update progress summary
    expect(progressTracker.updateProgressSummary).toHaveBeenCalled();
    
    // Should dispatch event
    expect(document.dispatchEvent).toHaveBeenCalled();
    
    // Restore window.location
    window.location = originalLocation;
  });
  
  test('should reset all progress', () => {
    // Setup localStorage with test data
    const prefix = 'sdde_progress_';
    localStorageMock.setItem(`${prefix}/page1_item1`, 'true');
    localStorageMock.setItem(`${prefix}/page1_item2`, 'true');
    localStorageMock.setItem(`${prefix}/page2_item1`, 'true');
    localStorageMock.setItem('other_key', 'true');
    
    const progressTracker = new ProgressTracker();
    progressTracker.loadProgressFromStorage();
    progressTracker.updateProgressSummary = jest.fn();
    progressTracker.announceProgressUpdate = jest.fn();
    progressTracker.setupMutationObserver = jest.fn(); // Avoid actually setting up observer during test
    
    // Create mock checkboxes
    const mockCheckboxes = [
      document.createElement('input'),
      document.createElement('input'),
      document.createElement('input')
    ];
    mockCheckboxes.forEach(checkbox => checkbox.checked = true);
    
    document.querySelectorAll.mockReturnValue(mockCheckboxes);
    
    // Reset all progress
    progressTracker.resetAllProgress();
    
    // Should remove all progress items
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${prefix}/page1_item1`);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${prefix}/page1_item2`);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${prefix}/page2_item1`);
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
    
    // Should clear the map
    expect(progressTracker.progressItems.size).toBe(0);
    
    // Should update checkboxes
    mockCheckboxes.forEach(checkbox => {
      expect(checkbox.checked).toBe(false);
    });
    
    // Should update progress summary
    expect(progressTracker.updateProgressSummary).toHaveBeenCalled();
    
    // Should dispatch event
    expect(document.dispatchEvent).toHaveBeenCalled();
    
    // Should announce to screen readers
    expect(progressTracker.announceProgressUpdate).toHaveBeenCalledWith('reset for all pages');
  });
  
  test('should setup mutation observer', () => {
    const progressTracker = new ProgressTracker();
    progressTracker.initProgressCheckboxes = jest.fn();
    progressTracker.updateProgressSummary = jest.fn();
    
    progressTracker.setupMutationObserver();
    
    // Should create a mutation observer
    expect(window.MutationObserver).toHaveBeenCalled();
    
    // Get the observer instance
    const observer = window.MutationObserver.mock.instances[0];
    
    // Should observe document body
    expect(observer.observe).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true
    });
    
    // Should call initProgressCheckboxes when mutations occur
    const mockNode = document.createElement('div');
    mockNode.nodeType = Node.ELEMENT_NODE;
    mockNode.matches = jest.fn().mockReturnValue(true);
    
    observer.trigger([{
      type: 'childList',
      addedNodes: [mockNode]
    }]);
    
    expect(progressTracker.initProgressCheckboxes).toHaveBeenCalled();
    expect(progressTracker.updateProgressSummary).toHaveBeenCalled();
  });
  
  test('should announce progress updates to screen readers', () => {
    const progressTracker = new ProgressTracker();
    progressTracker.getProgressSummary = jest.fn().mockReturnValue({
      total: 5,
      completed: 3,
      percentage: 60
    });
    
    // Mock timer
    jest.useFakeTimers();
    
    // Create a mock announcer element
    const mockAnnouncer = document.createElement('div');
    document.getElementById.mockReturnValue(null); // First call returns null
    document.createElement.mockReturnValueOnce(mockAnnouncer); // Create announcer
    document.getElementById.mockReturnValue(mockAnnouncer); // Second call returns announcer
    
    // Call the method
    progressTracker.announceProgressUpdate('completed');
    
    // Should create announcer if it doesn't exist
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockAnnouncer.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnnouncer);
    
    // Should set the text content
    expect(mockAnnouncer.textContent).toBe('Step completed. 3 of 5 steps completed (60%).');
    
    // Should clear after delay
    jest.advanceTimersByTime(1000);
    expect(mockAnnouncer.textContent).toBe('');
    
    // Restore timer
    jest.useRealTimers();
  });
}); 