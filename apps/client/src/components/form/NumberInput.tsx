import { forwardRef } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      prefix,
      suffix,
      placeholder,
      className = "",
      min,
      max,
      step,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onChange(newValue);
    };

    return (
      <div className={`relative ${className}`}>
        {prefix && (
          <div className="absolute top-[52%] left-2.5 -translate-y-1/2 text-body-md pointer-events-none text-secondary/50">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full h-9 border border-surface-03 bg-surface-03 rounded-[0.625rem] text-body-md text-primary outline-0 transition-colors focus:border-s-02 focus:bg-surface-02 ${
            prefix ? "pl-7.5" : "pl-2.5"
          } ${suffix ? "pr-2" : "pr-2"}`}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          {...props}
        />
        {suffix && (
          <div className="absolute top-[52%] right-2.5 -translate-y-1/2 text-body-md pointer-events-none text-secondary/50">
            {suffix}
          </div>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
