# API Design Principles

## Core Philosophy

Our API design combines the best patterns from leading UI frameworks while maintaining simplicity and consistency. Every API decision should enhance developer experience without sacrificing flexibility or performance.

## Fundamental Principles

### 1. Props Over Classes

Users interact with components through props, not utility classes. Tailwind powers the implementation, not the API.

```tsx
// ✅ Good - Props-driven API
<Button variant="primary" size="large" />

// ❌ Bad - Utility class API
<Button className="btn-primary btn-lg" />
```

### 2. Compound Components with Dot Notation

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

### 3. Implicit State Sharing

Compound components share state through React Context, eliminating prop drilling.

```tsx
// Parent manages state, children consume it implicitly
<Select value={value} onChange={setValue}>
  <Select.Trigger /> {/* Knows current value */}
  <Select.Content>
    <Select.Item value="1" /> {/* Knows if selected */}
  </Select.Content>
</Select>
```

## Prop Naming Conventions

### Boolean Props

1. **Default to `false`** - All boolean props should be false by default
2. **Use state descriptions** - Describe the state, not the action
3. **Use positive framing** - Avoid negative props when possible

```tsx
// ✅ Good
interface ButtonProps {
  disabled?: boolean; // Describes state, defaults to false
  loading?: boolean; // Clear state description
  fullWidth?: boolean; // Positive framing
  size?: "xs" | "sm" | "md" | "lg" | "xl"; // T-shirt sizing
}

// ❌ Bad
interface ButtonProps {
  enabled?: boolean; // Negative default (true)
  isNotLoading?: boolean; // Negative framing
  onClick?: boolean; // Describes action, not state
}
```

### Size and Variant Props

Use consistent naming and values across all components:

```tsx
// Size scale - T-shirt sizes (consistent across all components)
type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Variant naming (semantic, not visual)
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type AlertVariant = "info" | "success" | "warning" | "error";
```

### Event Handlers

Always prefix with `on` and use present tense:

```tsx
interface Props {
  onChange: (value: string) => void; // Not onChanged
  onClose: () => void; // Not onClosed
  onSubmit: (data: FormData) => void; // Not onSubmitted
}
```

### Children and Composition

```tsx
interface Props {
  children?: React.ReactNode; // Primary content
  leftIcon?: React.ReactNode; // Specific slot
  rightElement?: React.ReactNode; // Named slot
  renderItem?: (item: T) => ReactNode; // Render prop
}
```

## Component Patterns

### 1. The Slot Pattern

Components expose "slots" for customization without breaking encapsulation:

```tsx
<Button leftIcon={<Icon name="save" />} rightIcon={<Icon name="arrow" />}>
  Save and Continue
</Button>;

// Implementation
function Button({ children, leftIcon, rightIcon, ...props }) {
  return (
    <button {...props}>
      {leftIcon && <span className="button-icon-left">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="button-icon-right">{rightIcon}</span>}
    </button>
  );
}
```

### 2. The `as` Prop Pattern

Allow components to render as different elements or custom components:

```tsx
// Render as a different element
<Button as="a" href="/home">
  Go Home
</Button>

// Render as a custom component
<Button as={Link} to="/dashboard">
  Dashboard
</Button>

// Implementation with TypeScript
type ButtonProps<T extends React.ElementType> = {
  as?: T;
  variant?: 'primary' | 'secondary';
} & React.ComponentPropsWithoutRef<T>;

function Button<T extends React.ElementType = 'button'>(
  { as, variant, ...props }: ButtonProps<T>
) {
  const Component = as || 'button';
  return <Component className={getStyles(variant)} {...props} />;
}
```

### 3. Controlled vs Uncontrolled

Support both patterns with clear conventions:

```tsx
// Controlled
<Input value={value} onChange={setValue} />

// Uncontrolled with default
<Input defaultValue="initial" />

// Implementation
function Input({ value, defaultValue, onChange }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e.target.value);
  };
}
```

### 4. Compound Component Implementation

```tsx
// Parent component with context
const SelectContext = createContext();

export function Select({ children, value, onChange }) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div role="listbox">{children}</div>
    </SelectContext.Provider>
  );
}

// Child components consume context
Select.Item = function SelectItem({ value: itemValue, children }) {
  const { value, onChange } = useContext(SelectContext);
  const isSelected = value === itemValue;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onChange(itemValue)}
    >
      {children}
    </div>
  );
};

// Export with dot notation
Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Item = SelectItem;
```

## Props Spreading and Forwarding

### DOM Props Spreading

Undocumented props spread to the root element:

```tsx
function Button({ variant, size, children, ...rest }) {
  return (
    <button
      className={cn(getVariantClasses(variant), getSizeClasses(size))}
      {...rest} // Spreads data-*, aria-*, onClick, etc.
    >
      {children}
    </button>
  );
}

// Usage
<Button
  variant="primary"
  data-testid="submit" // Spreads through
  aria-label="Submit form" // Spreads through
/>;
```

### Ref Forwarding

Always forward refs to the root element:

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
```

## TypeScript Patterns

### Discriminated Unions for Variants

```tsx
type ButtonProps =
  | { variant: "primary"; color?: never }
  | { variant: "custom"; color: string };

// This ensures color is only available when variant is 'custom'
```

### Generic Components

```tsx
interface SelectProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

function Select<T>({ value, onChange, options }: SelectProps<T>) {
  // Implementation
}
```

### Extending Native Elements

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
}
```

## Accessibility Patterns

### ARIA Attributes

Components handle ARIA attributes internally:

```tsx
function Dialog({ open, children }) {
  return (
    <div role="dialog" aria-modal="true" aria-hidden={!open}>
      {children}
    </div>
  );
}
```

### Keyboard Navigation

Built-in keyboard support following WAI-ARIA patterns:

```tsx
function Select() {
  // Handle arrow keys, Enter, Escape automatically
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown": // Move to next item
        case "ArrowUp": // Move to previous item
        case "Enter": // Select current item
        case "Escape": // Close dropdown
      }
    };
  });
}
```

## CSS and Styling Approach

### Internal Implementation

Components use Tailwind internally, but users don't see it:

```tsx
// Implementation (internal)
function Button({ variant, size }) {
  const classes = cn(
    "inline-flex items-center justify-center",
    variants[variant],
    sizes[size],
  );
  return <button className={classes} />;
}

// Usage (external)
<Button variant="primary" size="large" />;
```

### className Override

Always allow className for edge cases:

```tsx
<Button
  variant="primary"
  className="custom-class" // Merged with internal classes
/>
```

### CSS Variables for Theming

Use CSS variables for theme customization:

```tsx
// Component uses CSS variables
.button-primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

// User customizes via CSS
:root {
  --color-primary: #007bff;
  --color-primary-foreground: #ffffff;
}
```

## Documentation Requirements

Every component must document:

1. **Props** - All props with types and descriptions
2. **Examples** - Basic and advanced usage
3. **Accessibility** - ARIA roles and keyboard support
4. **Composition** - How to compose with other components
5. **Theming** - Available CSS variables

```tsx
/**
 * Button component for user actions
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * @accessibility
 * - Supports keyboard navigation (Space/Enter to click)
 * - Properly handles disabled state
 * - Forwards ARIA attributes
 */
```

## Anti-Patterns to Avoid

### 1. Prop Explosion

```tsx
// ❌ Bad - Too many props
<Button
  primary secondary ghost outline text
  small medium large xlarge
  rounded pill square
  loading disabled active hover
/>

// ✅ Good - Organized props
<Button
  variant="primary"
  size="medium"
  shape="rounded"
  state={{ loading: true }}
/>
```

### 2. Inconsistent Naming

```tsx
// ❌ Bad - Inconsistent across components
<Button size="lg" />
<Input inputSize="large" />
<Card cardSize="big" />

// ✅ Good - Consistent naming
<Button size="large" />
<Input size="large" />
<Card size="large" />
```

### 3. Ambiguous Props

```tsx
// ❌ Bad - Unclear what these do
<Modal show />
<Dialog open />
<Dropdown visible />

// ✅ Good - Consistent state prop
<Modal open />
<Dialog open />
<Dropdown open />
```

### 4. Breaking Composition

```tsx
// ❌ Bad - Can't compose
<Button text="Click me" icon="save" />

// ✅ Good - Composable
<Button>
  <Icon name="save" />
  Click me
</Button>
```

## Testing Guidelines

Components should be tested from the user's perspective:

```tsx
// Test user interactions, not implementation
test("button shows loading state", () => {
  render(<Button loading>Save</Button>);

  expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  expect(screen.getByText("Save")).toBeInTheDocument();
});
```

## Migration Strategy

When adopting these principles:

1. Start with new components
2. Gradually refactor existing components
3. Maintain backward compatibility during transition
4. Document breaking changes clearly
5. Provide codemods for automated migration
