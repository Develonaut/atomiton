import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, ValidationResult } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createValidate<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: {
    validateField: (
      field: keyof T,
      value?: T[keyof T],
    ) => Promise<ValidationResult>;
  },
): () => Promise<boolean> {
  return async () => {
    store.setState((state) => {
      state.isValidating = true;
    });

    const state = store.getState();
    const errors: any = {};
    let isValid = true;

    for (const field of Object.keys(state.values)) {
      const result = await actions.validateField(field);
      if (result && !result.valid) {
        errors[field] = { message: result.error || "Validation failed" };
        isValid = false;
      }
    }

    store.setState((s) => {
      s.errors = errors;
      s.isValid = isValid;
      s.isValidating = false;
    });

    return isValid;
  };
}
