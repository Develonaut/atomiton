import React from "react";
import type { UseFormRegister } from "react-hook-form";
import { Field } from "@atomiton/ui";

interface JsonFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: { message?: string };
  register: UseFormRegister<any>;
  disabled?: boolean;
  readOnly?: boolean;
}

export const JsonField = React.memo<JsonFieldProps>(
  ({
    name,
    label,
    placeholder = '{"key": "value"}',
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
        {...register(name, {
          validate: (value: unknown) => {
            if (!value) return true;
            try {
              JSON.parse(value as string);
              return true;
            } catch {
              return "Invalid JSON format";
            }
          },
        })}
      />
      {helpText && <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  ),
);

JsonField.displayName = "JsonField";
