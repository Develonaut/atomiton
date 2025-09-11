import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../../types/index.js";
import type { FormStoreState } from "../types.js";

export function createSubmit<T extends FieldValues = FieldValues>(
  store: ReturnType<typeof storeApi.createStore<FormStoreState<T>>>,
  actions: {
    validate: () => Promise<boolean>;
    reset: () => void;
  },
): (onSubmit: (values: T) => void | Promise<void>) => Promise<void> {
  return async (onSubmit: (values: T) => void | Promise<void>) => {
    store.setState((state) => {
      state.isSubmitting = true;
      state.submitCount = state.submitCount + 1;
    });

    const state = store.getState();
    if (state.config?.validateOnSubmit) {
      const isValid = await actions.validate();
      if (!isValid) {
        store.setState((s) => {
          s.isSubmitting = false;
        });
        return;
      }
    }

    try {
      await onSubmit(state.values);
      if (state.config?.resetOnSubmitSuccess) {
        actions.reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      store.setState((s) => {
        s.isSubmitting = false;
      });
    }
  };
}
