import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  FieldValues,
  FormConfig,
  ValidatorFunction,
} from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createValidateField } from "./validateField.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
} & FieldValues;

describe("validateField", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let validateField: ReturnType<typeof createValidateField<TestFormData>>;

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

    validateField = createValidateField(store);
  });

  describe("Happy Path", () => {
    it("should return valid when no validators registered", async () => {
      const result = await validateField("name");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate with current field value", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      store.setState((state) => {
        state.validators.set("name", [validator]);
      });

      await validateField("name");

      expect(validator).toHaveBeenCalledWith("John", initialValues);
    });

    it("should validate with provided value", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      store.setState((state) => {
        state.validators.set("name", [validator]);
      });

      await validateField("name", "CustomValue");

      expect(validator).toHaveBeenCalledWith("CustomValue", initialValues);
    });

    it("should return first validation error", async () => {
      const validator1: ValidatorFunction = vi.fn().mockResolvedValue({
        valid: false,
        error: "First error",
      });
      const validator2: ValidatorFunction = vi.fn().mockResolvedValue({
        valid: false,
        error: "Second error",
      });

      store.setState((state) => {
        state.validators.set("name", [validator1, validator2]);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("First error");
      expect(validator2).not.toHaveBeenCalled();
    });

    it("should continue validation until first failure", async () => {
      const validator1: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      const validator2: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      const validator3: ValidatorFunction = vi.fn().mockResolvedValue({
        valid: false,
        error: "Third error",
      });
      const validator4: ValidatorFunction = vi.fn().mockResolvedValue({
        valid: false,
        error: "Fourth error",
      });

      store.setState((state) => {
        state.validators.set("name", [
          validator1,
          validator2,
          validator3,
          validator4,
        ]);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Third error");
      expect(validator1).toHaveBeenCalled();
      expect(validator2).toHaveBeenCalled();
      expect(validator3).toHaveBeenCalled();
      expect(validator4).not.toHaveBeenCalled();
    });
  });

  describe("Async Validation", () => {
    it("should handle async validators", async () => {
      const asyncValidator: ValidatorFunction = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ valid: true }), 10),
            ),
        );

      store.setState((state) => {
        state.validators.set("name", [asyncValidator]);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(true);
      expect(asyncValidator).toHaveBeenCalled();
    });

    it("should handle mixed sync and async validators", async () => {
      const syncValidator: ValidatorFunction = vi
        .fn()
        .mockReturnValue({ valid: true });
      const asyncValidator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      store.setState((state) => {
        state.validators.set("name", [syncValidator, asyncValidator]);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(true);
      expect(syncValidator).toHaveBeenCalled();
      expect(asyncValidator).toHaveBeenCalled();
    });

    it("should handle slow validators", async () => {
      const slowValidator: ValidatorFunction = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve({ valid: false, error: "Slow error" }),
                100,
              ),
            ),
        );

      store.setState((state) => {
        state.validators.set("name", [slowValidator]);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Slow error");
    });
  });

  describe("Error Handling", () => {
    it("should handle validator throwing error", async () => {
      const throwingValidator: ValidatorFunction = vi
        .fn()
        .mockRejectedValue(new Error("Validator error"));

      store.setState((state) => {
        state.validators.set("name", [throwingValidator]);
      });

      await expect(validateField("name")).rejects.toThrow("Validator error");
    });

    it("should handle validator returning malformed result", async () => {
      const malformedValidator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue(null);

      store.setState((state) => {
        state.validators.set("name", [malformedValidator]);
      });

      // Should not crash, but behavior may vary
      await expect(validateField("name")).resolves.toBeDefined();
    });

    it("should handle undefined validator results", async () => {
      const undefinedValidator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue(undefined);

      store.setState((state) => {
        state.validators.set("name", [undefinedValidator]);
      });

      await expect(validateField("name")).resolves.toBeDefined();
    });
  });

  describe("Performance and Stress Testing", () => {
    it("should handle many validators efficiently", async () => {
      const validators = Array.from({ length: 100 }, (_, i) =>
        vi.fn().mockResolvedValue({ valid: true }),
      );

      store.setState((state) => {
        state.validators.set("name", validators);
      });

      const startTime = Date.now();
      const result = await validateField("name");
      const endTime = Date.now();

      expect(result.valid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100);
      validators.forEach((validator) => {
        expect(validator).toHaveBeenCalled();
      });
    });

    it("should handle concurrent validations", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      store.setState((state) => {
        state.validators.set("name", [validator]);
      });

      const promises = Array.from({ length: 10 }, () => validateField("name"));
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.valid).toBe(true);
      });
    });

    it("should fail fast on first error with many validators", async () => {
      const validators = [
        vi.fn().mockResolvedValue({ valid: true }),
        vi.fn().mockResolvedValue({ valid: true }),
        vi.fn().mockResolvedValue({ valid: false, error: "Fast fail" }),
        ...Array.from({ length: 97 }, () =>
          vi.fn().mockResolvedValue({ valid: true }),
        ),
      ];

      store.setState((state) => {
        state.validators.set("name", validators);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Fast fail");
      expect(validators[0]).toHaveBeenCalled();
      expect(validators[1]).toHaveBeenCalled();
      expect(validators[2]).toHaveBeenCalled();
      expect(validators[3]).not.toHaveBeenCalled();
    });
  });

  describe("State Integration", () => {
    it("should use current form values in validation", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      store.setState((state) => {
        state.values.name = "Updated Name";
        state.values.email = "updated@test.com";
        state.validators.set("name", [validator]);
      });

      await validateField("name");

      expect(validator).toHaveBeenCalledWith("Updated Name", {
        name: "Updated Name",
        email: "updated@test.com",
        age: 25,
      });
    });

    it("should work with different field types", async () => {
      const nameValidator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      const ageValidator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      store.setState((state) => {
        state.validators.set("name", [nameValidator]);
        state.validators.set("age", [ageValidator]);
      });

      await validateField("name");
      await validateField("age");

      expect(nameValidator).toHaveBeenCalledWith("John", initialValues);
      expect(ageValidator).toHaveBeenCalledWith(25, initialValues);
    });

    it("should handle field not in values", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      store.setState((state) => {
        state.validators.set("nonExistent" as any, [validator]);
      });

      await validateField("nonExistent" as any);

      expect(validator).toHaveBeenCalledWith(undefined, initialValues);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty validator array", async () => {
      store.setState((state) => {
        state.validators.set("name", []);
      });

      const result = await validateField("name");

      expect(result.valid).toBe(true);
    });

    it("should handle undefined/null field values", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      store.setState((state) => {
        state.values.name = undefined as any;
        state.validators.set("name", [validator]);
      });

      await validateField("name");

      expect(validator).toHaveBeenCalledWith(undefined, expect.any(Object));
    });

    it("should handle validation with override value as null", async () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      store.setState((state) => {
        state.validators.set("name", [validator]);
      });

      await validateField("name", null as any);

      expect(validator).toHaveBeenCalledWith(null, initialValues);
    });

    it("should handle complex validation logic", async () => {
      const complexValidator: ValidatorFunction = vi
        .fn()
        .mockImplementation((value, allValues) => {
          if (!value) return { valid: false, error: "Required" };
          if (value.length < 2) return { valid: false, error: "Too short" };
          if (allValues?.email && !allValues.email.includes("@")) {
            return { valid: false, error: "Invalid email affects name" };
          }
          return { valid: true };
        });

      store.setState((state) => {
        state.validators.set("name", [complexValidator]);
      });

      // Test various scenarios
      let result = await validateField("name", "");
      expect(result.error).toBe("Required");

      result = await validateField("name", "A");
      expect(result.error).toBe("Too short");

      store.setState((state) => {
        state.values.email = "invalid-email";
      });
      result = await validateField("name", "ValidName");
      expect(result.error).toBe("Invalid email affects name");

      store.setState((state) => {
        state.values.email = "valid@email.com";
      });
      result = await validateField("name", "ValidName");
      expect(result.valid).toBe(true);
    });
  });
});
