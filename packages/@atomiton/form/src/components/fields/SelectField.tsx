import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { FormField } from "../FormField.js";

export type SelectFieldProps = {
  name: string;
  formId?: string;
  label?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
} & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "name" | "value" | "onChange" | "onBlur" | "onFocus"
>;

export function SelectField({
  name,
  formId,
  label,
  helperText,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FormField<string> name={name} formId={formId}>
      {({ value, error, touched, onChange, onBlur, onFocus }) => (
        <div className="atomiton-form-field atomiton-form-space-y-1">
          {label && (
            <label htmlFor={name} className="atomiton-form-label">
              {label}
            </label>
          )}
          <select
            id={name}
            name={name}
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
            className={`atomiton-form-select ${
              touched && error ? "error" : ""
            }`}
            {...selectProps}
          >
            {placeholder && (
              <option
                value=""
                disabled
                style={{ color: "var(--form-placeholder)" }}
              >
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="atomiton-form-select-option"
              >
                {option.label}
              </option>
            ))}
          </select>
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
