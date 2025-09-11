import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSetValues } from "./setValues.js";

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

describe("setValues", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let setValues: ReturnType<typeof createSetValues<TestFormData>>;
  let mockValidate: ReturnType<typeof vi.fn>;

  const initialValues: TestFormData = {
    name: "",
    email: "",
    age: 0,
    isActive: false,
    nested: {
      value: "",
      count: 0,
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

    mockValidate = vi.fn().mockResolvedValue(true);
    setValues = createSetValues(store, { validate: mockValidate });
  });

  describe("Happy Path", () => {
    it("should set single field value", () => {
      setValues({ name: "John Doe" });

      const state = store.getState();
      expect(state.values.name).toBe("John Doe");
      expect(state.values.email).toBe("");
      expect(state.values.age).toBe(0);
    });

    it("should set multiple field values", () => {
      setValues({
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      });

      const state = store.getState();
      expect(state.values.name).toBe("John Doe");
      expect(state.values.email).toBe("john@example.com");
      expect(state.values.age).toBe(30);
      expect(state.values.isActive).toBe(false);
    });

    it("should set all field values", () => {
      const newValues: Partial<TestFormData> = {
        name: "Jane Smith",
        email: "jane@example.com",
        age: 25,
        isActive: true,
        nested: {
          value: "nested test",
          count: 5,
        },
      };

      setValues(newValues);

      const state = store.getState();
      expect(state.values).toEqual(newValues);
    });

    it("should handle nested object updates", () => {
      setValues({
        nested: {
          value: "updated nested",
          count: 10,
        },
      });

      const state = store.getState();
      expect(state.values.nested.value).toBe("updated nested");
      expect(state.values.nested.count).toBe(10);
    });

    it("should handle partial nested object updates", () => {
      // First set initial nested values
      setValues({
        nested: {
          value: "initial",
          count: 5,
        },
      });

      // Then update only part of nested object
      setValues({
        nested: {
          ...store.getState().values.nested,
          value: "updated",
        },
      });

      const state = store.getState();
      expect(state.values.nested.value).toBe("updated");
      expect(state.values.nested.count).toBe(5);
    });
  });

  describe("Dirty State Management", () => {
    it("should mark form as dirty when values change from initial", () => {
      setValues({ name: "John" });

      const state = store.getState();
      expect(state.isDirty).toBe(true);
    });

    it("should not mark form as dirty when values match initial", () => {
      // Change values first
      setValues({ name: "John" });
      expect(store.getState().isDirty).toBe(true);

      // Reset to initial values
      setValues({ name: "" });

      const state = store.getState();
      expect(state.isDirty).toBe(false);
    });

    it("should handle complex dirty state with multiple field changes", () => {
      // Initially clean
      expect(store.getState().isDirty).toBe(false);

      // Make changes
      setValues({ name: "John", age: 30 });
      expect(store.getState().isDirty).toBe(true);

      // Partial reset
      setValues({ name: "" });
      expect(store.getState().isDirty).toBe(true);

      // Full reset
      setValues({ age: 0 });
      expect(store.getState().isDirty).toBe(false);
    });

    it("should correctly handle dirty state with default values", () => {
      const storeWithDefaults = storeApi.createStore<
        FormStoreState<TestFormData>
      >({
        initialState: createTestStore({
          initialValues: { ...initialValues, name: "Initial" },
          defaultValues: { name: "Default", email: "default@test.com" },
        }),
        name: "test-store-defaults",
      });

      const setValuesWithDefaults = createSetValues(storeWithDefaults, {
        validate: mockValidate,
      });

      // Should be clean initially
      expect(storeWithDefaults.getState().isDirty).toBe(false);

      // Setting to default value should still be dirty if different from initial
      setValuesWithDefaults({ name: "Default" });
      expect(storeWithDefaults.getState().isDirty).toBe(true);

      // Setting back to initial should be clean
      setValuesWithDefaults({ name: "Initial" });
      expect(storeWithDefaults.getState().isDirty).toBe(false);
    });
  });

  describe("Validation Integration", () => {
    it("should trigger validation when validateOnChange is true", () => {
      setValues({ name: "John" });

      expect(mockValidate).toHaveBeenCalledTimes(1);
    });

    it("should not trigger validation when validateOnChange is false", () => {
      store.setState((state) => {
        state.config.validateOnChange = false;
      });

      setValues({ name: "John" });

      expect(mockValidate).not.toHaveBeenCalled();
    });

    it("should trigger validation for each setValues call", () => {
      setValues({ name: "John" });
      setValues({ email: "john@example.com" });
      setValues({ age: 30 });

      expect(mockValidate).toHaveBeenCalledTimes(3);
    });

    it("should handle validation promise rejection gracefully", () => {
      mockValidate.mockRejectedValue(new Error("Validation error"));

      expect(() => {
        setValues({ name: "John" });
      }).not.toThrow();

      const state = store.getState();
      expect(state.values.name).toBe("John");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty values object", () => {
      const initialState = store.getState();
      setValues({});

      const state = store.getState();
      expect(state.values).toEqual(initialState.values);
      expect(state.isDirty).toBe(false);
    });

    it("should handle undefined values", () => {
      setValues({ name: undefined as unknown as string });

      const state = store.getState();
      expect(state.values.name).toBeUndefined();
    });

    it("should handle null values", () => {
      setValues({ name: null as unknown as string });

      const state = store.getState();
      expect(state.values.name).toBeNull();
    });

    it("should handle zero and false values correctly", () => {
      setValues({
        age: 0,
        isActive: false,
      });

      const state = store.getState();
      expect(state.values.age).toBe(0);
      expect(state.values.isActive).toBe(false);
    });

    it("should handle empty string values", () => {
      setValues({ name: "" });

      const state = store.getState();
      expect(state.values.name).toBe("");
    });

    it("should handle very large data sets", () => {
      const largeString = "x".repeat(10000);
      setValues({ name: largeString });

      const state = store.getState();
      expect(state.values.name).toBe(largeString);
      expect(state.values.name.length).toBe(10000);
    });

    it("should handle special characters and unicode", () => {
      const specialData = {
        name: "Special: !@#$%^&*()_+-=[]{}|;:,.<>?/\\`~\"'",
        email: "unicode@测试.com 🚀",
      };

      setValues(specialData);

      const state = store.getState();
      expect(state.values.name).toBe(specialData.name);
      expect(state.values.email).toBe(specialData.email);
    });

    it("should handle circular reference checks in dirty state", () => {
      const circularValue: any = { name: "test" };
      circularValue.self = circularValue;

      // Should not crash with circular references in dirty check
      expect(() => {
        setValues({ nested: circularValue as any });
      }).not.toThrow();
    });

    it("should handle fields not in initial values", () => {
      setValues({ newField: "new value" } as any);

      const state = store.getState();
      expect((state.values as any).newField).toBe("new value");
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle rapid bulk updates", () => {
      for (let i = 0; i < 1000; i++) {
        setValues({
          name: `Name ${i}`,
          age: i,
          isActive: i % 2 === 0,
        });
      }

      const state = store.getState();
      expect(state.values.name).toBe("Name 999");
      expect(state.values.age).toBe(999);
      expect(state.values.isActive).toBe(false);
    });

    it("should handle concurrent bulk operations", () => {
      const operations = Array.from({ length: 500 }, (_, i) => () => {
        setValues({
          name: `Concurrent ${i}`,
          email: `user${i}@test.com`,
          age: i % 100,
        });
      });

      operations.forEach((op) => op());

      const state = store.getState();
      expect(state.values.name).toContain("Concurrent");
      expect(state.values.email).toContain("@test.com");
      expect(typeof state.values.age).toBe("number");
    });

    it("should maintain state consistency during rapid operations", () => {
      let stateUpdates = 0;
      const unsubscribe = store.subscribe(() => {
        stateUpdates++;
        const state = store.getState();
        // Ensure values object is always valid
        expect(state.values).toBeDefined();
        expect(typeof state.values).toBe("object");
        expect(typeof state.isDirty).toBe("boolean");
      });

      for (let i = 0; i < 100; i++) {
        setValues({ name: `Value ${i}` });
      }

      expect(stateUpdates).toBe(100);
      unsubscribe();
    });

    it("should handle large object assignments efficiently", () => {
      const largeUpdate = Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`]),
      );

      const startTime = Date.now();
      setValues(largeUpdate as any);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      const state = store.getState();
      expect((state.values as any).field999).toBe("value999");
    });
  });

  describe("State Consistency", () => {
    it("should preserve other state properties when setting values", () => {
      // Set initial state with some properties
      store.setState((state) => {
        state.errors.email = { message: "Email error" };
        state.touched.name = true;
        state.isSubmitting = true;
        state.submitCount = 5;
      });

      setValues({ name: "John" });

      const state = store.getState();
      expect(state.errors.email?.message).toBe("Email error");
      expect(state.touched.name).toBe(true);
      expect(state.isSubmitting).toBe(true);
      expect(state.submitCount).toBe(5);
      expect(state.values.name).toBe("John");
    });

    it("should work correctly when store state is modified externally", () => {
      // Modify store state externally
      store.setState((state) => {
        state.values.email = "external@test.com";
        state.touched.email = true;
      });

      // setValues should still work and merge correctly
      setValues({ name: "John" });

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.values.email).toBe("external@test.com");
      expect(state.touched.email).toBe(true);
    });

    it("should handle Object.assign behavior correctly", () => {
      // Set initial values
      setValues({
        name: "John",
        email: "john@test.com",
        nested: { value: "initial", count: 1 },
      });

      // Update with partial data
      setValues({
        name: "Jane",
        nested: { value: "updated", count: 2 },
      });

      const state = store.getState();
      expect(state.values.name).toBe("Jane");
      expect(state.values.email).toBe("john@test.com");
      expect(state.values.nested.value).toBe("updated");
      expect(state.values.nested.count).toBe(2);
    });

    it("should handle overwriting nested objects completely", () => {
      // Set initial nested object
      setValues({
        nested: { value: "initial", count: 1 },
      });

      // Overwrite with new nested object
      setValues({
        nested: { value: "overwritten", count: 99 },
      });

      const state = store.getState();
      expect(state.values.nested.value).toBe("overwritten");
      expect(state.values.nested.count).toBe(99);
    });
  });

  describe("Type Safety and Data Integrity", () => {
    it("should maintain type consistency for string fields", () => {
      setValues({ name: "string value" });

      const state = store.getState();
      expect(typeof state.values.name).toBe("string");
    });

    it("should maintain type consistency for number fields", () => {
      setValues({ age: 25 });

      const state = store.getState();
      expect(typeof state.values.age).toBe("number");
    });

    it("should maintain type consistency for boolean fields", () => {
      setValues({ isActive: true });

      const state = store.getState();
      expect(typeof state.values.isActive).toBe("boolean");
    });

    it("should maintain type consistency for object fields", () => {
      setValues({ nested: { value: "test", count: 5 } });

      const state = store.getState();
      expect(typeof state.values.nested).toBe("object");
      expect(state.values.nested.value).toBe("test");
      expect(state.values.nested.count).toBe(5);
    });

    it("should handle mixed type updates", () => {
      setValues({
        name: "John",
        age: 30,
        isActive: true,
        nested: { value: "nested", count: 10 },
      });

      const state = store.getState();
      expect(typeof state.values.name).toBe("string");
      expect(typeof state.values.age).toBe("number");
      expect(typeof state.values.isActive).toBe("boolean");
      expect(typeof state.values.nested).toBe("object");
    });
  });

  describe("Configuration Edge Cases", () => {
    it("should handle missing validateOnChange configuration", () => {
      store.setState((state) => {
        delete (state.config as any).validateOnChange;
      });

      expect(() => {
        setValues({ name: "John" });
      }).not.toThrow();

      expect(mockValidate).not.toHaveBeenCalled();
    });

    it("should handle config being undefined", () => {
      store.setState((state) => {
        (state as any).config = undefined;
      });

      expect(() => {
        setValues({ name: "John" });
      }).not.toThrow();

      const state = store.getState();
      expect(state.values.name).toBe("John");
    });

    it("should respect validateOnChange configuration changes", () => {
      // Initially validateOnChange is true
      setValues({ name: "John" });
      expect(mockValidate).toHaveBeenCalledTimes(1);

      mockValidate.mockClear();

      // Change configuration
      store.setState((state) => {
        state.config.validateOnChange = false;
      });

      setValues({ email: "john@test.com" });
      expect(mockValidate).not.toHaveBeenCalled();
    });
  });

  describe("Subscription and Change Detection", () => {
    it("should notify subscribers when values change", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setValues({ name: "John" });

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should provide correct previous and current state to subscribers", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setValues({ name: "John", age: 30 });

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            name: "John",
            age: 30,
          }),
          isDirty: true,
        }),
        expect.objectContaining({
          values: expect.objectContaining({
            name: "",
            age: 0,
          }),
          isDirty: false,
        }),
      );

      unsubscribe();
    });

    it("should handle multiple subscribers correctly", () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = store.subscribe(subscriber1);
      const unsubscribe2 = store.subscribe(subscriber2);

      setValues({ name: "Multi-subscriber test" });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
    });
  });
});
