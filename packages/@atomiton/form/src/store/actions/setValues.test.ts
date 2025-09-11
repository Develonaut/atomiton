import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSetValues } from "./setValues.js";
import type { FormStoreState } from "../types.js";
import type { FieldValues } from "../../types/index.js";

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
    getState: vi.fn(() => state),
  };
};

const createMockActions = () => ({
  validate: vi.fn(() => Promise.resolve(true)),
});

describe("setValues", () => {
  describe("Edge Cases", () => {
    it("should handle circular reference checks in dirty state", () => {
      const store = createMockStore();
      const actions = createMockActions();
      const setValues = createSetValues(store, actions);

      // Create an object with circular reference
      const circularObj: any = { name: "test" };
      circularObj.self = circularObj;

      // This should not throw an error when handling circular references
      expect(() => {
        setValues({ data: circularObj });
      }).not.toThrow();
    });
  });
});
