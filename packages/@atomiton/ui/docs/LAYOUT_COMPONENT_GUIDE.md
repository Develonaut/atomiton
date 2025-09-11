# Layout Component Guidelines

## Use Semantic Layout Components

Instead of using raw HTML elements, use the layout components from `@atomiton/ui`:

### ❌ Don't use raw divs:

```tsx
<div className="flex flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### ✅ Do use layout components:

```tsx
import { Row } from "@atomiton/ui";

<Row gap={4}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Row>;
```

## Component Usage Guide

### Box

Generic container for any layout need:

```tsx
<Box className="p-4 bg-surface-01 rounded-lg">Content here</Box>
```

### Flex

When you need full flexbox control:

```tsx
<Flex direction="row" justify="between" align="center">
  <Logo />
  <Navigation />
  <UserMenu />
</Flex>
```

### Row

Horizontal layouts (simpler than Flex):

```tsx
<Row gap={2} align="center">
  <Icon />
  <Text>Label</Text>
</Row>
```

### Column

Vertical layouts (simpler than Flex):

```tsx
<Column gap={4}>
  <Header />
  <Content />
  <Footer />
</Column>
```

## Benefits

1. **Consistency**: All layouts use the same components
2. **Type Safety**: Props are typed and validated
3. **Maintainability**: Easy to update styling system-wide
4. **Readability**: Code intent is clearer with semantic names
5. **Future-proof**: Can add features to all layouts at once

## Migration Strategy

When refactoring existing components:

1. Replace `<div>` with `<Box>`
2. Replace `<div className="flex ...">` with appropriate layout component
3. Use `Row` for horizontal flex layouts
4. Use `Column` for vertical flex layouts
5. Use `Flex` when you need more control

## Examples

### Sidebar Layout

```tsx
// Before
<div className="sidebar left-3 flex flex-col">
  <div>Header</div>
  <div className="grow overflow-y-auto">Content</div>
  <div>Footer</div>
</div>

// After
<Column className="sidebar left-3">
  <Box>Header</Box>
  <Box className="grow overflow-y-auto">Content</Box>
  <Box>Footer</Box>
</Column>
```

### Toolbar Layout

```tsx
// Before
<div className="flex gap-2 p-2">
  {actions.map(action => <button>...</button>)}
</div>

// After
<Row gap={2} className="p-2">
  {actions.map(action => <Button>...</Button>)}
</Row>
```
