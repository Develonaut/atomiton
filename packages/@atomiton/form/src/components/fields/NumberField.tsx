import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { FormField } from "../FormField.js";

export type NumberFieldProps = {
  name: string;
  formId?: string;
  label?: string;
  helperText?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "name" | "value" | "onChange" | "onBlur" | "onFocus"
>;

export function NumberField({
  name,
  formId,
  label,
  helperText,
  ...inputProps
}: NumberFieldProps) {
  return (
    <FormField<number>
      name={name}
      formId={formId}
      parse={(value) => {
        const num = parseFloat(value as string);
        return isNaN(num) ? 0 : num;
      }}
      format={(value) => value?.toString() || ""}
    >
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
            type="number"
            value={(value as number) || ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "" ? 0 : parseFloat(val));
            }}
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
