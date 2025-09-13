import React from "react";
import { Select } from "@atomiton/ui";
import type { SelectOption } from "@atomiton/ui";

type SelectFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: { message?: string };
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean) => void;
  options: Array<{ label: string; value: string | number | boolean }>;
  disabled?: boolean;
};

export const SelectField = React.memo<SelectFieldProps>(
  ({
    name: _name,
    label,
    placeholder,
    helpText,
    error,
    value,
    onChange,
    options,
    disabled = false,
  }) => {
    const selectOptions: SelectOption[] = options.map((opt, index) => ({
      id: index,
      name: (opt.label || opt.value) as string,
      value: opt.value,
    }));

    const selectedOption =
      selectOptions.find((opt) => opt.value === value) || null;

    return (
      <div>
        {label && (
          <label className="block text-xs font-medium text-[#000] mb-2">
            {label}
          </label>
        )}
        <Select
          options={selectOptions}
          value={selectedOption}
          onChange={(option: SelectOption) => {
            onChange(option.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        {helpText && <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
