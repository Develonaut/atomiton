import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FieldValues, FormConfig } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createValidate } from "./validate.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
} & FieldValues;

describe("validate", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let validate: ReturnType<typeof createValidate<TestFormData>>;
  let mockValidateField: ReturnType<typeof vi.fn>;

  const initialValues: TestFormData = {
    name: "John",
    email: "john@example.com",
    age: 25,
  };

  beforeEach(() => {
    store = storeApi.createStore<FormStoreState<TestFormData>>({
      initialState: {
        formId: "test-form",
        config: { initialValues } as FormConfig<TestFormData>,
        values: { ...initialValues },
        errors: {},
        touched: { name: false, email: false, age: false },
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        isDirty: false,
        submitCount: 0,
        validators: new Map(),
      },
      name: "test-store",
    });

    mockValidateField = vi.fn();
    validate = createValidate(store, { validateField: mockValidateField });
  });

  describe("Happy Path", () => {
    it("should set isValidating to true during validation", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      const validationPromise = validate();

      // Check immediately
      expect(store.getState().isValidating).toBe(true);

      await validationPromise;

      expect(store.getState().isValidating).toBe(false);
    });

    it("should return true when all fields are valid", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      const result = await validate();

      expect(result).toBe(true);
      expect(store.getState().isValid).toBe(true);
      expect(store.getState().errors).toEqual({});
    });

    it("should return false when any field is invalid", async () => {
      mockValidateField
        .mockResolvedValueOnce({ valid: true })
        .mockResolvedValueOnce({ valid: false, error: "Email error" })
        .mockResolvedValueOnce({ valid: true });

      const result = await validate();

      expect(result).toBe(false);
      expect(store.getState().isValid).toBe(false);
      expect(store.getState().errors.email?.message).toBe("Email error");
    });

    it("should validate all fields in form values", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      await validate();

      expect(mockValidateField).toHaveBeenCalledWith("name");
      expect(mockValidateField).toHaveBeenCalledWith("email");
      expect(mockValidateField).toHaveBeenCalledWith("age");
      expect(mockValidateField).toHaveBeenCalledTimes(3);
    });

    it("should set errors for all invalid fields", async () => {
      mockValidateField
        .mockResolvedValueOnce({ valid: false, error: "Name required" })
        .mockResolvedValueOnce({ valid: false, error: "Invalid email" })
        .mockResolvedValueOnce({ valid: true });

      await validate();

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name required");
      expect(state.errors.email?.message).toBe("Invalid email");
      expect(state.errors.age).toBeUndefined();
    });

    it("should use default error message when no error provided", async () => {
      mockValidateField.mockResolvedValue({ valid: false });

      await validate();

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Validation failed");
    });
  });

  describe("Performance and Concurrency", () => {
    it("should handle rapid validation calls", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      const promises = Array.from({ length: 10 }, () => validate());
      const results = await Promise.all(promises);

      results.forEach((result) => expect(result).toBe(true));
    });

    it("should handle large numbers of fields efficiently", async () => {
      // Add many fields to values
      const manyValues = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [`field${i}`, `value${i}`]),
      );

      store.setState((state) => {
        Object.assign(state.values, manyValues);
      });

      mockValidateField.mockResolvedValue({ valid: true });

      const startTime = Date.now();
      const result = await validate();
      const endTime = Date.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
      expect(mockValidateField).toHaveBeenCalledTimes(103); // 3 original + 100 new
    });

    it("should handle mixed validation speeds", async () => {
      mockValidateField
        .mockImplementationOnce(() => Promise.resolve({ valid: true }))
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ valid: true }), 50),
            ),
        )
        .mockImplementationOnce(() => Promise.resolve({ valid: true }));

      const result = await validate();

      expect(result).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle validateField throwing errors", async () => {
      mockValidateField
        .mockResolvedValueOnce({ valid: true })
        .mockRejectedValueOnce(new Error("Validation error"))
        .mockResolvedValueOnce({ valid: true });

      await expect(validate()).rejects.toThrow("Validation error");
    });

    it("should handle malformed validation results", async () => {
      mockValidateField
        .mockResolvedValueOnce({ valid: true })
        .mockResolvedValueOnce(null as any)
        .mockResolvedValueOnce({ valid: true });

      // Should handle gracefully
      const result = await validate();
      expect(typeof result).toBe("boolean");
    });

    it("should reset isValidating on error", async () => {
      mockValidateField.mockRejectedValue(new Error("Test error"));

      try {
        await validate();
      } catch {
        // Ignore error
      }

      expect(store.getState().isValidating).toBe(false);
    });
  });

  describe("State Management", () => {
    it("should preserve other state properties during validation", async () => {
      store.setState((state) => {
        state.values.name = "Test";
        state.touched.name = true;
        state.isDirty = true;
        state.submitCount = 3;
      });

      mockValidateField.mockResolvedValue({ valid: true });

      await validate();

      const state = store.getState();
      expect(state.values.name).toBe("Test");
      expect(state.touched.name).toBe(true);
      expect(state.isDirty).toBe(true);
      expect(state.submitCount).toBe(3);
    });

    it("should update errors object completely", async () => {
      // Set initial errors
      store.setState((state) => {
        state.errors = {
          name: { message: "Old name error" },
          email: { message: "Old email error" },
          age: { message: "Old age error" },
        };
      });

      mockValidateField
        .mockResolvedValueOnce({ valid: false, error: "New name error" })
        .mockResolvedValueOnce({ valid: true })
        .mockResolvedValueOnce({ valid: false, error: "New age error" });

      await validate();

      const state = store.getState();
      expect(state.errors.name?.message).toBe("New name error");
      expect(state.errors.email).toBeUndefined();
      expect(state.errors.age?.message).toBe("New age error");
    });

    it("should set isValid correctly based on validation results", async () => {
      // Test valid case
      mockValidateField.mockResolvedValue({ valid: true });

      let result = await validate();
      expect(result).toBe(true);
      expect(store.getState().isValid).toBe(true);

      // Test invalid case
      mockValidateField.mockResolvedValue({ valid: false, error: "Error" });

      result = await validate();
      expect(result).toBe(false);
      expect(store.getState().isValid).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty values object", async () => {
      store.setState((state) => {
        state.values = {} as TestFormData;
      });

      const result = await validate();

      expect(result).toBe(true);
      expect(mockValidateField).not.toHaveBeenCalled();
    });

    it("should handle values with undefined/null fields", async () => {
      store.setState((state) => {
        state.values.name = undefined as any;
        state.values.email = null as any;
      });

      mockValidateField.mockResolvedValue({ valid: true });

      const result = await validate();

      expect(result).toBe(true);
      expect(mockValidateField).toHaveBeenCalledWith("name");
      expect(mockValidateField).toHaveBeenCalledWith("email");
      expect(mockValidateField).toHaveBeenCalledWith("age");
    });

    it("should handle dynamic field additions", async () => {
      store.setState((state) => {
        (state.values as any).dynamicField = "dynamic value";
      });

      mockValidateField.mockResolvedValue({ valid: true });

      await validate();

      expect(mockValidateField).toHaveBeenCalledWith("dynamicField");
    });

    it("should handle validation during state changes", async () => {
      mockValidateField.mockImplementation(async (field) => {
        // Simulate state change during validation
        if (field === "name") {
          store.setState((state) => {
            state.values.email = "changed@test.com";
          });
        }
        return { valid: true };
      });

      const result = await validate();

      expect(result).toBe(true);
    });
  });

  describe("Integration with validateField", () => {
    it("should call validateField for each field with correct parameters", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      await validate();

      expect(mockValidateField).toHaveBeenCalledWith("name");
      expect(mockValidateField).toHaveBeenCalledWith("email");
      expect(mockValidateField).toHaveBeenCalledWith("age");
    });

    it("should continue validation even if some fields fail", async () => {
      mockValidateField
        .mockResolvedValueOnce({ valid: false, error: "Name error" })
        .mockResolvedValueOnce({ valid: false, error: "Email error" })
        .mockResolvedValueOnce({ valid: true });

      const result = await validate();

      expect(result).toBe(false);
      expect(mockValidateField).toHaveBeenCalledTimes(3);

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name error");
      expect(state.errors.email?.message).toBe("Email error");
      expect(state.errors.age).toBeUndefined();
    });

    it("should handle async validation properly", async () => {
      const validationOrder: string[] = [];

      mockValidateField.mockImplementation(async (field) => {
        const delay = field === "email" ? 50 : 10;
        await new Promise((resolve) => setTimeout(resolve, delay));
        validationOrder.push(field as string);
        return { valid: true };
      });

      await validate();

      expect(validationOrder).toHaveLength(3);
      expect(validationOrder).toContain("name");
      expect(validationOrder).toContain("email");
      expect(validationOrder).toContain("age");
    });
  });

  describe("Stress Testing", () => {
    it("should handle validation with thousands of rapid calls", async () => {
      mockValidateField.mockResolvedValue({ valid: true });

      const promises: Promise<boolean>[] = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(validate());
      }

      const results = await Promise.all(promises);

      results.forEach((result) => expect(result).toBe(true));
      expect(store.getState().isValidating).toBe(false);
    });

    it("should maintain consistency with concurrent validations", async () => {
      let callCount = 0;
      mockValidateField.mockImplementation(async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
        return { valid: callCount % 5 !== 0 };
      });

      const promises = Array.from({ length: 50 }, () => validate());
      const results = await Promise.all(promises);

      // All results should be consistent with final state
      const finalState = store.getState();
      results.forEach((result) => {
        expect(result).toBe(finalState.isValid);
      });
    });
  });
});
