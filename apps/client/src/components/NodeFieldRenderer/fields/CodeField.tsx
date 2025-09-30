import { CodeInput } from "@atomiton/ui";
import type { FieldComponentProps } from "#components/NodeFieldRenderer";

export function CodeField({
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
      <CodeInput
        id={fieldKey}
        value={(value as string) || ""}
        onChange={onChange}
        placeholder={config.placeholder}
        disabled={disabled}
        height={`${(config.rows || 10) * 1.5}rem`}
        data-testid={`field-${fieldKey}`}
      />
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
