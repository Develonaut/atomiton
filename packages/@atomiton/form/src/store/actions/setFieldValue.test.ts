import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createSetFieldValue } from "./setFieldValue.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  nested: {
    value: string;
  };
} & FieldValues;

describe("setFieldValue", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let setFieldValue: ReturnType<typeof createSetFieldValue<TestFormData>>;
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
    setFieldValue = createSetFieldValue(store, {
      validateField: mockValidateField,
    });
  });

  describe("Happy Path", () => {
    it("should set field value correctly", () => {
      setFieldValue("name", "John Doe");

      const state = store.getState();
      expect(state.values.name).toBe("John Doe");
    });

    it("should mark form as dirty when value changes", () => {
      setFieldValue("name", "John Doe");

      const state = store.getState();
      expect(state.isDirty).toBe(true);
    });

    it("should not mark form as dirty when value matches initial", () => {
      // First change to make it dirty
      setFieldValue("name", "John Doe");
      expect(store.getState().isDirty).toBe(true);

      // Reset to initial value
      setFieldValue("name", "");
      expect(store.getState().isDirty).toBe(false);
    });

    it("should set different field types correctly", () => {
      setFieldValue("name", "John");
      setFieldValue("age", 25);
      setFieldValue("isActive", true);

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.values.age).toBe(25);
      expect(state.values.isActive).toBe(true);
    });

    it("should handle nested object values", () => {
      setFieldValue("nested", { value: "nested test" });

      const state = store.getState();
      expect(state.values.nested.value).toBe("nested test");
    });
  });

  describe("Validation Integration", () => {
    it("should trigger validation when validateOnChange is true and field is touched", () => {
      // Mark field as touched first
      store.setState((state) => {
        state.touched.name = true;
      });

      setFieldValue("name", "John");

      expect(mockValidateField).toHaveBeenCalledWith("name");
    });

    it("should not trigger validation when field is not touched", () => {
      setFieldValue("name", "John");

      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should not trigger validation when validateOnChange is false", () => {
      store.setState((state) => {
        state.config.validateOnChange = false;
        state.touched.name = true;
      });

      setFieldValue("name", "John");

      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should clear field error when validation passes", async () => {
      store.setState((state) => {
        state.touched.name = true;
        state.errors.name = { message: "Previous error" };
      });

      mockValidateField.mockResolvedValue({ valid: true });
      setFieldValue("name", "Valid Name");

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.errors.name).toBeUndefined();
    });

    it("should set field error when validation fails", async () => {
      store.setState((state) => {
        state.touched.name = true;
      });

      mockValidateField.mockResolvedValue({
        valid: false,
        error: "Name is required",
      });

      setFieldValue("name", "");

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name is required");
    });

    it("should handle validation error without error message", async () => {
      store.setState((state) => {
        state.touched.name = true;
      });

      mockValidateField.mockResolvedValue({ valid: false });
      setFieldValue("name", "");

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Validation failed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined values", () => {
      setFieldValue("name", undefined as unknown as string);

      const state = store.getState();
      expect(state.values.name).toBeUndefined();
      expect(state.isDirty).toBe(true);
    });

    it("should handle null values", () => {
      setFieldValue("name", null as unknown as string);

      const state = store.getState();
      expect(state.values.name).toBeNull();
      expect(state.isDirty).toBe(true);
    });

    it("should handle empty string values", () => {
      setFieldValue("name", "");

      const state = store.getState();
      expect(state.values.name).toBe("");
    });

    it("should handle zero values", () => {
      setFieldValue("age", 0);

      const state = store.getState();
      expect(state.values.age).toBe(0);
    });

    it("should handle false boolean values", () => {
      setFieldValue("isActive", false);

      const state = store.getState();
      expect(state.values.isActive).toBe(false);
    });

    it("should handle very large strings", () => {
      const largeString = "x".repeat(10000);
      setFieldValue("name", largeString);

      const state = store.getState();
      expect(state.values.name).toBe(largeString);
      expect(state.values.name.length).toBe(10000);
    });

    it("should handle special characters", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/\\`~\"'";
      setFieldValue("name", specialChars);

      const state = store.getState();
      expect(state.values.name).toBe(specialChars);
    });

    it("should handle unicode characters", () => {
      const unicodeString = "🚀🎉💯👍🔥";
      setFieldValue("name", unicodeString);

      const state = store.getState();
      expect(state.values.name).toBe(unicodeString);
    });

    it("should handle setting same value multiple times", () => {
      const subscriber = vi.fn();
      store.subscribe(subscriber);

      setFieldValue("name", "test");
      setFieldValue("name", "test");
      setFieldValue("name", "test");

      const state = store.getState();
      expect(state.values.name).toBe("test");
      // Should call setState each time even if value is the same
      expect(subscriber).toHaveBeenCalled();
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle rapid field updates without race conditions", () => {
      const updates = Array.from({ length: 1000 }, (_, i) => `Update ${i}`);

      updates.forEach((value) => {
        setFieldValue("name", value);
      });

      const state = store.getState();
      expect(state.values.name).toBe("Update 999");
      expect(state.isDirty).toBe(true);
    });

    it("should handle concurrent updates to different fields", () => {
      const nameUpdates = Array.from({ length: 100 }, (_, i) => `Name ${i}`);
      const emailUpdates = Array.from(
        { length: 100 },
        (_, i) => `email${i}@test.com`,
      );

      nameUpdates.forEach((value, i) => {
        setFieldValue("name", value);
        setFieldValue("email", emailUpdates[i]);
      });

      const state = store.getState();
      expect(state.values.name).toBe("Name 99");
      expect(state.values.email).toBe("email99@test.com");
    });

    it("should handle mixed data types rapidly", () => {
      for (let i = 0; i < 100; i++) {
        setFieldValue("name", `Name ${i}`);
        setFieldValue("age", i);
        setFieldValue("isActive", i % 2 === 0);
      }

      const state = store.getState();
      expect(state.values.name).toBe("Name 99");
      expect(state.values.age).toBe(99);
      expect(state.values.isActive).toBe(false);
    });

    it("should maintain state consistency during rapid updates", () => {
      let stateUpdates = 0;
      const unsubscribe = store.subscribe(() => {
        stateUpdates++;
        const state = store.getState();
        // Ensure state is always valid
        expect(state.values).toBeDefined();
        expect(typeof state.isDirty).toBe("boolean");
        expect(typeof state.touched).toBe("object");
      });

      for (let i = 0; i < 500; i++) {
        setFieldValue("name", `Value ${i}`);
      }

      expect(stateUpdates).toBe(500);
      unsubscribe();
    });
  });

  describe("Error Scenarios", () => {
    it("should handle validation function throwing errors", async () => {
      store.setState((state) => {
        state.touched.name = true;
      });

      mockValidateField.mockRejectedValue(new Error("Validation error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      setFieldValue("name", "test");

      // Wait for async validation to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Field value should still be set even if validation fails
      const state = store.getState();
      expect(state.values.name).toBe("test");

      consoleSpy.mockRestore();
    });

    it("should handle malformed validation responses", async () => {
      store.setState((state) => {
        state.touched.name = true;
      });

      mockValidateField.mockResolvedValue(null);
      setFieldValue("name", "test");

      // Wait for async validation - this will cause an error but shouldn't crash the test
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should not crash, field value should still be set
      const state = store.getState();
      expect(state.values.name).toBe("test");
    });
  });

  describe("State Consistency", () => {
    it("should maintain proper dirty state tracking with complex updates", () => {
      // Start clean
      expect(store.getState().isDirty).toBe(false);

      // Make dirty
      setFieldValue("name", "John");
      expect(store.getState().isDirty).toBe(true);

      // Change to different value (still dirty)
      setFieldValue("name", "Jane");
      expect(store.getState().isDirty).toBe(true);

      // Change another field
      setFieldValue("email", "test@example.com");
      expect(store.getState().isDirty).toBe(true);

      // Reset name to initial but email still changed
      setFieldValue("name", "");
      expect(store.getState().isDirty).toBe(true);

      // Reset email to initial (now clean)
      setFieldValue("email", "");
      expect(store.getState().isDirty).toBe(false);
    });

    it("should correctly compare initial values with default values", () => {
      const storeWithDefaults = storeApi.createStore<
        FormStoreState<TestFormData>
      >({
        initialState: createTestStore({
          initialValues: { ...initialValues, name: "Initial" },
          defaultValues: { name: "Default", email: "default@test.com" },
        }),
        name: "test-store-defaults",
      });

      const setFieldValueWithDefaults = createSetFieldValue(storeWithDefaults, {
        validateField: mockValidateField,
      });

      // Should be clean initially
      expect(storeWithDefaults.getState().isDirty).toBe(false);

      // Changing to match default should still be dirty if different from initial
      setFieldValueWithDefaults("name", "Default");
      expect(storeWithDefaults.getState().isDirty).toBe(true);

      // Changing back to initial should be clean
      setFieldValueWithDefaults("name", "Initial");
      expect(storeWithDefaults.getState().isDirty).toBe(false);
    });

    it("should handle complex nested objects in dirty state", () => {
      const complexValue = {
        name: "test",
        deep: {
          nested: {
            value: "deep",
            array: [1, 2, 3],
          },
        },
      };

      // Should not crash with complex nested objects
      expect(() => {
        setFieldValue("nested" as any, complexValue);
      }).not.toThrow();

      const state = store.getState();
      expect(state.values.nested).toBe(complexValue);
    });
  });

  describe("Integration with Store State", () => {
    it("should work correctly when store state is modified externally", () => {
      // Modify store state externally
      store.setState((state) => {
        state.values.email = "external@test.com";
        state.touched.email = true;
      });

      // setFieldValue should still work
      setFieldValue("name", "John");

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.values.email).toBe("external@test.com");
      expect(state.isDirty).toBe(true);
    });

    it("should preserve other state properties when updating", () => {
      // Set initial state with some properties
      store.setState((state) => {
        state.isSubmitting = true;
        state.submitCount = 5;
        state.errors.email = { message: "Email error" };
      });

      setFieldValue("name", "John");

      const state = store.getState();
      expect(state.values.name).toBe("John");
      expect(state.isSubmitting).toBe(true);
      expect(state.submitCount).toBe(5);
      expect(state.errors.email?.message).toBe("Email error");
    });
  });
});
