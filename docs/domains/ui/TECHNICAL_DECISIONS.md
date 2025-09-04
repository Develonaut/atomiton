# Technical Decisions

## Classname Utility: The `cn` Pattern

### Decision: clsx + tailwind-merge

We use a combination of `clsx` and `tailwind-merge` to create our `cn` utility function.

### Implementation

```tsx
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Why This Approach?

1. **`clsx`** handles conditional classes efficiently
   - Smallest and fastest utility (0.5KB)
   - Supports objects, arrays, strings, and conditionals
   - Better performance than `classnames`

2. **`tailwind-merge`** resolves Tailwind conflicts
   - Intelligently merges conflicting Tailwind classes
   - Essential for component libraries where users pass className props
   - Prevents style conflicts like `p-2 p-4` (keeps only `p-4`)

### Usage Examples

```tsx
// Basic usage
cn("base-class", condition && "conditional-class");

// With variants
cn(
  "inline-flex items-center",
  variants[variant],
  sizes[size],
  className, // User overrides last
);

// Object syntax (from clsx)
cn({
  "bg-primary": isPrimary,
  "bg-secondary": !isPrimary,
  "opacity-50": disabled,
});

// Array syntax
cn(["base", condition ? "true-class" : "false-class", ["nested", "classes"]]);
```

### Performance Considerations

- The `cn` function adds ~17.5KB to bundle (mostly tailwind-merge)
- Execution time is negligible (< 16ms for 1000 calls)
- Caching in tailwind-merge optimizes repeated calls
- Worth the cost for proper Tailwind conflict resolution

### Alternative Considered

We considered using just `clsx` alone for performance, but the lack of Tailwind conflict resolution would lead to styling bugs when users pass conflicting className props to our components.

## Component Polymorphism: The `as` Prop

### Decision: Material UI's `as` Pattern over Radix's `asChild`

We use the `as` prop pattern for polymorphic components instead of Radix's `asChild` pattern.

### Implementation

```tsx
// Type-safe polymorphic component
type ButtonProps<T extends React.ElementType = 'button'> = {
  as?: T;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
} & Omit<React.ComponentPropsWithoutRef<T>, 'as'>;

function Button<T extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'medium',
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';

  return (
    <Component
      className={cn(
        buttonStyles({ variant, size }),
        className
      )}
      {...props}
    />
  );
}

// Usage
<Button as="a" href="/home">Home</Button>
<Button as={Link} to="/dashboard">Dashboard</Button>
```

### Why `as` over `asChild`?

1. **Simpler Mental Model**: Direct prop is easier to understand
2. **Better TypeScript**: Full type inference for the rendered element
3. **Industry Standard**: Used by Material UI, Chakra, and others
4. **No Additional Dependencies**: No need for `@radix-ui/react-slot`

### Type Safety

The `as` prop maintains full type safety:

```tsx
// TypeScript knows these props
<Button as="a" href="/home">Home</Button> // ✅ href is valid
<Button as="a" to="/home">Home</Button>   // ❌ TypeScript error

// Custom components work too
<Button as={Link} to="/home">Home</Button> // ✅ to is valid
<Button as={Link} href="/home">Home</Button> // ❌ TypeScript error
```

## Build-Time CSS with CVA

### Decision: class-variance-authority for Variant Management

We use CVA (class-variance-authority) to manage component variants at build time.

### Implementation

```tsx
import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  // Base styles
  "inline-flex items-center justify-center font-medium",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent",
      },
      size: {
        small: "h-8 px-3 text-sm",
        medium: "h-10 px-4",
        large: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);
```

### Why CVA?

1. **Type-Safe Variants**: Full TypeScript support
2. **Build-Time Optimization**: No runtime overhead
3. **Composable**: Works perfectly with our cn utility
4. **Developer Experience**: Great autocomplete and IntelliSense

## Accessibility: React Aria Components

### Decision: Use React Aria for Complex Components

For complex interactive components (datepickers, comboboxes, etc.), we'll use React Aria Components.

### Why React Aria?

1. **Battle-Tested**: Used by Adobe in production
2. **Fully Accessible**: WCAG 2.1 AAA compliant
3. **Headless**: Style with Tailwind
4. **Comprehensive**: Handles all edge cases

### Implementation Strategy

```tsx
// For simple components - build ourselves
<Button />; // We handle ARIA

// For complex components - use React Aria
import { DatePicker } from "react-aria-components";

// Style with Tailwind
<DatePicker className={cn("our-styles")} />;
```

## Bundle Size Strategy

### Target: < 50KB for Core Components

Our strategy to achieve this:

1. **Tree-Shaking**: Each component in separate file
2. **Dynamic Imports**: Lazy load heavy components
3. **No Runtime CSS**: Tailwind at build time
4. **Selective Dependencies**:
   - Essential: clsx, tailwind-merge, cva
   - Optional: React Aria (only for complex components)

### Measurement

```bash
# Analyze bundle
npm run build
npm run analyze

# Target sizes
- Button: < 2KB
- Card: < 1KB
- Dialog: < 5KB
- Select: < 8KB
- DatePicker: < 20KB (with React Aria)
```
