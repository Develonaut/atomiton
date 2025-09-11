import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, ValidationResult } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetFieldTouched<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: {
    validateField: (
      field: keyof T,
      value?: T[keyof T],
    ) => Promise<ValidationResult>;
  },
) {
  return (field: keyof T, touched: boolean) => {
    store.setState((state: FormStoreState<T>) => {
      state.touched[field] = touched;
    });

    const currentState = store.getState();
    if (touched && currentState.config?.validateOnBlur) {
      actions
        .validateField(field)
        .then((result) => {
          if (result && !result.valid) {
            store.setState((state: FormStoreState<T>) => {
              state.errors[field] = {
                message: result.error || "Validation failed",
              };
            });
          } else if (result && result.valid) {
            store.setState((state: FormStoreState<T>) => {
              delete state.errors[field];
            });
          }
        })
        .catch((error) => {
          console.error(`Validation error for field ${String(field)}:`, error);
        });
    }
  };
}
