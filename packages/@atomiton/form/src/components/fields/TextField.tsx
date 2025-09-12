import { Input } from "@atomiton/ui";
import React from "react";
import { type UseFormRegister } from "react-hook-form";

type TextFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: { message?: string };
  register: UseFormRegister<any>;
  disabled?: boolean;
  readOnly?: boolean;
  type?:
    | "text"
    | "email"
    | "password"
    | "url"
    | "tel"
    | "date"
    | "datetime-local"
    | "color"
    | "file"
    | "range";
};

export const TextField = React.memo<TextFieldProps>(
  ({
    name,
    label,
    placeholder,
    helpText,
    error,
    register,
    disabled = false,
    readOnly = false,
    type = "text",
  }) => (
    <div>
      <Input
        label={label}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name)}
      />
      {helpText && <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  ),
);

TextField.displayName = "TextField";
