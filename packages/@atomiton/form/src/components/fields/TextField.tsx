import type { InputHTMLAttributes } from "react";
import { FormField } from "../FormField.js";

export type TextFieldProps = {
  name: string;
  formId?: string;
  label?: string;
  helperText?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "name" | "value" | "onChange" | "onBlur" | "onFocus"
>;

export function TextField({
  name,
  formId,
  label,
  helperText,
  ...inputProps
}: TextFieldProps) {
  return (
    <FormField<string> name={name} formId={formId}>
      {({ value, error, touched, onChange, onBlur, onFocus }) => (
        <div className="atomiton-form-field atomiton-form-space-y-1">
          {label && (
            <label htmlFor={name} className="atomiton-form-label">
              {label}
            </label>
          )}
          <input
            id={name}
            name={name}
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-invalid={touched && !!error}
            aria-describedby={
              error && touched
                ? `${name}-error`
                : helperText
                  ? `${name}-helper`
                  : undefined
            }
            className={`atomiton-form-input ${touched && error ? "error" : ""}`}
            {...inputProps}
          />
          {helperText && !error && (
            <span id={`${name}-helper`} className="atomiton-form-helper-text">
              {helperText}
            </span>
          )}
          {touched && error && (
            <span
              id={`${name}-error`}
              className="atomiton-form-error-text"
              role="alert"
            >
              {error.message}
            </span>
          )}
        </div>
      )}
    </FormField>
  );
}
