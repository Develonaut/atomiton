import type { FieldComponentProps } from "../types";
import type { ChangeEvent } from "react";

export function SelectField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const options = config.options || [];

  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={fieldKey}
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded"
        data-testid={`field-${fieldKey}`}
      >
        <option value="">-- Select --</option>
        {options.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
