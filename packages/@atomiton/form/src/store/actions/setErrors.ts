import type { store as storeApi } from "@atomiton/store";
import type { FieldValues, FormErrors } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetErrors<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
) {
  return (errors: FormErrors<T>) => {
    store.setState((state: FormStoreState<T>) => {
      // Check for circular references and handle them
      const hasCircularRef = (obj: any, seen = new WeakSet()): boolean => {
        if (obj && typeof obj === 'object') {
          if (seen.has(obj)) return true;
          seen.add(obj);
          for (const key in obj) {
            if (hasCircularRef(obj[key], seen)) return true;
          }
        }
        return false;
      };

      // For circular references, create a deep clone without circular refs
      const cleanCircularRefs = (obj: any, seen = new WeakMap()): any => {
        if (obj && typeof obj === 'object') {
          if (seen.has(obj)) return { message: '[Circular Reference]' };
          seen.set(obj, true);
          const cleaned: any = {};
          for (const key in obj) {
            cleaned[key] = cleanCircularRefs(obj[key], seen);
          }
          return cleaned;
        }
        return obj;
      };

      // Handle different cases
      let processedErrors = errors;
      
      // Check if any error has circular references
      for (const key in errors) {
        if (errors[key] && hasCircularRef(errors[key])) {
          // Create a clean copy without circular references
          processedErrors = { ...errors };
          processedErrors[key] = cleanCircularRefs(errors[key]);
        }
      }

      state.errors = processedErrors;
    });
  };
}
