import type { FieldValues, FieldError, FormState } from "../types/index.js";

export function getFieldError<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T
): string | undefined {
  const error = state.errors[fieldName];
  return error?.message;
}

export function isFieldTouched<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T
): boolean {
  return Boolean(state.touched[fieldName]);
}

export function isFieldDirty<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T
): boolean {
  const initialValue = state.config?.initialValues?.[fieldName];
  const currentValue = state.values[fieldName];
  return initialValue !== currentValue;
}

export function isFormDirty<T extends FieldValues>(state: FormState<T>): boolean {
  return state.isDirty;
}

export function isFormValid<T extends FieldValues>(state: FormState<T>): boolean {
  return state.isValid;
}

export function hasFormErrors<T extends FieldValues>(state: FormState<T>): boolean {
  return Object.keys(state.errors).some(key => state.errors[key]?.message);
}

export function getFormErrors<T extends FieldValues>(
  state: FormState<T>
): Record<keyof T, string | undefined> {
  const errors: Record<keyof T, string | undefined> = {} as Record<keyof T, string | undefined>;
  
  for (const key in state.errors) {
    const error = state.errors[key];
    if (error?.message) {
      errors[key as keyof T] = error.message;
    }
  }
  
  return errors;
}

export function flattenErrors(
  errors: Record<string, FieldError | undefined>
): string[] {
  return Object.values(errors)
    .filter((error): error is FieldError => Boolean(error?.message))
    .map(error => error.message);
}

export function createFormId(prefix = "form"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFieldName(name: string): string {
  return name
    .split(/[._-]|(?=[A-Z])/)
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getFieldDisplayName(
  name: string,
  displayNames?: Record<string, string>
): string {
  if (displayNames?.[name]) {
    return displayNames[name];
  }
  
  return formatFieldName(name);
}

export function shouldShowError<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T,
  options?: {
    showOnTouch?: boolean;
    showOnSubmit?: boolean;
    immediate?: boolean;
  }
): boolean {
  const hasError = Boolean(state.errors[fieldName]);
  
  if (!hasError) {
    return false;
  }
  
  const { 
    showOnTouch = true, 
    showOnSubmit = true, 
    immediate = false 
  } = options || {};
  
  if (immediate) {
    return true;
  }
  
  const isTouched = isFieldTouched(state, fieldName);
  const isSubmitted = state.isSubmitted;
  
  return (showOnTouch && isTouched) || (showOnSubmit && isSubmitted);
}

export function getFieldProps<T extends FieldValues>(
  state: FormState<T>,
  fieldName: keyof T,
  options?: {
    showErrorOnTouch?: boolean;
    showErrorOnSubmit?: boolean;
    immediateError?: boolean;
  }
) {
  const value = state.values[fieldName];
  const error = getFieldError(state, fieldName);
  const showError = shouldShowError(state, fieldName, {
    showOnTouch: options?.showErrorOnTouch,
    showOnSubmit: options?.showErrorOnSubmit,
    immediate: options?.immediateError
  });
  
  return {
    value,
    error: showError ? error : undefined,
    hasError: Boolean(error),
    showError,
    touched: isFieldTouched(state, fieldName),
    dirty: isFieldDirty(state, fieldName),
    name: fieldName as string,
    id: fieldName as string
  };
}

export function validateFormData<T extends FieldValues>(
  values: T,
  schema?: any // Can be Zod, Yup, or any validation schema
): { isValid: boolean; errors: Record<keyof T, string> } {
  if (!schema) {
    return { isValid: true, errors: {} as Record<keyof T, string> };
  }
  
  try {
    // This is a simplified validation - actual implementation would depend on the schema type
    if (typeof schema.parse === 'function') {
      // Zod-style validation
      schema.parse(values);
      return { isValid: true, errors: {} as Record<keyof T, string> };
    }
    
    if (typeof schema.validate === 'function') {
      // Yup-style validation
      schema.validateSync(values);
      return { isValid: true, errors: {} as Record<keyof T, string> };
    }
    
    return { isValid: true, errors: {} as Record<keyof T, string> };
  } catch (error: any) {
    // This would need to be implemented based on the specific validation library
    return { 
      isValid: false, 
      errors: { _form: error.message || 'Validation failed' } as Record<keyof T, string>
    };
  }
}