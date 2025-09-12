import { forwardRef } from "react";

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 1,
      step = 0.001,
      className = "",
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full h-9 appearance-none bg-shade-03 rounded-lg cursor-pointer range-slider ${className}`}
        style={{
          background: `linear-gradient(to right, var(--shade-06_30) 0%, var(--shade-06_30) ${percentage}%, var(--shade-03) ${percentage}%, var(--shade-03) 100%)`,
        }}
        {...props}
      />
    );
  },
);

RangeSlider.displayName = "RangeSlider";

export default RangeSlider;
