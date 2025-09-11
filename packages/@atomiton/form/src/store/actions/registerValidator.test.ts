import { store as storeApi } from "@atomiton/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  FieldValues,
  FormConfig,
  ValidatorFunction,
} from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { createRegisterValidator } from "./registerValidator.js";

type TestFormData = {
  name: string;
  email: string;
  age: number;
} & FieldValues;

describe("registerValidator", () => {
  let store: ReturnType<
    typeof storeApi.createStore<FormStoreState<TestFormData>>
  >;
  let registerValidator: ReturnType<
    typeof createRegisterValidator<TestFormData>
  >;

  const initialValues: TestFormData = {
    name: "",
    email: "",
    age: 0,
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

    registerValidator = createRegisterValidator(store);
  });

  describe("Happy Path", () => {
    it("should register single validator for field", () => {
      const validator: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      registerValidator("name", validator);

      const state = store.getState();
      const validators = state.validators.get("name");
      expect(validators).toHaveLength(1);
      expect(validators![0]).toBe(validator);
    });

    it("should register multiple validators for same field", () => {
      const validator1: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });
      const validator2: ValidatorFunction = vi
        .fn()
        .mockResolvedValue({ valid: true });

      registerValidator("name", validator1);
      registerValidator("name", validator2);

      const state = store.getState();
      const validators = state.validators.get("name");
      expect(validators).toHaveLength(2);
      expect(validators![0]).toBe(validator1);
      expect(validators![1]).toBe(validator2);
    });

    it("should register validators for different fields", () => {
      const nameValidator: ValidatorFunction = vi.fn();
      const emailValidator: ValidatorFunction = vi.fn();

      registerValidator("name", nameValidator);
      registerValidator("email", emailValidator);

      const state = store.getState();
      expect(state.validators.get("name")).toContain(nameValidator);
      expect(state.validators.get("email")).toContain(emailValidator);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid validator registration", () => {
      const validators = Array.from({ length: 100 }, () => vi.fn());

      validators.forEach((validator) => {
        registerValidator("name", validator);
      });

      const state = store.getState();
      expect(state.validators.get("name")).toHaveLength(100);
    });

    it("should handle same validator registered multiple times", () => {
      const validator: ValidatorFunction = vi.fn();

      registerValidator("name", validator);
      registerValidator("name", validator);
      registerValidator("name", validator);

      const state = store.getState();
      expect(state.validators.get("name")).toHaveLength(3);
    });

    it("should handle validators with different signatures", () => {
      const syncValidator: ValidatorFunction = (value) => ({ valid: !!value });
      const asyncValidator: ValidatorFunction = async (value) => ({
        valid: !!value,
      });

      registerValidator("name", syncValidator);
      registerValidator("name", asyncValidator);

      const state = store.getState();
      expect(state.validators.get("name")).toHaveLength(2);
    });
  });

  describe("State Consistency", () => {
    it("should preserve other state properties", () => {
      store.setState((state) => {
        state.values.name = "test";
        state.isDirty = true;
      });

      const validator: ValidatorFunction = vi.fn();
      registerValidator("name", validator);

      const state = store.getState();
      expect(state.values.name).toBe("test");
      expect(state.isDirty).toBe(true);
    });

    it("should maintain validator map integrity", () => {
      const validator1: ValidatorFunction = vi.fn();
      const validator2: ValidatorFunction = vi.fn();

      registerValidator("name", validator1);
      registerValidator("email", validator2);

      const state = store.getState();
      expect(state.validators.size).toBe(2);
      expect(state.validators.has("name")).toBe(true);
      expect(state.validators.has("email")).toBe(true);
    });
  });
});
