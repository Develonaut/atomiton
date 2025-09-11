import type { FieldValues, FormConfig } from "../types/index.js";
import type { FormStore } from "./types.js";
import { createFormStore } from "./factory.js";
import { getFormStore, deleteFormStore, getDefaultFormId } from "./registry.js";

export type { FormStore, FormStoreState, FormStoreActions } from "./types.js";

export { createFormStore, getFormStore, deleteFormStore, getDefaultFormId };

export function useFormStore<T extends FieldValues = FieldValues>(
  formId: string,
  config?: FormConfig<T>,
): FormStore<T> {
  let formStore = getFormStore<T>(formId);

  if (!formStore && config) {
    formStore = createFormStore<T>(formId, config);
  }

  if (!formStore) {
    throw new Error(`Form store "${formId}" not found and no config provided`);
  }

  return formStore;
}
