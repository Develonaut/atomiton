import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, FormErrors } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createReset<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
) {
  return (values?: Partial<T>) => {
    const currentState = store.getState();
    const initialValues = currentState.config?.initialValues || ({} as T);
    const resetValues = values
      ? { ...initialValues, ...values }
      : initialValues;

    store.setState((state: FormStoreState<T>) => {
      state.values = resetValues as T;
      state.errors = {} as FormErrors<T>;
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
