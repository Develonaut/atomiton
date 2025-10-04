import type { FieldComponentProps } from "#components/NodeFieldRenderer/types";

export function ColorField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const currentValue = (value as string) || "#000000";

  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-2 items-center">
        <input
          id={fieldKey}
          type="color"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-16 h-10 border rounded cursor-pointer"
          data-testid={`field-${fieldKey}`}
        />
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border rounded font-mono text-sm"
          placeholder="#000000"
        />
      </div>
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
