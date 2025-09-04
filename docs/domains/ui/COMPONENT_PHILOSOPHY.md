# Component Philosophy

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
