/**
 * Test suite for utility functions
 */

import {
  debounce,
  throttle,
  formatDate,
  generateId,
  isElementInViewport,
  copyToClipboard,
  getLocalStorage,
  setLocalStorage,
} from "../scripts/utils/index.js";

describe("Utility Functions", () => {
  // Debounce tests
  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should delay function execution", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      // Call the debounced function debouncedFunc(): void;

      // Function should not be called immediately
      expect(func).not.toBeCalled();

      // Fast forward time
      jest.advanceTimersByTime(1000);

      // Function should be called after the delay
      expect(func).toBeCalled();
      expect(func).toHaveBeenCalledTimes(1);
    });

    test("should only execute once when called multiple times within wait period", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      // Call the debounced function multiple times
      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      // Fast forward time
      jest.advanceTimersByTime(1000);

      // Function should only be called once
      expect(func).toHaveBeenCalledTimes(1);
    });

    test("should reset timer when called again within wait period", () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 1000);

      // Call the debounced function debouncedFunc(): void;

      // Advance time but not enough to trigger the function
      jest.advanceTimersByTime(500);

      // Call the function again
      debouncedFunc();

      // Advance time to just after the first delay
      jest.advanceTimersByTime(500);

      // Function should not have been called yet (the timer was reset)
      expect(func).not.toBeCalled();

      // Advance to complete the second delay
      jest.advanceTimersByTime(500);

      // Function should be called once after the second delay
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  // Throttle tests
  describe("throttle", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should execute function immediately", () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 1000);

      // Call the throttled function throttledFunc(): void;

      // Function should be called immediately
      expect(func).toBeCalled();
      expect(func).toHaveBeenCalledTimes(1);
    });

    test("should ignore subsequent calls within limit period", () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 1000);

      // Call the throttled function multiple times
      throttledFunc();
      throttledFunc();
      throttledFunc();

      // Function should only be called once
      expect(func).toHaveBeenCalledTimes(1);
    });

    test("should allow function to be called again after limit period", () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 1000);

      // Call the throttled function throttledFunc(): void;

      // Function should be called once
      expect(func).toHaveBeenCalledTimes(1);

      // Advance time past the limit
      jest.advanceTimersByTime(1001);

      // Call the function again
      throttledFunc();

      // Function should be called twice in total
      expect(func).toHaveBeenCalledTimes(2);
    });
  });

  // formatDate tests
  describe("formatDate", () => {
    test("should format date correctly", () => {
      // Testing with a fixed date to ensure consistent results
      const testDate: Date = new Date(2023, 2, 15); // March 15, 2023
      const formattedDate = formatDate(testDate);

      expect(formattedDate).toBe("March 15, 2023");
    });

    test("should handle string date input", () => {
      const dateString = "2023-04-20";
      const formattedDate = formatDate(dateString);

      expect(formattedDate).toBe("April 20, 2023");
    });
  });

  // generateId tests
  describe("generateId", () => {
    test("should generate an ID with the correct prefix", () => {
      const prefix = "test-";
      const id = generateId(prefix);

      expect(id.startsWith(prefix)).toBe(true);
      expect(id.length).toBeGreaterThan(prefix.length);
    });

    test("should generate a unique ID each time", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });
  });

  // isElementInViewport tests
  describe("isElementInViewport", () => {
    test("should return true when element is in viewport", () => {
      // Mock element with getBoundingClientRect returning values within viewport
      const element = {
        getBoundingClientRect: () => ({
          top: 100,
          left: 100,
          bottom: 200,
          right: 200,
        }),
      };

      // Mock window dimensions
      global.innerWidth = 1024;
      global.innerHeight = 768;

      expect(isElementInViewport(element)).toBe(true);
    });

    test("should return false when element is outside viewport", () => {
      // Mock element with getBoundingClientRect returning values outside viewport
      const element = {
        getBoundingClientRect: () => ({
          top: -100,
          left: -100,
          bottom: -50,
          right: -50,
        }),
      };

      // Mock window dimensions
      global.innerWidth = 1024;
      global.innerHeight = 768;

      expect(isElementInViewport(element)).toBe(false);
    });
  });

  // copyToClipboard tests
  describe("copyToClipboard", () => {
    test("should call navigator.clipboard.writeText with correct text", () => {
      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      global.navigator.clipboard = { writeText: mockWriteText };

      const text = "Text to copy";
      copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
    });
  });

  // localStorage tests
  describe("localStorage utilities", () => {
    beforeEach(() => {
      // Set up localStorage mock
      const localStorageMock: any = (() => {
        let store = {};
        return {
          getItem: jest.fn((key) => store[key] || null),
          setItem: jest.fn((key, value) => {
            store[key] = value;
          }),
          clear: jest.fn(() => {
            store = {};
          }),
        };
      })();

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
        writable: true,
      });
    });

    test("getLocalStorage should retrieve and parse stored value", () => {
      // Store a value
      const testObj = { name: "test", value: 123 };
      window.localStorage.setItem("testKey", JSON.stringify(testObj));

      const retrieved = getLocalStorage("testKey");
      expect(retrieved).toEqual(testObj);
    });

    test("getLocalStorage should return default value when key not found", () => {
      const defaultValue = { default: true };
      const retrieved = getLocalStorage("nonExistentKey", defaultValue);
      expect(retrieved).toEqual(defaultValue);
    });

    test("setLocalStorage should stringify and store value", () => {
      const testObj = { name: "test", value: 456 };
      const result = setLocalStorage("testKey", testObj);

      expect(result).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify(testObj),
      );
    });

    test("setLocalStorage should handle errors gracefully", () => {
      // Mock localStorage to throw an error
      window.localStorage.setItem.mockImplementationOnce(() => {
        throw new Error("Storage error");
      });

      const result = setLocalStorage("testKey", { data: "test" });
      expect(result).toBe(false);
    });

    test("getLocalStorage should handle JSON parse errors", () => {
      // Set up invalid JSON
      window.localStorage.getItem.mockReturnValueOnce("invalid-json");

      const defaultValue = { default: true };
      const result = getLocalStorage("testKey", defaultValue);

      expect(result).toEqual(defaultValue);
    });
  });
});
