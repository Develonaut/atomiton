import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { FormField } from "../FormField.js";

export type RadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type RadioFieldProps = {
  name: string;
  formId?: string;
  label?: string;
  helperText?: string;
  options: RadioOption[];
  orientation?: "horizontal" | "vertical";
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "name" | "value" | "onChange" | "onBlur" | "onFocus"
>;

export function RadioField({
  name,
  formId,
  label,
  helperText,
  options,
  orientation = "vertical",
  ...inputProps
}: RadioFieldProps) {
  return (
    <FormField<string> name={name} formId={formId}>
      {({ value, error, touched, onChange, onBlur, onFocus }) => (
        <div className="atomiton-form-field atomiton-form-space-y-1">
          {label && (
            <div
              className="atomiton-form-label"
              role="group"
              aria-labelledby={`${name}-label`}
            >
              <span id={`${name}-label`}>{label}</span>
            </div>
          )}
          <div
            className={
              orientation === "horizontal"
                ? "atomiton-form-radio-group-horizontal"
                : "atomiton-form-radio-group-vertical"
            }
          >
            {options.map((option) => (
              <label
                key={option.value}
                className={`atomiton-form-radio-label ${
                  option.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  opacity: option.disabled
                    ? "var(--form-disabled-opacity)"
                    : "1",
                }}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  disabled={option.disabled}
                  aria-invalid={touched && !!error}
                  aria-describedby={
                    error && touched ? `${name}-error` : undefined
                  }
                  className={`atomiton-form-radio ${
                    touched && error ? "error" : ""
                  }`}
                  {...inputProps}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
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
