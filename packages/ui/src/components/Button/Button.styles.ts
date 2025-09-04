import { cva } from "class-variance-authority";

/**
 * Button variants using CVA for clean variant management
 * Following Brainwave 2.0 design tokens
 */
export const buttonVariants = cva(
  // Base styles - apply to all buttons
  [
    "relative",
    "inline-flex",
    "justify-center",
    "items-center",
    "font-medium",
    "transition-all",
    "cursor-pointer",
    "select-none",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-offset-2",
    "disabled:opacity-30",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-b",
          "from-[#E5E5E5]",
          "to-[#E2E2E2]",
          "text-shade-09",
          "shadow-[0_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4]",
          "after:absolute",
          "after:inset-0",
          "after:rounded-[inherit]",
          "after:bg-white/40",
          "after:opacity-0",
          "after:transition-opacity",
          "hover:after:opacity-100",
          "hover:shadow-[0px_3px_8px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6]",
          "active:after:opacity-0",
          "focus-visible:ring-shade-05",
        ],
        secondary: [
          "text-shade-01",
          "shadow-[0_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333]",
          "after:absolute",
          "after:inset-0",
          "after:bg-gradient-to-b",
          "after:from-[#323232]",
          "after:to-[#222222]",
          "after:rounded-[inherit]",
          "after:transition-opacity",
          "hover:after:opacity-90",
          "active:after:opacity-100",
          "focus-visible:ring-shade-06",
        ],
        ghost: [
          "text-shade-07",
          "hover:bg-shade-02",
          "active:bg-shade-03",
          "focus-visible:ring-shade-05",
        ],
        danger: [
          "bg-gradient-to-b",
          "from-red-600",
          "to-red-700",
          "text-white",
          "shadow-[0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_rgba(185,28,28,1),0px_3px_4px_-1px_rgba(185,28,28,0.5)]",
          "hover:from-red-500",
          "hover:to-red-600",
          "active:from-red-700",
          "active:to-red-800",
          "focus-visible:ring-red-500",
        ],
      },
      size: {
        xs: ["h-7", "px-3", "text-xs", "rounded-lg", "gap-1"],
        sm: ["h-8", "px-4", "text-xs", "rounded-lg", "gap-1.5"],
        md: ["h-10", "px-6", "text-sm", "rounded-xl", "gap-2"],
        lg: ["h-12", "px-8", "text-base", "rounded-xl", "gap-2"],
        xl: ["h-14", "px-10", "text-lg", "rounded-2xl", "gap-3"],
        xxl: ["h-16", "px-12", "text-xl", "rounded-2xl", "gap-3"],
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

/**
 * Loading spinner styles
 */
export const spinnerClasses = "animate-spin h-4 w-4";

/**
 * Icon wrapper classes
 */
export const iconClasses = "relative z-10 flex items-center";
