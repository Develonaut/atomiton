import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSetFieldTouched } from "./setFieldTouched.js";
import type { FormStoreState } from "../types.js";
import type { FieldValues, ValidationResult } from "../../types/index.js";

// Mock store for testing
const createMockStore = <T extends FieldValues = FieldValues>() => {
  const state: FormStoreState<T> = {
    formId: "test-form",
    config: { initialValues: {} as T, validateOnBlur: false },
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
    getState: vi.fn(() => state),
  };
};

const createMockActions = () => ({
  validateField: vi.fn(() =>
    Promise.resolve({ valid: true } as ValidationResult),
  ),
});

describe("setFieldTouched", () => {
  describe("Edge Cases", () => {
    it("should handle setting same touched state multiple times", () => {
      const store = createMockStore();
      const actions = createMockActions();
      const setFieldTouched = createSetFieldTouched(store, actions);

      // Set touched state multiple times
      setFieldTouched("name", true);
      setFieldTouched("name", true);
      setFieldTouched("name", true);

      // Should be called 3 times even if setting the same value
      expect(store.setState).toHaveBeenCalledTimes(3);
    });

    it("should track validation calls when validateOnBlur is enabled", () => {
      const store = createMockStore();
      store.state.config.validateOnBlur = true;
      const actions = createMockActions();
      const setFieldTouched = createSetFieldTouched(store, actions);

      // Set field as touched, which should trigger validation
      setFieldTouched("name", true);

      expect(actions.validateField).toHaveBeenCalledWith("name");

      // Set field as untouched, which should not trigger validation
      setFieldTouched("name", false);

      // Validation should still only be called once (for the touched=true case)
      expect(actions.validateField).toHaveBeenCalledTimes(1);
    });
  });
});
