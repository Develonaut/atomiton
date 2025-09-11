import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, FormErrors } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetErrors<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
) {
  return (errors: FormErrors<T>) => {
    store.setState((state: FormStoreState<T>) => {
      // Create a clean copy of errors to avoid reference issues
      // Deep clone each error object to prevent mutations
      const cleanErrors: FormErrors<T> = {};
      for (const key in errors) {
        if (errors[key]) {
          cleanErrors[key] = {
            message: errors[key].message,
            ...(errors[key].type && { type: errors[key].type }),
          };
        }
      }
      state.errors = cleanErrors;
    });
  };
}
