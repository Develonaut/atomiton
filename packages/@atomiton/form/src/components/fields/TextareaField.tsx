import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { FormField } from "../FormField.js";

export type TextareaFieldProps = {
  name: string;
  formId?: string;
  label?: string;
  helperText?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "value" | "onChange" | "onBlur" | "onFocus"
>;

export function TextareaField({
  name,
  formId,
  label,
  helperText,
  resize = "vertical",
  rows = 4,
  ...textareaProps
}: TextareaFieldProps) {
  const resizeClass = {
    none: "atomiton-form-resize-none",
    both: "atomiton-form-resize-both",
    horizontal: "atomiton-form-resize-horizontal",
    vertical: "atomiton-form-resize-vertical",
  }[resize];

  return (
    <FormField<string> name={name} formId={formId}>
      {({ value, error, touched, onChange, onBlur, onFocus }) => (
        <div className="atomiton-form-field atomiton-form-space-y-1">
          {label && (
            <label htmlFor={name} className="atomiton-form-label">
              {label}
            </label>
          )}
          <textarea
            id={name}
            name={name}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            rows={rows}
            aria-invalid={touched && !!error}
            aria-describedby={
              error && touched
                ? `${name}-error`
                : helperText
                  ? `${name}-helper`
                  : undefined
            }
            className={`atomiton-form-textarea ${resizeClass} ${
              touched && error ? "error" : ""
            }`}
            {...textareaProps}
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
