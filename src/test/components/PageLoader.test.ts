/**
 * @jest-environment jsdom
 */

import { PageLoader } from "../../components/PageLoader/PageLoader";

// Mock styles for CSS modules
jest.mock("../../components/PageLoader/PageLoader.module.css", () => ({
  pageLoader: "pageLoader",
  visible: "visible",
  fadeOut: "fadeOut",
  loaderContent: "loaderContent",
  spinner: "spinner",
  message: "message",
  progressContainer: "progressContainer",
  progressBar: "progressBar",
  error: "error",
  errorIcon: "errorIcon",
  retryButton: "retryButton",
}));

describe("PageLoader", () => {
  // Setup
  let pageLoader;
  let container;

  beforeEach(() => {
    // Create a container div and add it to the document
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);

    // Mock event listeners
    window.addEventListener = jest.fn();
    document.addEventListener = jest.fn();

    // Mock XMLHttpRequest
    global.XMLHttpRequest = function () {
      this.addEventListener = jest.fn();
    };
    XMLHttpRequest.prototype.open = jest.fn();
    XMLHttpRequest.prototype.send = jest.fn();
  });

  afterEach(() => {
    // Clean up
    if (pageLoader && pageLoader.destroy) {
      pageLoader.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should initialize with default options when autoInit is true", () => {
      pageLoader = new PageLoader();
      expect(pageLoader.initialized).toBeTruthy();
      expect(pageLoader.message).toBe("Loading...");
      expect(pageLoader.showSpinner).toBeTruthy();
      expect(pageLoader.showProgress).toBeFalsy();
      expect(pageLoader.autoHide).toBeTruthy();
    });

    test("should not initialize when autoInit is false", () => {
      pageLoader = new PageLoader({ autoInit: false });
      expect(pageLoader.initialized).toBeFalsy();
      expect(pageLoader.loaderElement).toBeNull();
    });

    test("should initialize with custom options", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        message: "Custom loading message",
        showSpinner: false,
        showProgress: true,
        autoHide: false,
        minDisplayTime: 1500,
        fadeOutTime: 500,
      });

      expect(pageLoader.container).toBe(container);
      expect(pageLoader.message).toBe("Custom loading message");
      expect(pageLoader.showSpinner).toBeFalsy();
      expect(pageLoader.showProgress).toBeTruthy();
      expect(pageLoader.autoHide).toBeFalsy();
      expect(pageLoader.minDisplayTime).toBe(1500);
      expect(pageLoader.fadeOutTime).toBe(500);
    });

    test("should be able to initialize manually when autoInit is false", () => {
      pageLoader = new PageLoader({ autoInit: false });
      expect(pageLoader.initialized).toBeFalsy();

      pageLoader.initialize();
      expect(pageLoader.initialized).toBeTruthy();
      expect(pageLoader.loaderElement).not.toBeNull();
    });
  });

  describe("DOM Elements", () => {
    test("should create loader element with correct structure", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      // Check if the loader element exists and has the correct class
      const loaderElement = container.querySelector(".pageLoader");
      expect(loaderElement).not.toBeNull();

      // Check if the loader content element exists
      const contentElement = loaderElement.querySelector(".loaderContent");
      expect(contentElement).not.toBeNull();

      // Check if spinner is created when showSpinner is true
      const spinnerElement = contentElement.querySelector(".spinner");
      expect(spinnerElement).not.toBeNull();

      // Check if message element is created
      const messageElement = contentElement.querySelector(".message");
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent).toBe("Loading...");
    });

    test("should not create spinner when showSpinner is false", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        showSpinner: false,
      });

      const spinnerElement = container.querySelector(".spinner");
      expect(spinnerElement).toBeNull();
    });

    test("should create progress bar when showProgress is true", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        showProgress: true,
      });

      const progressContainer = container.querySelector(".progressContainer");
      expect(progressContainer).not.toBeNull();

      const progressBar = progressContainer.querySelector(".progressBar");
      expect(progressBar).not.toBeNull();
      expect(progressBar.style.width).toBe("0%");
    });
  });

  describe("Visibility Control", () => {
    test("should show loader when show method is called", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      expect(pageLoader.visible).toBeFalsy();

      // Mock the current time
      jest.spyOn(Date, "now").mockImplementation(() => 1000);

      // Mock dispatchEvent
      document.dispatchEvent = jest.fn();

      pageLoader.show();

      expect(pageLoader.visible).toBeTruthy();
      expect(pageLoader.startTime).toBe(1000);
      expect(
        pageLoader.loaderElement.classList.contains("visible"),
      ).toBeTruthy();
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "pageloader-shown",
          detail: { pageLoader },
        }),
      );
    });

    test("should set custom message when provided to show method", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      pageLoader.show("Custom message");

      const messageElement = container.querySelector(".message");
      expect(messageElement.textContent).toBe("Custom message");
    });

    test("should hide loader when hide method is called", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      // Show first
      pageLoader.show();
      expect(pageLoader.visible).toBeTruthy();

      // Mock dispatchEvent
      document.dispatchEvent = jest.fn();

      // Mock setTimeout
      jest.useFakeTimers();

      pageLoader.hide();

      expect(pageLoader.visible).toBeFalsy();
      expect(
        pageLoader.loaderElement.classList.contains("visible"),
      ).toBeFalsy();
      expect(
        pageLoader.loaderElement.classList.contains("fadeOut"),
      ).toBeTruthy();
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "pageloader-hidden",
          detail: { pageLoader },
        }),
      );

      // Advance timers to check fadeOut class removal
      jest.advanceTimersByTime(300); // Default fadeOutTime
      expect(
        pageLoader.loaderElement.classList.contains("fadeOut"),
      ).toBeFalsy();

      jest.useRealTimers();
    });

    test("should respect minimum display time", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        minDisplayTime: 1000,
      });

      // Mock the current time for start
      let currentTime = 1000;
      jest.spyOn(Date, "now").mockImplementation(() => currentTime);

      // Show the loader
      pageLoader.show();
      expect(pageLoader.startTime).toBe(1000);

      // Mock setTimeout
      jest.useFakeTimers();

      // Try to hide after 500ms (less than minDisplayTime)
      currentTime = 1500; // 500ms elapsed
      pageLoader.hideAfterDelay();

      // Should schedule a timeout instead of hiding immediately
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
      expect(pageLoader.visible).toBeTruthy();

      // Advance timers to trigger the timeout
      jest.advanceTimersByTime(500);
      expect(pageLoader.visible).toBeFalsy();

      jest.useRealTimers();
    });
  });

  describe("Progress Tracking", () => {
    test("should update progress bar when setProgress is called", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        showProgress: true,
      });

      // Mock dispatchEvent
      document.dispatchEvent = jest.fn();

      pageLoader.setProgress(50);

      expect(pageLoader.progress).toBe(50);
      expect(pageLoader.progressBarElement.style.width).toBe("50%");
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "pageloader-progress",
          detail: {
            pageLoader,
            progress: 50,
          },
        }),
      );
    });

    test("should clamp progress values between 0 and 100", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        showProgress: true,
      });

      pageLoader.setProgress(-10);
      expect(pageLoader.progress).toBe(0);
      expect(pageLoader.progressBarElement.style.width).toBe("0%");

      pageLoader.setProgress(120);
      expect(pageLoader.progress).toBe(100);
      expect(pageLoader.progressBarElement.style.width).toBe("100%");
    });

    test("should call hideAfterDelay when progress reaches 100%", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        showProgress: true,
      });

      // Spy on hideAfterDelay
      const hideAfterDelaySpy = jest.spyOn(pageLoader, "hideAfterDelay");

      pageLoader.setProgress(100);

      expect(hideAfterDelaySpy).toHaveBeenCalled();
    });

    test("should track load steps and calculate progress", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        showProgress: true,
      });

      // Spy on setProgress
      const setProgressSpy = jest.spyOn(pageLoader, "setProgress");

      // Add three load steps
      pageLoader.addLoadStep("step1");
      pageLoader.addLoadStep("step2");
      pageLoader.addLoadStep("step3");

      // Complete steps one by one
      pageLoader.completeLoadStep("step1");
      expect(setProgressSpy).toHaveBeenLastCalledWith(33); // 1/3 = 33%

      pageLoader.completeLoadStep("step2");
      expect(setProgressSpy).toHaveBeenLastCalledWith(66); // 2/3 = 66%

      pageLoader.completeLoadStep("step3");
      expect(setProgressSpy).toHaveBeenLastCalledWith(100); // 3/3 = 100%
    });
  });

  describe("Error Handling", () => {
    test("should display error message and retry button", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      // Mock dispatchEvent
      document.dispatchEvent = jest.fn();

      pageLoader.showError("Failed to load resources");

      expect(pageLoader.loaderElement.classList.contains("error")).toBeTruthy();

      const errorIcon = container.querySelector(".errorIcon");
      expect(errorIcon).not.toBeNull();

      const errorMessage = container.querySelector(".message div:nth-child(2)");
      expect(errorMessage.textContent).toBe("Failed to load resources");

      const retryButton = container.querySelector(".retryButton");
      expect(retryButton).not.toBeNull();
      expect(retryButton.textContent.trim()).toBe("Retry");

      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "pageloader-error",
          detail: {
            pageLoader,
            error: "Failed to load resources",
          },
        }),
      );
    });
  });

  describe("Cleanup", () => {
    test("should remove elements and reset properties on destroy", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      // Ensure loader is created
      expect(pageLoader.loaderElement).not.toBeNull();
      expect(container.querySelector(".pageLoader")).not.toBeNull();

      // Mock dispatchEvent
      document.dispatchEvent = jest.fn();

      pageLoader.destroy();

      // Check if element is removed from DOM
      expect(container.querySelector(".pageLoader")).toBeNull();

      // Check if properties are reset
      expect(pageLoader.loaderElement).toBeNull();
      expect(pageLoader.progressBarElement).toBeNull();
      expect(pageLoader.messageElement).toBeNull();
      expect(pageLoader.initialized).toBeFalsy();
      expect(pageLoader.visible).toBeFalsy();

      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "pageloader-destroyed",
          detail: { pageLoader },
        }),
      );
    });
  });

  describe("Event Listeners", () => {
    test("should setup automatic progress tracking events when autoHide is true", () => {
      pageLoader = new PageLoader({ container: "#test-container" });

      // Check if event listeners were added
      expect(window.addEventListener).toHaveBeenCalledWith(
        "load",
        expect.any(Function),
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "DOMContentLoaded",
        expect.any(Function),
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "content-loaded",
        expect.any(Function),
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        "ajax-complete",
        expect.any(Function),
      );
    });

    test("should not setup automatic progress tracking when autoHide is false", () => {
      pageLoader = new PageLoader({
        container: "#test-container",
        autoHide: false,
      });

      // Window load event should not be added
      expect(window.addEventListener).not.toHaveBeenCalledWith(
        "load",
        expect.any(Function),
      );

      // But content-loaded event should still be added regardless of autoHide
      expect(document.addEventListener).toHaveBeenCalledWith(
        "content-loaded",
        expect.any(Function),
      );
    });
  });
});
