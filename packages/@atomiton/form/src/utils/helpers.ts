import type { FormStoreState, FieldValues, FormError } from "../types/index.js";

export function getFieldError<T extends FieldValues>(
  state: FormStoreState<T>,
  fieldName: keyof T,
): FormError | undefined {
  return state.errors[fieldName];
}

export function isFieldTouched<T extends FieldValues>(
  state: FormStoreState<T>,
  fieldName: keyof T,
): boolean {
  return state.touched[fieldName] || false;
}

export function flattenErrors<T extends FieldValues>(
  errors: Record<keyof T, FormError | undefined>,
): string[] {
  return Object.values(errors)
    .filter(Boolean)
    .map((error) => (error as FormError).message);
}
