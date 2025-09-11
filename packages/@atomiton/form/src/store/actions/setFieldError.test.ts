import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldError, FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSetFieldError } from "./setFieldError.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  nested: {
    value: string;
  };
} & FieldValues;

describe("setFieldError", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let setFieldError: ReturnType<typeof createSetFieldError<TestFormData>>;

  const initialValues: TestFormData = {
    name: "",
    email: "",
    age: 0,
    isActive: false,
    nested: {
      value: "",
    },
  };

  const createTestStore = (
    config: Partial<FormConfig<TestFormData>> = {},
  ): FormStoreState<TestFormData> => ({
    formId: "test-form",
    config: {
      initialValues,
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
      resetOnSubmitSuccess: false,
      ...config,
    },
    values: { ...initialValues },
    errors: {},
    touched: {
      name: false,
      email: false,
      age: false,
      isActive: false,
      nested: false,
    },
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
    validators: new Map(),
  });

  beforeEach(() => {
    store = storeApi.createStore<FormStoreState<TestFormData>>({
      initialState: createTestStore(),
      name: "test-store",
    });

    setFieldError = createSetFieldError(store);
  });

  describe("Happy Path", () => {
    it("should set field error correctly", () => {
      const error: FieldError = { message: "Field is required" };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name).toEqual(error);
      expect(state.errors.name?.message).toBe("Field is required");
    });

    it("should set error with type", () => {
      const error: FieldError = {
        message: "Invalid format",
        type: "format",
      };
      setFieldError("email", error);

      const state = store.getState();
      expect(state.errors.email).toEqual(error);
      expect(state.errors.email?.type).toBe("format");
    });

    it("should clear field error when undefined", () => {
      // First set an error
      setFieldError("name", { message: "Error" });
      expect(store.getState().errors.name).toBeDefined();

      // Then clear it
      setFieldError("name", undefined);

      const state = store.getState();
      expect(state.errors.name).toBeUndefined();
    });

    it("should handle multiple field errors", () => {
      setFieldError("name", { message: "Name required" });
      setFieldError("email", { message: "Email required" });
      setFieldError("age", { message: "Age must be positive" });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name required");
      expect(state.errors.email?.message).toBe("Email required");
      expect(state.errors.age?.message).toBe("Age must be positive");
    });

    it("should overwrite existing error", () => {
      setFieldError("name", { message: "First error" });
      setFieldError("name", { message: "Second error" });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Second error");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty error message", () => {
      const error: FieldError = { message: "" };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("");
    });

    it("should handle very long error messages", () => {
      const longMessage = "x".repeat(10000);
      const error: FieldError = { message: longMessage };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(longMessage);
      expect(state.errors.name?.message.length).toBe(10000);
    });

    it("should handle special characters in error message", () => {
      const specialMessage =
        "Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/\\`~\"'";
      const error: FieldError = { message: specialMessage };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(specialMessage);
    });

    it("should handle unicode characters in error message", () => {
      const unicodeMessage = "Error 🚨 with unicode: 你好 🌍 Ñoño";
      const error: FieldError = { message: unicodeMessage };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(unicodeMessage);
    });

    it("should handle multiline error messages", () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const error: FieldError = { message: multilineMessage };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(multilineMessage);
    });

    it("should handle HTML content in error message", () => {
      const htmlMessage = "<script>alert('xss')</script>Invalid input";
      const error: FieldError = { message: htmlMessage };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(htmlMessage);
    });

    it("should handle different error types", () => {
      const errorTypes = ["required", "format", "length", "custom", "async"];

      errorTypes.forEach((type, index) => {
        const fieldName = `field${index}` as keyof TestFormData;
        setFieldError(fieldName as any, {
          message: `Error ${index}`,
          type,
        });
      });

      const state = store.getState();
      errorTypes.forEach((type, index) => {
        const fieldName = `field${index}` as keyof TestFormData;
        expect(state.errors[fieldName as any]?.type).toBe(type);
      });
    });

    it("should handle error objects with additional properties", () => {
      const error = {
        message: "Custom error",
        type: "custom",
        code: 400,
        timestamp: new Date().toISOString(),
        metadata: { source: "validation" },
      } as FieldError;

      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name).toEqual(error);
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle rapid error setting/clearing", () => {
      for (let i = 0; i < 1000; i++) {
        if (i % 2 === 0) {
          setFieldError("name", { message: `Error ${i}` });
        } else {
          setFieldError("name", undefined);
        }
      }

      const state = store.getState();
      expect(state.errors.name).toBeUndefined();
    });

    it("should handle setting errors on multiple fields rapidly", () => {
      const fields = ["name", "email", "age"] as (keyof TestFormData)[];

      for (let i = 0; i < 1000; i++) {
        const field = fields[i % fields.length];
        setFieldError(field, { message: `Error ${i} for ${String(field)}` });
      }

      const state = store.getState();
      expect(state.errors.name?.message).toContain("name");
      expect(state.errors.email?.message).toContain("email");
      expect(state.errors.age?.message).toContain("age");
    });

    it("should handle concurrent error operations", () => {
      const operations = Array.from({ length: 500 }, (_, i) => () => {
        setFieldError("name", { message: `Concurrent error ${i}` });
        setFieldError("email", undefined);
        setFieldError("age", { message: `Age error ${i}`, type: "validation" });
      });

      operations.forEach((op) => op());

      const state = store.getState();
      expect(state.errors.name?.message).toContain("Concurrent error");
      expect(state.errors.email).toBeUndefined();
      expect(state.errors.age?.message).toContain("Age error");
    });

    it("should maintain state consistency during rapid operations", () => {
      let stateUpdates = 0;
      const unsubscribe = store.subscribe(() => {
        stateUpdates++;
        const state = store.getState();
        // Ensure errors object is always valid
        expect(state.errors).toBeDefined();
        expect(typeof state.errors).toBe("object");
        // Ensure no undefined entries exist (should be deleted, not set to undefined)
        Object.keys(state.errors).forEach((key) => {
          expect(state.errors[key as keyof TestFormData]).toBeDefined();
        });
      });

      for (let i = 0; i < 100; i++) {
        setFieldError("name", { message: `Error ${i}` });
        if (i % 3 === 0) {
          setFieldError("name", undefined);
        }
      }

      expect(stateUpdates).toBe(100);
      unsubscribe();
    });
  });

  describe("State Consistency", () => {
    it("should preserve other state properties when setting errors", () => {
      // Set initial state with some properties
      store.setState((state) => {
        state.values.name = "John";
        state.touched.name = true;
        state.isDirty = true;
        state.isSubmitting = true;
        state.submitCount = 5;
      });

      setFieldError("email", { message: "Email error" });

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.touched.name).toBe(true);
      expect(state.isDirty).toBe(true);
      expect(state.isSubmitting).toBe(true);
      expect(state.submitCount).toBe(5);
      expect(state.errors.email?.message).toBe("Email error");
    });

    it("should properly delete error properties", () => {
      // Set multiple errors
      setFieldError("name", { message: "Name error" });
      setFieldError("email", { message: "Email error" });
      setFieldError("age", { message: "Age error" });

      let state = store.getState();
      expect(Object.keys(state.errors)).toHaveLength(3);

      // Clear one error
      setFieldError("email", undefined);

      state = store.getState();
      expect(Object.keys(state.errors)).toHaveLength(2);
      expect(state.errors.email).toBeUndefined();
      expect(state.errors.name).toBeDefined();
      expect(state.errors.age).toBeDefined();
      expect("email" in state.errors).toBe(false);
    });

    it("should handle clearing non-existent errors gracefully", () => {
      setFieldError("nonExistentField" as any, undefined);

      const state = store.getState();
      expect(state.errors).toEqual({});
    });

    it("should work correctly when store state is modified externally", () => {
      // Modify store state externally
      store.setState((state) => {
        state.errors.name = { message: "External error" };
        state.values.email = "external@test.com";
      });

      // setFieldError should still work
      setFieldError("email", { message: "New email error" });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("External error");
      expect(state.errors.email?.message).toBe("New email error");
      expect(state.values.email).toBe("external@test.com");
    });
  });

  describe("Error Object Validation", () => {
    it("should handle error objects with only message", () => {
      const error: FieldError = { message: "Simple error" };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name).toEqual(error);
      expect(state.errors.name?.type).toBeUndefined();
    });

    it("should handle error objects with message and type", () => {
      const error: FieldError = {
        message: "Validation error",
        type: "validation",
      };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name).toEqual(error);
      expect(state.errors.name?.message).toBe("Validation error");
      expect(state.errors.name?.type).toBe("validation");
    });

    it("should preserve error object references", () => {
      const error: FieldError = { message: "Reference test" };
      setFieldError("name", error);

      const state = store.getState();
      expect(state.errors.name).toBe(error);
    });

    it("should handle immutable error updates", () => {
      const error1: FieldError = { message: "First error" };
      const error2: FieldError = { message: "Second error" };

      setFieldError("name", error1);
      const state1 = store.getState();

      setFieldError("name", error2);
      const state2 = store.getState();

      expect(state1.errors.name).toBe(error1);
      expect(state2.errors.name).toBe(error2);
      expect(state1.errors.name).not.toBe(state2.errors.name);
    });
  });

  describe("Field Name Edge Cases", () => {
    it("should handle string field names", () => {
      setFieldError("name", { message: "String field error" });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("String field error");
    });

    it("should handle numeric-like field names", () => {
      setFieldError("age", { message: "Numeric field error" });

      const state = store.getState();
      expect(state.errors.age?.message).toBe("Numeric field error");
    });

    it("should handle nested field references", () => {
      setFieldError("nested", { message: "Nested field error" });

      const state = store.getState();
      expect(state.errors.nested?.message).toBe("Nested field error");
    });

    it("should handle field names with special characters", () => {
      const specialField = "field-with_special.chars" as keyof TestFormData;
      setFieldError(specialField as any, { message: "Special field error" });

      const state = store.getState();
      expect(state.errors[specialField as any]?.message).toBe(
        "Special field error",
      );
    });
  });

  describe("Subscription and Change Detection", () => {
    it("should notify subscribers when error is set", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setFieldError("name", { message: "Test error" });

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should notify subscribers when error is cleared", () => {
      // Set initial error
      setFieldError("name", { message: "Test error" });

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setFieldError("name", undefined);

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should provide correct previous and current state to subscribers", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setFieldError("name", { message: "Test error" });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.objectContaining({
            name: { message: "Test error" },
          }),
        }),
        expect.objectContaining({
          errors: {},
        }),
      );

      unsubscribe();
    });

    it("should handle multiple subscribers correctly", () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn();

      const unsubscribe1 = store.subscribe(subscriber1);
      const unsubscribe2 = store.subscribe(subscriber2);
      const unsubscribe3 = store.subscribe(subscriber3);

      setFieldError("name", { message: "Multi-subscriber test" });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });
  });
});
