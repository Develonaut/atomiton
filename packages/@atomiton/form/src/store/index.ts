import { createFormStore } from "./factory.js";
import { getFormStore, deleteFormStore, getDefaultFormId } from "./registry.js";
import type { FormConfig, FieldValues } from "../types/index.js";

export { createFormStore, getFormStore, deleteFormStore, getDefaultFormId };

export function useFormStore<T extends FieldValues = FieldValues>(
  formId?: string,
  config?: FormConfig<T>,
) {
  let formStore = getFormStore<T>(formId);

  if (!formStore && config) {
    formStore = createFormStore(formId, config);
  }

  if (!formStore) {
    throw new Error(`Form store "${formId}" not found and no config provided`);
  }

  return formStore;
}
