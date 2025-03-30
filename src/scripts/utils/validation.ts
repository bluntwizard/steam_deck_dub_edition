/**
 * Grimoire
 * Validation Utility Functions
 */

/**
 * Check if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if a value is a boolean
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if a value is a function
 * @param value - The value to check
 * @returns True if the value is a function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Check if a value is an object (and not null)
 * @param value - The value to check
 * @returns True if the value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value is an array
 * @param value - The value to check
 * @returns True if the value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if a value is null or undefined
 * @param value - The value to check
 * @returns True if the value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is defined (not null or undefined)
 * @param value - The value to check
 * @returns True if the value is defined
 */
export function isDefined(value: unknown): boolean {
  return !isNullOrUndefined(value);
}

/**
 * Check if a value is empty (empty string, empty array, empty object)
 * @param value - The value to check
 * @returns True if the value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (isNullOrUndefined(value)) return true;
  if (isString(value)) return value.trim() === '';
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if a value is an HTML element
 * @param value - The value to check
 * @returns True if the value is an HTML element
 */
export function isElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

/**
 * Check if a value is a DOM node
 * @param value - The value to check
 * @returns True if the value is a DOM node
 */
export function isNode(value: unknown): value is Node {
  return value instanceof Node;
}

/**
 * Check if a value is a valid email
 * @param value - The value to check
 * @returns True if the value is a valid email
 */
export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if a value is a valid URL
 * @param value - The value to check
 * @returns True if the value is a valid URL
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string contains only alphanumeric characters
 * @param value - The value to check
 * @returns True if the value contains only alphanumeric characters
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Check if a value is a valid positive integer
 * @param value - The value to check
 * @returns True if the value is a valid positive integer
 */
export function isPositiveInteger(value: number): boolean {
  return isNumber(value) && Number.isInteger(value) && value > 0;
}

/**
 * Check if a number is within a specified range
 * @param value - The value to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if the value is within the range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return isNumber(value) && value >= min && value <= max;
}

/**
 * Check if a value is a valid JSON string
 * @param value - The value to check
 * @returns True if the value is a valid JSON string
 */
export function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value exists in localStorage
 * @param key - The key to check
 * @returns True if the key exists in localStorage
 */
export function existsInLocalStorage(key: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(key) !== null;
}

/**
 * Check if a date string is valid
 * @param value - The date string to check
 * @returns True if the value is a valid date
 */
export function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Check if a value matches a specific pattern
 * @param value - The value to check
 * @param pattern - Regular expression pattern
 * @returns True if the value matches the pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Check if all conditions are true
 * @param conditions - Array of boolean conditions
 * @returns True if all conditions are true
 */
export function all(conditions: boolean[]): boolean {
  return conditions.every(condition => condition === true);
}

/**
 * Check if any condition is true
 * @param conditions - Array of boolean conditions
 * @returns True if any condition is true
 */
export function any(conditions: boolean[]): boolean {
  return conditions.some(condition => condition === true);
}

/**
 * Validate an object against a schema of validation functions
 * @param obj - The object to validate
 * @param schema - Object with keys matching obj and validation function values
 * @returns Object with validation results for each field
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  schema: Record<keyof T, (value: unknown) => boolean>
): Record<keyof T, boolean> {
  const result = {} as Record<keyof T, boolean>;
  
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      result[key] = schema[key](obj[key]);
    }
  }
  
  return result;
}

/**
 * Validate form input value
 * @param value - The value to validate 
 * @param validators - Array of validation functions
 * @returns True if all validators pass
 */
export function validateInput(
  value: unknown, 
  validators: Array<(value: unknown) => boolean>
): boolean {
  return validators.every(validator => validator(value));
}

/**
 * Generate a validation error with custom message
 * @param message - The error message
 * @returns Validation error
 */
export function createValidationError(message: string): Error {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
} 