import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createFormStore,
  deleteFormStore,
  getFormStore,
  type FormStore,
} from "./index.js";
import type { FormConfig, FieldValues } from "../types/index.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
} & FieldValues;

describe("Form Store", () => {
  let store: FormStore<TestFormData>;
  const formId = "test-form";
  const initialValues: TestFormData = {
    name: "",
    email: "",
    age: 0,
    isActive: false,
  };

  const config: FormConfig<TestFormData> = {
    initialValues,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
  };

  beforeEach(() => {
    deleteFormStore(formId);
    store = createFormStore(formId, config);
  });

  describe("Store Creation", () => {
    it("should create store with initial state", () => {
      const state = store.getState();
      expect(state.values).toEqual(initialValues);
      expect(state.errors).toEqual({});
      expect(state.touched).toEqual({
        name: false,
        email: false,
        age: false,
        isActive: false,
      });
      expect(state.isSubmitting).toBe(false);
      expect(state.isValidating).toBe(false);
      expect(state.isValid).toBe(true);
      expect(state.isDirty).toBe(false);
      expect(state.submitCount).toBe(0);
    });

    it("should return existing store for same formId", () => {
      const store2 = createFormStore(formId, config);
      expect(store2.getState).toBeDefined();
      expect(store2.getState().values).toEqual(store.getState().values);
    });

    it("should create store with merged default and initial values", () => {
      const configWithDefaults: FormConfig<TestFormData> = {
        initialValues: { name: "John", email: "", age: 0, isActive: false },
        defaultValues: { email: "default@test.com", age: 25 },
      };

      const storeWithDefaults = createFormStore(
        "test-defaults",
        configWithDefaults,
      );
      const state = storeWithDefaults.getState();

      expect(state.values).toEqual({
        name: "John",
        email: "",
        age: 0,
        isActive: false,
      });

      deleteFormStore("test-defaults");
    });
  });

  describe("Field Value Operations", () => {
    it("should set field value and mark form as dirty", () => {
      store.setFieldValue("name", "John Doe");

      const state = store.getState();
      expect(state.values.name).toBe("John Doe");
      expect(state.isDirty).toBe(true);
    });

    it("should set multiple values at once", () => {
      store.setValues({
        name: "Jane",
        email: "jane@test.com",
      });

      const state = store.getState();
      expect(state.values.name).toBe("Jane");
      expect(state.values.email).toBe("jane@test.com");
      expect(state.isDirty).toBe(true);
    });

    it("should handle rapid field updates without race conditions", () => {
      const updates = Array.from({ length: 100 }, (_, i) => `Update ${i}`);

      updates.forEach((value) => {
        store.setFieldValue("name", value);
      });

      const state = store.getState();
      expect(state.values.name).toBe("Update 99");
    });

    it("should handle setting field to same value", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      store.setFieldValue("name", "test");
      store.setFieldValue("name", "test");

      // Should be called at least once for the first update
      expect(subscriber).toHaveBeenCalled();
      expect(store.getState().values.name).toBe("test");
      unsubscribe();
    });
  });

  describe("Field Error Operations", () => {
    it("should set and clear field errors", () => {
      store.setFieldError("email", { message: "Invalid email" });

      let state = store.getState();
      expect(state.errors.email?.message).toBe("Invalid email");

      store.setFieldError("email", undefined);
      state = store.getState();
      expect(state.errors.email).toBeUndefined();
    });

    it("should set multiple errors", () => {
      store.setErrors({
        name: { message: "Name required" },
        email: { message: "Email required" },
      });

      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name required");
      expect(state.errors.email?.message).toBe("Email required");
    });
  });

  describe("Touch State Operations", () => {
    it("should mark field as touched", () => {
      store.setFieldTouched("name", true);

      const state = store.getState();
      expect(state.touched.name).toBe(true);
    });

    it("should handle untouching field", () => {
      store.setFieldTouched("name", true);
      store.setFieldTouched("name", false);

      const state = store.getState();
      expect(state.touched.name).toBe(false);
    });
  });

  describe("Form Reset", () => {
    beforeEach(() => {
      store.setFieldValue("name", "John");
      store.setFieldError("email", { message: "Error" });
      store.setFieldTouched("name", true);
    });

    it("should reset to initial values", () => {
      store.reset();

      const state = store.getState();
      expect(state.values).toEqual(initialValues);
      expect(state.errors).toEqual({});
      expect(state.touched).toEqual({
        name: false,
        email: false,
        age: false,
        isActive: false,
      });
      expect(state.isDirty).toBe(false);
      expect(state.submitCount).toBe(0);
    });

    it("should reset to provided values", () => {
      const resetValues = { name: "Reset Name", email: "reset@test.com" };
      store.reset(resetValues);

      const state = store.getState();
      expect(state.values.name).toBe("Reset Name");
      expect(state.values.email).toBe("reset@test.com");
      expect(state.values.age).toBe(0);
    });
  });

  describe("Validation", () => {
    it("should register and run validators", async () => {
      const validator = vi.fn().mockResolvedValue({ valid: true });
      store.registerValidator("name", validator);

      const result = await store.validateField("name");

      expect(validator).toHaveBeenCalledWith("", store.getState().values);
      expect(result.valid).toBe(true);
    });

    it("should return first validation error", async () => {
      const validator1 = vi
        .fn()
        .mockResolvedValue({ valid: false, error: "Error 1" });
      const validator2 = vi
        .fn()
        .mockResolvedValue({ valid: false, error: "Error 2" });

      store.registerValidator("name", validator1);
      store.registerValidator("name", validator2);

      const result = await store.validateField("name");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Error 1");
      expect(validator2).not.toHaveBeenCalled();
    });

    it("should validate all fields", async () => {
      const nameValidator = vi
        .fn()
        .mockResolvedValue({ valid: false, error: "Name error" });
      const emailValidator = vi.fn().mockResolvedValue({ valid: true });

      store.registerValidator("name", nameValidator);
      store.registerValidator("email", emailValidator);

      const isValid = await store.validate();

      expect(isValid).toBe(false);
      const state = store.getState();
      expect(state.errors.name?.message).toBe("Name error");
      expect(state.errors.email).toBeUndefined();
    });

    it("should handle async validation correctly", async () => {
      const slowValidator = vi
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

      store.registerValidator("name", slowValidator);

      const resultPromise = store.validateField("name");
      expect(store.getState().isValidating).toBe(false);

      const result = await resultPromise;
      expect(result.error).toBe("Slow error");
    });
  });

  describe("Form Submission", () => {
    it("should handle successful submission", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      await store.submit(onSubmit);

      expect(onSubmit).toHaveBeenCalledWith(store.getState().values);
      const state = store.getState();
      expect(state.submitCount).toBe(1);
      expect(state.isSubmitting).toBe(false);
    });

    it("should validate before submission when enabled", async () => {
      const validator = vi
        .fn()
        .mockResolvedValue({ valid: false, error: "Validation error" });
      const onSubmit = vi.fn();

      store.registerValidator("name", validator);

      await store.submit(onSubmit);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(store.getState().submitCount).toBe(1);
    });

    it("should skip validation when disabled", async () => {
      const configNoValidation = { ...config, validateOnSubmit: false };
      const storeNoValidation = createFormStore(
        "no-validation",
        configNoValidation,
      );

      const validator = vi
        .fn()
        .mockResolvedValue({ valid: false, error: "Error" });
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      storeNoValidation.registerValidator("name", validator);

      await storeNoValidation.submit(onSubmit);

      expect(onSubmit).toHaveBeenCalled();
      deleteFormStore("no-validation");
    });

    it("should handle submission errors gracefully", async () => {
      const onSubmit = vi
        .fn()
        .mockRejectedValue(new Error("Submission failed"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await store.submit(onSubmit);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Form submission error:",
        expect.any(Error),
      );
      expect(store.getState().isSubmitting).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should reset form after successful submission when enabled", async () => {
      const configWithReset = { ...config, resetOnSubmitSuccess: true };
      const storeWithReset = createFormStore("with-reset", configWithReset);

      storeWithReset.setFieldValue("name", "John");
      storeWithReset.setFieldTouched("name", true);

      const onSubmit = vi.fn().mockResolvedValue(undefined);
      await storeWithReset.submit(onSubmit);

      const state = storeWithReset.getState();
      expect(state.values.name).toBe("");
      expect(state.touched.name).toBe(false);

      deleteFormStore("with-reset");
    });

    it("should handle rapid submission attempts", async () => {
      const onSubmit = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

      const promise1 = store.submit(onSubmit);
      const promise2 = store.submit(onSubmit);

      await Promise.all([promise1, promise2]);

      expect(store.getState().submitCount).toBe(2);
    });
  });

  describe("Store Management", () => {
    it("should retrieve existing store", () => {
      const retrieved = getFormStore<TestFormData>(formId);
      expect(retrieved).toBeDefined();
    });

    it("should return undefined for non-existent store", () => {
      const retrieved = getFormStore("non-existent");
      expect(retrieved).toBeUndefined();
    });

    it("should delete store", () => {
      const deleted = deleteFormStore(formId);
      expect(deleted).toBe(true);

      const retrieved = getFormStore(formId);
      expect(retrieved).toBeUndefined();
    });

    it("should return false when deleting non-existent store", () => {
      const deleted = deleteFormStore("non-existent");
      expect(deleted).toBe(false);
    });
  });

  describe("Subscription and State Changes", () => {
    it("should notify subscribers of state changes", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      store.setFieldValue("name", "test");

      expect(subscriber).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("should handle multiple subscribers", () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = store.subscribe(subscriber1);
      const unsubscribe2 = store.subscribe(subscriber2);

      store.setFieldValue("name", "test");

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
    });

    it("should not notify unsubscribed listeners", () => {
      const subscriber = vi.fn();
      const unsubscribe = store.subscribe(subscriber);

      unsubscribe();
      store.setFieldValue("name", "test");

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined/null values gracefully", () => {
      store.setFieldValue("name", undefined as unknown as string);
      store.setFieldValue("email", null as unknown as string);

      const state = store.getState();
      expect(state.values.name).toBeUndefined();
      expect(state.values.email).toBeNull();
    });

    it("should handle very large strings", () => {
      const largeString = "x".repeat(10000);
      store.setFieldValue("name", largeString);

      const state = store.getState();
      expect(state.values.name).toBe(largeString);
    });

    it("should handle special characters in field values", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      store.setFieldValue("name", specialChars);

      const state = store.getState();
      expect(state.values.name).toBe(specialChars);
    });

    it("should handle simultaneous operations without corruption", () => {
      const operations = Array.from({ length: 1000 }, (_, i) => () => {
        store.setFieldValue("name", `value-${i}`);
        store.setFieldTouched("name", i % 2 === 0);
        if (i % 10 === 0) {
          store.setFieldError("name", { message: `error-${i}` });
        }
      });

      operations.forEach((op) => op());

      const state = store.getState();
      expect(typeof state.values.name).toBe("string");
      expect(typeof state.touched.name).toBe("boolean");
    });
  });
});
