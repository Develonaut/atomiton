import { forwardRef } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

type DualRangeSliderProps = {
  values: [number, number];
  onChange: (values: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  overlayStyle?: "timeline" | "default";
};

const DualRangeSlider = forwardRef<HTMLDivElement, DualRangeSliderProps>(
  (
    {
      values,
      onChange,
      min = 0,
      max = 20,
      step = 1,
      className = "",
      disabled = false,
      overlayStyle = "default",
      ...props
    },
    ref,
  ) => {
    const handleChange = (value: number | number[]) => {
      onChange(value as [number, number]);
    };

    const getStyles = () => {
      if (overlayStyle === "timeline") {
        return {
          handle: {
            width: "2px",
            height: "100%",
            backgroundColor: "var(--shade-01)",
            border: "none",
            borderRadius: "0",
            outline: "none",
            cursor: "pointer",
            marginTop: "0",
            boxShadow: "none",
          },
          track: {
            height: "100%",
            backgroundColor: "var(--shade-09_35)",
            borderRadius: "0",
          },
          rail: {
            height: "100%",
            backgroundColor: "transparent",
            borderRadius: "0",
          },
        };
      }

      // Default styles for regular dual range slider
      return {
        handle: {
          width: "16px",
          height: "16px",
          backgroundColor: "var(--shade-01)",
          border: "2px solid var(--surface-01)",
          borderRadius: "50%",
          outline: "none",
          cursor: "pointer",
          marginTop: "-6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        track: {
          height: "4px",
          backgroundColor: "var(--shade-06)",
          borderRadius: "2px",
        },
        rail: {
          height: "4px",
          backgroundColor: "var(--shade-03)",
          borderRadius: "2px",
        },
      };
    };

    return (
      <Slider
        ref={ref}
        className={`${overlayStyle === "timeline" ? "range-loop !absolute top-0 left-0 !h-full !p-0 z-2" : ""} ${className}`}
        range
        value={values}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        styles={getStyles()}
        {...props}
      />
    );
  },
);

DualRangeSlider.displayName = "DualRangeSlider";

export default DualRangeSlider;
