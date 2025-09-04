# Quick Reference

## Building a Component - Complete Checklist

### 1. Philosophy Check ✓

- [ ] **Max 3-5 variants** (primary, secondary, ghost)
- [ ] **Essential props only** (variant, size, disabled, loading)
- [ ] **Style props included** (mb, px, py, etc.)
- [ ] **Data attributes for state** (data-state="loading")

### 2. File Structure

```
components/Button/
  Button.tsx          # Main component
  Button.types.ts     # TypeScript interfaces
  Button.styles.ts    # CVA styles
  Button.test.tsx     # Tests
  Button.stories.tsx  # Storybook
  index.ts           # Exports
  README.md          # Docs
```

### 3. Component Template

```tsx
// Button.types.ts
import { StyleProps } from "@/types";

export interface ButtonProps extends StyleProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl"; // T-shirt sizes
  tone?: "danger" | "success";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: React.ElementType;
  children?: ReactNode;
}

// Button.styles.ts
import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  "inline-flex items-center justify-center font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

// Button.tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { extractStyleProps } from "@/utils/styleProps";
import { ButtonProps } from "./Button.types";
import { buttonStyles } from "./Button.styles";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { styleClasses, otherProps } = extractStyleProps(props);
    const {
      variant,
      size,
      tone,
      disabled,
      loading,
      leftIcon,
      rightIcon,
      as: Component = "button",
      className,
      children,
      ...rest
    } = otherProps;

    return (
      <Component
        ref={ref}
        className={cn(
          "atomiton-button",
          buttonStyles({ variant, size }),
          tone && `button--${tone}`,
          styleClasses,
          className,
        )}
        data-variant={variant}
        data-size={size}
        data-state={loading ? "loading" : "idle"}
        data-tone={tone}
        data-disabled={disabled || undefined}
        disabled={disabled || loading}
        aria-busy={loading}
        {...rest}
      >
        {loading && <Spinner className="mr-2" />}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Component>
    );
  },
);

Button.displayName = "Button";
```

## Naming Conventions

### Props

```tsx
// Boolean props - no "is" prefix
disabled  ✓   isDisabled  ✗
loading   ✓   isLoading   ✗

// Event handlers - present tense
onClick   ✓   onClicked   ✗
onChange  ✓   onChanged   ✗

// Slots - position/purpose
leftIcon  ✓   startIcon   ✗
rightIcon ✓   endIcon     ✗
```

### Prop Values

```tsx
// Sizes - t-shirt sizing
'xs' | 'sm' | 'md' | 'lg' | 'xl'  ✓
'small' | 'medium' | 'large'      ✗

// Variants - semantic
'primary' | 'secondary'        ✓
'blue' | 'gray'               ✗
```

### Data Attributes

```tsx
// State representation
data-state="loading"     // Always has value
data-disabled           // Present when true
data-variant="primary"  // Component variant
data-size="md"          // Component size (t-shirt)
```

## Style Props Implementation

```tsx
// Supported props
mb={4}        // margin-bottom: 1rem
px={6}        // padding-x: 1.5rem
w="full"      // width: 100%
display="flex" // display: flex
fullWidth     // width: 100%
fw            // shorthand for fullWidth
fullHeight    // height: 100%
fh            // shorthand for fullHeight

// Responsive
mb={{ base: 2, md: 4 }}  // Responsive margins
```

## Compound Components

```tsx
// Naming pattern
Dialog.Trigger; // Opens dialog
Dialog.Content; // Main container
Dialog.Header; // Header area
Dialog.Title; // Title text
Dialog.Body; // Content area
Dialog.Footer; // Footer area
Dialog.Close; // Close button
```

## CSS Classes & Variables

```css
/* Component classes */
.atomiton-button
.atomiton-button__icon
.atomiton-button__label

/* CSS Variables */
--color-primary: #007bff;
--spacing-sm: 0.5rem;
--button-height-medium: 2.5rem;
```

## Testing Pattern

```tsx
// Test user behavior, not implementation
test("button shows loading state", () => {
  render(<Button loading>Save</Button>);

  expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("button")).toHaveAttribute("data-state", "loading");
});
```

## Common Utilities

```tsx
// cn utility - combines clsx + tailwind-merge
import { cn } from "@/utils/cn";
cn("base", condition && "conditional", className);

// extractStyleProps - handles style props
import { extractStyleProps } from "@/utils/styleProps";
const { styleClasses, otherProps } = extractStyleProps(props);
```

## Component Categories

### Core (5-10 components)

- Button
- Input
- Card
- Dialog
- Select

### Layout (5-8 components)

- Box
- Stack
- Grid
- Container

### Feedback (4-6 components)

- Alert
- Toast
- Spinner
- Progress

## Do's and Don'ts

### DO ✓

- Use data attributes for state
- Keep variants under 5
- Support style props
- Provide `as` prop for polymorphism
- Forward refs
- Include ARIA attributes

### DON'T ✗

- Create 10+ variants
- Use "is" prefix for booleans
- Forget accessibility
- Over-abstract the API
- Build unused features
- Mix visual and semantic variants

## Example Usage

```tsx
// Simple
<Button>Click me</Button>

// With props
<Button
  variant="primary"
  size="lg"
  mb={4}
  loading
>
  Save Changes
</Button>

// Polymorphic
<Button as="a" href="/home">
  Go Home
</Button>

// With icons
<Button leftIcon={<SaveIcon />}>
  Save Document
</Button>

// Custom styling
<Button
  className="custom-gradient"
  px={8}
  data-custom="value"
>
  Special Button
</Button>
```
