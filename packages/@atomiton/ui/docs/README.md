# Atomiton UI Framework Documentation

## Vision

Build a lightweight, composable, and beautiful React UI framework that combines the best patterns from leading libraries while maintaining zero runtime overhead through CSS-first architecture.

## 📚 Essential Documentation

### Start Here

1. **[Component Philosophy](./COMPONENT_PHILOSOPHY.md)** - Our approach to simplicity, style props, and API design
2. **[Component Building Guide](./COMPONENT_BUILDING_GUIDE.md)** - Complete step-by-step guide with all patterns
3. **[Component Organization](./COMPONENT_ORGANIZATION.md)** - The "bento box" principle for file structure
4. **[Primitive Integration Guide](./PRIMITIVE_INTEGRATION_GUIDE.md)** - How to integrate shadcn/ui primitives and maintain separation of concerns

### Progress Tracking

- **[CURRENT](../CURRENT.md)** - Active development tasks
- **[NEXT](../NEXT.md)** - Upcoming features
- **[COMPLETED](../COMPLETED.md)** - Finished work
- **[ROADMAP](../ROADMAP.md)** - Long-term vision

## What Makes Us Different

1. **Zero Runtime Overhead**: Pure CSS with Tailwind, no CSS-in-JS
2. **Props-Driven API**: Developer-friendly props (`variant="primary"`), not utility classes
3. **Compound Components**: Intuitive dot notation for clear component relationships
4. **Smallest Bundle**: < 50KB for core components
5. **Beautiful by Default**: Brainwave 2.0 aesthetic out of the box

## Quick Example

```tsx
// Clean, intuitive API
<Button
  variant="primary"
  size="md"
  mb={4}
  loading={isSubmitting}
>
  Save Changes
</Button>

// Compound components for complex UI
<Dialog>
  <Dialog.Trigger>Open Settings</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Settings</Dialog.Title>
      <Dialog.Close />
    </Dialog.Header>
    <Dialog.Body>
      {/* Settings content */}
    </Dialog.Body>
  </Dialog.Content>
</Dialog>
```

## Component Categories

### Core Components (5-10 total)

- `Button` - Primary, secondary, ghost variants
- `Input` - Text, number, password types
- `Card` - Container with optional header/footer
- `Dialog` - Modal dialogs
- `Select` - Dropdown selection

### Layout Components (5-8 total)

- `Box` - Basic container with style props
- `Stack` - Vertical/horizontal stacking
- `Grid` - CSS Grid wrapper
- `Container` - Max-width container

### Feedback Components (4-6 total)

- `Alert` - Info, success, warning, error
- `Toast` - Temporary notifications
- `Spinner` - Loading indicator
- `Progress` - Progress bars

## Development Status

We're currently in **Phase 2: Refactor Core Components** (Started Sept 4, 2025).

See [CURRENT.md](../CURRENT.md) for active tasks and [NEXT.md](../NEXT.md) for upcoming work.

---

**Getting Started?** → Read [Component Philosophy](./COMPONENT_PHILOSOPHY.md) first, then dive into the [Building Guide](./COMPONENT_BUILDING_GUIDE.md).
