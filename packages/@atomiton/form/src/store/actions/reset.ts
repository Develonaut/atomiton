import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createReset<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
): (values?: Partial<T>) => void {
  return (values?: Partial<T>) => {
    const currentState = store.getState();
    const initialValues = currentState.config?.initialValues || {};
    const resetValues = values
      ? { ...initialValues, ...values }
      : initialValues;

    store.setState((state) => {
      state.values = resetValues as T;
      state.errors = {};
      state.touched = Object.keys(resetValues).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as Record<keyof T, boolean>,
      );
      state.isSubmitting = false;
      state.isValidating = false;
      state.isValid = true;
      state.isDirty = false;
      state.submitCount = 0;
    });
  };
}
