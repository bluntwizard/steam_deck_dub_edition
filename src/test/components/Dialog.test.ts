/**
 * @jest-environment jsdom
 */

import Dialog from "../../components/Dialog";

// Mock styles for CSS modules
jest.mock("../../components/Dialog/Dialog.module.css", () => ({
  dialogOverlay: "dialogOverlay",
  dialog: "dialog",
  dialogTitle: "dialogTitle",
  closeButton: "closeButton",
  dialogContent: "dialogContent",
  dialogActions: "dialogActions",
  buttonPrimary: "buttonPrimary",
  buttonDanger: "buttonDanger",
  buttonSecondary: "buttonSecondary",
}));

describe("Dialog", () => {
  let dialog;
  let container;

  // Setup - runs before each test
  beforeEach(() => {
    // Create a container element to check DOM operations
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);

    // Mock document.createElement to track created elements
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      const element = originalCreateElement.call(document, tagName);
      // Add custom querySelector for testing
      if (tagName === "div") {
        element.querySelector = jest.fn().mockImplementation((selector) => {
          if (selector === ".dialogContent") {
            return element.classList.contains("dialogContent") ? element : null;
          }
          return null;
        });
      }
      return element;
    });

    // Mock event listeners
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  // Cleanup - runs after each test
  afterEach(() => {
    if (dialog) {
      dialog.destroy();
    }

    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    // Restore original document.createElement
    document.createElement.mockRestore && document.createElement.mockRestore();

    // Cleanup any elements added to body
    const dialogs = document.querySelectorAll(".dialogOverlay");
    dialogs.forEach((el) => {
      el.parentNode && el.parentNode.removeChild(el);
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should initialize with default options", () => {
      dialog = new Dialog();

      expect(dialog).toBeDefined();
      expect(dialog.options.title).toBe("");
      expect(dialog.options.content).toBe("");
      expect(dialog.options.closeOnEscape).toBe(true);
      expect(dialog.options.closeOnOutsideClick).toBe(true);
      expect(dialog.options.showCloseButton).toBe(true);
      expect(dialog.options.maxWidth).toBe("500px");
      expect(dialog.dialogElement).toBeNull();
      expect(dialog.overlayElement).toBeNull();
      expect(dialog.isVisible).toBe(false);
    });

    test("should initialize with custom options", () => {
      const customOptions = {
        title: "Test Dialog",
        content: "<p>Test content</p>",
        closeOnEscape: false,
        closeOnOutsideClick: false,
        showCloseButton: false,
        width: "600px",
        maxWidth: "800px",
        onClose: jest.fn(),
        actions: [{ text: "OK", primary: true }, { text: "Cancel" }],
      };

      dialog = new Dialog(customOptions);

      expect(dialog.options.title).toBe("Test Dialog");
      expect(dialog.options.content).toBe("<p>Test content</p>");
      expect(dialog.options.closeOnEscape).toBe(false);
      expect(dialog.options.closeOnOutsideClick).toBe(false);
      expect(dialog.options.showCloseButton).toBe(false);
      expect(dialog.options.width).toBe("600px");
      expect(dialog.options.maxWidth).toBe("800px");
      expect(dialog.options.onClose).toBeDefined();
      expect(dialog.options.actions.length).toBe(2);
    });
  });

  describe("DOM Creation", () => {
    test("should create dialog elements when show method is called", () => {
      dialog = new Dialog({
        title: "Test Dialog",
        content: "Test content",
      });

      dialog.show();

      expect(dialog.dialogElement).not.toBeNull();
      expect(dialog.overlayElement).not.toBeNull();
      expect(dialog.isVisible).toBe(true);

      // Check if elements are added to the DOM
      expect(document.querySelector(".dialogOverlay")).not.toBeNull();
      expect(document.querySelector(".dialog")).not.toBeNull();
      expect(document.querySelector(".dialogTitle")).not.toBeNull();
      expect(document.querySelector(".dialogContent")).not.toBeNull();
    });

    test("should set custom width and maxWidth if specified", () => {
      dialog = new Dialog({
        width: "400px",
        maxWidth: "600px",
      });

      dialog.show();

      expect(dialog.dialogElement.style.width).toBe("400px");
      expect(dialog.dialogElement.style.maxWidth).toBe("600px");
    });

    test("should create title element if title is provided", () => {
      dialog = new Dialog({
        title: "Test Dialog",
      });

      dialog.show();

      const titleElement = document.querySelector(".dialogTitle");
      expect(titleElement).not.toBeNull();
      expect(titleElement.textContent).toBe("Test Dialog");
    });

    test("should create close button if showCloseButton is true", () => {
      dialog = new Dialog({
        showCloseButton: true,
      });

      dialog.show();

      const closeButton = document.querySelector(".closeButton");
      expect(closeButton).not.toBeNull();
      expect(closeButton.getAttribute("aria-label")).toBe("Close");
    });

    test("should not create close button if showCloseButton is false", () => {
      dialog = new Dialog({
        showCloseButton: false,
      });

      dialog.show();

      const closeButton = document.querySelector(".closeButton");
      expect(closeButton).toBeNull();
    });

    test("should add string content to content element", () => {
      dialog = new Dialog({
        content: "<p>Test content</p>",
      });

      dialog.show();

      const contentElement = document.querySelector(".dialogContent");
      expect(contentElement).not.toBeNull();
      expect(contentElement.innerHTML).toBe("<p>Test content</p>");
    });

    test("should add HTMLElement content to content element", () => {
      const htmlContent = document.createElement("div");
      htmlContent.textContent = "Test HTML content";

      dialog = new Dialog({
        content: htmlContent,
      });

      dialog.show();

      const contentElement = document.querySelector(".dialogContent");
      expect(contentElement).not.toBeNull();
      expect(contentElement.firstChild).toBe(htmlContent);
    });

    test("should create action buttons if actions are provided", () => {
      dialog = new Dialog({
        actions: [{ text: "OK", primary: true }, { text: "Cancel" }],
      });

      dialog.show();

      const actionsElement = document.querySelector(".dialogActions");
      expect(actionsElement).not.toBeNull();

      const buttons = actionsElement.querySelectorAll("button");
      expect(buttons.length).toBe(2);

      expect(buttons[0].textContent).toBe("OK");
      expect(buttons[0].className).toBe("buttonPrimary");

      expect(buttons[1].textContent).toBe("Cancel");
      expect(buttons[1].className).toBe("buttonSecondary");
    });

    test("should create danger button if action has danger flag", () => {
      dialog = new Dialog({
        actions: [{ text: "Delete", danger: true }],
      });

      dialog.show();

      const button = document.querySelector(".buttonDanger");
      expect(button).not.toBeNull();
      expect(button.textContent).toBe("Delete");
    });
  });

  describe("Event Handling", () => {
    test("should add event listeners when created", () => {
      dialog = new Dialog();
      dialog.show();

      expect(document.addEventListener).toHaveBeenCalledWith(
        "keydown",
        dialog.handleKeyDown,
      );
      expect(dialog.overlayElement.addEventListener).toHaveBeenCalledWith(
        "click",
        dialog.handleOutsideClick,
      );
    });

    test("should not add escape key listener if closeOnEscape is false", () => {
      dialog = new Dialog({ closeOnEscape: false });
      dialog.show();

      expect(document.addEventListener).not.toHaveBeenCalledWith(
        "keydown",
        dialog.handleKeyDown,
      );
    });

    test("should not add outside click listener if closeOnOutsideClick is false", () => {
      dialog = new Dialog({ closeOnOutsideClick: false });
      dialog.show();

      // Mock the addEventListener to verify it's not called with handleOutsideClick
      const originalAddEventListener = dialog.overlayElement.addEventListener;
      dialog.overlayElement.addEventListener = jest.fn();

      dialog.addEventListeners();

      expect(dialog.overlayElement.addEventListener).not.toHaveBeenCalledWith(
        "click",
        dialog.handleOutsideClick,
      );

      // Restore original method
      dialog.overlayElement.addEventListener = originalAddEventListener;
    });

    test("should close on Escape key press if closeOnEscape is true", () => {
      dialog = new Dialog();
      dialog.close = jest.fn();
      dialog.show();
      dialog.isVisible = true;

      // Simulate Escape key press
      const escapeEvent: KeyboardEvent = new KeyboardEvent("keydown", {
        key: "Escape",
      });
      dialog.handleKeyDown(escapeEvent);

      expect(dialog.close).toHaveBeenCalled();
    });

    test("should not close on Escape key press if not visible", () => {
      dialog = new Dialog();
      dialog.close = jest.fn();
      dialog.show();
      dialog.isVisible = false;

      // Simulate Escape key press
      const escapeEvent: KeyboardEvent = new KeyboardEvent("keydown", {
        key: "Escape",
      });
      dialog.handleKeyDown(escapeEvent);

      expect(dialog.close).not.toHaveBeenCalled();
    });

    test("should close on outside click if closeOnOutsideClick is true", () => {
      dialog = new Dialog();
      dialog.close = jest.fn();
      dialog.show();

      // Create a mock event where target is the overlay element
      const clickEvent = { target: dialog.overlayElement };
      dialog.handleOutsideClick(clickEvent);

      expect(dialog.close).toHaveBeenCalled();
    });

    test("should not close on click inside dialog content", () => {
      dialog = new Dialog();
      dialog.close = jest.fn();
      dialog.show();

      // Create a mock event where target is not the overlay element
      const clickEvent = { target: dialog.dialogElement };
      dialog.handleOutsideClick(clickEvent);

      expect(dialog.close).not.toHaveBeenCalled();
    });

    test("should call action onClick handler when action button is clicked", () => {
      const actionClick = jest.fn();
      dialog = new Dialog({
        actions: [{ text: "OK", onClick: actionClick }],
      });

      dialog.show();

      // Find the action button and simulate click
      const button = document.querySelector(".dialogActions button");
      button.click();

      expect(actionClick).toHaveBeenCalled();
    });

    test("should close dialog after action button click by default", () => {
      const actionClick = jest.fn();
      dialog = new Dialog({
        actions: [{ text: "OK", onClick: actionClick }],
      });

      dialog.close = jest.fn();
      dialog.show();

      // Find the action button and simulate click
      const button = document.querySelector(".dialogActions button");
      button.click();

      expect(dialog.close).toHaveBeenCalled();
    });

    test("should not close dialog if action onClick returns false", () => {
      const actionClick = jest.fn().mockReturnValue(false);
      dialog = new Dialog({
        actions: [{ text: "OK", onClick: actionClick }],
      });

      dialog.close = jest.fn();
      dialog.show();

      // Find the action button and simulate click
      const button = document.querySelector(".dialogActions button");
      button.click();

      expect(actionClick).toHaveBeenCalled();
      expect(dialog.close).not.toHaveBeenCalled();
    });
  });

  describe("Visibility Control", () => {
    test("should show the dialog when show method is called", () => {
      dialog = new Dialog();

      expect(dialog.isVisible).toBe(false);

      dialog.show();

      expect(dialog.isVisible).toBe(true);
      expect(dialog.overlayElement.style.display).toBe("flex");
      expect(document.body.style.overflow).toBe("hidden");
    });

    test("should hide the dialog when close method is called", () => {
      dialog = new Dialog();
      dialog.show();

      expect(dialog.isVisible).toBe(true);

      dialog.close();

      expect(dialog.isVisible).toBe(false);
      expect(dialog.overlayElement.style.display).toBe("none");
      expect(document.body.style.overflow).toBe("");
    });

    test("should call onClose callback when dialog is closed", () => {
      const onCloseMock = jest.fn();
      dialog = new Dialog({
        onClose: onCloseMock,
      });

      dialog.show();
      dialog.close();

      expect(onCloseMock).toHaveBeenCalled();
    });

    test("should remove event listeners when dialog is closed", () => {
      dialog = new Dialog();
      dialog.show();
      dialog.close();

      expect(document.removeEventListener).toHaveBeenCalledWith(
        "keydown",
        dialog.handleKeyDown,
      );
    });
  });

  describe("Cleanup", () => {
    test("should remove all elements and reset properties on destroy", () => {
      dialog = new Dialog();
      dialog.show();

      const overlayElement = dialog.overlayElement;

      dialog.destroy();

      expect(dialog.dialogElement).toBeNull();
      expect(dialog.overlayElement).toBeNull();
      expect(document.body.contains(overlayElement)).toBe(false);
    });
  });

  describe("Content Management", () => {
    test("should update content when setContent is called with string", () => {
      dialog = new Dialog({
        content: "Original content",
      });
      dialog.show();

      expect(
        dialog.dialogElement.querySelector(".dialogContent").innerHTML,
      ).toBe("Original content");

      dialog.setContent("Updated content");

      expect(
        dialog.dialogElement.querySelector(".dialogContent").innerHTML,
      ).toBe("Updated content");
    });

    test("should update content when setContent is called with HTMLElement", () => {
      dialog = new Dialog();
      dialog.show();

      const newContent = document.createElement("div");
      newContent.textContent = "Element content";

      dialog.setContent(newContent);

      expect(
        dialog.dialogElement
          .querySelector(".dialogContent")
          .contains(newContent),
      ).toBe(true);
    });

    test("should not update content if dialog is not created", () => {
      dialog = new Dialog();

      // This should not throw an error even though the dialog hasn't been shown yet
      const result = dialog.setContent("Test content");

      expect(result).toBe(dialog); // Should return this for chaining
    });
  });
});
