import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, ValidationResult } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetFieldValue<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: {
    validateField: (
      field: keyof T,
      value?: T[keyof T],
    ) => Promise<ValidationResult>;
  },
) {
  return (field: keyof T, value: T[keyof T]) => {
    store.setState((state: FormStoreState<T>) => {
      state.values[field] = value;
      state.isDirty =
        JSON.stringify(state.values) !==
        JSON.stringify(state.config?.initialValues || {});

      if (state.config?.validateOnChange && state.touched[field]) {
        actions
          .validateField(field)
          .then((result) => {
            if (result) {
              store.setState((s: FormStoreState<T>) => {
                if (result.valid) {
                  delete s.errors[field];
                } else {
                  s.errors[field] = {
                    message: result.error || "Validation failed",
                  };
                }
              });
            }
          })
          .catch((error) => {
            console.error(
              `Validation error for field ${String(field)}:`,
              error,
            );
          });
      }
    });
  };
}
