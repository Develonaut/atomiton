import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, ValidationResult } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createValidateField<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
): (field: keyof T, value?: T[keyof T]) => Promise<ValidationResult> {
  return async (field: keyof T, value?: T[keyof T]) => {
    const state = store.getState();
    const fieldValue = value ?? state.values[field];
    const validators = state.validators.get(field) || [];

    for (const validator of validators) {
      const result = await validator(fieldValue, state.values);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  };
}
