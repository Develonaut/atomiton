import type { FieldComponentProps } from "../types";

export function RangeField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const step = config.step ?? 1;
  const currentValue = value ?? min;

  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
        <span className="ml-2 text-gray-600 font-normal">({currentValue})</span>
      </label>
      <input
        id={fieldKey}
        type="range"
        value={currentValue}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full"
        data-testid={`field-${fieldKey}`}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
