import React from "react";
import type { UseFormRegister } from "react-hook-form";
import { Field } from "@atomiton/ui";

type NumberFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  error?: { message?: string };
  register: UseFormRegister<Record<string, unknown>>;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

export const NumberField = React.memo<NumberFieldProps>(
  ({
    name,
    label,
    placeholder,
    helpText,
    error,
    register,
    disabled = false,
    readOnly = false,
    min,
    max,
    step,
  }) => (
    <div>
      <Field
        label={label}
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        {...register(name, { valueAsNumber: true })}
      />
      {helpText && <p className="text-xs text-[#7B7B7B] mt-1">{helpText}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
    </div>
  ),
);

NumberField.displayName = "NumberField";
