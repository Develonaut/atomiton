import type { FieldComponentProps } from "#components/NodeFieldRenderer/types";

export function BooleanField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center space-x-2">
        <input
          id={fieldKey}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4"
          data-testid={`field-${fieldKey}`}
        />
        <span className="text-sm font-medium">
          {config.label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      {config.helpText && (
        <p className="text-xs text-gray-500 ml-6">{config.helpText}</p>
      )}
    </div>
  );
}
