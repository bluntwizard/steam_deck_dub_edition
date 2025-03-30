/**
 * @jest-environment jsdom
 */

import SvgHeader from "../../components/SvgHeader";

describe("SvgHeader", () => {
  beforeEach(() => {
    // Clear the DOM
    document.body.innerHTML = "";

    // Mock document methods
    document.createElement = jest.fn().mockImplementation((tag) => {
      const element = document.implementation
        .createHTMLDocument()
        .createElement(tag);

      // Mock object specific methods
      if (tag === "object") {
        // Add contentDocument property
        Object.defineProperty(element, "contentDocument", {
          get: jest.fn().mockReturnValue({
            documentElement:
              document.implementation.createHTMLDocument().documentElement,
            querySelector: jest.fn().mockImplementation((selector) => {
              return document.implementation
                .createHTMLDocument()
                .querySelector(selector);
            }),
          }),
        });
      }

      return element;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should initialize with default options when autoInit is true", () => {
      const svgHeader: SvgHeader = new SvgHeader();

      expect(svgHeader.initialized).toBe(true);
      expect(svgHeader.headerContainer).not.toBeNull();
      expect(svgHeader.svgContainer).not.toBeNull();
      expect(document.body.contains(svgHeader.headerContainer)).toBe(true);
    });

    test("should not initialize when autoInit is false", () => {
      const svgHeader: SvgHeader = new SvgHeader({ autoInit: false });

      expect(svgHeader.initialized).toBe(false);
      expect(svgHeader.headerContainer).toBeNull();
      expect(svgHeader.svgContainer).toBeNull();
    });

    test("should initialize manually when calling initialize()", () => {
      const svgHeader: SvgHeader = new SvgHeader({ autoInit: false });
      const container = svgHeader.initialize();

      expect(svgHeader.initialized).toBe(true);
      expect(svgHeader.headerContainer).not.toBeNull();
      expect(svgHeader.svgContainer).not.toBeNull();
      expect(container).toBe(svgHeader.headerContainer);
      expect(document.body.contains(svgHeader.headerContainer)).toBe(true);
    });

    test("should not initialize twice", () => {
      const svgHeader: SvgHeader = new SvgHeader();
      const container1 = svgHeader.headerContainer;
      const container2 = svgHeader.initialize();

      expect(container1).toBe(container2);
    });
  });

  describe("Configuration", () => {
    test("should use default options when not provided", () => {
      const svgHeader: SvgHeader = new SvgHeader();

      expect(svgHeader.options.svgPath).toBe("sdde.svg");
      expect(svgHeader.options.fallbackText).toBe("Grimoire");
      expect(svgHeader.options.ariaLabel).toBe("Grimoire Logo");
      expect(svgHeader.options.container).toBe(document.body);
      expect(svgHeader.options.cssPath).toBe("svg-header-styles.css");
      expect(svgHeader.options.cssVariables).toContain("--color-main");
      expect(svgHeader.options.autoInit).toBe(true);
    });

    test("should override options when provided", () => {
      const customContainer = document.createElement("div");
      const customOptions = {
        svgPath: "custom.svg",
        fallbackText: "Custom Text",
        ariaLabel: "Custom SVG",
        container: customContainer,
        cssPath: "custom.css",
        cssVariables: ["--custom-var"],
        autoInit: false,
      };

      const svgHeader: SvgHeader = new SvgHeader(customOptions);

      expect(svgHeader.options.svgPath).toBe("custom.svg");
      expect(svgHeader.options.fallbackText).toBe("Custom Text");
      expect(svgHeader.options.ariaLabel).toBe("Custom SVG");
      expect(svgHeader.options.container).toBe(customContainer);
      expect(svgHeader.options.cssPath).toBe("custom.css");
      expect(svgHeader.options.cssVariables).toEqual(["--custom-var"]);
      expect(svgHeader.options.autoInit).toBe(false);
    });
  });

  describe("DOM Structure", () => {
    test("should create a header container with correct classes", () => {
      const svgHeader: SvgHeader = new SvgHeader();

      expect(
        svgHeader.headerContainer.classList.contains("header-container"),
      ).toBe(true);
      expect(svgHeader.headerContainer.classList.contains("svg-loading")).toBe(
        true,
      );
    });

    test("should create an SVG container with correct attributes", () => {
      const svgHeader: SvgHeader = new SvgHeader();

      expect(svgHeader.svgContainer.tagName.toLowerCase()).toBe("object");
      expect(svgHeader.svgContainer.data).toBe("sdde.svg");
      expect(svgHeader.svgContainer.type).toBe("image/svg+xml");
      expect(svgHeader.svgContainer.classList.contains("header-svg")).toBe(
        true,
      );
      expect(svgHeader.svgContainer.getAttribute("aria-label")).toBe(
        "Grimoire Logo",
      );
    });

    test("should create a fallback element with correct content", () => {
      const svgHeader: SvgHeader = new SvgHeader();

      const fallback = svgHeader.headerContainer.querySelector(".svg-fallback");
      expect(fallback).not.toBeNull();
      expect(fallback.innerHTML).toContain("Grimoire");
    });
  });

  describe("Event Handling", () => {
    test("should set up event listeners on initialization", () => {
      const addEventListenerSpy = jest.spyOn(
        Element.prototype,
        "addEventListener",
      );
      const svgHeader: SvgHeader = new SvgHeader();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "load",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );
    });

    test("should handle SVG load event correctly", () => {
      const svgHeader: SvgHeader = new SvgHeader();
      const mockSvgDoc = {
        documentElement: document.createElement("svg"),
        querySelector: jest
          .fn()
          .mockReturnValue(document.createElement("head")),
      };

      // Manually trigger load event
      svgHeader.handleSvgLoad();

      // Check if classes were updated correctly
      expect(svgHeader.headerContainer.classList.contains("svg-loading")).toBe(
        false,
      );
      expect(svgHeader.headerContainer.classList.contains("svg-loaded")).toBe(
        true,
      );
    });

    test("should handle SVG error event correctly", () => {
      const svgHeader: SvgHeader = new SvgHeader();

      // Manually trigger error event
      svgHeader.handleSvgError();

      // Check if classes were updated correctly
      expect(svgHeader.headerContainer.classList.contains("svg-loading")).toBe(
        false,
      );
      expect(svgHeader.headerContainer.classList.contains("svg-error")).toBe(
        true,
      );
    });
  });

  describe("Public Methods", () => {
    test("setSvgPath should update SVG path", () => {
      const svgHeader: SvgHeader = new SvgHeader();
      svgHeader.setSvgPath("new.svg");

      expect(svgHeader.options.svgPath).toBe("new.svg");
      expect(svgHeader.svgContainer.data).toBe("new.svg");
      expect(svgHeader.headerContainer.classList.contains("svg-loading")).toBe(
        true,
      );
    });

    test("setFallbackText should update fallback text", () => {
      const svgHeader: SvgHeader = new SvgHeader();
      svgHeader.setFallbackText("New Text");

      const fallback = svgHeader.headerContainer.querySelector(".svg-fallback");
      expect(svgHeader.options.fallbackText).toBe("New Text");
      expect(fallback.innerHTML).toContain("New Text");
    });

    test("destroy should remove component from DOM", () => {
      const svgHeader: SvgHeader = new SvgHeader();
      const headerContainer = svgHeader.headerContainer;

      svgHeader.destroy();

      expect(svgHeader.initialized).toBe(false);
      expect(svgHeader.headerContainer).toBeNull();
      expect(svgHeader.svgContainer).toBeNull();
      expect(document.body.contains(headerContainer)).toBe(false);
    });
  });
});
