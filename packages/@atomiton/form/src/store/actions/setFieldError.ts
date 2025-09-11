import type { store as storeApi } from "@atomiton/store";
import type { FieldError, FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetFieldError<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
) {
  return (field: keyof T, error: FieldError | undefined) => {
    store.setState((state: FormStoreState<T>) => {
      if (error) {
        state.errors[field] = error;
      } else {
        delete state.errors[field];
      }
    });
  };
}
