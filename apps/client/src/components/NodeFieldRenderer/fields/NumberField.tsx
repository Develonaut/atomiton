import { Input } from "@atomiton/ui";
import type { FieldComponentProps } from "../types";
import type { ChangeEvent } from "react";

export function NumberField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id={fieldKey}
        type="number"
        value={value ?? ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const val = e.target.value;
          onChange(val === "" ? undefined : Number(val));
        }}
        placeholder={config.placeholder}
        disabled={disabled}
        min={config.min}
        max={config.max}
        step={config.step}
        className="w-full"
        data-testid={`field-${fieldKey}`}
      />
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
