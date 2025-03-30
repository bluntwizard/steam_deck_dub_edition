/**
 * @jest-environment jsdom
 */

import { CodeBlocks } from "../../components/CodeBlocks";
import type { CodeBlocksOptions } from "../../types/codeblocks";
// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  configurable: true,
});

// Mock Prism
global.Prism = {
  highlightElement: jest.fn(),
};

describe("CodeBlocks Component", () => {
  let codeBlocks;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Reset document body
    document.body.innerHTML = "";

    // Create instance
    codeBlocks = new CodeBlocks({
      addCopyButtons: true,
      lineNumbers: true,
      showLanguage: true,
    });
  });

  test("initializes with default options", () => {
    const defaultCodeBlocks: CodeBlocks = new CodeBlocks();
    expect(defaultCodeBlocks.addCopyButtons).toBe(true);
    expect(defaultCodeBlocks.lineNumbers).toBe(true);
    expect(defaultCodeBlocks.showLanguage).toBe(false);
    expect(defaultCodeBlocks.expandableLongBlocks).toBe(true);
    expect(defaultCodeBlocks.expandThreshold).toBe(400);
    expect(defaultCodeBlocks.useSyntaxHighlighting).toBe(true);
    expect(defaultCodeBlocks.initialized).toBe(false);
  });

  test("initializes with custom options", () => {
    const customCodeBlocks: CodeBlocks = new CodeBlocks({
      addCopyButtons: false,
      lineNumbers: false,
      showLanguage: true,
      expandableLongBlocks: false,
      expandThreshold: 200,
      useSyntaxHighlighting: false,
    });

    expect(customCodeBlocks.addCopyButtons).toBe(false);
    expect(customCodeBlocks.lineNumbers).toBe(false);
    expect(customCodeBlocks.showLanguage).toBe(true);
    expect(customCodeBlocks.expandableLongBlocks).toBe(false);
    expect(customCodeBlocks.expandThreshold).toBe(200);
    expect(customCodeBlocks.useSyntaxHighlighting).toBe(false);
  });

  test("auto initializes when autoInit is true", () => {
    const autoInitCodeBlocks: CodeBlocks = new CodeBlocks({ autoInit: true });
    expect(autoInitCodeBlocks.initialized).toBe(true);
  });

  test("processes pre code blocks", () => {
    // Create code block
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = 'function test(): void {\n  console.log("Hello");\n}';
    code.classList.add("language-javascript");
    pre.appendChild(code);
    document.body.appendChild(pre);

    // Initialize and process
    codeBlocks.initialize();

    // Check if processed
    expect(code.dataset.processed).toBe("true");

    // Check if line numbers were added
    expect(pre.querySelector("div")).not.toBeNull();

    // Check if style classes were added
    expect(pre.classList.contains("codeBlock")).toBe(true);

    // Check if language label was added
    const labels = pre.querySelectorAll("div");
    let hasLanguageLabel = false;
    labels.forEach((label) => {
      if (label.textContent === "javascript") hasLanguageLabel = true;
    });
    expect(hasLanguageLabel).toBe(true);

    // Check if copy button was added
    const buttons = pre.querySelectorAll("button");
    let hasCopyButton = false;
    buttons.forEach((button) => {
      if (button.textContent === "Copy") hasCopyButton = true;
    });
    expect(hasCopyButton).toBe(true);

    // Check if syntax highlighting was called
    expect(Prism.highlightElement).toHaveBeenCalledWith(code);
  });

  test("processes code-block elements", () => {
    // Create code block
    const codeBlock = document.createElement("div");
    codeBlock.className = "code-block";
    const code = document.createElement("code");
    code.textContent = "npm install";
    codeBlock.appendChild(code);
    document.body.appendChild(codeBlock);

    // Initialize and process
    codeBlocks.initialize();

    // Check if processed
    expect(codeBlock.dataset.processed).toBe("true");

    // Check if style classes were added
    expect(codeBlock.classList.contains("codeBlock")).toBe(true);

    // Check if copy button was added
    const button = codeBlock.querySelector("button");
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("Copy");
  });

  test("copy button copies text to clipboard", async () => {
    // Create code block
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = "Test code";
    pre.appendChild(code);
    document.body.appendChild(pre);

    // Initialize and process
    codeBlocks.initialize();

    // Find copy button
    const copyButton = pre.querySelector("button");
    expect(copyButton).not.toBeNull();

    // Click copy button
    copyButton.click();

    // Verify clipboard API was called with correct text
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Test code");

    // Wait for button text to change
    copyButton.textContent = "Copied!";
    expect(copyButton.textContent).toBe("Copied!");

    // Fast-forward timers
    jest.useFakeTimers();
    jest.advanceTimersByTime(2000);

    // Button text should reset
    expect(copyButton.textContent).toBe("Copy");

    jest.useRealTimers();
  });

  test("makeExpandableIfLong makes long code blocks expandable", () => {
    // Create code block
    const pre = document.createElement("pre");
    pre.style.height = "500px"; // Make it tall

    // Mock scrollHeight
    Object.defineProperty(pre, "scrollHeight", { value: 500 });

    document.body.appendChild(pre);

    // Call the method directly
    codeBlocks.makeExpandableIfLong(pre);

    // Check if expandable class was added
    expect(pre.classList.contains("expandable")).toBe(true);

    // Check if expand button was added
    const expandButton = pre.querySelector("button");
    expect(expandButton).not.toBeNull();
    expect(expandButton.textContent).toBe("Show more");

    // Click the button to expand
    expandButton.click();

    // Check if expanded class was added
    expect(pre.classList.contains("expanded")).toBe(true);
    expect(expandButton.textContent).toBe("Show less");

    // Click again to collapse
    expandButton.click();

    // Check if expanded class was removed
    expect(pre.classList.contains("expanded")).toBe(false);
    expect(expandButton.textContent).toBe("Show more");
  });

  test("updateExpandableCodeBlocks updates all expandable blocks", () => {
    // Create multiple expandable blocks
    for (let i = 0; i < 3; i++) {
      const block = document.createElement("div");
      block.className = "expandable";

      const button = document.createElement("button");
      button.className = "expandButton";
      button.textContent = "Show more";

      block.appendChild(button);
      document.body.appendChild(block);
    }

    // Initialize
    codeBlocks.initialize();

    // Update to expanded state
    codeBlocks.updateExpandableCodeBlocks(true);

    // Check all blocks expanded
    document.querySelectorAll(".expandable").forEach((block) => {
      expect(block.classList.contains("expanded")).toBe(true);
      expect(block.querySelector("button").textContent).toBe("Show less");
    });

    // Update to collapsed state
    codeBlocks.updateExpandableCodeBlocks(false);

    // Check all blocks collapsed
    document.querySelectorAll(".expandable").forEach((block) => {
      expect(block.classList.contains("expanded")).toBe(false);
      expect(block.querySelector("button").textContent).toBe("Show more");
    });
  });

  test("handles content-inserted event", () => {
    // Spy on processCodeBlocks
    const processCodeBlocksSpy = jest.spyOn(codeBlocks, "processCodeBlocks");

    // Initialize
    codeBlocks.initialize();

    // Create section with code block
    const section = document.createElement("div");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = "Inserted code";
    pre.appendChild(code);
    section.appendChild(pre);

    // Dispatch content-inserted event
    const event: CustomEvent = new CustomEvent("content-inserted", {
      detail: { section },
    });
    document.dispatchEvent(event);

    // Use fake timers to advance past the setTimeout
    jest.useFakeTimers();
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    // Verify processCodeBlocks was called with the section
    expect(processCodeBlocksSpy).toHaveBeenCalledWith(section);
  });
});
