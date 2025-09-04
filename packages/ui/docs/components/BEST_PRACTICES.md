# Component Best Practices

_Inspired by Dan Abramov's approach to React component design_

## Core Philosophy

Dan Abramov's components are exemplary for their simplicity, readability, and maintainability. This guide captures the essence of his approach for the Atomiton project.

## Key Principles

### 1. Simplicity Over Complexity

**Dan's Way**: Components should be short, focused, and do one thing well.

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

### 2. Composition Over Configuration

**Dan's Way**: Build complex UIs from simple, composable pieces.

```tsx
// ✅ Good - Composable components
function Card({ children }) {
  return <div className="card">{children}</div>;
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>

// ❌ Bad - Configuration-heavy
<Card
  title="Title"
  body="Content"
  showHeader={true}
  headerStyle="large"
  bodyPadding={20}
/>
```

### 3. Explicit Over Implicit

**Dan's Way**: Make behavior obvious. No magic.

```tsx
// ✅ Good - Explicit props and behavior
function Toggle({ isOn, onToggle }) {
  return <button onClick={onToggle}>{isOn ? "ON" : "OFF"}</button>;
}

// ❌ Bad - Implicit behavior
function Toggle({ autoSave, smartMode }) {
  // Hidden side effects and unclear behavior
}
```

### 4. Hooks for Logic Extraction

**Dan's Way**: Extract complex logic into custom hooks.

```tsx
// ✅ Good - Logic in a custom hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function SearchInput({ onSearch }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 5. No Premature Abstraction

**Dan's Way**: Start simple, refactor when patterns emerge.

```tsx
// ✅ Good - Start with simple duplication
function UserCard({ user }) {
  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div>
      <img src={product.image} alt={product.title} />
      <h3>{product.title}</h3>
    </div>
  );
}

// Only abstract when the pattern is clear and repeated 3+ times
```

## Practical Guidelines

### Component Structure

```tsx
// 1. Imports
import { useState, useEffect } from "react";
import { Button } from "@mantine/core";

// 2. Types (if TypeScript)
interface Props {
  title: string;
  onSave: (data: Data) => void;
}

// 3. Component
export function MyComponent({ title, onSave }: Props) {
  // 4. State
  const [value, setValue] = useState("");

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 6. Handlers
  const handleSubmit = () => {
    onSave({ value });
  };

  // 7. Render
  return (
    <div>
      <h2>{title}</h2>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={handleSubmit}>Save</Button>
    </div>
  );
}
```

### Component Length

- **Ideal**: 20-50 lines
- **Acceptable**: Up to 100 lines
- **Refactor**: Over 100 lines

If a component is getting long, extract:

1. Custom hooks for logic
2. Child components for UI sections
3. Utility functions for calculations

### Props Design

```tsx
// ✅ Good - Clear, minimal props
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

// ❌ Bad - Too many props, unclear purpose
interface ButtonProps {
  text?: string;
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  style?: object;
  className?: string;
  type?: string;
  variant?: string;
  size?: string;
  // ... 20 more props
}
```

### State Management

```tsx
// ✅ Good - Colocated state
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  const filteredTodos = todos.filter(/* ... */);

  return (/* ... */);
}

// ✅ Good - Lifted state when needed
function Parent() {
  const [sharedState, setSharedState] = useState();

  return (
    <>
      <ChildA state={sharedState} />
      <ChildB onUpdate={setSharedState} />
    </>
  );
}
```

## Common Patterns

### Compound Components

```tsx
const Select = ({ children, value, onChange }) => {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
};

Select.Option = ({ value, children }) => {
  const { value: selectedValue, onChange } = useSelectContext();

  return (
    <div
      className={value === selectedValue ? "selected" : ""}
      onClick={() => onChange(value)}
    >
      {children}
    </div>
  );
};

// Usage
<Select value={selected} onChange={setSelected}>
  <Select.Option value="1">Option 1</Select.Option>
  <Select.Option value="2">Option 2</Select.Option>
</Select>;
```

### Render Props (when needed)

```tsx
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  return children({ data, loading });
}

// Usage
<DataFetcher url="/api/users">
  {({ data, loading }) => (loading ? <Spinner /> : <UserList users={data} />)}
</DataFetcher>;
```

## Testing Approach

Dan emphasizes testing user behavior, not implementation details:

```tsx
// ✅ Good - Test what users see
test("shows saving state when form is submitted", async () => {
  render(<SaveButton onSave={mockSave} />);

  const button = screen.getByRole("button");
  fireEvent.click(button);

  expect(button).toHaveTextContent("Saving...");
  expect(button).toBeDisabled();
});

// ❌ Bad - Testing implementation
test("calls setState with true", () => {
  // Don't test internal state changes
});
```

## Applied to Atomiton

### Blueprint Node Component Example

```tsx
// Simple, focused node component
export function BlueprintNode({ data, selected }) {
  const { label, ports } = data;

  return (
    <Card className={selected ? "selected" : ""}>
      <CardHeader>{label}</CardHeader>
      <CardBody>
        <PortList ports={ports} />
      </CardBody>
    </Card>
  );
}

// Extracted port logic
function PortList({ ports }) {
  return (
    <div className="ports">
      {ports.map((port) => (
        <Port key={port.id} {...port} />
      ))}
    </div>
  );
}

// Single responsibility port component
function Port({ label, type, connected }) {
  return (
    <div className={`port ${type} ${connected ? "connected" : ""}`}>
      <span>{label}</span>
    </div>
  );
}
```

## Summary

Dan Abramov's approach creates components that are:

- **Readable**: Anyone can understand them quickly
- **Maintainable**: Easy to modify and extend
- **Testable**: Clear inputs and outputs
- **Reusable**: Focused on single responsibilities
- **Performant**: Simple components render efficiently

Remember: "Simplicity is the ultimate sophistication." Start simple, stay simple as long as possible.
