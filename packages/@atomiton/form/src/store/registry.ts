import type { store as storeApi } from "@atomiton/store";
import type { FieldValues } from "../types/index.js";
import type { FormStore, FormStoreActions, FormStoreState } from "./types.js";

const formStores = new Map<string, FormStore<any>>();
let defaultFormId: string | undefined;

export function getFormStore<T extends FieldValues = FieldValues>(
  formId: string,
): FormStore<T> | undefined {
  return formStores.get(formId) as FormStore<T> | undefined;
}

export function setFormStore<T extends FieldValues = FieldValues>(
  formId: string,
  store: FormStore<T>,
): void {
  formStores.set(formId, store);
  defaultFormId = formId;
}

export function deleteFormStore(formId: string): boolean {
  const deleted = formStores.delete(formId);
  if (deleted && defaultFormId === formId) {
    defaultFormId = undefined;
  }
  return deleted;
}

export function getDefaultFormId(): string | undefined {
  return defaultFormId;
}
