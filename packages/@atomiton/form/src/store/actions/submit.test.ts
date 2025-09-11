import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSubmit } from "./submit.js";
import type { FormStoreState } from "../types.js";
import type { FieldValues } from "../../types/index.js";

// Mock store for testing
const createMockStore = <T extends FieldValues = FieldValues>() => {
  const state: FormStoreState<T> = {
    formId: "test-form",
    config: { initialValues: {} as T, validateOnSubmit: false },
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
  reset: vi.fn(),
});

describe("submit", () => {
  describe("Async Handling", () => {
    it("should handle async submit functions properly", async () => {
      const store = createMockStore();
      const actions = createMockActions();
      const submit = createSubmit(store, actions);

      const asyncSubmitHandler = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      await submit(asyncSubmitHandler);

      expect(asyncSubmitHandler).toHaveBeenCalledWith(store.state.values);
      expect(store.setState).toHaveBeenCalled();
    });

    it("should increment submit count on each submission", async () => {
      const store = createMockStore();
      const actions = createMockActions();
      const submit = createSubmit(store, actions);

      const submitHandler = vi.fn();

      await submit(submitHandler);
      expect(store.state.submitCount).toBe(1);

      await submit(submitHandler);
      expect(store.state.submitCount).toBe(2);
    });
  });
});
