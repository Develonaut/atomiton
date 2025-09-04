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
import type { VariantProps } from "@/utils/cva";
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
import { cva } from "@/utils/cva";

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

Clean, focused implementation using our `useComponent` hook:

```tsx
import { forwardRef } from "react";
import {
  useComponent,
  createPropNormalizer,
  normalizers,
} from "@/utils/useComponent";
import { Spinner } from "@/components/Spinner";
import type { ButtonProps } from "./Button.types";
import { buttonStyles } from "./Button.styles";

// Create prop normalizer for common patterns
const normalizeButtonProps = createPropNormalizer([
  normalizers.fullWidth, // Handles fullWidth/fw
  normalizers.fullHeight, // Handles fullHeight/fh
  normalizers.icons, // Handles leftIcon/startIcon, rightIcon/endIcon
]);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (incomingProps, ref) => {
    // Extract component-specific props
    const {
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...restProps
    } = incomingProps;

    // Use the unified hook - handles EVERYTHING
    const { classes, props, cx } = useComponent({
      props: restProps,
      name: "Button", // Generates 'atomiton-button' class
      variants: buttonStyles({ variant, size }),
      normalizeProps: normalizeButtonProps,
    });

    // Extract normalized props
    const { leftIcon, rightIcon } = props;
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        // Data attributes for state
        data-variant={variant}
        data-size={size}
        data-state={loading ? "loading" : "idle"}
        data-disabled={isDisabled || undefined}
        aria-busy={loading}
        {...props}
      >
        {loading && <Spinner size={size} />}
        {leftIcon && <span>{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
```

#### The `useComponent` Hook Pattern

The `useComponent` hook is our unified solution for component setup:

```tsx
const { classes, props, cx } = useComponent({
  props: incomingProps,
  name: "Button", // Component name for namespacing
  variants: buttonVariants(), // CVA variants
  normalizeProps: normalizer, // Optional prop normalization
});
```

What it does:

1. **Extracts style props** - Removes mb, px, etc. and converts to classes
2. **Handles prop normalization** - Manages shorthands and aliases
3. **Composes className** - Merges base, variants, style props, and user className
4. **Namespaces component** - Adds `atomiton-{name}` class
5. **Returns clean props** - Props without style/className pollution

Benefits:

- ✅ **Single hook at the top** - Clean Material UI-style pattern
- ✅ **All styling logic unified** - No scattered cn() calls
- ✅ **Prop normalization built-in** - Handle shorthands cleanly
- ✅ **Consistent across components** - Same pattern everywhere
- ✅ **TypeScript friendly** - Full type inference
- ✅ **cx utility included** - For conditional classes when needed

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
import type { VariantProps } from "@/utils/cva";
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
import { cva } from "@/utils/cva";

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

## TypeScript Best Practices

### No `any` Types - Ever

We enforce strict typing throughout the codebase:

```tsx
// ❌ BAD - Never use any
const handleClick = (event: any) => {
  /* ... */
};
const data: any = fetchData();
ref: React.Ref<any>;

// ✅ GOOD - Use proper types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  /* ... */
};
const data: UserData = fetchData();
ref: React.ComponentPropsWithRef < E > ["ref"];
```

### Use Type Inference Where Possible

Let TypeScript infer types when obvious:

```tsx
// ❌ Unnecessary type annotation
const isDisabled: boolean = loading || disabled;
const variant: string = "primary";

// ✅ Let TypeScript infer
const isDisabled = loading || disabled;
const variant = "primary";
```

### Prefer `type` over `interface` for Component Props

```tsx
// ✅ GOOD - Use type for props
export type ButtonProps = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
} & StyleProps;

// Also fine for complex types
export interface ComplexFormState {
  fields: Record<string, FieldState>;
  errors: ValidationError[];
}
```

### Always Type Event Handlers

```tsx
// ✅ Properly typed events
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
```

## React Best Practices (Dan Abramov Style)

### Extract Logic from Hooks for Testability

Hooks are difficult to test. Extract all business logic into pure functions:

```tsx
// ❌ BAD - Logic trapped in a hook, hard to test
function useUserValidation(user) {
  return useMemo(() => {
    if (!user.email) return { valid: false, error: "Email required" };
    if (!user.email.includes("@"))
      return { valid: false, error: "Invalid email" };
    if (user.age < 18) return { valid: false, error: "Must be 18+" };
    return { valid: true };
  }, [user]);
}

// ✅ GOOD - Logic in pure function, easy to test
export function validateUser(user) {
  if (!user.email) return { valid: false, error: "Email required" };
  if (!user.email.includes("@"))
    return { valid: false, error: "Invalid email" };
  if (user.age < 18) return { valid: false, error: "Must be 18+" };
  return { valid: true };
}

function useUserValidation(user) {
  return useMemo(() => validateUser(user), [user]);
}
```

Benefits:

- ✅ Pure functions are trivial to unit test
- ✅ No need for React testing utilities
- ✅ Logic can be reused outside of React
- ✅ Easier to reason about and debug

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
import {
  useComponent,
  createPropNormalizer,
  normalizers,
} from "@/utils/useComponent";
import { cva } from "@/utils/cva";
import type { VariantProps } from "@/utils/cva";
import type { ComponentProps } from "@/utils/useComponent";
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
