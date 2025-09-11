import { store as storeApi } from "@atomiton/store";
import type { FieldValues, FormConfig, FormErrors } from "../types/index.js";
import type { FormStore, FormStoreState } from "./types.js";
import { createFormActions } from "./actions.js";
import { setFormStore, getFormStore } from "./registry.js";

function createInitialState<T extends FieldValues>(
  formId: string,
  config: FormConfig<T>,
): FormStoreState<T> {
  const values = { ...config.defaultValues, ...config.initialValues };
  return {
    formId,
    config: {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
      resetOnSubmitSuccess: false,
      ...config,
    },
    values: values as T,
    errors: {} as FormErrors<T>,
    touched: Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as Record<keyof T, boolean>,
    ),
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
    validators: new Map(),
  };
}

export function createFormStore<T extends FieldValues = FieldValues>(
  formId: string,
  config: FormConfig<T>,
): FormStore<T> {
  const existingStore = getFormStore<T>(formId);
  if (existingStore) {
    return existingStore;
  }

  const initialState = createInitialState(formId, config);

  const store = storeApi.createStore<FormStoreState<T>>({
    initialState,
    name: `FormStore:${formId}`,
  });

  const actions = createFormActions<T>(store);

  const formStore: FormStore<T> = Object.assign(
    Object.create(Object.getPrototypeOf(store)),
    store,
    actions,
    {
      formId,
      getState: store.getState.bind(store),
      setState: store.setState.bind(store),
      subscribe: store.subscribe.bind(store),
    },
  );

  setFormStore(formId, formStore);

  return formStore;
}
