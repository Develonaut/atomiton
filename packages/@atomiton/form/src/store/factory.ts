import { store as storeApi } from "@atomiton/store";
import { createFormActions } from "./actions/index.js";
import { setFormStore, getFormStore } from "./registry.js";
import type { FormConfig, FieldValues, FormStore } from "../types/index.js";
import type { FormStoreState } from "./types.js";

function createInitialState<T extends FieldValues = FieldValues>(
  formId: string,
  config: FormConfig<T>,
): FormStoreState<T> {
  const values = { ...config.defaultValues, ...config.initialValues } as T;

  return {
    formId,
    config: {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
      resetOnSubmitSuccess: false,
      ...config,
    },
    values,
    errors: {},
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
  const store = storeApi.createStore({
    initialState,
    name: `FormStore:${formId}`,
  });

  const actions = createFormActions(store);

  const formStore = Object.assign(
    Object.create(Object.getPrototypeOf(store)),
    store,
    actions,
    {
      formId,
      getState: store.getState.bind(store),
      setState: store.setState.bind(store),
      subscribe: store.subscribe.bind(store),
    },
  ) as FormStore<T>;

  setFormStore(formId, formStore);
  return formStore;
}
