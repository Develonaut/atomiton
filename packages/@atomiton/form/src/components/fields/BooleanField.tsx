import React from "react";
import type { UseFormRegister } from "react-hook-form";

interface BooleanFieldProps {
  name: string;
  label?: string;
  helpText?: string;
  error?: { message?: string };
  register: UseFormRegister<any>;
  disabled?: boolean;
}

export const BooleanField = React.memo<BooleanFieldProps>(
  ({ name, label, helpText, error, register, disabled = false }) => (
    <div className="flex items-center justify-between">
      <div>
        {label && (
          <label className="block text-xs font-medium text-[#000]">
            {label}
          </label>
        )}
        {helpText && <p className="text-xs text-[#7B7B7B]">{helpText}</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
      </div>
      <input
        type="checkbox"
        {...register(name)}
        disabled={disabled}
        className="h-4 w-4 rounded border-[#E2E2E2] text-[#000] focus:ring-2 focus:ring-[#000] disabled:opacity-50"
      />
    </div>
  ),
);

BooleanField.displayName = "BooleanField";
