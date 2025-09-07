// Shared style constants for consistency
export const BUTTON_STYLES = {
  // Base styles shared by all buttons
  base: [
    "relative",
    "inline-flex",
    "justify-center",
    "items-center",
    "font-semibold",
    "cursor-pointer",
    "transition-all",
    "rounded-xl",
    "whitespace-nowrap",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],

  // Common overlay pattern used by multiple variants
  overlay: {
    base: [
      "after:absolute",
      "after:inset-0",
      "after:rounded-xl",
      "after:transition-opacity",
    ],
    hover: "hover:after:opacity-100",
    active: "active:after:opacity-0",
  },

  // Shadow presets for consistency
  shadows: {
    default: {
      base: "shadow-[0_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4]",
      hover:
        "hover:shadow-[0px_3px_8px_-2px_rgba(0,0,0,0.30),0px_1px_0px_0px_rgba(255,255,255,0.70)_inset,0px_0px_0px_1px_#E6E6E6]",
    },
    secondary:
      "shadow-[0_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333]",
    destructive:
      "shadow-[0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#BF4A0F,0px_3px_4px_-1px_rgba(252,96,16,0.95)]",
    outline: {
      active: "active:shadow-[0px_0px_4px_0px_rgba(0,0,0,0.10)_inset]",
    },
    ghost: {
      active: "active:shadow-[0px_0px_2.1px_0px_rgba(0,0,0,0.15)_inset]",
    },
    embossed: {
      active:
        "active:shadow-[0_-1px_3px_0px_rgba(18,18,18,0.15)_inset,0px_1.25px_1px_0px_#FFF_inset,0_0_0_2px_var(--tw-ring-color)]",
    },
  },

  // Gradient presets
  gradients: {
    default: ["bg-gradient-to-b", "from-[#E5E5E5]", "to-[#E2E2E2]"],
    secondary: [
      "after:bg-gradient-to-b",
      "after:from-[#323232]",
      "after:to-[#222222]",
    ],
    destructive: ["bg-gradient-to-b", "from-[#E36323]", "to-[#DF5A18]"],
  },

  // Text colors
  text: {
    default: "text-shade-08",
    light: "text-[#FCFCFC]",
    primary: "text-primary",
  },

  // Background colors
  backgrounds: {
    outline: "bg-[#FCFCFC]",
    ghost: {
      hover: "hover:bg-[#F1F1F1]",
    },
    embossed: {
      hover: "hover:bg-surface-03",
    },
  },

  // Border styles
  borders: {
    outline: ["border", "border-[#E2E2E2]"],
    ghost: ["border", "border-transparent"],
  },
};

// Variant definitions using the shared styles
export const buttonVariants = {
  default: [
    ...BUTTON_STYLES.gradients.default,
    BUTTON_STYLES.shadows.default.base,
    BUTTON_STYLES.text.default,
    ...BUTTON_STYLES.overlay.base,
    "after:bg-white/40",
    "after:opacity-0",
    BUTTON_STYLES.overlay.hover,
    BUTTON_STYLES.shadows.default.hover,
    BUTTON_STYLES.overlay.active,
  ],

  secondary: [
    BUTTON_STYLES.shadows.secondary,
    BUTTON_STYLES.text.light,
    ...BUTTON_STYLES.overlay.base,
    ...BUTTON_STYLES.gradients.secondary,
    "hover:after:opacity-90",
    "active:after:opacity-100",
  ],

  destructive: [
    ...BUTTON_STYLES.gradients.destructive,
    BUTTON_STYLES.shadows.destructive,
    BUTTON_STYLES.text.light,
    ...BUTTON_STYLES.overlay.base,
    "after:bg-white/10",
    "after:opacity-0",
    BUTTON_STYLES.overlay.hover,
    BUTTON_STYLES.overlay.active,
  ],

  outline: [
    ...BUTTON_STYLES.borders.outline,
    BUTTON_STYLES.backgrounds.outline,
    "hover:bg-[#F1F1F1]",
    BUTTON_STYLES.shadows.outline.active,
  ],

  ghost: [
    ...BUTTON_STYLES.borders.ghost,
    BUTTON_STYLES.backgrounds.ghost.hover,
    BUTTON_STYLES.shadows.ghost.active,
  ],

  link: [BUTTON_STYLES.text.primary, "underline-offset-4", "hover:underline"],

  embossed: [
    "embossed",
    BUTTON_STYLES.backgrounds.embossed.hover,
    BUTTON_STYLES.shadows.embossed.active,
  ],
};

// Size definitions
export const buttonSizes = {
  sm: ["h-9", "px-3", "rounded-xl", "text-xs"],
  default: ["h-10", "px-4", "rounded-xl", "text-sm"],
  lg: ["h-11", "px-8", "rounded-xl", "text-base"],
  icon: ["h-10", "w-10", "p-0"],
};

// Loading state
export const buttonLoading = {
  true: ["cursor-wait", "[&>span]:opacity-0"],
};

// Compound variants
export const buttonCompoundVariants = [
  {
    size: "icon",
    className: ["[&:has(>span>svg:only-child)]:p-0"],
  },
];
