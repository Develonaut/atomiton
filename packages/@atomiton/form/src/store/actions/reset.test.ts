import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createReset } from "./reset.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  nested: {
    value: string;
    count: number;
  };
} & FieldValues;

describe("reset", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let reset: ReturnType<typeof createReset<TestFormData>>;

  const initialValues: TestFormData = {
    name: "Initial Name",
    email: "initial@example.com",
    age: 25,
    isActive: true,
    nested: {
      value: "initial nested",
      count: 5,
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

    reset = createReset(store);
  });

  describe("Happy Path", () => {
    it("should reset to initial values when no values provided", () => {
      // Modify state first
      store.setState((state) => {
        state.values.name = "Modified Name";
        state.values.email = "modified@example.com";
        state.errors.name = { message: "Name error" };
        state.touched.name = true;
        state.isDirty = true;
        state.submitCount = 3;
      });

      reset();

      const state = store.getState();
      expect(state.values).toEqual(initialValues);
      expect(state.errors).toEqual({});
      expect(state.touched).toEqual({
        name: false,
        email: false,
        age: false,
        isActive: false,
        nested: false,
      });
      expect(state.isDirty).toBe(false);
      expect(state.submitCount).toBe(0);
      expect(state.isSubmitting).toBe(false);
      expect(state.isValidating).toBe(false);
      expect(state.isValid).toBe(true);
    });

    it("should reset to provided values", () => {
      const resetValues = {
        name: "Reset Name",
        email: "reset@example.com",
      };

      // Modify state first
      store.setState((state) => {
        state.values.name = "Modified Name";
        state.values.age = 99;
        state.errors.email = { message: "Email error" };
        state.touched.email = true;
        state.isDirty = true;
      });

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe("Reset Name");
      expect(state.values.email).toBe("reset@example.com");
      expect(state.values.age).toBe(25); // Should use initial value
      expect(state.values.isActive).toBe(true); // Should use initial value
      expect(state.errors).toEqual({});
      expect(state.isDirty).toBe(false);
    });

    it("should reset partial values and merge with initial", () => {
      const resetValues = {
        name: "Partial Reset",
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe("Partial Reset");
      expect(state.values.email).toBe("initial@example.com");
      expect(state.values.age).toBe(25);
      expect(state.values.isActive).toBe(true);
    });

    it("should reset nested objects correctly", () => {
      const resetValues = {
        nested: {
          value: "reset nested",
          count: 10,
        },
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.nested.value).toBe("reset nested");
      expect(state.values.nested.count).toBe(10);
    });

    it("should reset all state flags correctly", () => {
      // Set state to various non-default values
      store.setState((state) => {
        state.isSubmitting = true;
        state.isValidating = true;
        state.isValid = false;
        state.isDirty = true;
        state.submitCount = 5;
      });

      reset();

      const state = store.getState();
      expect(state.isSubmitting).toBe(false);
      expect(state.isValidating).toBe(false);
      expect(state.isValid).toBe(true);
      expect(state.isDirty).toBe(false);
      expect(state.submitCount).toBe(0);
    });
  });

  describe("Touched State Reset", () => {
    it("should reset all touched states to false", () => {
      // Set all fields as touched
      store.setState((state) => {
        state.touched.name = true;
        state.touched.email = true;
        state.touched.age = true;
        state.touched.isActive = true;
        state.touched.nested = true;
      });

      reset();

      const state = store.getState();
      expect(state.touched.name).toBe(false);
      expect(state.touched.email).toBe(false);
      expect(state.touched.age).toBe(false);
      expect(state.touched.isActive).toBe(false);
      expect(state.touched.nested).toBe(false);
    });

    it("should create touched state for all reset value keys", () => {
      const resetValues = {
        name: "New Name",
        newField: "New Field Value",
      } as Partial<TestFormData>;

      reset(resetValues);

      const state = store.getState();
      expect(state.touched.name).toBe(false);
      expect((state.touched as any).newField).toBe(false);
      expect(state.touched.email).toBe(false);
    });

    it("should handle dynamic field additions in touched state", () => {
      const resetValues = {
        dynamicField1: "value1",
        dynamicField2: "value2",
        name: "Updated Name",
      } as Partial<TestFormData>;

      reset(resetValues);

      const state = store.getState();
      expect((state.touched as any).dynamicField1).toBe(false);
      expect((state.touched as any).dynamicField2).toBe(false);
      expect(state.touched.name).toBe(false);
    });
  });

  describe("Error State Reset", () => {
    it("should clear all errors", () => {
      // Set multiple errors
      store.setState((state) => {
        state.errors.name = { message: "Name error" };
        state.errors.email = { message: "Email error" };
        state.errors.age = { message: "Age error" };
      });

      reset();

      const state = store.getState();
      expect(state.errors).toEqual({});
      expect(Object.keys(state.errors)).toHaveLength(0);
    });

    it("should clear errors even with custom reset values", () => {
      // Set errors
      store.setState((state) => {
        state.errors.name = { message: "Name error" };
        state.errors.email = { message: "Email error" };
      });

      reset({ name: "Custom Reset" });

      const state = store.getState();
      expect(state.errors).toEqual({});
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty reset values object", () => {
      const initialState = store.getState();
      reset({});

      const state = store.getState();
      expect(state.values).toEqual(initialState.values);
      expect(state.errors).toEqual({});
      expect(state.isDirty).toBe(false);
    });

    it("should handle undefined reset values", () => {
      reset(undefined);

      const state = store.getState();
      expect(state.values).toEqual(initialValues);
    });

    it("should handle null values in reset", () => {
      const resetValues = {
        name: null as unknown as string,
        email: undefined as unknown as string,
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBeNull();
      expect(state.values.email).toBeUndefined();
    });

    it("should handle zero and false values correctly", () => {
      const resetValues = {
        age: 0,
        isActive: false,
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.age).toBe(0);
      expect(state.values.isActive).toBe(false);
    });

    it("should handle empty string values", () => {
      const resetValues = {
        name: "",
        email: "",
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe("");
      expect(state.values.email).toBe("");
    });

    it("should handle very large data sets", () => {
      const largeString = "x".repeat(10000);
      const resetValues = {
        name: largeString,
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe(largeString);
      expect(state.values.name.length).toBe(10000);
    });

    it("should handle special characters and unicode", () => {
      const resetValues = {
        name: "Special: !@#$%^&*()_+-=[]{}|;:,.<>?/\\`~\"'",
        email: "unicode@测试.com 🚀",
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe(resetValues.name);
      expect(state.values.email).toBe(resetValues.email);
    });

    it("should handle fields not in initial values", () => {
      const resetValues = {
        newField: "new value",
        anotherField: 42,
      } as Partial<TestFormData>;

      reset(resetValues);

      const state = store.getState();
      expect((state.values as any).newField).toBe("new value");
      expect((state.values as any).anotherField).toBe(42);
    });
  });

  describe("Default Values Integration", () => {
    it("should handle reset with default values configuration", () => {
      const storeWithDefaults = storeApi.createStore<
        FormStoreState<TestFormData>
      >({
        initialState: createTestStore({
          initialValues,
          defaultValues: {
            name: "Default Name",
            email: "default@test.com",
          },
        }),
        name: "test-store-defaults",
      });

      const resetWithDefaults = createReset(storeWithDefaults);

      resetWithDefaults();

      const state = storeWithDefaults.getState();
      // Should reset to initial values, not default values
      expect(state.values.name).toBe("Initial Name");
      expect(state.values.email).toBe("initial@example.com");
    });

    it("should merge reset values with initial values correctly", () => {
      const resetValues = {
        name: "Custom Name",
        age: 30,
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe("Custom Name");
      expect(state.values.age).toBe(30);
      expect(state.values.email).toBe("initial@example.com");
      expect(state.values.isActive).toBe(true);
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle rapid reset operations", () => {
      for (let i = 0; i < 1000; i++) {
        reset({ name: `Reset ${i}` });
      }

      const state = store.getState();
      expect(state.values.name).toBe("Reset 999");
      expect(state.isDirty).toBe(false);
      expect(state.submitCount).toBe(0);
    });

    it("should handle large reset value objects", () => {
      const largeResetValues = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`]),
      ) as Partial<TestFormData>;

      const startTime = Date.now();
      reset(largeResetValues);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      const state = store.getState();
      expect((state.values as any).field999).toBe("value999");
    });

    it("should maintain state consistency during rapid operations", () => {
      let stateUpdates = 0;
      const unsubscribe = store.subscribe(() => {
        stateUpdates++;
        const state = store.getState();
        // Ensure all reset properties are correct
        expect(state.errors).toEqual({});
        expect(state.isDirty).toBe(false);
        expect(state.isSubmitting).toBe(false);
        expect(state.isValidating).toBe(false);
        expect(state.isValid).toBe(true);
        expect(state.submitCount).toBe(0);
        expect(typeof state.touched).toBe("object");
      });

      for (let i = 0; i < 100; i++) {
        reset({ name: `Rapid ${i}` });
      }

      expect(stateUpdates).toBe(100);
      unsubscribe();
    });

    it("should handle concurrent reset operations", () => {
      const operations = Array.from({ length: 500 }, (_, i) => () => {
        reset({
          name: `Concurrent ${i}`,
          age: i % 100,
        });
      });

      operations.forEach((op) => op());

      const state = store.getState();
      expect(state.values.name).toContain("Concurrent");
      expect(typeof state.values.age).toBe("number");
      expect(state.isDirty).toBe(false);
    });
  });

  describe("State Consistency", () => {
    it("should preserve form configuration during reset", () => {
      const originalConfig = store.getState().config;

      reset({ name: "New Name" });

      const state = store.getState();
      expect(state.config).toEqual(originalConfig);
      expect(state.formId).toBe("test-form");
    });

    it("should preserve validators during reset", () => {
      // Add some validators
      store.setState((state) => {
        state.validators.set("name", [vi.fn()]);
        state.validators.set("email", [vi.fn(), vi.fn()]);
      });

      const originalValidators = store.getState().validators;

      reset();

      const state = store.getState();
      expect(state.validators).toBe(originalValidators);
      expect(state.validators.size).toBe(2);
    });

    it("should work correctly when store state is modified externally", () => {
      // Modify store state externally
      store.setState((state) => {
        state.values.name = "External modification";
        state.errors.email = { message: "External error" };
        state.touched.age = true;
        state.isSubmitting = true;
      });

      reset({ email: "Reset email" });

      const state = store.getState();
      expect(state.values.email).toBe("Reset email");
      expect(state.values.name).toBe("Initial Name");
      expect(state.errors).toEqual({});
      expect(state.touched.age).toBe(false);
      expect(state.isSubmitting).toBe(false);
    });

    it("should handle immutable state updates correctly", () => {
      const initialState = store.getState();

      reset({ name: "Reset Name" });

      const newState = store.getState();

      // States should be different objects
      expect(newState).not.toBe(initialState);
      expect(newState.values).not.toBe(initialState.values);
      expect(newState.errors).not.toBe(initialState.errors);
      expect(newState.touched).not.toBe(initialState.touched);
    });
  });

  describe("Type Safety and Data Integrity", () => {
    it("should maintain type consistency after reset", () => {
      const resetValues = {
        name: "string value",
        age: 42,
        isActive: false,
        nested: { value: "nested string", count: 99 },
      };

      reset(resetValues);

      const state = store.getState();
      expect(typeof state.values.name).toBe("string");
      expect(typeof state.values.age).toBe("number");
      expect(typeof state.values.isActive).toBe("boolean");
      expect(typeof state.values.nested).toBe("object");
      expect(typeof state.values.nested.value).toBe("string");
      expect(typeof state.values.nested.count).toBe("number");
    });

    it("should handle nested object resets correctly", () => {
      const resetValues = {
        nested: {
          value: "completely new nested",
          count: 888,
        },
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.nested.value).toBe("completely new nested");
      expect(state.values.nested.count).toBe(888);
    });

    it("should handle partial nested object resets", () => {
      // This tests the merge behavior with initial values
      const resetValues = {
        nested: {
          value: "partial update",
          count: 777,
        },
      };

      reset(resetValues);

      const state = store.getState();
      expect(state.values.nested.value).toBe("partial update");
      expect(state.values.nested.count).toBe(777);
    });
  });

  describe("Subscription and Change Detection", () => {
    it("should notify subscribers when reset is called", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      reset({ name: "Reset Test" });

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should provide correct previous and current state to subscribers", () => {
      // Modify state first
      store.setState((state) => {
        state.values.name = "Modified";
        state.errors.email = { message: "Error" };
        state.isDirty = true;
      });

      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      reset({ name: "Reset Name" });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            name: "Reset Name",
          }),
          errors: {},
          isDirty: false,
          submitCount: 0,
        }),
        expect.objectContaining({
          values: expect.objectContaining({
            name: "Modified",
          }),
          errors: expect.objectContaining({
            email: { message: "Error" },
          }),
          isDirty: true,
        }),
      );

      unsubscribe();
    });

    it("should handle multiple subscribers correctly", () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = store.subscribe(subscriber1);
      const unsubscribe2 = store.subscribe(subscriber2);

      reset({ name: "Multi-subscriber reset" });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe("Configuration Edge Cases", () => {
    it("should handle missing initial values in config", () => {
      store.setState((state) => {
        delete (state.config as any).initialValues;
      });

      expect(() => {
        reset();
      }).not.toThrow();

      // Should still reset other properties
      const state = store.getState();
      expect(state.errors).toEqual({});
      expect(state.isDirty).toBe(false);
      expect(state.submitCount).toBe(0);
    });

    it("should handle config being undefined", () => {
      store.setState((state) => {
        (state as any).config = undefined;
      });

      expect(() => {
        reset({ name: "Test" });
      }).not.toThrow();

      const state = store.getState();
      expect(state.values.name).toBe("Test");
      expect(state.errors).toEqual({});
    });

    it("should handle malformed initial values", () => {
      store.setState((state) => {
        (state.config as any).initialValues = null;
      });

      expect(() => {
        reset({ name: "Safe reset" });
      }).not.toThrow();

      const state = store.getState();
      expect(state.values.name).toBe("Safe reset");
    });
  });
});
