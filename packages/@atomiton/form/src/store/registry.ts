import type { FormStore, FieldValues } from "../types/index.js";

const formStores = new Map<string, FormStore<any>>();
let defaultFormId: string | undefined;

export function getFormStore<T extends FieldValues = FieldValues>(
  formId?: string,
): FormStore<T> | undefined {
  const id = formId || defaultFormId;
  return id ? formStores.get(id) : undefined;
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
