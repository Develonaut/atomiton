import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";
import { safeStringify, hasCircularReference } from "../../utils/object.js";

export function createSetValues<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: { validate: () => Promise<boolean> },
) {
  return (values: Partial<T>) => {
    // Check for circular references and warn/skip if found
    if (hasCircularReference(values)) {
      console.warn("setValues: Circular reference detected in values, skipping update to prevent errors");
      return;
    }

    store.setState((state: FormStoreState<T>) => {
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
