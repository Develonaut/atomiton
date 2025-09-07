# Component Philosophy

## Table of Contents

- [Core Principle: Simplicity Over Options](#core-principle-simplicity-over-options)
- [Style Props System](#style-props-system)
- [Component Categories](#component-categories)
- [The 80/20 Rule](#the-8020-rule)
- [Composition Patterns](#composition-patterns)
- [Customization Strategy](#customization-strategy)
- [Real-World Examples](#real-world-examples)
- [Implementation Checklist](#implementation-checklist)
- [Summary](#summary)
- [API Design Patterns](#api-design-patterns)
  - [Compound Components with Dot Notation](#compound-components-with-dot-notation)
  - [Implicit State Sharing](#implicit-state-sharing)
  - [Polymorphic Components](#polymorphic-components-with-as-prop)
  - [Data Attributes for State](#data-attributes-for-state)
  - [Class Variance Authority (CVA)](#class-variance-authority-cva)
  - [Consistent Naming Conventions](#consistent-naming-conventions)
- [Design Tokens System](#design-tokens-system)

## Core Principle: Simplicity Over Options

### The Problem with Too Many Variants

Many UI libraries suffer from variant explosion:

```tsx
// ❌ BAD - Too many variants
<Button
  variant="solid-primary-large-rounded-elevated-with-icon"
/>

// ❌ BAD - 10+ variants
variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline' |
         'link' | 'subtle' | 'filled' | 'light' | 'default' | 'text' | ...
```

### Our Approach: Essential Variants Only

```tsx
// ✅ GOOD - Only what's actually used
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';  // 90% of use cases
  tone?: 'danger' | 'success';                  // Semantic states when needed
  size?: 'small' | 'medium' | 'large';          // Standard sizing
}

// Usage
<Button variant="primary">Save</Button>
<Button variant="ghost" tone="danger">Delete</Button>
```

### Why This Works

1. **3-5 variants max** - Covers 95% of real use cases
2. **Semantic tones** - Separate from visual variants
3. **Composition over configuration** - Use multiple props, not compound variants
4. **Custom escape hatch** - Allow className/style for edge cases

## Style Props System

### The Power of Style Shortcuts

Instead of forcing users to write className strings, provide intuitive style props:

```tsx
// ✅ GOOD - Style props for common needs
<Card mb={4} px={6} py={4} mt={{ base: 2, md: 4 }}>
  Content
</Card>

// Translates to:
<Card className="mb-4 px-6 py-4 mt-2 md:mt-4">
  Content
</Card>
```

### Our Style Props API

```tsx
interface StyleProps {
  // Margin
  m?: SpaceValue; // margin
  mt?: SpaceValue; // margin-top
  mr?: SpaceValue; // margin-right
  mb?: SpaceValue; // margin-bottom
  ml?: SpaceValue; // margin-left
  mx?: SpaceValue; // margin-horizontal
  my?: SpaceValue; // margin-vertical

  // Padding
  p?: SpaceValue; // padding
  pt?: SpaceValue; // padding-top
  pr?: SpaceValue; // padding-right
  pb?: SpaceValue; // padding-bottom
  pl?: SpaceValue; // padding-left
  px?: SpaceValue; // padding-horizontal
  py?: SpaceValue; // padding-vertical

  // Layout
  w?: SizeValue; // width
  h?: SizeValue; // height
  minW?: SizeValue; // min-width
  minH?: SizeValue; // min-height
  maxW?: SizeValue; // max-width
  maxH?: SizeValue; // max-height
  fullWidth?: boolean; // width: 100%
  fullHeight?: boolean; // height: 100%
  fw?: boolean; // shorthand for fullWidth
  fh?: boolean; // shorthand for fullHeight

  // Display
  display?: "none" | "block" | "inline" | "flex" | "grid";
  flex?: string | number; // flex shorthand

  // Position
  position?: "relative" | "absolute" | "fixed" | "sticky";
  top?: SpaceValue;
  right?: SpaceValue;
  bottom?: SpaceValue;
  left?: SpaceValue;
  zIndex?: number;
}

// Responsive values
type SpaceValue =
  | number // Translates to spacing scale: 1 = 0.25rem, 4 = 1rem
  | string // Raw value: "10px", "2rem"
  | { base: number; sm?: number; md?: number; lg?: number; xl?: number };
```

### Implementation

```tsx
// utils/styleProps.ts
const SPACE_SCALE = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
};

function extractStyleProps<T extends StyleProps>(props: T) {
  const {
    m,
    mt,
    mr,
    mb,
    ml,
    mx,
    my,
    p,
    pt,
    pr,
    pb,
    pl,
    px,
    py,
    w,
    h,
    minW,
    minH,
    maxW,
    maxH,
    fullWidth,
    fullHeight,
    fw,
    fh,
    display,
    flex,
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    ...rest
  } = props;

  const styles = [];

  // Margin
  if (m !== undefined) styles.push(`m-${m}`);
  if (mt !== undefined) styles.push(`mt-${mt}`);
  if (mx !== undefined) styles.push(`mx-${mx}`);
  // ... etc

  // Full width/height
  if (fullWidth || fw) styles.push("w-full");
  if (fullHeight || fh) styles.push("h-full");

  return {
    styleClasses: styles.join(" "),
    otherProps: rest,
  };
}

// Component usage
function Button(props: ButtonProps & StyleProps) {
  const { styleClasses, otherProps } = extractStyleProps(props);
  const { variant, children, className, ...rest } = otherProps;

  return (
    <button
      className={cn(buttonStyles({ variant }), styleClasses, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
```

## Component Categories

### 1. Core Components (5-10 total)

The essentials every app needs:

- `Button` - Primary, secondary, ghost
- `Input` - Text, number, password
- `Card` - Container with optional header/footer
- `Dialog` - Modal dialogs
- `Select` - Dropdown selection

### 2. Layout Components (5-8 total)

Structure and spacing:

- `Box` - Basic container with style props
- `Stack` - Vertical/horizontal stacking
- `Grid` - CSS Grid wrapper
- `Container` - Max-width container
- `Divider` - Visual separator

### 3. Feedback Components (4-6 total)

User feedback and status:

- `Alert` - Info, success, warning, error
- `Toast` - Temporary notifications
- `Spinner` - Loading indicator
- `Progress` - Progress bars

### 4. Data Display (5-8 total)

Showing information:

- `Table` - Data tables
- `Badge` - Status indicators
- `Avatar` - User images
- `Tooltip` - Hover information

## The 80/20 Rule

### Focus on the 80% Use Case

```tsx
// ✅ GOOD - Covers most needs
<Button variant="primary" size="medium" mb={2}>
  Save Changes
</Button>

// For the 20% edge cases, provide escape hatches
<Button
  variant="primary"
  className="custom-gradient-bg"  // Escape hatch
  style={{ '--custom-var': 'value' }}  // CSS variables
>
  Special Button
</Button>
```

### Don't Build What They Won't Use

Common over-engineering mistakes:

- 15 button variants (users only use 3)
- Complex compound variants
- Deep prop nesting
- Over-abstracted APIs

## Composition Patterns

### Simple Composition Wins

```tsx
// ✅ GOOD - Clear, composable
<Card>
  <Card.Header>
    <h3>Title</h3>
    <Button variant="ghost" size="small">Edit</Button>
  </Card.Header>
  <Card.Body>
    Content
  </Card.Body>
</Card>

// ❌ BAD - Over-configured
<Card
  title="Title"
  titleSize="large"
  showEditButton={true}
  editButtonVariant="ghost"
  editButtonSize="small"
  onEditClick={handleEdit}
>
  Content
</Card>
```

## Customization Strategy

### Three Levels of Customization

1. **Props** - For common cases

   ```tsx
   <Button variant="primary" size="large" />
   ```

2. **Style Props** - For spacing and layout

   ```tsx
   <Button mb={4} px={8} />
   ```

3. **className/style** - For everything else
   ```tsx
   <Button className="special-case" style={{ "--glow": "0 0 20px blue" }} />
   ```

## Real-World Examples

### What Actually Gets Used

Based on analysis of production codebases:

**Button Usage:**

- `variant="primary"` - 45%
- `variant="secondary"` - 30%
- `variant="ghost"` - 20%
- Everything else - 5%

**Size Usage:**

- `size="medium"` (default) - 70%
- `size="small"` - 20%
- `size="large"` - 10%

**Style Props Usage:**

- Margin props (`mb`, `mt`, etc.) - 60%
- Padding props (`px`, `py`, etc.) - 30%
- Width/height - 10%

## Implementation Checklist

When building a component, ask:

- [ ] Do we really need this variant?
- [ ] Can this be composed from simpler parts?
- [ ] Are we solving a real problem or imagined one?
- [ ] Will developers actually use this prop?
- [ ] Can style props handle this instead?
- [ ] Is the API intuitive without documentation?

## Summary

Our philosophy prioritizes:

1. **Simplicity** - Fewer, better options
2. **Composition** - Build complex from simple
3. **Style Props** - Powerful shortcuts for common needs
4. **Escape Hatches** - className/style for edge cases
5. **Real Usage** - Build what's actually needed

Remember: Every variant, prop, and option adds complexity. Default to simple, add complexity only when proven necessary.

## API Design Patterns

### Compound Components with Dot Notation

Related components are grouped using dot notation, creating clear hierarchy and improving discoverability.

```tsx
// ✅ Good - Clear relationship between components
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Close />
    </Dialog.Header>
    <Dialog.Body>Content</Dialog.Body>
  </Dialog.Content>
</Dialog>

// ❌ Bad - Flat structure, unclear relationships
<DialogTrigger />
<DialogContent />
<DialogHeader />
```

### Implicit State Sharing

Compound components share state through React Context, eliminating prop drilling.

```tsx
// Parent manages state, children consume it implicitly
<Select value={value} onChange={setValue}>
  <Select.Trigger />
  <Select.Options>
    <Select.Option value="1">One</Select.Option>
  </Select.Options>
</Select>
```

### Polymorphic Components with `as` Prop

Components can render as different HTML elements or custom components.

```tsx
<Button as="a" href="/home">Home</Button>
<Button as={Link} to="/about">About</Button>
<Button as="div" role="button">Div Button</Button>
```

### Event Handler Naming Conventions

Always prefix event handlers with `handle` followed by the event name:

```tsx
// ✅ Correct event handler naming
const handleOnClick = (event: React.MouseEvent) => {
  // handler logic
};

const handleOnDoubleClick = (event: React.MouseEvent) => {
  // handler logic
};

const handleOnChange = (value: string) => {
  // handler logic
};

// ❌ Avoid these patterns
const onClick = () => {}; // Missing 'handle' prefix
const handleClick = () => {}; // Missing 'On' in event name
const onClickHandler = () => {}; // Redundant 'Handler' suffix
```

This convention ensures:

- **Consistency**: All handlers follow the same pattern
- **Clarity**: Immediately identifiable as event handlers
- **Searchability**: Easy to find all handlers with `handle*` search

### Data Attributes for State

Use data attributes instead of conditional classes for state visualization. This is a powerful pattern that solves multiple problems elegantly.

#### Why Data Attributes?

**1. Separation of Concerns**

Data attributes separate state representation from styling implementation:

```tsx
// ❌ BAD - Logic mixed with styling
<button className={cn(
  "base-button",
  isLoading && "opacity-50 cursor-wait pointer-events-none",
  isDisabled && "opacity-30 cursor-not-allowed",
  isPressed && "scale-95 shadow-inner",
  variant === "primary" && isHovered && "bg-primary-dark"
)}>

// ✅ GOOD - Clean state representation
<button
  data-state={isLoading ? "loading" : "idle"}
  data-disabled={isDisabled || undefined}
  data-pressed={isPressed || undefined}
  data-variant={variant}
  className="base-button"
>
```

**2. CSS Becomes Self-Documenting**

Styles clearly show what states they respond to:

```css
/* Clear intent - this styles the loading state */
[data-state="loading"] {
  cursor: wait;
  opacity: 0.7;
  pointer-events: none;
}

/* Compound state targeting is intuitive */
[data-variant="primary"][data-state="loading"] {
  background: var(--primary-muted);
}

/* vs conditional classes - what triggers these? */
.opacity-50 {
}
.cursor-wait {
}
.pointer-events-none {
}
```

**3. Better DevTools Experience**

Data attributes are visible in the DOM, making debugging easier:

```html
<!-- You can immediately see all states in DevTools -->
<button
  data-variant="primary"
  data-size="md"
  data-state="loading"
  data-disabled
  class="button"
>
  Save
</button>
```

**4. Prevents Class Name Conflicts**

No collision between state classes and utility classes:

```tsx
// ❌ BAD - Which "disabled" wins? Utility or component class?
<button className={cn(
  "button",
  disabled && "disabled", // Component's disabled class
  "disabled:opacity-50"    // Tailwind's disabled utility
)}>

// ✅ GOOD - Clear separation
<button
  data-disabled={disabled || undefined}
  className="button"
  disabled={disabled}
>
```

**5. Framework Agnostic**

Data attributes work everywhere - CSS Modules, Tailwind, Styled Components:

```scss
// Sass/CSS Modules
.button {
  &[data-state="loading"] {
    cursor: wait;
  }
}

// Tailwind with arbitrary selectors
class="[[data-state=loading]]:cursor-wait"

// Styled Components
const Button = styled.button`
  &[data-state="loading"] {
    cursor: wait;
  }
`;
```

**6. Type-Safe State Representation**

Easy to type and validate states:

```tsx
type ButtonState = "idle" | "loading" | "success" | "error";
type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  state?: ButtonState;
  variant?: ButtonVariant;
}

// Component guarantees valid data attributes
<button
  data-state={state}
  data-variant={variant}
>
```

**7. Better for Testing**

Test state directly without CSS knowledge:

```tsx
// ✅ Clear what we're testing
expect(button).toHaveAttribute("data-state", "loading");
expect(button).toHaveAttribute("data-disabled");

// ❌ Testing implementation details
expect(button).toHaveClass("opacity-50");
expect(button).toHaveClass("cursor-wait");
```

#### Implementation Pattern

```tsx
// In your component
export const Button = ({
  variant,
  size,
  loading,
  disabled,
  pressed,
  ...props
}) => {
  return (
    <button
      {...props}
      // Always-present attributes with values
      data-variant={variant}
      data-size={size}
      data-state={loading ? "loading" : pressed ? "pressed" : "idle"}
      // Boolean attributes - present when true, absent when false
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
      // Compound states for complex scenarios
      data-interaction={disabled ? "disabled" : loading ? "loading" : "enabled"}
      className={cn(buttonStyles, props.className)}
      disabled={disabled || loading}
      aria-busy={loading}
    />
  );
};
```

#### CSS Patterns

```css
/* Single state */
[data-state="loading"] {
  cursor: wait;
}

/* Boolean presence */
[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}

/* Specific variant in specific state */
[data-variant="primary"][data-state="pressed"] {
  transform: scale(0.98);
}

/* Combining multiple attributes */
[data-size="lg"][data-variant="primary"][data-loading] {
  /* Large primary button while loading */
}

/* Using with Tailwind's arbitrary selectors */
.button {
  @apply [[data-state=loading]]:animate-pulse;
  @apply [[data-disabled]]:cursor-not-allowed;
}
```

#### Best Practices

1. **Use `undefined` for boolean attributes** - This removes the attribute when false
2. **Always include variant/size as values** - Even when they don't change
3. **Keep state values semantic** - "loading", not "state-1"
4. **Document your data attributes** - Make them part of your component's API
5. **Be consistent** - All components should follow the same pattern

### Class Variance Authority (CVA)

CVA is our chosen solution for managing component variants and their associated styles. It's a powerful pattern that solves the complexity of variant management elegantly.

#### Prop Resolvers: The Foundation of Our System

Before diving into CVA, it's important to understand **prop resolvers** - the core pattern that powers our component system.

**What is a Prop Resolver?**

A prop resolver is a pure function that transforms one set of props into another. It's the foundation for handling prop aliases, defaults, and transformations:

```tsx
// Simple prop resolver
type PropResolver<T = any> = (props: T) => T;

// Example: System props resolver
const resolveSystemProps = (props) => {
  const resolved = { ...props };

  // Transform shorthand props to full names
  if (props.m !== undefined) {
    resolved.margin = resolved.margin || props.m;
    delete resolved.m;
  }

  if (props.px !== undefined) {
    resolved.paddingX = resolved.paddingX || props.px;
    delete resolved.px;
  }

  return resolved;
};

// Usage
const originalProps = { m: 4, px: 2, className: "custom" };
const resolvedProps = resolveSystemProps(originalProps);
// Result: { margin: 4, paddingX: 2, className: "custom" }
```

**Composing Multiple Resolvers**

Our system allows composing multiple resolvers for complex transformations:

```tsx
// Compose multiple resolvers
const composePropResolvers = (...resolvers) => {
  return (props) => {
    let resolved = props;
    for (const resolver of resolvers) {
      resolved = resolver(resolved);
    }
    return resolved;
  };
};

// Create a custom resolver pipeline
const myComponentResolver = composePropResolvers(
  resolveSystemProps, // Handle m, px, etc.
  resolveLoadingState, // loading → disabled
  resolveIconProps, // startIcon → leftIcon
);
```

**Standard System Props Map**

We maintain a centralized map of standard prop transformations that all components support:

```tsx
export const SYSTEM_PROPS_MAP = {
  // Layout shorthands
  w: "width",
  h: "height",
  fullW: "fullWidth",
  fullH: "fullHeight",

  // Spacing shorthands
  m: "margin",
  mt: "marginTop",
  px: "paddingX",
  py: "paddingY",

  // Typography shorthands
  fs: "fontSize",
  fw: "fontWeight",

  // Icon aliases
  startIcon: "leftIcon",
  endIcon: "rightIcon",
} as const;
```

**Why This Pattern Works**

1. **Pure Functions**: Easy to test and reason about
2. **Composable**: Mix and match different resolvers
3. **Type Safe**: Full TypeScript support
4. **Consistent**: Same prop transformations across all components
5. **Flexible**: Add custom resolvers for specific components

#### What is CVA?

Class Variance Authority (CVA) is a library that provides a declarative API for managing component variants. Think of it as a "style recipe generator" - you define the ingredients (variants) and CVA handles creating the right combination of classes based on the props you pass.

```tsx
// Without CVA - Manual variant management is error-prone
const getButtonClasses = (variant, size, disabled) => {
  let classes = "base-button ";

  if (variant === "primary") {
    classes += "bg-blue-500 text-white hover:bg-blue-600 ";
  } else if (variant === "secondary") {
    classes += "bg-gray-200 text-gray-900 hover:bg-gray-300 ";
  }

  if (size === "sm") {
    classes += "h-8 px-3 text-sm ";
  } else if (size === "lg") {
    classes += "h-12 px-6 text-lg ";
  }

  if (disabled) {
    classes += "opacity-50 cursor-not-allowed ";
  }

  return classes.trim();
};

// With CVA - Declarative and maintainable
const buttonVariants = cva(
  "base-button", // Base classes applied to all variants
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
```

#### Why CVA?

**1. Eliminates Conditional Class Logic**

Without CVA, components become cluttered with conditional logic:

```tsx
// ❌ BAD - Conditional logic mixed with rendering
const Button = ({
  variant,
  size,
  fullWidth,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-900",
        variant === "ghost" && "bg-transparent hover:bg-gray-100",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-base",
        size === "lg" && "h-12 px-6 text-lg",
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
};

// ✅ GOOD - Clean separation of concerns
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-200 text-gray-900",
        ghost: "bg-transparent hover:bg-gray-100",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      fullWidth: {
        true: "w-full",
      },
    },
  },
);

const Button = ({ variant, size, fullWidth, className, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
};
```

**2. Type Safety Out of the Box**

CVA automatically generates TypeScript types from your variant configuration:

```tsx
// CVA infers these types automatically
type ButtonVariants = VariantProps<typeof buttonVariants>;
// Results in:
// {
//   variant?: "primary" | "secondary" | "ghost" | null
//   size?: "sm" | "md" | "lg" | null
//   fullWidth?: boolean | null
// }

// Your component props are automatically typed
interface ButtonProps extends ButtonVariants {
  children: React.ReactNode;
}

// TypeScript will error on invalid variants
<Button variant="invalid" /> // ❌ Type error!
<Button variant="primary" /> // ✅ Valid
```

**3. Compound Variants for Complex States**

CVA handles complex variant combinations elegantly:

```tsx
const buttonVariants = cva("base", {
  variants: {
    variant: {
      primary: "bg-blue-500",
      secondary: "bg-gray-200",
      danger: "bg-red-500",
    },
    size: {
      sm: "text-sm",
      lg: "text-lg",
    },
    disabled: {
      true: "opacity-50",
    },
  },
  // Compound variants - apply styles when multiple conditions are met
  compoundVariants: [
    {
      variant: "primary",
      size: "lg",
      class: "font-bold uppercase", // Special styling for large primary buttons
    },
    {
      variant: "danger",
      disabled: true,
      class: "bg-red-300", // Lighter red when disabled
    },
  ],
});
```

**4. Prevents Class Name Conflicts**

CVA works seamlessly with tailwind-merge through our `cn` utility:

```tsx
// CVA generates the variant classes
const variantClasses = buttonVariants({ variant: "primary", size: "lg" });
// Result: "base-button bg-blue-500 h-12 px-6 text-lg"

// cn() ensures proper class merging with user overrides
const finalClasses = cn(variantClasses, "px-8");
// Result: "base-button bg-blue-500 h-12 text-lg px-8" (px-6 replaced by px-8)
```

**5. Maintainable Style Organization**

Variants are defined in one place, making updates straightforward:

```tsx
// Button.styles.ts - All variant logic in one file
export const buttonVariants = cva(
  [
    // Base styles as an array for readability
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "font-medium",
    "transition-all",
    "outline-none",
    "focus-visible:ring-2",
  ],
  {
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
  },
);

// Button.tsx - Component logic stays clean
import { buttonVariants } from "./Button.styles";

export const Button = ({ variant, size, className, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};
```

**6. Excellent Developer Experience**

CVA provides clear, predictable behavior:

```tsx
// Explicit variant selection
<Button variant="primary" size="lg" />

// Use default variants (no props needed)
<Button />

// Override with className when needed
<Button variant="primary" className="shadow-xl" />

// Variants are optional and can be undefined
const myVariant = condition ? "secondary" : undefined;
<Button variant={myVariant} /> // Falls back to default
```

**7. Performance Benefits**

CVA generates classes at build time when possible:

```tsx
// These classes are computed once and reused
const primaryLarge = buttonVariants({ variant: "primary", size: "lg" });
// No runtime string concatenation for common combinations

// Dynamic variants are still efficient
const dynamicClasses = buttonVariants({
  variant: userPreference,
  size: viewportSize,
});
```

#### CVA Best Practices in Our Codebase

1. **Define variants in separate `.styles.ts` files**

   ```tsx
   // Button.styles.ts
   export const buttonVariants = cva(/* ... */);
   ```

2. **Use arrays for base classes (better readability)**

   ```tsx
   const buttonVariants = cva(
     ["inline-flex", "items-center", "justify-center"],
     {
       /* variants */
     },
   );
   ```

3. **Always combine with `cn()` for proper merging**

   ```tsx
   className={cn(buttonVariants({ variant }), className)}
   ```

4. **Export variant types for external use**

   ```tsx
   export type ButtonVariants = VariantProps<typeof buttonVariants>;
   ```

5. **Keep variants focused and minimal**

   ```tsx
   // ✅ GOOD - Clear, distinct variants
   variant: {
     primary: "...",
     secondary: "...",
     ghost: "...",
   }

   // ❌ BAD - Too many similar variants
   variant: {
     primary: "...",
     primaryLight: "...",
     primaryDark: "...",
     primaryMuted: "...",
     // ... 10 more variants
   }
   ```

6. **Use compound variants sparingly**
   - Only for truly special cases
   - Document why the compound variant exists
   - Consider if composition would be better

#### How CVA Fits Our Philosophy

CVA aligns perfectly with our component philosophy:

- **Simplicity**: Declarative API is easier to understand than conditional logic
- **Maintainability**: All variant styles in one place
- **Type Safety**: Automatic TypeScript types prevent errors
- **Performance**: Efficient class generation and reuse
- **Flexibility**: Works with our `cn` utility and className overrides
- **Testability**: Variants can be tested in isolation

By using CVA, we get a powerful, type-safe system for managing component variants while keeping our components clean and focused on behavior rather than styling logic.

### Consistent Naming Conventions

- **Boolean props**: `is*`, `has*`, `allow*`, `show*`, `enable*`
- **Event handlers**: `on*` (onClick, onChange, onClose)
- **Render props**: `render*` (renderHeader, renderItem)
- **Component refs**: `*Ref` (buttonRef, inputRef)

### Standard Prop Conventions

#### Positioning

- **Prop name**: Always use `side` for positioning components
- **Values**: `"top"` | `"right"` | `"bottom"` | `"left"`
- **Extended values** (when needed): `"top-left"` | `"top-right"` | `"bottom-left"` | `"bottom-right"`
- **Applies to**: Panel, Sheet, Tooltip, Popover, Drawer, Toast, and any floating/positioned elements

```tsx
// ✅ Consistent across all components
<Panel side="left" />
<Tooltip side="top" />
<Sheet side="right" />
<Toast side="bottom-right" />
```

#### Sizing

- **Prop name**: Always use `size` for component sizing
- **Values**: `"sm"` | `"md"` | `"lg"` (t-shirt sizes)
- **Extended values** (rarely needed): `"xs"` | `"xl"` | `"2xl"`
- **Default**: Always `"md"` unless context demands otherwise

```tsx
// ✅ Consistent t-shirt sizing
<Button size="sm" />
<Input size="md" />
<Card size="lg" />
```

#### Why These Conventions?

1. **Consistency**: Same prop names across all components
2. **Predictability**: Developers know what to expect
3. **Type Safety**: Shared types can be reused
4. **Documentation**: One concept to learn
5. **shadcn Alignment**: Follows established patterns in the ecosystem

## Design Tokens System

### CSS Variables Structure

Design tokens provide a single source of truth for visual design decisions:

```css
:root {
  /* Colors */
  --color-primary-50: ...;
  --color-primary-500: ...;
  --color-primary-900: ...;

  /* Spacing (follows Tailwind scale) */
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-4: 1rem; /* 16px */
  --spacing-8: 2rem; /* 32px */

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* Animations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark theme override */
[data-theme="dark"] {
  --color-primary-500: ...;
  /* Override tokens for dark theme */
}
```

### Using Design Tokens

Components reference tokens instead of hard-coded values:

```tsx
// In CSS/Tailwind config
.button-primary {
  background-color: var(--color-primary-500);
  transition-duration: var(--duration-fast);
  transition-timing-function: var(--ease-in-out);
}

// With inline styles when needed
<div style={{
  animationDuration: 'var(--duration-normal)',
  boxShadow: 'var(--shadow-md)'
}}/>
```
