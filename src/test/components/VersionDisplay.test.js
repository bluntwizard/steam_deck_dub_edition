/**
 * Test suite for VersionDisplay component
 */

describe('VersionDisplay', () => {
  let VersionDisplay;
  let instance;
  let container;
  
  // Mock version info
  const mockVersionInfo = {
    version: '1.2.3',
    buildNumber: '12345',
    releaseDate: '2023-03-30'
  };
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Clear module cache to ensure fresh instances
    jest.resetModules();
    
    // Import component
    VersionDisplay = require('../../components/VersionDisplay/VersionDisplay').default;
    
    // Create instance
    instance = new VersionDisplay({
      container: container,
      versionInfo: mockVersionInfo
    });
  });
  
  afterEach(() => {
    // Clean up
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should initialize properly', () => {
    expect(instance).toBeDefined();
    expect(instance.container).toBe(container);
    expect(instance.versionInfo).toEqual(mockVersionInfo);
  });
  
  test('should render version information', () => {
    instance.render();
    
    const versionElement = container.querySelector('.version-display');
    expect(versionElement).not.toBeNull();
    
    // Check version text
    expect(versionElement.textContent).toContain('1.2.3');
    expect(versionElement.textContent).toContain('12345');
    expect(versionElement.textContent).toContain('2023-03-30');
  });
  
  test('should format version information properly', () => {
    const formattedVersion = instance.formatVersionInfo(mockVersionInfo);
    expect(formattedVersion).toContain('Version: 1.2.3');
    expect(formattedVersion).toContain('Build: 12345');
    expect(formattedVersion).toContain('Released: 2023-03-30');
  });
  
  test('should handle missing version information', () => {
    // Create instance with incomplete version info
    instance = new VersionDisplay({
      container: container,
      versionInfo: { version: '1.0.0' }
    });
    
    instance.render();
    
    const versionElement = container.querySelector('.version-display');
    expect(versionElement).not.toBeNull();
    
    // Should show version but not build/release info
    expect(versionElement.textContent).toContain('1.0.0');
    expect(versionElement.textContent).not.toContain('Build:');
    expect(versionElement.textContent).not.toContain('Released:');
  });
  
  test('should update when version changes', () => {
    instance.render();
    
    // Update version info
    const newVersionInfo = {
      version: '2.0.0',
      buildNumber: '67890',
      releaseDate: '2023-04-15'
    };
    
    instance.updateVersionInfo(newVersionInfo);
    
    const versionElement = container.querySelector('.version-display');
    expect(versionElement.textContent).toContain('2.0.0');
    expect(versionElement.textContent).toContain('67890');
    expect(versionElement.textContent).toContain('2023-04-15');
  });
  
  test('should toggle expanded version details when clicked', () => {
    instance.render();
    
    const versionElement = container.querySelector('.version-display');
    expect(versionElement.classList.contains('expanded')).toBe(false);
    
    // Click to expand
    versionElement.click();
    expect(versionElement.classList.contains('expanded')).toBe(true);
    
    // Click again to collapse
    versionElement.click();
    expect(versionElement.classList.contains('expanded')).toBe(false);
  });
  
  test('should clean up event listeners on destroy', () => {
    // Setup spy on event listeners
    const removeEventListenerSpy = jest.spyOn(
      HTMLElement.prototype, 
      'removeEventListener'
    );
    
    instance.render();
    instance.destroy();
    
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
}); 