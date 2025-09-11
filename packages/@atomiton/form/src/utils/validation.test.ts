import { describe, it, expect } from "vitest";
import {
  createFieldError,
  isValidationResult,
  normalizeValidationResult,
  combineValidationResults,
  validateRequired,
  validateEmail,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateNumber
} from "./validation.js";

describe("Validation Utilities", () => {
  describe("createFieldError", () => {
    it("should create field error with message", () => {
      const error = createFieldError("Required field");
      expect(error).toEqual({ message: "Required field" });
    });

    it("should create field error with message and code", () => {
      const error = createFieldError("Invalid email", "INVALID_EMAIL");
      expect(error).toEqual({ 
        message: "Invalid email", 
        code: "INVALID_EMAIL" 
      });
    });
  });

  describe("isValidationResult", () => {
    it("should return true for valid ValidationResult", () => {
      expect(isValidationResult({ valid: true })).toBe(true);
      expect(isValidationResult({ valid: false, error: "Error" })).toBe(true);
    });

    it("should return false for invalid values", () => {
      expect(isValidationResult(null)).toBe(false);
      expect(isValidationResult(undefined)).toBe(false);
      expect(isValidationResult("string")).toBe(false);
      expect(isValidationResult({ message: "error" })).toBe(false);
      expect(isValidationResult({ valid: "true" })).toBe(false);
    });
  });

  describe("normalizeValidationResult", () => {
    it("should normalize boolean values", () => {
      expect(normalizeValidationResult(true)).toEqual({ valid: true });
      expect(normalizeValidationResult(false)).toEqual({ valid: false });
    });

    it("should normalize string values", () => {
      expect(normalizeValidationResult("Error message")).toEqual({
        valid: false,
        error: "Error message"
      });
    });

    it("should pass through valid ValidationResult", () => {
      const result = { valid: false, error: "Test error" };
      expect(normalizeValidationResult(result)).toEqual(result);
    });

    it("should handle invalid input", () => {
      expect(normalizeValidationResult(123 as any)).toEqual({
        valid: false,
        error: "Invalid validation result"
      });
    });
  });

  describe("combineValidationResults", () => {
    it("should return valid when all results are valid", () => {
      const results = [
        { valid: true },
        { valid: true },
        { valid: true }
      ];
      expect(combineValidationResults(results)).toEqual({ valid: true });
    });

    it("should combine errors from multiple invalid results", () => {
      const results = [
        { valid: false, error: "First error" },
        { valid: true },
        { valid: false, error: "Second error" }
      ];
      expect(combineValidationResults(results)).toEqual({
        valid: false,
        error: "First error, Second error"
      });
    });

    it("should handle single error", () => {
      const results = [
        { valid: true },
        { valid: false, error: "Only error" }
      ];
      expect(combineValidationResults(results)).toEqual({
        valid: false,
        error: "Only error"
      });
    });

    it("should handle empty results", () => {
      expect(combineValidationResults([])).toEqual({ valid: true });
    });
  });

  describe("validateRequired", () => {
    it("should return valid for non-empty values", () => {
      expect(validateRequired("text")).toEqual({ valid: true });
      expect(validateRequired(123)).toEqual({ valid: true });
      expect(validateRequired(true)).toEqual({ valid: true });
      expect(validateRequired([1, 2, 3])).toEqual({ valid: true });
    });

    it("should return invalid for empty values", () => {
      expect(validateRequired("")).toEqual({
        valid: false,
        error: "This field is required"
      });
      expect(validateRequired(null)).toEqual({
        valid: false,
        error: "This field is required"
      });
      expect(validateRequired(undefined)).toEqual({
        valid: false,
        error: "This field is required"
      });
      expect(validateRequired([])).toEqual({
        valid: false,
        error: "This field is required"
      });
    });

    it("should use custom error message", () => {
      expect(validateRequired("", "Custom message")).toEqual({
        valid: false,
        error: "Custom message"
      });
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("user@example.com")).toEqual({ valid: true });
      expect(validateEmail("test.email+tag@domain.co.uk")).toEqual({ valid: true });
      expect(validateEmail("user123@test-domain.org")).toEqual({ valid: true });
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid-email")).toEqual({
        valid: false,
        error: "Please enter a valid email address"
      });
      expect(validateEmail("@domain.com")).toEqual({
        valid: false,
        error: "Please enter a valid email address"
      });
      expect(validateEmail("user@")).toEqual({
        valid: false,
        error: "Please enter a valid email address"
      });
    });

    it("should allow empty values", () => {
      expect(validateEmail("")).toEqual({ valid: true });
    });

    it("should use custom error message", () => {
      expect(validateEmail("invalid", "Custom email error")).toEqual({
        valid: false,
        error: "Custom email error"
      });
    });
  });

  describe("validateMinLength", () => {
    it("should validate strings meeting minimum length", () => {
      expect(validateMinLength("hello", 3)).toEqual({ valid: true });
      expect(validateMinLength("exactly", 7)).toEqual({ valid: true });
    });

    it("should reject strings below minimum length", () => {
      expect(validateMinLength("hi", 5)).toEqual({
        valid: false,
        error: "Must be at least 5 characters long"
      });
    });

    it("should allow empty values", () => {
      expect(validateMinLength("", 5)).toEqual({ valid: true });
    });

    it("should use custom error message", () => {
      expect(validateMinLength("hi", 5, "Too short!")).toEqual({
        valid: false,
        error: "Too short!"
      });
    });
  });

  describe("validateMaxLength", () => {
    it("should validate strings within maximum length", () => {
      expect(validateMaxLength("hello", 10)).toEqual({ valid: true });
      expect(validateMaxLength("exactly", 7)).toEqual({ valid: true });
    });

    it("should reject strings exceeding maximum length", () => {
      expect(validateMaxLength("this is too long", 5)).toEqual({
        valid: false,
        error: "Must be no more than 5 characters long"
      });
    });

    it("should allow empty values", () => {
      expect(validateMaxLength("", 5)).toEqual({ valid: true });
    });

    it("should use custom error message", () => {
      expect(validateMaxLength("too long string", 5, "Too long!")).toEqual({
        valid: false,
        error: "Too long!"
      });
    });
  });

  describe("validatePattern", () => {
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;

    it("should validate strings matching pattern", () => {
      expect(validatePattern("123-456-7890", phonePattern)).toEqual({ valid: true });
    });

    it("should reject strings not matching pattern", () => {
      expect(validatePattern("123-45-6789", phonePattern)).toEqual({
        valid: false,
        error: "Invalid format"
      });
    });

    it("should allow empty values", () => {
      expect(validatePattern("", phonePattern)).toEqual({ valid: true });
    });

    it("should use custom error message", () => {
      expect(validatePattern("invalid", phonePattern, "Phone format required")).toEqual({
        valid: false,
        error: "Phone format required"
      });
    });
  });

  describe("validateNumber", () => {
    it("should validate valid numbers", () => {
      expect(validateNumber("123")).toEqual({ valid: true });
      expect(validateNumber(42)).toEqual({ valid: true });
      expect(validateNumber("3.14")).toEqual({ valid: true });
    });

    it("should reject invalid numbers", () => {
      expect(validateNumber("not-a-number")).toEqual({
        valid: false,
        error: "Must be a valid number"
      });
      expect(validateNumber("12abc")).toEqual({
        valid: false,
        error: "Must be a valid number"
      });
    });

    it("should validate minimum value", () => {
      expect(validateNumber("10", { min: 5 })).toEqual({ valid: true });
      expect(validateNumber("3", { min: 5 })).toEqual({
        valid: false,
        error: "Must be at least 5"
      });
    });

    it("should validate maximum value", () => {
      expect(validateNumber("5", { max: 10 })).toEqual({ valid: true });
      expect(validateNumber("15", { max: 10 })).toEqual({
        valid: false,
        error: "Must be no more than 10"
      });
    });

    it("should validate integer constraint", () => {
      expect(validateNumber("42", { integer: true })).toEqual({ valid: true });
      expect(validateNumber("3.14", { integer: true })).toEqual({
        valid: false,
        error: "Must be a whole number"
      });
    });

    it("should allow empty values", () => {
      expect(validateNumber("")).toEqual({ valid: true });
      expect(validateNumber(null)).toEqual({ valid: true });
    });

    it("should use custom error message", () => {
      expect(validateNumber("invalid", { message: "Custom error" })).toEqual({
        valid: false,
        error: "Custom error"
      });
    });

    it("should combine multiple constraints", () => {
      const options = { min: 1, max: 100, integer: true };
      
      expect(validateNumber("50", options)).toEqual({ valid: true });
      expect(validateNumber("0", options)).toEqual({
        valid: false,
        error: "Must be at least 1"
      });
      expect(validateNumber("150", options)).toEqual({
        valid: false,
        error: "Must be no more than 100"
      });
      expect(validateNumber("50.5", options)).toEqual({
        valid: false,
        error: "Must be a whole number"
      });
    });
  });

  describe("Performance", () => {
    it("should handle rapid email validation", () => {
      const emails = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`);
      
      const start = performance.now();
      const results = emails.map(email => validateEmail(email));
      const duration = performance.now() - start;
      
      expect(results.every(r => r.valid)).toBe(true);
      expect(duration).toBeLessThan(50); // Should complete within 50ms
    });

    it("should efficiently combine many validation results", () => {
      const results = Array.from({ length: 1000 }, (_, i) => 
        i % 10 === 0 
          ? { valid: false, error: `Error ${i}` }
          : { valid: true }
      );
      
      const start = performance.now();
      const combined = combineValidationResults(results);
      const duration = performance.now() - start;
      
      expect(combined.valid).toBe(false);
      expect(duration).toBeLessThan(10); // Should complete within 10ms
    });
  });
});