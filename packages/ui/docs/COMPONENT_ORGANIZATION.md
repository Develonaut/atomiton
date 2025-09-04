# Component Organization Guide

## Table of Contents

- [The "Bento Box" Principle 🍱](#the-bento-box-principle-)
- [Ideal Component Structure](#ideal-component-structure)
- [File Responsibilities](#file-responsibilities)
- [Component Examples](#component-examples)
- [Compound Components](#compound-components)
- [Anti-Patterns](#anti-patterns)
- [Import/Export Patterns](#importexport-patterns)
- [File Naming Conventions](#file-naming-conventions)
- [Organization Benefits](#organization-benefits)
- [Summary](#summary)

## The "Bento Box" Principle 🍱

When you open a component, it should feel like opening a beautiful bento box:

- Each ingredient has its own compartment
- Nothing is mixed together or messy
- It's visually pleasing and organized
- You can immediately see and access everything
- Quality over quantity - a few excellent pieces, not a cluttered mess

## Ideal Component Structure

```
components/
  Button/
    Button.tsx           # Main component logic
    Button.types.ts      # TypeScript interfaces
    Button.styles.ts     # CVA style variants
    Button.test.tsx      # Unit tests (if needed)
    index.ts            # Clean exports
    README.md           # Component documentation (optional)
```

## File Responsibilities

### 1. `Button.types.ts` - Type Definitions

Clean, semantic prop interfaces:

```tsx
import type { StyleProps } from "@/types/style-props";
import type { VariantProps } from "class-variance-authority";
import type { buttonStyles } from "./Button.styles";

export interface ButtonProps
  extends StyleProps,
    VariantProps<typeof buttonStyles>,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Semantic props
  variant?: "primary" | "secondary" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "danger" | "success";

  // State props
  loading?: boolean;
  disabled?: boolean;

  // Slots
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Polymorphic
  as?: React.ElementType;
}
```

### 2. `Button.styles.ts` - Style Variants

CVA configuration for all visual styles:

```tsx
import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  // Base styles
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-md gap-1",
        sm: "h-8 px-3 text-sm rounded-md gap-1.5",
        md: "h-10 px-4 text-base rounded-lg gap-2",
        lg: "h-12 px-6 text-lg rounded-lg gap-2",
        xl: "h-14 px-8 text-xl rounded-xl gap-3",
      },
      tone: {
        danger: "bg-red-500 hover:bg-red-600 text-white",
        success: "bg-green-500 hover:bg-green-600 text-white",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

// Additional modifier classes
export const buttonModifiers = {
  loading: "cursor-wait",
  fullWidth: "w-full",
};
```

### 3. `Button.tsx` - Component Logic

Clean, focused component implementation:

```tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { extractStyleProps } from "@/utils/style-props";
import { Spinner } from "@/components/Spinner";
import type { ButtonProps } from "./Button.types";
import { buttonStyles, buttonModifiers } from "./Button.styles";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    // Extract style props cleanly
    const { styleClasses, otherProps } = extractStyleProps(props);

    // Destructure component-specific props
    const {
      variant,
      size,
      tone,
      loading,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth,
      fw,
      as: Component = "button",
      className,
      children,
      ...htmlProps
    } = otherProps;

    // Compute final disabled state
    const isDisabled = disabled || loading;

    // Build className using cn utility
    const classes = cn(
      "atomiton-button", // Component identifier
      buttonStyles({ variant, size }), // CVA variants
      tone && buttonStyles({ tone }), // Optional tone
      loading && buttonModifiers.loading, // State modifiers
      (fullWidth || fw) && buttonModifiers.fullWidth,
      styleClasses, // Style props
      className, // User overrides
    );

    return (
      <Component
        ref={ref}
        className={classes}
        disabled={isDisabled}
        data-variant={variant}
        data-size={size}
        data-tone={tone}
        data-state={loading ? "loading" : "idle"}
        data-disabled={isDisabled || undefined}
        aria-busy={loading}
        {...htmlProps}
      >
        {loading && <Spinner size={size} className="mr-2" />}
        {leftIcon && <span className="button-icon-left">{leftIcon}</span>}
        <span className="button-label">{children}</span>
        {rightIcon && <span className="button-icon-right">{rightIcon}</span>}
      </Component>
    );
  },
);

Button.displayName = "Button";
```

### 4. `index.ts` - Clean Exports

Simple, clear module exports:

```tsx
export { Button } from "./Button";
export type { ButtonProps } from "./Button.types";
```

## Core Utilities

### 1. `utils/cn.ts` - Class Name Utility

Combines clsx and tailwind-merge:

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. `utils/style-props.ts` - Style Props Extraction

Handles all style prop logic:

```tsx
import type { StyleProps } from "@/types/style-props";

const STYLE_PROP_KEYS = [
  // Margin
  "m",
  "mt",
  "mr",
  "mb",
  "ml",
  "mx",
  "my",
  // Padding
  "p",
  "pt",
  "pr",
  "pb",
  "pl",
  "px",
  "py",
  // Size
  "w",
  "h",
  "minW",
  "minH",
  "maxW",
  "maxH",
  "fullWidth",
  "fullHeight",
  "fw",
  "fh",
  // Display
  "display",
  "flex",
  "grid",
  // Position
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
] as const;

export function extractStyleProps<T extends StyleProps>(
  props: T,
): {
  styleClasses: string;
  otherProps: Omit<T, keyof StyleProps>;
} {
  const styleProps: Record<string, any> = {};
  const otherProps: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (STYLE_PROP_KEYS.includes(key as any)) {
      styleProps[key] = value;
    } else {
      otherProps[key] = value;
    }
  }

  // Convert style props to Tailwind classes
  const classes = convertStylePropsToClasses(styleProps);

  return {
    styleClasses: classes,
    otherProps: otherProps as Omit<T, keyof StyleProps>,
  };
}

function convertStylePropsToClasses(props: Record<string, any>): string {
  const classes: string[] = [];

  // Margin
  if (props.m !== undefined) classes.push(`m-${props.m}`);
  if (props.mt !== undefined) classes.push(`mt-${props.mt}`);
  // ... etc

  // Full width/height
  if (props.fullWidth || props.fw) classes.push("w-full");
  if (props.fullHeight || props.fh) classes.push("h-full");

  return classes.join(" ");
}
```

### 3. `types/style-props.ts` - Shared Type Definitions

Central location for style prop types:

```tsx
export type SpaceValue =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12"
  | "16"
  | "20"
  | "24"
  | "auto"
  | "px"
  | "full";

export type SizeValue =
  | SpaceValue
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "1/2"
  | "1/3"
  | "2/3"
  | "1/4"
  | "3/4"
  | "screen"
  | "min"
  | "max"
  | "fit";

export interface StyleProps {
  // Margin
  m?: SpaceValue;
  mt?: SpaceValue;
  mr?: SpaceValue;
  mb?: SpaceValue;
  ml?: SpaceValue;
  mx?: SpaceValue;
  my?: SpaceValue;

  // Padding
  p?: SpaceValue;
  pt?: SpaceValue;
  pr?: SpaceValue;
  pb?: SpaceValue;
  pl?: SpaceValue;
  px?: SpaceValue;
  py?: SpaceValue;

  // Size
  w?: SizeValue;
  h?: SizeValue;
  minW?: SizeValue;
  minH?: SizeValue;
  maxW?: SizeValue;
  maxH?: SizeValue;
  fullWidth?: boolean;
  fullHeight?: boolean;
  fw?: boolean;
  fh?: boolean;

  // Display
  display?:
    | "none"
    | "block"
    | "inline"
    | "inline-block"
    | "flex"
    | "inline-flex"
    | "grid"
    | "inline-grid";
  flex?: string | number;

  // Position
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: SpaceValue;
  right?: SpaceValue;
  bottom?: SpaceValue;
  left?: SpaceValue;
  zIndex?: number;
}
```

## Component Categories & Current State

### Core Components (What We Have)

- ✅ Button - Needs refactor to new structure
- ✅ Card - Needs refactor
- ⚠️ Input - Missing, needs creation
- ✅ Select - Exists, needs refactor
- ✅ Switch - Exists, needs refactor
- ✅ Tooltip - Exists, needs refactor

### Layout Components

- ✅ Group - Exists, needs refactor
- ⚠️ Stack - Missing, needs creation
- ⚠️ Box - Missing, needs creation
- ⚠️ Container - Missing, needs creation

### Feedback Components

- ✅ Notifications - Exists as complex component
- ✅ Spinner - Embedded in other components, needs extraction
- ⚠️ Alert - Missing, needs creation
- ⚠️ Progress - Missing, needs creation

### Complex Components (Application-Specific)

These are highly specific to the Atomiton app:

- DesignAndAnimationSidebar
- SceneAndAssetsSidebar
- Export system
- Comment system
- PromptInput
- etc.

## Refactoring Strategy

### Phase 1: Core Infrastructure

1. Create `utils/cn.ts`
2. Create `utils/style-props.ts`
3. Create `types/style-props.ts`
4. Set up CVA
5. Update Vite showcase app to demonstrate new patterns

### Phase 2: Refactor Existing Core Components

Start with Button as the reference implementation:

1. Button - Full refactor to new structure
2. Card - Adapt to new patterns
3. Switch - Simplify and standardize
4. Select - Convert to compound pattern
5. Tooltip - Standardize API

### Phase 3: Create Missing Essentials

1. Input - With all common types
2. Box - Basic layout primitive
3. Stack - Vertical/horizontal layout
4. Alert - Info/warning/error states
5. Spinner - Standalone component

### Phase 4: Standardize Complex Components

Gradually refactor application-specific components to follow patterns where it makes sense.

## Best Practices

### DO ✓

- Keep files focused and single-purpose
- Use CVA for all variant logic
- Extract styles to `.styles.ts`
- Use data attributes for state
- Support style props on everything
- Forward refs properly
- Include proper TypeScript types

### DON'T ✗

- Mix styles with logic
- Use inline Tailwind strings in components
- Create deep prop nesting
- Forget accessibility attributes
- Skip the display name
- Use "is" prefix for booleans

## Example: The Bento Box Feel

When you open a well-organized component:

```tsx
// You immediately see:
// 1. Clean imports - grouped and organized
// 2. Clear prop extraction with style props
// 3. Logical prop destructuring
// 4. Clean className composition with cn()
// 5. Semantic HTML with data attributes
// 6. No inline styles or complex conditionals

// It feels like a bento box:
// - Each part in its compartment (types, styles, logic)
// - Clean separation of concerns
// - Visually organized and pleasing
// - Easy to understand what goes where
// - Quality ingredients, not filler
```

This is the standard every component should meet - the bento box standard.
