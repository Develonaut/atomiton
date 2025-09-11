import type { ReactElement } from "react";
import { useField } from "../hooks/useField.js";
import type { FieldValue, FormFieldProps } from "../types/index.js";

export type FieldProps<T = FieldValue> = {
  name: string;
  formId?: string;
  children: (props: FormFieldProps<T>) => ReactElement;
  parse?: (value: unknown) => T;
  format?: (value: T) => unknown;
};

/**
 * FormField component that connects a field to the form store
 * Uses the useField hook for clean separation of concerns
 */
export function FormField<T = FieldValue>({
  name,
  formId,
  children,
  parse,
  format,
}: FieldProps<T>) {
  const fieldProps = useField<T>({
    name,
    formId,
    parse,
    format,
  });

  return children(fieldProps);
}
