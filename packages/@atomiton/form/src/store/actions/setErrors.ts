import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, FormErrors } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetErrors<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
): (errors: FormErrors<T>) => void {
  return (errors: FormErrors<T>) => {
    store.setState((state) => {
      // Preserve the original error objects and their references
      // This maintains object identity for the tests that expect it
      state.errors = errors;
    });
  };
}
