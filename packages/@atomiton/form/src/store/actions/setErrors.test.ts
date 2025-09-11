import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig, FormErrors } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSetErrors } from "./setErrors.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  nested: {
    value: string;
  };
} & FieldValues;

describe("setErrors", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let setErrors: ReturnType<typeof createSetErrors<TestFormData>>;

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

    setErrors = createSetErrors(store);
  });

  describe("Happy Path", () => {
    it("should set single field error", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Name is required" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name is required");
      expect(state.errors.email).toBeUndefined();
    });

    it("should set multiple field errors", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Name is required" },
        email: { message: "Email is invalid" },
        age: { message: "Age must be positive" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name is required");
      expect(state.errors.email?.message).toBe("Email is invalid");
      expect(state.errors.age?.message).toBe("Age must be positive");
    });

    it("should set errors with types", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Required field", type: "required" },
        email: { message: "Invalid format", type: "format" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Required field");
      expect(state.errors.name?.type).toBe("required");
      expect(state.errors.email?.message).toBe("Invalid format");
      expect(state.errors.email?.type).toBe("format");
    });

    it("should replace all existing errors", () => {
      // Set initial errors
      setErrors({
        name: { message: "Initial name error" },
        email: { message: "Initial email error" },
        age: { message: "Initial age error" },
      });

      // Replace with new errors
      setErrors({
        name: { message: "New name error" },
        isActive: { message: "New active error" },
      });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("New name error");
      expect(state.errors.isActive?.message).toBe("New active error");
      expect(state.errors.email).toBeUndefined();
      expect(state.errors.age).toBeUndefined();
    });

    it("should clear all errors when empty object provided", () => {
      // Set initial errors
      setErrors({
        name: { message: "Name error" },
        email: { message: "Email error" },
      });

      // Clear all errors
      setErrors({});

      const state = store.getState();
      expect(state.errors).toEqual({});
      expect(Object.keys(state.errors)).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty error messages", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "" },
        email: { message: "" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("");
      expect(state.errors.email?.message).toBe("");
    });

    it("should handle very long error messages", () => {
      const longMessage = "x".repeat(10000);
      const errors: FormErrors<TestFormData> = {
        name: { message: longMessage },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(longMessage);
      expect(state.errors.name?.message.length).toBe(10000);
    });

    it("should handle special characters in error messages", () => {
      const specialMessage =
        "Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/\\`~\"'";
      const errors: FormErrors<TestFormData> = {
        name: { message: specialMessage },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(specialMessage);
    });

    it("should handle unicode characters in error messages", () => {
      const unicodeMessage = "Error 🚨 with unicode: 你好 🌍 Ñoño";
      const errors: FormErrors<TestFormData> = {
        name: { message: unicodeMessage },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(unicodeMessage);
    });

    it("should handle multiline error messages", () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const errors: FormErrors<TestFormData> = {
        name: { message: multilineMessage },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(multilineMessage);
    });

    it("should handle HTML content in error messages", () => {
      const htmlMessage = "<script>alert('xss')</script>Invalid input";
      const errors: FormErrors<TestFormData> = {
        name: { message: htmlMessage },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe(htmlMessage);
    });

    it("should handle error objects with additional properties", () => {
      const errors = {
        name: {
          message: "Custom error",
          type: "custom",
          code: 400,
          timestamp: new Date().toISOString(),
          metadata: { source: "validation" },
        },
      } as FormErrors<TestFormData>;

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name).toEqual(errors.name);
    });

    it("should handle undefined values in error object", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Name error" },
        email: undefined,
        age: { message: "Age error" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name error");
      expect(state.errors.email).toBeUndefined();
      expect(state.errors.age?.message).toBe("Age error");
    });

    it("should handle fields not in form values", () => {
      const errors = {
        name: { message: "Name error" },
        nonExistentField: { message: "Non-existent error" },
      } as FormErrors<TestFormData>;

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name error");
      expect((state.errors as any).nonExistentField?.message).toBe(
        "Non-existent error",
      );
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle rapid error updates", () => {
      for (let i = 0; i < 1000; i++) {
        setErrors({
          name: { message: `Error ${i}` },
          email: { message: `Email error ${i}` },
        });
      }

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Error 999");
      expect(state.errors.email?.message).toBe("Email error 999");
    });

    it("should handle large numbers of field errors", () => {
      const largeErrors = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [
          `field${i}`,
          { message: `Error for field ${i}` },
        ]),
      ) as FormErrors<TestFormData>;

      const startTime = Date.now();
      setErrors(largeErrors);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      const state = store.getState();
      expect((state.errors as any).field999?.message).toBe(
        "Error for field 999",
      );
    });

    it("should handle concurrent error operations", () => {
      const operations = Array.from({ length: 500 }, (_, i) => () => {
        setErrors({
          name: { message: `Concurrent error ${i}` },
          email: i % 2 === 0 ? { message: `Email ${i}` } : undefined,
        });
      });

      operations.forEach((op) => op());

      const state = store.getState();
      expect(state.errors.name?.message).toContain("Concurrent error");
    });

    it("should maintain state consistency during rapid operations", () => {
      let stateUpdates = 0;
      const unsubscribe = store.subscribe(() => {
        stateUpdates++;
        const state = store.getState();
        // Ensure errors object is always valid
        expect(state.errors).toBeDefined();
        expect(typeof state.errors).toBe("object");
        // Ensure no null entries exist
        Object.keys(state.errors).forEach((key) => {
          const error = state.errors[key as keyof TestFormData];
          if (error !== undefined) {
            expect(error).not.toBeNull();
            expect(typeof error.message).toBe("string");
          }
        });
      });

      for (let i = 0; i < 100; i++) {
        setErrors({
          name: { message: `Error ${i}` },
          email: i % 3 === 0 ? undefined : { message: `Email ${i}` },
        });
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

      setErrors({ email: { message: "Email error" } });

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.touched.name).toBe(true);
      expect(state.isDirty).toBe(true);
      expect(state.isSubmitting).toBe(true);
      expect(state.submitCount).toBe(5);
      expect(state.errors.email?.message).toBe("Email error");
    });

    it("should completely replace errors object", () => {
      // Set initial errors
      setErrors({
        name: { message: "Initial name error" },
        email: { message: "Initial email error" },
        age: { message: "Initial age error" },
      });

      expect(Object.keys(store.getState().errors)).toHaveLength(3);

      // Replace with completely new errors
      setErrors({
        isActive: { message: "Active error" },
        nested: { message: "Nested error" },
      });

      const state = store.getState();
      expect(Object.keys(state.errors)).toHaveLength(2);
      expect(state.errors.name).toBeUndefined();
      expect(state.errors.email).toBeUndefined();
      expect(state.errors.age).toBeUndefined();
      expect(state.errors.isActive?.message).toBe("Active error");
      expect(state.errors.nested?.message).toBe("Nested error");
    });

    it("should work correctly when store state is modified externally", () => {
      // Modify store state externally
      store.setState((state) => {
        state.errors.name = { message: "External error" };
        state.values.email = "external@test.com";
      });

      // setErrors should completely replace the errors object
      setErrors({ email: { message: "New email error" } });

      const state = store.getState();
      expect(state.errors.name).toBeUndefined();
      expect(state.errors.email?.message).toBe("New email error");
      expect(state.values.email).toBe("external@test.com");
    });

    it("should handle immutable error updates", () => {
      const errors1: FormErrors<TestFormData> = {
        name: { message: "First error" },
      };

      const errors2: FormErrors<TestFormData> = {
        email: { message: "Second error" },
      };

      setErrors(errors1);
      const state1 = store.getState();

      setErrors(errors2);
      const state2 = store.getState();

      expect(state1.errors).toBe(errors1);
      expect(state2.errors).toBe(errors2);
      expect(state1.errors).not.toBe(state2.errors);
    });
  });

  describe("Error Object Validation", () => {
    it("should preserve error object references", () => {
      const nameError = { message: "Name error", type: "required" };
      const emailError = { message: "Email error", type: "format" };

      const errors: FormErrors<TestFormData> = {
        name: nameError,
        email: emailError,
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name).toBe(nameError);
      expect(state.errors.email).toBe(emailError);
      expect(state.errors).toBe(errors);
    });

    it("should handle error objects with only message", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Simple error" },
        email: { message: "Another simple error" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Simple error");
      expect(state.errors.name?.type).toBeUndefined();
      expect(state.errors.email?.message).toBe("Another simple error");
      expect(state.errors.email?.type).toBeUndefined();
    });

    it("should handle error objects with message and type", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Validation error", type: "validation" },
        email: { message: "Format error", type: "format" },
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Validation error");
      expect(state.errors.name?.type).toBe("validation");
      expect(state.errors.email?.message).toBe("Format error");
      expect(state.errors.email?.type).toBe("format");
    });

    it("should handle mixed error object structures", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Simple error" },
        email: { message: "Typed error", type: "format" },
        age: { message: "Complex error", type: "validation", code: 400 } as any,
      };

      setErrors(errors);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Simple error");
      expect(state.errors.name?.type).toBeUndefined();
      expect(state.errors.email?.message).toBe("Typed error");
      expect(state.errors.email?.type).toBe("format");
      expect(state.errors.age?.message).toBe("Complex error");
      expect(state.errors.age?.type).toBe("validation");
      expect((state.errors.age as any)?.code).toBe(400);
    });
  });

  describe("Field Name Edge Cases", () => {
    it("should handle string field names", () => {
      setErrors({ name: { message: "String field error" } });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("String field error");
    });

    it("should handle object field names", () => {
      setErrors({ nested: { message: "Nested field error" } });

      const state = store.getState();
      expect(state.errors.nested?.message).toBe("Nested field error");
    });

    it("should handle field names with special characters", () => {
      const specialErrors = {
        "field-with_special.chars": { message: "Special field error" },
      } as FormErrors<TestFormData>;

      setErrors(specialErrors);

      const state = store.getState();
      expect((state.errors as any)["field-with_special.chars"]?.message).toBe(
        "Special field error",
      );
    });

    it("should handle numeric-like field names", () => {
      setErrors({ age: { message: "Numeric field error" } });

      const state = store.getState();
      expect(state.errors.age?.message).toBe("Numeric field error");
    });
  });

  describe("Subscription and Change Detection", () => {
    it("should notify subscribers when errors are set", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setErrors({ name: { message: "Test error" } });

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should notify subscribers when errors are cleared", () => {
      // Set initial errors
      setErrors({ name: { message: "Test error" } });

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setErrors({});

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should provide correct previous and current state to subscribers", () => {
      // Set initial errors
      setErrors({ name: { message: "Initial error" } });

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setErrors({ email: { message: "New error" } });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: { email: { message: "New error" } },
        }),
        expect.objectContaining({
          errors: { name: { message: "Initial error" } },
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

      setErrors({ name: { message: "Multi-subscriber test" } });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    it("should not notify unsubscribed listeners", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      unsubscribe();
      setErrors({ name: { message: "Test error" } });

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("Memory and Reference Management", () => {
    it("should not create memory leaks with large error objects", () => {
      const createLargeErrors = () =>
        Object.fromEntries(
          Array.from({ length: 1000 }, (_, i) => [
            `field${i}`,
            { message: `Error ${i}`, data: new Array(100).fill(i) },
          ]),
        ) as FormErrors<TestFormData>;

      // Set large errors multiple times
      for (let i = 0; i < 10; i++) {
        setErrors(createLargeErrors());
      }

      // Should not crash or cause memory issues
      const state = store.getState();
      expect(Object.keys(state.errors)).toHaveLength(1000);
    });

    it("should handle error object mutations after setting", () => {
      const errors: FormErrors<TestFormData> = {
        name: { message: "Original error" },
      };

      setErrors(errors);

      // Mutate the original error object
      errors.name!.message = "Mutated error";

      const state = store.getState();
      // Store should have the reference, so mutation affects it
      expect(state.errors.name?.message).toBe("Mutated error");
    });

    it("should handle cyclic references in error objects", () => {
      const cyclicError: any = { message: "Cyclic error" };
      cyclicError.self = cyclicError;

      const errors = {
        name: cyclicError,
      } as FormErrors<TestFormData>;

      // Should not crash with cyclic references
      expect(() => {
        setErrors(errors);
      }).not.toThrow();

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Cyclic error");
    });
  });
});
