/**
 * @jest-environment jsdom
 */

// Mock CSS imports
jest.mock("../../components/Theme/Theme.module.css", () => ({}), {
  virtual: true,
});

// Import the component
import * as Theme from "../../components/Theme";
const Theme = Theme.default;

describe("Theme Component", () => {
  // Mock localStorage
  const localStorageMock: any = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock console.warn to prevent output during tests
  const originalConsoleWarn = console.warn;

  // Setup mocks before tests
  beforeAll(() => {
    // Mock document.documentElement
    Object.defineProperty(document, "documentElement", {
      value: {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(),
        },
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
      },
      writable: true,
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });

    // Mock document.querySelectorAll
    document.querySelectorAll = jest.fn().mockReturnValue([]);

    // Mock document.querySelector
    document.querySelector = jest.fn().mockReturnValue(null);

    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation(() => ({
      classList: { add: jest.fn() },
      dataset: {},
      style: {},
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
    }));

    // Mock document.dispatchEvent
    document.dispatchEvent = jest.fn();

    // Mock console.warn
    console.warn = jest.fn();
  });

  // Restore original console.warn after tests
  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // Tests
  test("should construct with default options", () => {
    const theme: Theme = new Theme();
    expect(theme.availableThemes).toEqual([
      "light",
      "dark",
      "dracula",
      "high-contrast",
    ]);
    expect(theme.currentTheme).toBe("dark");
    expect(theme.storageKey).toBe("sdde_theme_preference");
    expect(theme.persistSettings).toBe(true);
    expect(theme.rootElement).toBe(document.documentElement);
    expect(theme.initialized).toBe(false);
  });

  test("should construct with custom options", () => {
    const mockRoot = { classList: { add: jest.fn() } };
    const theme: Theme = new Theme({
      themes: ["custom1", "custom2"],
      defaultTheme: "custom1",
      storageKey: "custom_key",
      persistSettings: false,
      rootElement: mockRoot,
      autoInit: false,
    });

    expect(theme.availableThemes).toEqual(["custom1", "custom2"]);
    expect(theme.currentTheme).toBe("custom1");
    expect(theme.storageKey).toBe("custom_key");
    expect(theme.persistSettings).toBe(false);
    expect(theme.rootElement).toBe(mockRoot);
  });

  test("should load saved theme from localStorage during initialization", () => {
    // Set up localStorage mock
    localStorageMock.getItem.mockReturnValueOnce("light");

    // Create and initialize theme
    const theme: Theme = new Theme();
    theme.initialize();

    // Check if theme was loaded from localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      "sdde_theme_preference",
    );
    expect(theme.currentTheme).toBe("light");
  });

  test("should not use localStorage if persistSettings is false", () => {
    // Create theme with persistSettings=false
    const theme: Theme = new Theme({ persistSettings: false });

    // Initialize and apply a theme
    theme.initialize();
    theme.applyTheme("light");

    // Should not save to localStorage
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test("should correctly toggle between themes", () => {
    const theme: Theme = new Theme({ defaultTheme: "dark" });

    // Toggle from dark to light
    expect(theme.toggleTheme()).toBe("light");
    expect(theme.currentTheme).toBe("light");

    // Toggle from light to dark
    expect(theme.toggleTheme()).toBe("dark");
    expect(theme.currentTheme).toBe("dark");
  });

  test("should handle localStorage errors gracefully", () => {
    // Make localStorage.getItem throw an error
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    const theme: Theme = new Theme();

    // Should not throw when loading theme
    expect(() => theme.loadSavedTheme()).not.toThrow();
    expect(console.warn).toHaveBeenCalled();

    // Reset mocks
    jest.clearAllMocks();

    // Make localStorage.setItem throw an error
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    // Should not throw when saving theme
    expect(() => theme.saveThemePreference()).not.toThrow();
    expect(console.warn).toHaveBeenCalled();
  });
});
