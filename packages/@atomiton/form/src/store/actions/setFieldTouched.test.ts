import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSetFieldTouched } from "./setFieldTouched.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  nested: {
    value: string;
  };
} & FieldValues;

describe("setFieldTouched", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let setFieldTouched: ReturnType<typeof createSetFieldTouched<TestFormData>>;
  let mockValidateField: ReturnType<typeof vi.fn>;

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

    mockValidateField = vi.fn().mockResolvedValue({ valid: true });
    setFieldTouched = createSetFieldTouched(store, {
      validateField: mockValidateField,
    });
  });

  describe("Happy Path", () => {
    it("should mark field as touched", () => {
      setFieldTouched("name", true);

      const state = store.getState();
      expect(state.touched.name).toBe(true);
    });

    it("should mark field as untouched", () => {
      // First mark as touched
      setFieldTouched("name", true);
      expect(store.getState().touched.name).toBe(true);

      // Then mark as untouched
      setFieldTouched("name", false);

      const state = store.getState();
      expect(state.touched.name).toBe(false);
    });

    it("should handle multiple fields independently", () => {
      setFieldTouched("name", true);
      setFieldTouched("email", false);
      setFieldTouched("age", true);

      const state = store.getState();
      expect(state.touched.name).toBe(true);
      expect(state.touched.email).toBe(false);
      expect(state.touched.age).toBe(true);
      expect(state.touched.isActive).toBe(false);
    });

    it("should handle boolean field touch state", () => {
      setFieldTouched("isActive", true);

      const state = store.getState();
      expect(state.touched.isActive).toBe(true);
    });

    it("should handle nested field touch state", () => {
      setFieldTouched("nested", true);

      const state = store.getState();
      expect(state.touched.nested).toBe(true);
    });
  });

  describe("Validation Integration", () => {
    it("should trigger validation when touched and validateOnBlur is true", () => {
      setFieldTouched("name", true);

      expect(mockValidateField).toHaveBeenCalledWith("name");
    });

    it("should not trigger validation when marked as untouched", () => {
      setFieldTouched("name", false);

      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should not trigger validation when validateOnBlur is false", () => {
      store.setState((state) => {
        state.config.validateOnBlur = false;
      });

      setFieldTouched("name", true);

      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should set error when validation fails on blur", async () => {
      mockValidateField.mockResolvedValue({
        valid: false,
        error: "Name is required",
      });

      setFieldTouched("name", true);

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name is required");
    });

    it("should not set error when validation passes on blur", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      setFieldTouched("name", true);

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.errors.name).toBeUndefined();
    });

    it("should use default error message when validation fails without error", async () => {
      mockValidateField.mockResolvedValue({ valid: false });

      setFieldTouched("name", true);

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Validation failed");
    });

    it("should not clear existing errors when marking as untouched", () => {
      // Set an initial error
      store.setState((state) => {
        state.errors.name = { message: "Existing error" };
      });

      setFieldTouched("name", false);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Existing error");
    });
  });

  describe("Edge Cases", () => {
    it("should handle toggling touched state rapidly", () => {
      for (let i = 0; i < 100; i++) {
        setFieldTouched("name", i % 2 === 0);
      }

      const state = store.getState();
      expect(state.touched.name).toBe(false);
    });

    it("should handle setting same touched state multiple times", () => {
      const subscriber = vi.fn();
      store.subscribe(subscriber);

      setFieldTouched("name", true);
      setFieldTouched("name", true);
      setFieldTouched("name", true);

      const state = store.getState();
      expect(state.touched.name).toBe(true);
      expect(subscriber).toHaveBeenCalledTimes(3);
    });

    it("should handle touched state on field that doesn't exist in initial state", () => {
      setFieldTouched("nonExistentField" as any, true);

      const state = store.getState();
      expect(state.touched["nonExistentField" as any]).toBe(true);
    });

    it("should handle different field types for touch state", () => {
      setFieldTouched("name", true);
      setFieldTouched("age", true);
      setFieldTouched("isActive", true);
      setFieldTouched("nested", true);

      const state = store.getState();
      expect(state.touched.name).toBe(true);
      expect(state.touched.age).toBe(true);
      expect(state.touched.isActive).toBe(true);
      expect(state.touched.nested).toBe(true);
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle rapid touch state changes across multiple fields", () => {
      const fields = ["name", "email", "age"] as (keyof TestFormData)[];

      for (let i = 0; i < 1000; i++) {
        const field = fields[i % fields.length];
        setFieldTouched(field, i % 2 === 0);
      }

      const state = store.getState();
      expect(state.touched.name).toBe(false);
      expect(state.touched.email).toBe(true);
      expect(state.touched.age).toBe(false);
    });

    it("should handle concurrent touch operations", () => {
      const operations = Array.from({ length: 500 }, (_, i) => () => {
        setFieldTouched("name", i % 3 === 0);
        setFieldTouched("email", i % 2 === 0);
        setFieldTouched("age", i % 4 === 0);
      });

      operations.forEach((op) => op());

      const state = store.getState();
      expect(typeof state.touched.name).toBe("boolean");
      expect(typeof state.touched.email).toBe("boolean");
      expect(typeof state.touched.age).toBe("boolean");
    });

    it("should maintain state consistency during rapid operations with validation", () => {
      let stateUpdates = 0;
      const unsubscribe = store.subscribe(() => {
        stateUpdates++;
        const state = store.getState();
        // Ensure touched object is always valid
        expect(state.touched).toBeDefined();
        expect(typeof state.touched).toBe("object");
        // Ensure all touched values are booleans
        Object.values(state.touched).forEach((touched) => {
          expect(typeof touched).toBe("boolean");
        });
      });

      for (let i = 0; i < 100; i++) {
        setFieldTouched("name", i % 2 === 0);
      }

      expect(stateUpdates).toBe(100);
      unsubscribe();
    });

    it("should handle multiple validation calls without race conditions", async () => {
      let validationCalls = 0;
      mockValidateField.mockImplementation(async () => {
        validationCalls++;
        // Simulate async validation delay
        await new Promise((resolve) => setTimeout(resolve, 1));
        return { valid: true };
      });

      // Trigger multiple rapid validations
      for (let i = 0; i < 10; i++) {
        setFieldTouched("name", false);
        setFieldTouched("name", true);
      }

      // Wait for all validations to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(validationCalls).toBe(10);
    });
  });

  describe("State Consistency", () => {
    it("should preserve other state properties when setting touched", () => {
      // Set initial state with some properties
      store.setState((state) => {
        state.values.name = "John";
        state.errors.email = { message: "Email error" };
        state.isDirty = true;
        state.isSubmitting = true;
        state.submitCount = 5;
      });

      setFieldTouched("name", true);

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.errors.email?.message).toBe("Email error");
      expect(state.isDirty).toBe(true);
      expect(state.isSubmitting).toBe(true);
      expect(state.submitCount).toBe(5);
      expect(state.touched.name).toBe(true);
    });

    it("should work correctly when store state is modified externally", () => {
      // Modify store state externally
      store.setState((state) => {
        state.touched.email = true;
        state.values.name = "external";
      });

      // setFieldTouched should still work
      setFieldTouched("name", true);

      const state = store.getState();
      expect(state.touched.name).toBe(true);
      expect(state.touched.email).toBe(true);
      expect(state.values.name).toBe("external");
    });

    it("should handle touched state initialization for new fields", () => {
      const newFieldName = "dynamicField" as keyof TestFormData;
      setFieldTouched(newFieldName as any, true);

      const state = store.getState();
      expect(state.touched[newFieldName as any]).toBe(true);
    });

    it("should maintain touched state consistency across resets", () => {
      // Set some touched states
      setFieldTouched("name", true);
      setFieldTouched("email", true);

      // Reset store values (but not touched state)
      store.setState((state) => {
        state.values = { ...initialValues };
      });

      const state = store.getState();
      expect(state.touched.name).toBe(true);
      expect(state.touched.email).toBe(true);
    });
  });

  describe("Validation Error Handling", () => {
    it("should handle validation function throwing errors", async () => {
      mockValidateField.mockRejectedValue(
        new Error("Validation function error"),
      );
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      setFieldTouched("name", true);

      // Wait for async validation to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Touched state should still be set even if validation fails
      const state = store.getState();
      expect(state.touched.name).toBe(true);

      consoleSpy.mockRestore();
    });

    it("should handle malformed validation responses", async () => {
      mockValidateField.mockResolvedValue(null);

      setFieldTouched("name", true);

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should not crash, touched state should be set
      const state = store.getState();
      expect(state.touched.name).toBe(true);
    });

    it("should handle validation returning undefined", async () => {
      mockValidateField.mockResolvedValue(undefined);

      setFieldTouched("name", true);

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.touched.name).toBe(true);
    });

    it("should handle slow validation responses", async () => {
      mockValidateField.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ valid: false, error: "Slow error" }),
              100,
            ),
          ),
      );

      setFieldTouched("name", true);

      // Immediately check touched state (should be set synchronously)
      expect(store.getState().touched.name).toBe(true);

      // Wait for validation to complete
      await new Promise((resolve) => setTimeout(resolve, 150));

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Slow error");
    });
  });

  describe("Configuration Edge Cases", () => {
    it("should respect validateOnBlur configuration changes", () => {
      // Initially validateOnBlur is true
      setFieldTouched("name", true);
      expect(mockValidateField).toHaveBeenCalledTimes(1);

      mockValidateField.mockClear();

      // Change configuration
      store.setState((state) => {
        state.config.validateOnBlur = false;
      });

      setFieldTouched("email", true);
      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should handle missing validateOnBlur configuration", () => {
      store.setState((state) => {
        delete (state.config as any).validateOnBlur;
      });

      // Should not crash and should not validate
      expect(() => {
        setFieldTouched("name", true);
      }).not.toThrow();

      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should handle config being undefined", () => {
      store.setState((state) => {
        (state as any).config = undefined;
      });

      // Should not crash
      expect(() => {
        setFieldTouched("name", true);
      }).not.toThrow();

      const state = store.getState();
      expect(state.touched.name).toBe(true);
    });
  });

  describe("Subscription and Change Detection", () => {
    it("should notify subscribers when touched state changes", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setFieldTouched("name", true);

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should provide correct previous and current state to subscribers", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      setFieldTouched("name", true);

      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({
          touched: expect.objectContaining({
            name: true,
          }),
        }),
        expect.objectContaining({
          touched: expect.objectContaining({
            name: false,
          }),
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

      setFieldTouched("name", true);

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
      setFieldTouched("name", true);

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("Field Name Edge Cases", () => {
    it("should handle field names with special characters", () => {
      const specialField = "field-with_special.chars" as keyof TestFormData;
      setFieldTouched(specialField as any, true);

      const state = store.getState();
      expect(state.touched[specialField as any]).toBe(true);
    });

    it("should handle numeric field references", () => {
      setFieldTouched("age", true);

      const state = store.getState();
      expect(state.touched.age).toBe(true);
    });

    it("should handle boolean field references", () => {
      setFieldTouched("isActive", true);

      const state = store.getState();
      expect(state.touched.isActive).toBe(true);
    });

    it("should handle object field references", () => {
      setFieldTouched("nested", true);

      const state = store.getState();
      expect(state.touched.nested).toBe(true);
    });
  });
});
