/**
 * Validation Utilities Tests
 */

import * as validation from '../../scripts/utils/validation';

describe('Validation Utilities', () => {
  describe('isString', () => {
    it('should return true for strings', () => {
      expect(validation.isString('test')).toBe(true);
      expect(validation.isString('')).toBe(true);
    });

    it('should return false for non-strings', () => {
      expect(validation.isString(123)).toBe(false);
      expect(validation.isString(true)).toBe(false);
      expect(validation.isString({})).toBe(false);
      expect(validation.isString([])).toBe(false);
      expect(validation.isString(null)).toBe(false);
      expect(validation.isString(undefined)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(validation.isNumber(123)).toBe(true);
      expect(validation.isNumber(0)).toBe(true);
      expect(validation.isNumber(-10)).toBe(true);
      expect(validation.isNumber(1.5)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(validation.isNumber(NaN)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(validation.isNumber('123')).toBe(false);
      expect(validation.isNumber(true)).toBe(false);
      expect(validation.isNumber({})).toBe(false);
      expect(validation.isNumber([])).toBe(false);
      expect(validation.isNumber(null)).toBe(false);
      expect(validation.isNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(validation.isBoolean(true)).toBe(true);
      expect(validation.isBoolean(false)).toBe(true);
    });

    it('should return false for non-booleans', () => {
      expect(validation.isBoolean('true')).toBe(false);
      expect(validation.isBoolean(1)).toBe(false);
      expect(validation.isBoolean(0)).toBe(false);
      expect(validation.isBoolean({})).toBe(false);
      expect(validation.isBoolean([])).toBe(false);
      expect(validation.isBoolean(null)).toBe(false);
      expect(validation.isBoolean(undefined)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(validation.isFunction(() => {})).toBe(true);
      expect(validation.isFunction(function() {})).toBe(true);
      expect(validation.isFunction(console.log)).toBe(true);
    });

    it('should return false for non-functions', () => {
      expect(validation.isFunction('function')).toBe(false);
      expect(validation.isFunction(123)).toBe(false);
      expect(validation.isFunction({})).toBe(false);
      expect(validation.isFunction([])).toBe(false);
      expect(validation.isFunction(null)).toBe(false);
      expect(validation.isFunction(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(validation.isObject({})).toBe(true);
      expect(validation.isObject({ a: 1 })).toBe(true);
      expect(validation.isObject(new Object())).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(validation.isObject([])).toBe(false);
      expect(validation.isObject([1, 2, 3])).toBe(false);
    });

    it('should return false for null', () => {
      expect(validation.isObject(null)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(validation.isObject(123)).toBe(false);
      expect(validation.isObject('object')).toBe(false);
      expect(validation.isObject(true)).toBe(false);
      expect(validation.isObject(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(validation.isArray([])).toBe(true);
      expect(validation.isArray([1, 2, 3])).toBe(true);
      expect(validation.isArray(new Array())).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(validation.isArray({})).toBe(false);
      expect(validation.isArray('array')).toBe(false);
      expect(validation.isArray(123)).toBe(false);
      expect(validation.isArray(true)).toBe(false);
      expect(validation.isArray(null)).toBe(false);
      expect(validation.isArray(undefined)).toBe(false);
    });
  });

  describe('isNullOrUndefined', () => {
    it('should return true for null and undefined', () => {
      expect(validation.isNullOrUndefined(null)).toBe(true);
      expect(validation.isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(validation.isNullOrUndefined('')).toBe(false);
      expect(validation.isNullOrUndefined(0)).toBe(false);
      expect(validation.isNullOrUndefined(false)).toBe(false);
      expect(validation.isNullOrUndefined({})).toBe(false);
      expect(validation.isNullOrUndefined([])).toBe(false);
    });
  });

  describe('isDefined', () => {
    it('should return false for null and undefined', () => {
      expect(validation.isDefined(null)).toBe(false);
      expect(validation.isDefined(undefined)).toBe(false);
    });

    it('should return true for other values', () => {
      expect(validation.isDefined('')).toBe(true);
      expect(validation.isDefined(0)).toBe(true);
      expect(validation.isDefined(false)).toBe(true);
      expect(validation.isDefined({})).toBe(true);
      expect(validation.isDefined([])).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(validation.isEmpty('')).toBe(true);
      expect(validation.isEmpty('  ')).toBe(true);
      expect(validation.isEmpty([])).toBe(true);
      expect(validation.isEmpty({})).toBe(true);
      expect(validation.isEmpty(null)).toBe(true);
      expect(validation.isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(validation.isEmpty('test')).toBe(false);
      expect(validation.isEmpty([1, 2, 3])).toBe(false);
      expect(validation.isEmpty({ a: 1 })).toBe(false);
      expect(validation.isEmpty(0)).toBe(false);
      expect(validation.isEmpty(false)).toBe(false);
    });
  });

  describe('isElement', () => {
    it('should return true for HTMLElements', () => {
      const element = document.createElement('div');
      expect(validation.isElement(element)).toBe(true);
    });

    it('should return false for non-elements', () => {
      expect(validation.isElement({})).toBe(false);
      expect(validation.isElement('<div></div>')).toBe(false);
      expect(validation.isElement(null)).toBe(false);
    });
  });

  describe('isNode', () => {
    it('should return true for DOM nodes', () => {
      const element = document.createElement('div');
      const textNode = document.createTextNode('text');
      expect(validation.isNode(element)).toBe(true);
      expect(validation.isNode(textNode)).toBe(true);
    });

    it('should return false for non-nodes', () => {
      expect(validation.isNode({})).toBe(false);
      expect(validation.isNode('<div></div>')).toBe(false);
      expect(validation.isNode(null)).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should return true for valid emails', () => {
      expect(validation.isEmail('test@example.com')).toBe(true);
      expect(validation.isEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validation.isEmail('test')).toBe(false);
      expect(validation.isEmail('test@')).toBe(false);
      expect(validation.isEmail('test@domain')).toBe(false);
      expect(validation.isEmail('@domain.com')).toBe(false);
    });
  });

  describe('isUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validation.isUrl('https://example.com')).toBe(true);
      expect(validation.isUrl('http://localhost:3000')).toBe(true);
      expect(validation.isUrl('ftp://files.example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validation.isUrl('example.com')).toBe(false); // missing protocol
      expect(validation.isUrl('https://')).toBe(false);
      expect(validation.isUrl('not a url')).toBe(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('should return true for alphanumeric strings', () => {
      expect(validation.isAlphanumeric('abc123')).toBe(true);
      expect(validation.isAlphanumeric('123456')).toBe(true);
      expect(validation.isAlphanumeric('abcDEF')).toBe(true);
    });

    it('should return false for non-alphanumeric strings', () => {
      expect(validation.isAlphanumeric('abc 123')).toBe(false);
      expect(validation.isAlphanumeric('abc-123')).toBe(false);
      expect(validation.isAlphanumeric('abc@123')).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    it('should return true for positive integers', () => {
      expect(validation.isPositiveInteger(1)).toBe(true);
      expect(validation.isPositiveInteger(42)).toBe(true);
    });

    it('should return false for zero and negative integers', () => {
      expect(validation.isPositiveInteger(0)).toBe(false);
      expect(validation.isPositiveInteger(-1)).toBe(false);
    });

    it('should return false for non-integers', () => {
      expect(validation.isPositiveInteger(1.5)).toBe(false);
      expect(validation.isPositiveInteger('1')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should return true for values within range', () => {
      expect(validation.isInRange(5, 1, 10)).toBe(true);
      expect(validation.isInRange(1, 1, 10)).toBe(true); // inclusive lower bound
      expect(validation.isInRange(10, 1, 10)).toBe(true); // inclusive upper bound
    });

    it('should return false for values outside range', () => {
      expect(validation.isInRange(0, 1, 10)).toBe(false);
      expect(validation.isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('isValidJson', () => {
    it('should return true for valid JSON strings', () => {
      expect(validation.isValidJson('{}')).toBe(true);
      expect(validation.isValidJson('{"a":1,"b":"test"}')).toBe(true);
      expect(validation.isValidJson('[]')).toBe(true);
      expect(validation.isValidJson('[1,2,3]')).toBe(true);
      expect(validation.isValidJson('"test"')).toBe(true);
      expect(validation.isValidJson('null')).toBe(true);
    });

    it('should return false for invalid JSON strings', () => {
      expect(validation.isValidJson('{')).toBe(false);
      expect(validation.isValidJson('{"a":1,}')).toBe(false);
      expect(validation.isValidJson('undefined')).toBe(false);
    });
  });

  describe('existsInLocalStorage', () => {
    beforeEach(() => {
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn().mockImplementation((key) => {
            return key === 'exists' ? 'value' : null;
          })
        },
        writable: true
      });
    });

    it('should return true for existing localStorage keys', () => {
      expect(validation.existsInLocalStorage('exists')).toBe(true);
    });

    it('should return false for non-existing localStorage keys', () => {
      expect(validation.existsInLocalStorage('nonexistent')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date strings', () => {
      expect(validation.isValidDate('2023-01-01')).toBe(true);
      expect(validation.isValidDate('January 1, 2023')).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(validation.isValidDate('not a date')).toBe(false);
      expect(validation.isValidDate('2023-13-01')).toBe(false); // invalid month
    });
  });

  describe('matchesPattern', () => {
    it('should return true when the string matches the pattern', () => {
      expect(validation.matchesPattern('abc123', /^[a-z0-9]+$/)).toBe(true);
      expect(validation.matchesPattern('123-456-7890', /^\d{3}-\d{3}-\d{4}$/)).toBe(true);
    });

    it('should return false when the string does not match the pattern', () => {
      expect(validation.matchesPattern('abc 123', /^[a-z0-9]+$/)).toBe(false);
      expect(validation.matchesPattern('1234567890', /^\d{3}-\d{3}-\d{4}$/)).toBe(false);
    });
  });

  describe('all', () => {
    it('should return true when all conditions are true', () => {
      expect(validation.all([true, true, true])).toBe(true);
    });

    it('should return false when any condition is false', () => {
      expect(validation.all([true, false, true])).toBe(false);
      expect(validation.all([false, false, false])).toBe(false);
    });
  });

  describe('any', () => {
    it('should return true when any condition is true', () => {
      expect(validation.any([false, true, false])).toBe(true);
      expect(validation.any([true, true, true])).toBe(true);
    });

    it('should return false when all conditions are false', () => {
      expect(validation.any([false, false, false])).toBe(false);
    });
  });

  describe('validateObject', () => {
    it('should validate object fields against schema', () => {
      const obj = {
        name: 'John',
        age: 30,
        email: 'john@example.com'
      };

      const schema = {
        name: validation.isString,
        age: (value: unknown) => validation.isNumber(value) && value > 18,
        email: validation.isEmail
      };

      const result = validation.validateObject(obj, schema);
      
      expect(result).toEqual({
        name: true,
        age: true,
        email: true
      });
    });

    it('should report validation failures', () => {
      const obj = {
        name: '',
        age: 15,
        email: 'not-an-email'
      };

      const schema = {
        name: (value: unknown) => validation.isString(value) && !validation.isEmpty(value),
        age: (value: unknown) => validation.isNumber(value) && value > 18,
        email: validation.isEmail
      };

      const result = validation.validateObject(obj, schema);
      
      expect(result).toEqual({
        name: false,
        age: false,
        email: false
      });
    });
  });

  describe('validateInput', () => {
    it('should return true when all validators pass', () => {
      const validators = [
        validation.isString,
        (value: unknown) => validation.isString(value) && value.length > 3
      ];

      expect(validation.validateInput('test', validators)).toBe(true);
    });

    it('should return false when any validator fails', () => {
      const validators = [
        validation.isString,
        (value: unknown) => validation.isString(value) && value.length > 5
      ];

      expect(validation.validateInput('test', validators)).toBe(false);
    });
  });

  describe('createValidationError', () => {
    it('should create an error with the ValidationError name', () => {
      const error = validation.createValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
    });
  });
}); 