import { Input } from "@atomiton/ui";
import type { ChangeEvent } from "react";
import type { FieldComponentProps } from "../types";

export function TextField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const inputTypes = {
    text: "text",
    password: "password",
    email: "email",
    url: "url",
    file: "file",
  };

  const inputType = inputTypes[config.controlType] || "text";

  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id={fieldKey}
        type={inputType}
        value={value || ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={config.placeholder}
        disabled={disabled}
        className="w-full"
        data-testid={`field-${fieldKey}`}
      />
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
