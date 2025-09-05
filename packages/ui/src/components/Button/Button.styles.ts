import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  [
    // Base styles
    "relative",
    "inline-flex",
    "justify-center",
    "items-center",
    "leading-[1.25rem]",
    "font-semibold",
    "cursor-pointer",
    "transition-all",
    "rounded-xl",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-b",
          "from-[#E5E5E5]",
          "to-[#E2E2E2]",
          "shadow-[0_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4]",
          "text-shade-08",
          "after:absolute",
          "after:inset-0",
          "after:rounded-xl",
          "after:bg-white/40",
          "after:opacity-0",
          "after:transition-opacity",
          "hover:after:opacity-100",
          "hover:shadow-[0px_3px_8px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6]",
          "active:after:opacity-0",
        ],
        secondary: [
          "shadow-[0_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333]",
          "text-[#FCFCFC]",
          "after:absolute",
          "after:inset-0",
          "after:bg-gradient-to-b",
          "after:from-[#323232]",
          "after:to-[#222222]",
          "after:rounded-xl",
          "after:transition-opacity",
          "hover:after:opacity-90",
          "active:after:opacity-100",
        ],
        orange: [
          "bg-gradient-to-b",
          "from-[#E36323]",
          "to-[#DF5A18]",
          "shadow-[0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#BF4A0F,0px_3px_4px_-1px_rgba(252,96,16,0.95)]",
          "text-[#FCFCFC]",
          "after:absolute",
          "after:inset-0",
          "after:rounded-xl",
          "after:bg-white/10",
          "after:opacity-0",
          "after:transition-opacity",
          "hover:after:opacity-100",
          "active:after:opacity-0",
        ],
        ghost: [
          "bg-transparent",
          "hover:bg-accent",
          "hover:text-accent-foreground",
        ],
      },
      size: {
        sm: ["h-9", "px-5", "rounded-[0.625rem]", "text-[0.75rem]"],
        md: ["h-10", "px-6", "rounded-xl", "text-[0.875rem]"],
        lg: ["h-12", "px-8", "rounded-xl", "text-base"],
      },
      disabled: {
        true: ["opacity-30", "pointer-events-none", "cursor-not-allowed"],
      },
      loading: {
        true: ["cursor-wait", "[&>span]:opacity-0"],
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
    compoundVariants: [],
  },
);
