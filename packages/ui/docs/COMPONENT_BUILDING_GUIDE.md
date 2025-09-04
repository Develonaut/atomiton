# The Complete Component Building Guide

**This is your single source of truth for building components in the Atomiton UI framework.**

## Quick Links to Supporting Docs

- 📖 **[Component Philosophy](./COMPONENT_PHILOSOPHY.md)** - Why we build components this way (simplicity, style props, 3-5 variants max, API patterns)
- 🍱 **[Component Organization](./COMPONENT_ORGANIZATION.md)** - How to structure files (the "bento box" principle)
- 🗺️ **[Roadmap](../ROADMAP.md)** - What we're actually building and why

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Component Structure](#component-structure)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Naming Conventions](#naming-conventions)
5. [Essential Utilities](#essential-utilities)
6. [Common Patterns](#common-patterns)
7. [Testing & Documentation](#testing--documentation)
8. [Complete Example](#complete-example)
9. [Quality Checklist](#quality-checklist)
10. [React Best Practices](#react-best-practices-dan-abramov-style)
11. [Technical Implementation Details](#technical-implementation-details)
12. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

## Before You Start

### Our Core Philosophy

**Read [Component Philosophy](./COMPONENT_PHILOSOPHY.md) first!**

Key principles:

- **3-5 variants maximum** - Don't create 10+ variants
- **Style props over className** - `mb={4}` not `className="mb-4"`
- **Data attributes for state** - `data-state="loading"` not conditional classes
- **T-shirt sizes** - `xs`, `sm`, `md`, `lg`, `xl` for all sizing

### The "Bento Box" Principle 🍱

**See [Component Organization](./COMPONENT_ORGANIZATION.md) for details**

When you open a component, it should feel like opening a beautiful bento box:

- Each ingredient has its own compartment
- Nothing is mixed together or messy
- It's visually pleasing and organized
- You can immediately see and access everything

## Component Structure

```
components/
  Button/
    Button.tsx           # Main component logic
    Button.types.ts      # TypeScript interfaces
    Button.styles.ts     # CVA style variants
    Button.test.tsx      # Tests (if needed)
    index.ts            # Clean exports
```

**Note**: We use our Vite showcase app for documentation, not Storybook.

## Step-by-Step Guide

### Step 1: Define Types (`Button.types.ts`)

Start with clean, semantic interfaces:

```tsx
import type { StyleProps } from "@/types/style-props";
import type { VariantProps } from "class-variance-authority";
import type { buttonStyles } from "./Button.styles";

export interface ButtonProps
  extends StyleProps,
    VariantProps<typeof buttonStyles>,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Max 3-5 variants (philosophy!)
  variant?: "primary" | "secondary" | "ghost";

  // T-shirt sizes always
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  // Optional semantic tone
  tone?: "danger" | "success";

  // No "is" prefix (see naming conventions)
  loading?: boolean;
  disabled?: boolean;

  // Slots for composition
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Polymorphic component
  as?: React.ElementType;
}
```

### Step 2: Create Styles (`Button.styles.ts`)

Use CVA for clean variant management:

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
```

### Step 3: Implement Component (`Button.tsx`)

Clean, focused implementation:

```tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { extractStyleProps } from "@/utils/style-props";
import { Spinner } from "@/components/Spinner";
import type { ButtonProps } from "./Button.types";
import { buttonStyles } from "./Button.styles";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    // Extract style props cleanly
    const { styleClasses, otherProps } = extractStyleProps(props);

    // Destructure component props
    const {
      variant,
      size,
      tone,
      loading,
      disabled,
      leftIcon,
      rightIcon,
      as: Component = "button",
      className,
      children,
      ...htmlProps
    } = otherProps;

    const isDisabled = disabled || loading;

    return (
      <Component
        ref={ref}
        className={cn(
          "atomiton-button",
          buttonStyles({ variant, size }),
          tone && buttonStyles({ tone }),
          styleClasses,
          className,
        )}
        disabled={isDisabled}
        // Data attributes for state (not classes!)
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

### Step 4: Export (`index.ts`)

Simple, clean exports:

```tsx
export { Button } from "./Button";
export type { ButtonProps } from "./Button.types";
```

## Naming Conventions

### Props

```tsx
// ✅ GOOD
disabled?: boolean;       // NOT isDisabled
loading?: boolean;        // NOT isLoading
onClick?: () => void;     // NOT onClicked
leftIcon?: ReactNode;     // NOT startIcon
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // T-shirt sizes!

// ❌ BAD
isDisabled?: boolean;
isLoading?: boolean;
onClicked?: () => void;
startIcon?: ReactNode;
size?: 'small' | 'medium' | 'large';
```

### Data Attributes

```tsx
// Always use data attributes for state
data-variant="primary"
data-size="md"
data-state="loading"     // Always has value
data-disabled           // Present when true
```

### Compound Components

```tsx
Dialog.Trigger; // Opens dialog
Dialog.Content; // Container
Dialog.Header; // Header area
Dialog.Title; // Title text
Dialog.Body; // Content area
Dialog.Footer; // Footer area
Dialog.Close; // Close button
```

## Essential Utilities

### The `cn` Utility

**Location**: `src/utils/cn.ts`

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Style Props Extraction

**Location**: `src/utils/style-props.ts`

```tsx
import type { StyleProps } from "@/types/style-props";

export function extractStyleProps<T extends StyleProps>(
  props: T,
): {
  styleClasses: string;
  otherProps: Omit<T, keyof StyleProps>;
} {
  // Implementation that extracts mb, px, fw, etc.
  // and converts to Tailwind classes
}
```

### Style Props Type

**Location**: `src/types/style-props.ts`

```tsx
export interface StyleProps {
  // Margin
  m?: SpaceValue;
  mt?: SpaceValue;
  mb?: SpaceValue;
  // ... etc

  // Size
  fullWidth?: boolean;
  fullHeight?: boolean;
  fw?: boolean; // Shorthand
  fh?: boolean; // Shorthand

  // All the style props we support
}
```

## Common Patterns

### Compound Components

For complex components, use React Context:

```tsx
const DialogContext = createContext<DialogContextValue>({});

export function Dialog({ children, open, onClose }) {
  return (
    <DialogContext.Provider value={{ open, onClose }}>
      {children}
    </DialogContext.Provider>
  );
}

Dialog.Trigger = function DialogTrigger({ children }) {
  const { onOpen } = useContext(DialogContext);
  return <button onClick={onOpen}>{children}</button>;
};

Dialog.Content = DialogContent;
// etc...
```

### Polymorphic Components

Use the `as` prop pattern (not Radix's `asChild`):

```tsx
<Button as="a" href="/home">
  Go Home
</Button>

<Button as={Link} to="/dashboard">
  Dashboard
</Button>
```

### Controlled/Uncontrolled

Support both patterns:

```tsx
// Controlled
<Input value={value} onChange={setValue} />

// Uncontrolled
<Input defaultValue="initial" />
```

## Testing & Documentation

### Testing

We test user behavior, not implementation:

```tsx
test("button shows loading state", () => {
  render(<Button loading>Save</Button>);

  expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("button")).toHaveAttribute("data-state", "loading");
});
```

### Documentation

Use the Vite showcase app to demonstrate components:

```tsx
// app/buttons/page.tsx
export function ButtonsPage() {
  return (
    <div>
      <Section title="Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </Section>

      <Section title="Sizes">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </Section>
    </div>
  );
}
```

## Complete Example

Here's a complete Button component following all our patterns:

### `Button.types.ts`

```tsx
import type { StyleProps } from "@/types/style-props";
import type { VariantProps } from "class-variance-authority";
import type { buttonStyles } from "./Button.styles";

export interface ButtonProps
  extends StyleProps,
    VariantProps<typeof buttonStyles>,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "danger" | "success";
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
}
```

### `Button.styles.ts`

```tsx
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
```

### `Button.tsx`

```tsx
import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { extractStyleProps } from "@/utils/style-props";
import type { ButtonProps } from "./Button.types";
import { buttonStyles } from "./Button.styles";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { styleClasses, otherProps } = extractStyleProps(props);
    const {
      variant,
      size,
      tone,
      loading,
      disabled,
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
        disabled={disabled || loading}
        {...rest}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </Component>
    );
  },
);

Button.displayName = "Button";
```

### `index.ts`

```tsx
export { Button } from "./Button";
export type { ButtonProps } from "./Button.types";
```

## Quality Checklist

Before marking a component complete:

- [ ] Types defined in `.types.ts`
- [ ] Styles in `.styles.ts` using CVA
- [ ] Component uses `extractStyleProps`
- [ ] Data attributes for state
- [ ] Follows naming conventions
- [ ] Supports `as` prop if needed
- [ ] Accessible (ARIA, keyboard)
- [ ] Displayed in showcase app
- [ ] Maximum 3-5 variants
- [ ] Uses t-shirt sizes

## Need More Details?

- **Philosophy questions?** → [Component Philosophy](./COMPONENT_PHILOSOPHY.md)
- **Organization questions?** → [Component Organization](./COMPONENT_ORGANIZATION.md)
- **What to build?** → [Roadmap](../ROADMAP.md)

## React Best Practices (Dan Abramov Style)

### Simplicity Over Complexity

Components should be short, focused, and do one thing well:

```tsx
// ✅ Good - Simple and focused
function SaveButton({ onSave, isSaving }) {
  return (
    <button onClick={onSave} disabled={isSaving}>
      {isSaving ? "Saving..." : "Save"}
    </button>
  );
}

// ❌ Bad - Too many responsibilities
function SaveButton({ onSave, user, permissions, analytics, theme, ...props }) {
  // 100 lines of complex logic...
}
```

### Extract Complex Logic to Hooks

Keep components simple by moving logic to custom hooks:

```tsx
// ✅ Good - Logic extracted to hook
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <Profile user={user} />;
}

// Custom hook handles complexity
function useUser(userId) {
  // All the complex logic here
}
```

### Avoid Premature Abstraction

Start simple, refactor when patterns emerge:

```tsx
// Start with duplication
<Button onClick={handleSave}>Save</Button>
<Button onClick={handleCancel}>Cancel</Button>

// Extract when pattern is clear (not before!)
function ActionButtons({ onSave, onCancel }) {
  return (
    <>
      <Button onClick={onSave}>Save</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </>
  );
}
```

### Early Returns for Clarity

Handle edge cases first:

```tsx
function Comment({ comment }) {
  if (!comment) return null;
  if (comment.deleted) return <DeletedComment />;
  if (comment.hidden) return null;

  // Main logic here
  return <div>{comment.text}</div>;
}
```

## Technical Implementation Details

### The `cn` Utility Pattern

We use `clsx` + `tailwind-merge` for className management:

```tsx
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Why this approach?**

- `clsx` handles conditional classes efficiently (0.5KB)
- `tailwind-merge` resolves Tailwind conflicts intelligently
- Prevents style conflicts like `p-2 p-4` (keeps only `p-4`)

### CVA for Variant Management

Use class-variance-authority for clean variant styles:

```tsx
const buttonStyles = cva("base-styles", {
  variants: {
    variant: {
      /* ... */
    },
    size: {
      /* ... */
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

### Quick Reference Cheat Sheet

#### Component File Structure

```
Button/
  Button.tsx          # Component
  Button.types.ts     # Types
  Button.styles.ts    # CVA styles
  index.ts           # Exports
```

#### Essential Imports

```tsx
import { cn } from "@/utils/cn";
import { cva } from "class-variance-authority";
import { extractStyleProps } from "@/utils/style-props";
import type { StyleProps } from "@/types/style-props";
```

#### T-Shirt Sizes Always

```tsx
size?: "xs" | "sm" | "md" | "lg" | "xl";
```

#### Data Attributes Pattern

```tsx
data-variant={variant}
data-state={loading ? "loading" : "idle"}
data-disabled={disabled || undefined}
```

---

**Remember**: This guide is your single source of truth. When building components, start here and reference other docs as needed.
