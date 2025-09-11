import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { FormField } from "../FormField.js";

export type CheckboxFieldProps = {
  name: string;
  formId?: string;
  label?: string;
  helperText?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "name" | "value" | "onChange" | "onBlur" | "onFocus" | "checked"
>;

export function CheckboxField({
  name,
  formId,
  label,
  helperText,
  ...inputProps
}: CheckboxFieldProps) {
  return (
    <FormField<boolean> name={name} formId={formId}>
      {({ value, error, touched, onChange, onBlur, onFocus }) => (
        <div className="atomiton-form-field atomiton-form-space-y-1">
          <label className="atomiton-form-checkbox-label">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
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
              className={`atomiton-form-checkbox ${
                touched && error ? "error" : ""
              }`}
              {...inputProps}
            />
            {label && <span>{label}</span>}
          </label>
          {helperText && !error && (
            <span
              id={`${name}-helper`}
              className="atomiton-form-helper-text"
              style={{ marginLeft: "1.75rem" }}
            >
              {helperText}
            </span>
          )}
          {touched && error && (
            <span
              id={`${name}-error`}
              className="atomiton-form-error-text"
              style={{ marginLeft: "1.75rem" }}
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
