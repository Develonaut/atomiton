# Button Component

A versatile button component with variants, style props, and polymorphic support.

## Basic Usage

```tsx
import { Button } from '@atomiton/ui';

// Primary button (default)
<Button>Click me</Button>

// Secondary variant
<Button variant="secondary">Save</Button>

// With icons
<Button leftIcon={<SaveIcon />} rightIcon={<ArrowIcon />}>
  Save and continue
</Button>
```

## Variants

Following our philosophy of 3-5 variants maximum:

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

## Sizes

Using t-shirt sizing convention:

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

## Style Props

All style props are available:

```tsx
// Margin and padding
<Button mb={4} px={8}>Styled</Button>

// Full width
<Button fullWidth>Full Width</Button>
<Button fw>Short syntax</Button>

// Combining style props
<Button 
  mt={2} 
  mb={4} 
  fullWidth 
  variant="secondary"
>
  Complex styling
</Button>
```

## Polymorphic Component

Use the `as` prop to render as different elements:

```tsx
// As a link
<Button as="a" href="/about">
  Learn more
</Button>

// As a custom component
<Button as={Link} to="/home">
  Go home
</Button>

// As any HTML element
<Button as="div" role="button">
  Div button
</Button>
```

## Loading State

```tsx
// Show spinner
<Button loading>
  Submit
</Button>

// Custom loading text
<Button loading loadingText="Processing...">
  Submit
</Button>
```

## Icons

Two ways to add icons:

```tsx
// Using leftIcon/rightIcon
<Button 
  leftIcon={<SaveIcon />} 
  rightIcon={<ArrowIcon />}
>
  Save
</Button>

// Using startIcon/endIcon (Material UI style)
<Button 
  startIcon={<SaveIcon />} 
  endIcon={<ArrowIcon />}
>
  Save
</Button>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual variant |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `as` | `ElementType` | `'button'` | Element to render as |
| `leftIcon` | `ReactElement` | - | Icon on the left |
| `rightIcon` | `ReactElement` | - | Icon on the right |
| `startIcon` | `ReactElement` | - | Alias for leftIcon |
| `endIcon` | `ReactElement` | - | Alias for rightIcon |
| `loading` | `boolean` | `false` | Show loading state |
| `loadingText` | `string` | - | Text to show when loading |
| `disabled` | `boolean` | `false` | Disable the button |
| `fullWidth` | `boolean` | `false` | Take full container width |
| `fw` | `boolean` | `false` | Shorthand for fullWidth |
| `className` | `string` | - | Additional CSS classes |
| ...styleProps | `StyleProps` | - | All style props (mb, px, etc.) |

### Data Attributes

For styling hooks and testing:

- `data-variant` - Current variant
- `data-size` - Current size  
- `data-state` - 'loading' \| 'disabled' when applicable

## Migration from Old Button

```tsx
// Old
<Button isPrimary>Click</Button>
<Button isSecondary>Click</Button>
<Button isSmall>Click</Button>

// New
<Button variant="primary">Click</Button>
<Button variant="secondary">Click</Button>
<Button size="sm">Click</Button>
```