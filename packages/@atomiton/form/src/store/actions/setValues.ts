import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSetValues<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: { validate: () => Promise<boolean> },
) {
  return (values: Partial<T>) => {
    store.setState((state: FormStoreState<T>) => {
      Object.assign(state.values, values);
      state.isDirty =
        JSON.stringify(state.values) !==
        JSON.stringify(state.config?.initialValues || {});
    });

    const currentState = store.getState();
    if (currentState.config?.validateOnChange) {
      actions.validate();
    }
  };
}
