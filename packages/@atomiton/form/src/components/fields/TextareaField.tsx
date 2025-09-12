import React from "react";
import type { UseFormRegister } from "react-hook-form";
import { Field } from "@atomiton/ui";

interface TextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: { message?: string };
  register: UseFormRegister<any>;
  disabled?: boolean;
  readOnly?: boolean;
}

export const TextareaField = React.memo<TextareaFieldProps>(
  ({
    name,
    label,
    placeholder,
    helpText,
    error,
    register,
    disabled = false,
    readOnly = false,
  }) => (
    <div>
      <Field
        label={label}
        placeholder={placeholder}
        textarea={true}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name)}
      />
      {helpText && <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  ),
);

TextareaField.displayName = "TextareaField";
