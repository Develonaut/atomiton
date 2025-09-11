import { describe, it, expect } from "vitest";
import {
  getFieldError,
  isFieldTouched,
  isFieldDirty,
  isFormDirty,
  isFormValid,
  hasFormErrors,
  getFormErrors,
  flattenErrors,
  createFormId,
  formatFieldName,
  getFieldDisplayName,
  shouldShowError,
  getFieldProps
} from "./form.js";
import type { FormState } from "../types/index.js";

const createMockState = (overrides: Partial<FormState<any>> = {}): FormState<any> => ({
  formId: "test-form",
  values: { name: "John", email: "john@example.com" },
  errors: {},
  touched: {},
  isDirty: false,
  isValid: true,
  isSubmitting: false,
  isSubmitted: false,
  config: {
    initialValues: { name: "", email: "" }
  },
  ...overrides
});

describe("Form Utilities", () => {
  describe("getFieldError", () => {
    it("should return error message when error exists", () => {
      const state = createMockState({
        errors: { name: { message: "Name is required" } }
      });
      
      expect(getFieldError(state, "name")).toBe("Name is required");
    });

    it("should return undefined when no error exists", () => {
      const state = createMockState();
      expect(getFieldError(state, "name")).toBeUndefined();
    });

    it("should handle errors without message", () => {
      const state = createMockState({
        errors: { name: {} as any }
      });
      
      expect(getFieldError(state, "name")).toBeUndefined();
    });
  });

  describe("isFieldTouched", () => {
    it("should return true when field is touched", () => {
      const state = createMockState({
        touched: { name: true }
      });
      
      expect(isFieldTouched(state, "name")).toBe(true);
    });

    it("should return false when field is not touched", () => {
      const state = createMockState();
      expect(isFieldTouched(state, "name")).toBe(false);
    });
  });

  describe("isFieldDirty", () => {
    it("should return true when field value differs from initial", () => {
      const state = createMockState({
        values: { name: "John" },
        config: { initialValues: { name: "Jane" } }
      });
      
      expect(isFieldDirty(state, "name")).toBe(true);
    });

    it("should return false when field value matches initial", () => {
      const state = createMockState({
        values: { name: "John" },
        config: { initialValues: { name: "John" } }
      });
      
      expect(isFieldDirty(state, "name")).toBe(false);
    });
  });

  describe("isFormDirty", () => {
    it("should return form dirty state", () => {
      expect(isFormDirty(createMockState({ isDirty: true }))).toBe(true);
      expect(isFormDirty(createMockState({ isDirty: false }))).toBe(false);
    });
  });

  describe("isFormValid", () => {
    it("should return form validity state", () => {
      expect(isFormValid(createMockState({ isValid: true }))).toBe(true);
      expect(isFormValid(createMockState({ isValid: false }))).toBe(false);
    });
  });

  describe("hasFormErrors", () => {
    it("should return true when form has errors", () => {
      const state = createMockState({
        errors: { name: { message: "Error" } }
      });
      
      expect(hasFormErrors(state)).toBe(true);
    });

    it("should return false when form has no errors", () => {
      const state = createMockState();
      expect(hasFormErrors(state)).toBe(false);
    });

    it("should handle empty error objects", () => {
      const state = createMockState({
        errors: { name: {} as any }
      });
      
      expect(hasFormErrors(state)).toBe(false);
    });
  });

  describe("getFormErrors", () => {
    it("should return error messages for all fields", () => {
      const state = createMockState({
        errors: {
          name: { message: "Name error" },
          email: { message: "Email error" },
          age: {} as any // No message
        }
      });
      
      const errors = getFormErrors(state);
      expect(errors.name).toBe("Name error");
      expect(errors.email).toBe("Email error");
      expect(errors.age).toBeUndefined();
    });
  });

  describe("flattenErrors", () => {
    it("should flatten error objects to array of messages", () => {
      const errors = {
        name: { message: "Name error" },
        email: { message: "Email error" },
        age: undefined,
        phone: {} as any
      };
      
      expect(flattenErrors(errors)).toEqual(["Name error", "Email error"]);
    });

    it("should handle empty errors", () => {
      expect(flattenErrors({})).toEqual([]);
    });
  });

  describe("createFormId", () => {
    it("should create unique form IDs", () => {
      const id1 = createFormId();
      const id2 = createFormId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^form-\d+-[a-z0-9]+$/);
    });

    it("should use custom prefix", () => {
      const id = createFormId("custom");
      expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/);
    });
  });

  describe("formatFieldName", () => {
    it("should format camelCase names", () => {
      expect(formatFieldName("firstName")).toBe("First Name");
      expect(formatFieldName("emailAddress")).toBe("Email Address");
    });

    it("should format snake_case names", () => {
      expect(formatFieldName("first_name")).toBe("First Name");
      expect(formatFieldName("email_address")).toBe("Email Address");
    });

    it("should format kebab-case names", () => {
      expect(formatFieldName("first-name")).toBe("First Name");
      expect(formatFieldName("email-address")).toBe("Email Address");
    });

    it("should format dot notation names", () => {
      expect(formatFieldName("user.firstName")).toBe("User First Name");
      expect(formatFieldName("profile.contact.email")).toBe("Profile Contact Email");
    });

    it("should handle single words", () => {
      expect(formatFieldName("name")).toBe("Name");
      expect(formatFieldName("email")).toBe("Email");
    });
  });

  describe("getFieldDisplayName", () => {
    it("should return custom display name when provided", () => {
      const displayNames = { firstName: "Given Name" };
      expect(getFieldDisplayName("firstName", displayNames)).toBe("Given Name");
    });

    it("should format field name when no display name provided", () => {
      expect(getFieldDisplayName("firstName")).toBe("First Name");
    });

    it("should handle missing display names gracefully", () => {
      const displayNames = { lastName: "Family Name" };
      expect(getFieldDisplayName("firstName", displayNames)).toBe("First Name");
    });
  });

  describe("shouldShowError", () => {
    const createStateWithError = (touched = false, submitted = false) =>
      createMockState({
        errors: { name: { message: "Name error" } },
        touched: { name: touched },
        isSubmitted: submitted
      });

    it("should not show error when field has no error", () => {
      const state = createMockState({ touched: { name: true } });
      expect(shouldShowError(state, "name")).toBe(false);
    });

    it("should show error immediately when immediate option is true", () => {
      const state = createStateWithError();
      expect(shouldShowError(state, "name", { immediate: true })).toBe(true);
    });

    it("should show error when field is touched", () => {
      const state = createStateWithError(true, false);
      expect(shouldShowError(state, "name")).toBe(true);
    });

    it("should show error when form is submitted", () => {
      const state = createStateWithError(false, true);
      expect(shouldShowError(state, "name")).toBe(true);
    });

    it("should not show error when field not touched and form not submitted", () => {
      const state = createStateWithError(false, false);
      expect(shouldShowError(state, "name")).toBe(false);
    });

    it("should respect showOnTouch option", () => {
      const state = createStateWithError(true, false);
      expect(shouldShowError(state, "name", { showOnTouch: false })).toBe(false);
    });

    it("should respect showOnSubmit option", () => {
      const state = createStateWithError(false, true);
      expect(shouldShowError(state, "name", { showOnSubmit: false })).toBe(false);
    });
  });

  describe("getFieldProps", () => {
    it("should return comprehensive field props", () => {
      const state = createMockState({
        values: { name: "John" },
        errors: { name: { message: "Name error" } },
        touched: { name: true },
        config: { initialValues: { name: "Jane" } }
      });
      
      const props = getFieldProps(state, "name");
      
      expect(props).toEqual({
        value: "John",
        error: "Name error", // Shown because field is touched
        hasError: true,
        showError: true,
        touched: true,
        dirty: true, // "John" !== "Jane"
        name: "name",
        id: "name"
      });
    });

    it("should not show error when conditions not met", () => {
      const state = createMockState({
        values: { name: "John" },
        errors: { name: { message: "Name error" } },
        touched: { name: false }, // Not touched
        isSubmitted: false // Not submitted
      });
      
      const props = getFieldProps(state, "name");
      
      expect(props.hasError).toBe(true);
      expect(props.error).toBeUndefined();
      expect(props.showError).toBe(false);
    });

    it("should respect error display options", () => {
      const state = createMockState({
        values: { name: "John" },
        errors: { name: { message: "Name error" } },
        touched: { name: false },
        isSubmitted: false
      });
      
      const props = getFieldProps(state, "name", { immediateError: true });
      
      expect(props.error).toBe("Name error");
      expect(props.showError).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large forms efficiently", () => {
      const largeValues = Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`]);
      const state = createMockState({
        values: Object.fromEntries(largeValues)
      });
      
      const start = performance.now();
      
      // Test multiple utility functions
      const errors = getFormErrors(state);
      const dirty = isFormDirty(state);
      const valid = isFormValid(state);
      const hasErrors = hasFormErrors(state);
      
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50); // Should complete within 50ms
      expect(Object.keys(errors).length).toBe(0);
      expect(dirty).toBe(false);
      expect(valid).toBe(true);
      expect(hasErrors).toBe(false);
    });

    it("should efficiently format many field names", () => {
      const fieldNames = Array.from({ length: 1000 }, (_, i) => `field_name_${i}`);
      
      const start = performance.now();
      const formatted = fieldNames.map(name => formatFieldName(name));
      const duration = performance.now() - start;
      
      expect(formatted[0]).toBe("Field Name 0");
      expect(formatted[999]).toBe("Field Name 999");
      expect(duration).toBeLessThan(20); // Should complete within 20ms
    });
  });
});