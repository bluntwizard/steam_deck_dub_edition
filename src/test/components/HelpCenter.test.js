/**
 * @jest-environment jsdom
 */

import HelpCenter from '../../components/HelpCenter/HelpCenter';

describe('HelpCenter Component', () => {
  let container;
  let helpCenter;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
    
    // Mock styles to prevent CSS module errors
    jest.mock('../../components/HelpCenter/HelpCenter.module.css', () => ({
      helpButton: 'helpButton',
      helpCenter: 'helpCenter',
      visible: 'visible',
      bottomRight: 'bottomRight',
      bottomLeft: 'bottomLeft',
      topRight: 'topRight',
      topLeft: 'topLeft',
      active: 'active',
      accordion: 'accordion',
      expanded: 'expanded',
      accordionHeader: 'accordionHeader',
      accordionContent: 'accordionContent',
      topicLink: 'topicLink'
    }));
  });
  
  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    if (helpCenter && helpCenter.destroy) {
      helpCenter.destroy();
    }
    helpCenter = null;
  });
  
  describe('Initialization', () => {
    test('should initialize with default options when autoInit is true', () => {
      helpCenter = new HelpCenter({
        container,
        autoInit: true
      });
      
      expect(container.querySelector('.helpButton')).toBeTruthy();
    });
    
    test('should not initialize help button when showButton is false', () => {
      helpCenter = new HelpCenter({
        container,
        showButton: false,
        autoInit: true
      });
      
      expect(container.querySelector('.helpButton')).toBeFalsy();
    });
    
    test('should position help button correctly based on options', () => {
      const positions = ['bottomRight', 'bottomLeft', 'topRight', 'topLeft'];
      
      positions.forEach(position => {
        if (helpCenter) helpCenter.destroy();
        
        helpCenter = new HelpCenter({
          container,
          buttonPosition: position,
          autoInit: true
        });
        
        const button = container.querySelector('.helpButton');
        expect(button.classList.contains(position)).toBe(true);
      });
    });
    
    test('should initialize manually when autoInit is false', () => {
      helpCenter = new HelpCenter({
        container,
        autoInit: false
      });
      
      expect(container.querySelector('.helpButton')).toBeFalsy();
      
      helpCenter.initialize();
      expect(container.querySelector('.helpButton')).toBeTruthy();
    });
  });
  
  describe('Help Center Dialog', () => {
    beforeEach(() => {
      helpCenter = new HelpCenter({
        container,
        title: 'Test Help Center',
        autoInit: true
      });
    });
    
    test('should show help center when show method is called', () => {
      helpCenter.show();
      
      const helpCenterElement = container.querySelector('.helpCenter');
      expect(helpCenterElement).toBeTruthy();
      expect(helpCenterElement.classList.contains('visible')).toBe(true);
    });
    
    test('should hide help center when hide method is called', () => {
      helpCenter.show();
      helpCenter.hide();
      
      const helpCenterElement = container.querySelector('.helpCenter');
      expect(helpCenterElement.classList.contains('visible')).toBe(false);
    });
    
    test('should toggle help center visibility when toggle method is called', () => {
      // Initially not visible
      helpCenter.toggle();
      
      let helpCenterElement = container.querySelector('.helpCenter');
      expect(helpCenterElement.classList.contains('visible')).toBe(true);
      
      // Toggle to hide
      helpCenter.toggle();
      expect(helpCenterElement.classList.contains('visible')).toBe(false);
    });
    
    test('should create help center with correct title', () => {
      helpCenter.show();
      
      const title = container.querySelector('#help-center-title');
      expect(title.textContent).toBe('Test Help Center');
    });
  });
  
  describe('Topics', () => {
    const customTopics = [
      {
        id: 'test-topic-1',
        title: 'Test Topic 1',
        icon: '📚',
        content: 'This is test topic 1 content'
      },
      {
        id: 'test-topic-2',
        title: 'Test Topic 2',
        icon: '🔍',
        content: 'This is test topic 2 content'
      }
    ];
    
    beforeEach(() => {
      helpCenter = new HelpCenter({
        container,
        topics: customTopics,
        defaultTopic: 'test-topic-1',
        autoInit: true
      });
    });
    
    test('should create topic navigation items for each topic', () => {
      helpCenter.show();
      
      const topicLinks = container.querySelectorAll('.topicLink');
      expect(topicLinks.length).toBe(customTopics.length);
      
      // Check topic titles
      expect(topicLinks[0].textContent).toContain('Test Topic 1');
      expect(topicLinks[1].textContent).toContain('Test Topic 2');
    });
    
    test('should load default topic on initialization', () => {
      helpCenter.show();
      
      const topicContent = helpCenter.topicContentElement;
      expect(topicContent.innerHTML).toContain('This is test topic 1 content');
    });
    
    test('should change topic content when topic is clicked', () => {
      helpCenter.show();
      
      // Mock topic link click
      helpCenter.loadTopic('test-topic-2');
      
      const topicContent = helpCenter.topicContentElement;
      expect(topicContent.innerHTML).toContain('This is test topic 2 content');
    });
    
    test('should add a new topic', () => {
      const newTopic = {
        id: 'test-topic-3',
        title: 'Test Topic 3',
        content: 'This is test topic 3 content'
      };
      
      helpCenter.addTopic(newTopic);
      
      // Get topics and check if the new one is included
      const topics = helpCenter.getTopics();
      expect(topics.length).toBe(3);
      expect(topics[2].id).toBe('test-topic-3');
    });
    
    test('should remove a topic', () => {
      helpCenter.removeTopic('test-topic-2');
      
      // Get topics and check if the topic was removed
      const topics = helpCenter.getTopics();
      expect(topics.length).toBe(1);
      expect(topics[0].id).toBe('test-topic-1');
    });
  });
  
  describe('Search Functionality', () => {
    const searchableTopics = [
      {
        id: 'topic1',
        title: 'Installation Guide',
        description: 'How to install the software',
        content: 'Installation content...'
      },
      {
        id: 'topic2',
        title: 'Troubleshooting',
        description: 'Common problems and solutions',
        content: 'Troubleshooting content...',
        faqs: [
          {
            id: 'faq1',
            question: 'Why does my app crash?',
            answer: 'There are several reasons why the app might crash...'
          },
          {
            id: 'faq2',
            question: 'How do I reset my password?',
            answer: 'To reset your password, follow these steps...'
          }
        ]
      }
    ];
    
    beforeEach(() => {
      helpCenter = new HelpCenter({
        container,
        topics: searchableTopics,
        searchEnabled: true,
        autoInit: true
      });
      helpCenter.show();
    });
    
    test('should search through topics and return matching results', () => {
      // Mock the search results element
      helpCenter.searchResultsElement = document.createElement('div');
      
      // Create a mock event with search term
      const mockEvent = { target: { value: 'install' } };
      
      // Call the search handler
      helpCenter.handleSearch(mockEvent);
      
      // Check if the search results were updated
      expect(helpCenter.searchTerm).toBe('install');
      expect(helpCenter.searchResultsElement.style.display).toBe('block');
    });
    
    test('should search through FAQs and return matching results', () => {
      // Mock the search results element
      helpCenter.searchResultsElement = document.createElement('div');
      
      // Create a mock event with search term
      const mockEvent = { target: { value: 'password' } };
      
      // Call the search handler
      helpCenter.handleSearch(mockEvent);
      
      // Check if the search results were updated
      expect(helpCenter.searchTerm).toBe('password');
      expect(helpCenter.searchResultsElement.style.display).toBe('block');
    });
    
    test('should hide search results when search term is empty', () => {
      // Mock the search results element
      helpCenter.searchResultsElement = document.createElement('div');
      
      // Create a mock event with empty search term
      const mockEvent = { target: { value: '' } };
      
      // Call the search handler
      helpCenter.handleSearch(mockEvent);
      
      // Check if the search results were hidden
      expect(helpCenter.searchTerm).toBe('');
      expect(helpCenter.searchResultsElement.style.display).toBe('none');
    });
  });
  
  describe('Contextual Help', () => {
    beforeEach(() => {
      helpCenter = new HelpCenter({
        container,
        autoInit: true
      });
    });
    
    test('should show contextual help for an element', () => {
      const testElement = document.createElement('button');
      testElement.textContent = 'Test Button';
      container.appendChild(testElement);
      
      const helpTooltip = helpCenter.showContextualHelp(
        testElement,
        'This is a test button',
        { position: 'top' }
      );
      
      expect(helpTooltip).toBeTruthy();
      expect(helpTooltip.textContent).toContain('This is a test button');
      expect(document.body.contains(helpTooltip)).toBe(true);
      
      // Clean up
      helpTooltip.remove();
    });
  });
  
  describe('Event Handlers', () => {
    beforeEach(() => {
      helpCenter = new HelpCenter({
        container,
        autoInit: true
      });
      helpCenter.show();
    });
    
    test('should close help center when clicking outside', () => {
      // Create a mock event with a target outside the help center
      const mockEvent = {
        target: document.body
      };
      
      helpCenter.handleOutsideClick(mockEvent);
      
      expect(helpCenter.isVisible).toBe(false);
    });
    
    test('should not close help center when clicking inside', () => {
      // Mock the help center element and contains method
      helpCenter.helpCenterElement = {
        classList: {
          contains: jest.fn(),
          remove: jest.fn()
        },
        contains: jest.fn().mockReturnValue(true)
      };
      
      // Create a mock event with a target inside the help center
      const mockEvent = {
        target: document.createElement('div')
      };
      
      helpCenter.handleOutsideClick(mockEvent);
      
      expect(helpCenter.helpCenterElement.classList.remove).not.toHaveBeenCalled();
    });
    
    test('should close help center when Escape key is pressed', () => {
      // Create a mock keyboard event
      const mockEvent = {
        key: 'Escape'
      };
      
      helpCenter.handleEscapeKey(mockEvent);
      
      expect(helpCenter.isVisible).toBe(false);
    });
  });
  
  describe('Cleanup', () => {
    beforeEach(() => {
      helpCenter = new HelpCenter({
        container,
        autoInit: true
      });
    });
    
    test('should remove help button and dialog when destroyed', () => {
      helpCenter.show();
      
      expect(container.querySelector('.helpButton')).toBeTruthy();
      expect(container.querySelector('.helpCenter')).toBeTruthy();
      
      helpCenter.destroy();
      
      expect(container.querySelector('.helpButton')).toBeFalsy();
      expect(container.querySelector('.helpCenter')).toBeFalsy();
    });
  });
}); 