import { Input as InputPrimitive } from "#primitives/Input";
import { styled } from "#system/styled";

const Input = styled(InputPrimitive, {
  name: "Input",
})(
  [
    // Base styles shared across all variants
    "w-full",
    "text-primary",
    "outline-0",
    "text-body-md",
    "placeholder:text-secondary",
    "shadow-none",
    "focus-visible:ring-0",
    "ring-0",
  ],
  {
    variants: {
      variant: {
        // Default - matches NumberInput styling exactly
        default: [
          "border",
          "border-surface-03",
          "bg-surface-03",
          "rounded-[0.625rem]",
          "transition-colors",
          "focus:border-s-02",
          "focus:bg-surface-02",
        ],
        // Outlined - border only, no background
        outlined: [
          "border",
          "border-s-02",
          "bg-transparent",
          "rounded-xl",
          "focus:border-s-01",
        ],
        // Ghost - minimal styling, no border
        ghost: ["border-0", "bg-transparent", "focus:bg-surface-01/50"],
      },
      size: {
        xs: "h-6 px-2 text-body-sm",
        sm: "h-8 px-2 text-body-sm",
        md: "h-9 px-3 text-body-md", // matches NumberInput h-9
        lg: "h-12 px-4 text-body-lg",
        xl: "h-14 px-6 text-heading",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export default Input;
