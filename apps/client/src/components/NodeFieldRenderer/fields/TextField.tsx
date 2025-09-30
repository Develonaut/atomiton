import { Input } from "@atomiton/ui";
import type { FieldComponentProps } from "../types";
import type { ChangeEvent } from "react";

export function TextField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const inputType =
    config.controlType === "password"
      ? "password"
      : config.controlType === "email"
        ? "email"
        : config.controlType === "url"
          ? "url"
          : "text";

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
