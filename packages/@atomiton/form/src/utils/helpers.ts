import type { FieldValues, FormState, FieldError } from "../types/index.js";

export function getFieldError<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T,
) {
  return state.errors[fieldName];
}

export function isFieldTouched<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T,
) {
  return state.touched[fieldName] || false;
}

export function flattenErrors(
  errors: Record<string, FieldError | undefined>,
): string[] {
  return Object.values(errors)
    .filter(Boolean)
    .map((error) => error!.message);
}
