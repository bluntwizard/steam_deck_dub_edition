/**
 * @jest-environment jsdom
 */

import { LazyLoader } from '../../components/LazyLoader';

// Mock fetch
global.fetch = jest.fn();

describe('LazyLoader Component', () => {
  let lazyLoader;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Set up fetch mock
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('<div class="test-content">Test Content</div>')
      })
    );
    
    // Reset document body
    document.body.innerHTML = '';
    
    // Create instance
    lazyLoader = new LazyLoader({
      contentBaseUrl: './test-content/'
    });
  });
  
  test('initializes with default options', () => {
    const defaultLoader = new LazyLoader();
    expect(defaultLoader.contentBaseUrl).toBe('./content/');
    expect(defaultLoader.loadTimeout).toBe(10000);
    expect(defaultLoader.initialized).toBe(false);
  });
  
  test('initializes with custom options', () => {
    const customLoader = new LazyLoader({
      contentBaseUrl: './custom-content/',
      loadTimeout: 5000
    });
    
    expect(customLoader.contentBaseUrl).toBe('./custom-content/');
    expect(customLoader.loadTimeout).toBe(5000);
  });
  
  test('auto initializes when autoInit is true', () => {
    const autoLoader = new LazyLoader({ autoInit: true });
    expect(autoLoader.initialized).toBe(true);
  });
  
  test('initialize method sets up observers', () => {
    // Mock IntersectionObserver
    const mockObserve = jest.fn();
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: mockObserve,
      unobserve: jest.fn()
    }));
    
    // Create section element
    const section = document.createElement('div');
    section.setAttribute('data-content-src', 'test-section');
    document.body.appendChild(section);
    
    // Initialize
    lazyLoader.initialize();
    
    expect(lazyLoader.initialized).toBe(true);
    expect(window.IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(section);
  });
  
  test('buildContentUrl formats URLs correctly', () => {
    // Absolute URL
    expect(lazyLoader.buildContentUrl('https://example.com/content')).toBe('https://example.com/content');
    
    // Relative URL without extension
    expect(lazyLoader.buildContentUrl('section1')).toBe('./test-content/section1.html');
    
    // Relative URL with extension
    expect(lazyLoader.buildContentUrl('section2.html')).toBe('./test-content/section2.html');
  });
  
  test('loadContent loads content for a section', async () => {
    // Create section element
    const section = document.createElement('div');
    section.setAttribute('data-content-src', 'test-section');
    document.body.appendChild(section);
    
    // Set up event listener
    const loadedHandler = jest.fn();
    section.addEventListener('content-loaded', loadedHandler);
    
    // Load content
    await lazyLoader.loadContent(section);
    
    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('./test-content/test-section.html');
    
    // Verify content was inserted
    expect(section.innerHTML).toContain('Test Content');
    
    // Verify section was marked as loaded
    expect(section.getAttribute('data-content-loaded')).toBe('true');
    
    // Verify event was dispatched
    expect(loadedHandler).toHaveBeenCalled();
  });
  
  test('loadContent handles errors', async () => {
    // Mock fetch error
    fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );
    
    // Create section element
    const section = document.createElement('div');
    section.setAttribute('data-content-src', 'missing-section');
    document.body.appendChild(section);
    
    // Create spy for showLoadError
    const showLoadErrorSpy = jest.spyOn(lazyLoader, 'showLoadError');
    
    // Try to load content
    try {
      await lazyLoader.loadContent(section);
    } catch (error) {
      // Error is expected
    }
    
    // Verify error handling
    expect(showLoadErrorSpy).toHaveBeenCalled();
    expect(section.innerHTML).toContain('Content Loading Error');
  });
  
  test('showLoading displays loading indicator', () => {
    // Create section element
    const section = document.createElement('div');
    section.innerHTML = 'Original content';
    document.body.appendChild(section);
    
    // Show loading
    lazyLoader.showLoading(section);
    
    // Verify original content was saved
    expect(section.getAttribute('data-original-content')).toBe('Original content');
    
    // Verify loading indicator was added
    expect(section.innerHTML).toContain('Loading content');
  });
  
  test('forceLoadAllContent loads all content sections', () => {
    // Create multiple sections
    for (let i = 0; i < 3; i++) {
      const section = document.createElement('div');
      section.setAttribute('data-content-src', `section-${i}`);
      document.body.appendChild(section);
    }
    
    // Spy on loadContent
    const loadContentSpy = jest.spyOn(lazyLoader, 'loadContent');
    
    // Force load all content
    lazyLoader.forceLoadAllContent();
    
    // Verify loadContent was called for each section
    expect(loadContentSpy).toHaveBeenCalledTimes(3);
  });
}); 