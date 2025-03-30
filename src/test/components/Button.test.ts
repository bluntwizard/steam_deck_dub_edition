/**
 * @jest-environment jsdom
 */

import { Button } from "../../components/Button";
import type { ButtonOptions } from "../../types/button";
describe("Button Component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("renders primary button correctly", () => {
    const button: Button = new Button({
      text: "Test Button",
    });

    const element = button.render();
    document.body.appendChild(element);

    expect(element.tagName).toBe("BUTTON");
    expect(element.textContent).toBe("Test Button");
    expect(element.classList.contains("primary")).toBe(true);
  });

  test("renders secondary button correctly", () => {
    const button: Button = new Button({
      text: "Secondary Button",
      variant: "secondary",
    });

    const element = button.render();
    document.body.appendChild(element);

    expect(element.textContent).toBe("Secondary Button");
    expect(element.classList.contains("secondary")).toBe(true);
    expect(element.classList.contains("primary")).toBe(false);
  });

  test("renders disabled button correctly", () => {
    const button: Button = new Button({
      text: "Disabled Button",
      disabled: true,
    });

    const element = button.render();
    document.body.appendChild(element);

    expect(element.disabled).toBe(true);
    expect(element.classList.contains("disabled")).toBe(true);
  });

  test("renders button with icon correctly", () => {
    const button: Button = new Button({
      text: "Icon Button",
      icon: "/path/to/icon.svg",
      iconAlt: "Icon Alt Text",
    });

    const element = button.render();
    document.body.appendChild(element);

    const icon = element.querySelector("img");
    // Check if icon exists before accessing properties
    expect(icon).not.toBeNull();
    if (icon) {
      expect(icon.src).toContain("/path/to/icon.svg");
      expect(icon.alt).toBe("Icon Alt Text");
    }
  });

  test("button click handler works correctly", () => {
    const mockClickHandler = jest.fn();

    const button: Button = new Button({
      text: "Click Me",
      onClick: mockClickHandler,
    });

    const element = button.render();
    document.body.appendChild(element);

    // Simulate a click
    element.click();

    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  test("setDisabled method works correctly", () => {
    const button: Button = new Button({
      text: "Test Button",
    });

    const element = button.render();
    document.body.appendChild(element);

    // Initially not disabled
    expect(element.disabled).toBe(false);
    expect(element.classList.contains("disabled")).toBe(false);

    // Set to disabled
    button.setDisabled(true);
    expect(element.disabled).toBe(true);
    expect(element.classList.contains("disabled")).toBe(true);

    // Set back to enabled
    button.setDisabled(false);
    expect(element.disabled).toBe(false);
    expect(element.classList.contains("disabled")).toBe(false);
  });

  test("setText method works correctly", () => {
    const button: Button = new Button({
      text: "Initial Text",
    });

    const element = button.render();
    document.body.appendChild(element);

    expect(element.textContent).toBe("Initial Text");

    // Change text
    button.setText("Updated Text");
    expect(element.textContent).toBe("Updated Text");
  });
});
