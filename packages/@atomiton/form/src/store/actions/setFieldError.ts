import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, FieldError } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetFieldError<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
): (field: keyof T, error: FieldError | undefined) => void {
  return (field: keyof T, error: FieldError | undefined) => {
    store.setState((state) => {
      if (error) {
        state.errors[field] = error;
      } else {
        delete state.errors[field];
      }
    });
  };
}
