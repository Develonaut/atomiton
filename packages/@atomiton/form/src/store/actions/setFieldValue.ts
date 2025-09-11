import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, ValidationResult } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { safeStringify } from "../../utils/object.js";

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
      // Handle nested field paths like "personalInfo.name"
      const fieldPath = String(field);
      if (fieldPath.includes('.')) {
        const keys = fieldPath.split('.');
        let current: any = state.values;
        
        // Navigate to the parent object, Immer will handle immutability
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current) || current[keys[i]] === null || current[keys[i]] === undefined) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Set the final value, Immer will detect this change
        current[keys[keys.length - 1]] = value;
      } else {
        state.values[field] = value;
      }
      state.isDirty =
        safeStringify(state.values) !==
        safeStringify(state.config?.initialValues || {});

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
