import type { FieldComponentProps } from "../types";

export function CodeField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  // For now, use a simple textarea. Can be enhanced with Monaco later
  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={fieldKey}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        disabled={disabled}
        rows={config.rows || 10}
        className="w-full px-3 py-2 border rounded font-mono text-xs bg-gray-50"
        spellCheck={false}
        data-testid={`field-${fieldKey}`}
      />
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
