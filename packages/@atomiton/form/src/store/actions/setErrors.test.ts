import { describe, expect, it, vi } from "vitest";
import type { FieldValues, FormErrors } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSetErrors } from "./setErrors.js";

// Mock store for testing
const createMockStore = <T extends FieldValues = FieldValues>() => {
  const state: FormStoreState<T> = {
    formId: "test-form",
    config: { initialValues: {} as T },
    validators: new Map(),
    values: {} as T,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  };

  return {
    state,
    setState: vi.fn((updater: (state: FormStoreState<T>) => void) => {
      updater(state);
    }),
  };
};

describe("setErrors", () => {
  describe("Edge Cases", () => {
    it("should handle error objects with additional properties", () => {
      const store = createMockStore();
      const setErrors = createSetErrors(store);

      const errors = {
        name: { message: "Custom error", customProp: "value" },
      } as FormErrors<any>;

      setErrors(errors);

      expect(store.setState).toHaveBeenCalled();
      expect(store.state.errors.name).toEqual(errors.name);
    });
  });

  describe("State Consistency", () => {
    it("should handle immutable error updates", () => {
      const store1 = createMockStore();
      const store2 = createMockStore();
      const setErrors1 = createSetErrors(store1);
      const setErrors2 = createSetErrors(store2);

      const errors1 = { name: { message: "First error" } };
      const errors2 = { name: { message: "Second error" } };

      setErrors1(errors1);
      setErrors2(errors2);

      expect(store1.state.errors).toBe(errors1);
      expect(store2.state.errors).toBe(errors2);
      expect(store1.state.errors).not.toBe(store2.state.errors);
    });
  });

  describe("Error Object Validation", () => {
    it("should preserve error object references", () => {
      const store = createMockStore();
      const setErrors = createSetErrors(store);

      const nameError = { message: "Name error", type: "validation" };
      const emailError = { message: "Email error", type: "format" };
      const errors = { name: nameError, email: emailError };

      setErrors(errors);

      expect(store.state.errors.name).toBe(nameError);
      expect(store.state.errors.email).toBe(emailError);
      expect(store.state.errors).toBe(errors);
    });

    it("should handle mixed error object structures", () => {
      const store = createMockStore();
      const setErrors = createSetErrors(store);

      const errors = {
        name: { message: "Simple error" },
        email: { message: "Complex error", type: "validation" },
        age: { message: "Complex error", type: "validation", code: 400 },
      } as FormErrors<any>;

      setErrors(errors);

      expect(store.state.errors.name?.message).toBe("Simple error");
      expect(store.state.errors.email?.type).toBe("validation");
      expect(store.state.errors.age?.message).toBe("Complex error");
      expect(store.state.errors.age?.type).toBe("validation");
      expect((store.state.errors.age as any)?.code).toBe(400);
    });
  });

  describe("Memory and Reference Management", () => {
    it("should handle error object mutations after setting", () => {
      const store = createMockStore();
      const setErrors = createSetErrors(store);

      const errorObj = { message: "Original error" };
      const errors = { name: errorObj };

      setErrors(errors);

      // Mutate the original error object
      errorObj.message = "Mutated error";

      expect(store.state.errors.name?.message).toBe("Mutated error");
    });
  });
});
