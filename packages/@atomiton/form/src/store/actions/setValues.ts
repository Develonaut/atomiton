import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

// Safe JSON stringifier that handles circular references
function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    // Handle circular references by using a Set to track visited objects
    const seen = new Set();
    return JSON.stringify(obj, (key, val) => {
      if (val != null && typeof val === "object") {
        if (seen.has(val)) {
          return "[Circular]";
        }
        seen.add(val);
      }
      return val;
    });
  }
}

export function createSetValues<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: {
    validate: () => Promise<boolean>;
  },
): (values: Partial<T>) => void {
  return (values: Partial<T>) => {
    store.setState((state) => {
      Object.assign(state.values, values);
      state.isDirty =
        safeStringify(state.values) !==
        safeStringify(state.config?.initialValues || {});
    });

    const currentState = store.getState();
    if (currentState.config?.validateOnChange) {
      actions.validate();
    }
  };
}
