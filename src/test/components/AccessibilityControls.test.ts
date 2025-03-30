/**
 * Test suite for AccessibilityControls component
 */

describe("AccessibilityControls", () => {
  let AccessibilityControls;
  let instance;
  let container;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";
    container = document.createElement("div");
    document.body.appendChild(container);

    // Clear module cache to ensure fresh instances
    jest.resetModules();

    // Import component
    AccessibilityControls =
      require("../../components/AccessibilityControls/AccessibilityControls").default;

    // Create instance
    instance = new AccessibilityControls({
      container: container,
    });
  });

  afterEach(() => {
    // Clean up
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
    }
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  test("should initialize properly", () => {
    expect(instance).toBeDefined();
    expect(instance.container).toBe(container);
  });

  test("should render accessibility controls", () => {
    instance.render();

    const controlsElement = container.querySelector(".accessibility-controls");
    expect(controlsElement).not.toBeNull();
  });

  test("should toggle font size when control is clicked", () => {
    instance.render();

    const fontSizeButton = container.querySelector(".font-size-control");
    expect(fontSizeButton).not.toBeNull();

    // Mock document body
    document.body.classList.contains = jest.fn().mockReturnValue(false);
    document.body.classList.add = jest.fn();
    document.body.classList.remove = jest.fn();

    // Simulate click to increase font size
    fontSizeButton.click();
    expect(document.body.classList.add).toHaveBeenCalledWith("larger-text");

    // Simulate another click to further increase font size
    document.body.classList.contains = jest.fn().mockReturnValue(true);
    fontSizeButton.click();
    expect(document.body.classList.remove).toHaveBeenCalledWith("larger-text");
    expect(document.body.classList.add).toHaveBeenCalledWith("largest-text");

    // Simulate click to reset font size
    document.body.classList.contains = jest.fn(
      (className) => className === "largest-text",
    );
    fontSizeButton.click();
    expect(document.body.classList.remove).toHaveBeenCalledWith("largest-text");
  });

  test("should toggle high contrast mode when control is clicked", () => {
    instance.render();

    const contrastButton = container.querySelector(".contrast-control");
    expect(contrastButton).not.toBeNull();

    // Mock document body
    document.body.classList.contains = jest.fn().mockReturnValue(false);
    document.body.classList.add = jest.fn();
    document.body.classList.remove = jest.fn();

    // Simulate click to enable high contrast
    contrastButton.click();
    expect(document.body.classList.add).toHaveBeenCalledWith("high-contrast");

    // Simulate click to disable high contrast
    document.body.classList.contains = jest.fn().mockReturnValue(true);
    contrastButton.click();
    expect(document.body.classList.remove).toHaveBeenCalledWith(
      "high-contrast",
    );
  });

  test("should persist settings to local storage", () => {
    // Mock localStorage
    const mockStorage = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => mockStorage[key]),
        setItem: jest.fn((key, value) => {
          mockStorage[key] = value;
        }),
      },
      writable: true,
    });

    instance.render();

    // Simulate changing accessibility settings
    instance.saveSettings({ fontSize: "larger", contrast: "high" });

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "accessibility-settings",
      JSON.stringify({ fontSize: "larger", contrast: "high" }),
    );
  });

  test("should load settings from local storage on initialization", () => {
    // Mock localStorage with pre-existing settings
    const mockSettings = { fontSize: "largest", contrast: "high" };
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn().mockReturnValue(JSON.stringify(mockSettings)),
        setItem: jest.fn(),
      },
      writable: true,
    });

    // Re-initialize component
    instance = new AccessibilityControls({
      container: container,
    });

    instance.render();

    // Verify settings were applied to DOM
    expect(document.body.classList.add).toHaveBeenCalledWith("largest-text");
    expect(document.body.classList.add).toHaveBeenCalledWith("high-contrast");
  });

  test("should clean up event listeners on destroy", () => {
    // Setup spy on event listeners
    const removeEventListenerSpy = jest.spyOn(
      HTMLElement.prototype,
      "removeEventListener",
    );

    instance.render();
    instance.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
