import Select from "#components/form/Select";
import type { FieldComponentProps } from "#components/NodeFieldRenderer/types";

type SelectOption = {
  value: string;
  label: string;
};

export function SelectField({
  fieldKey,
  config,
  value,
  onChange,
  disabled = false,
}: FieldComponentProps) {
  const options = config.options || [];

  // Find the current option object or use undefined for empty selection
  const currentOption = options.find(
    (opt: SelectOption) => opt.value === value,
  );

  return (
    <div className="space-y-1">
      <label htmlFor={fieldKey} className="block text-sm font-medium">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select
        value={currentOption}
        onChange={(option: SelectOption | undefined) =>
          onChange(option?.value || undefined)
        }
        disabled={disabled}
      >
        <Select.Trigger isMedium isWhite data-testid={`field-${fieldKey}`}>
          <Select.Placeholder>-- Select --</Select.Placeholder>
          <Select.Value>{currentOption?.label}</Select.Value>
          <Select.Indicator isMedium />
        </Select.Trigger>
        <Select.Options>
          {options.map((opt: SelectOption) => (
            <Select.Option key={opt.value} value={opt} isMedium>
              {opt.label}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>
      {config.helpText && (
        <p className="text-xs text-gray-500">{config.helpText}</p>
      )}
    </div>
  );
}
