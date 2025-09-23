# Form Components

This directory contains reusable form components extracted from the RightSidebar implementation. These components maintain the exact same visual appearance and functionality as the original implementations while providing better reusability.

## Components

### NumberInput

A number input with optional prefix/suffix display (e.g., "W", "H", "px").

**Props:**

- `value: number` - The current numeric value
- `onChange: (value: number) => void` - Change handler
- `prefix?: string` - Optional prefix text (e.g., "W", "H")
- `suffix?: string` - Optional suffix text (e.g., "px", "%")
- `min?: number` - Minimum value
- `max?: number` - Maximum value
- `step?: number` - Step increment
- `placeholder?: string` - Placeholder text
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Disabled state

### RangeSlider

A single-value range slider with custom Atomiton styling.

**Props:**

- `value: number` - Current value
- `onChange: (value: number) => void` - Change handler
- `min?: number` - Minimum value (default: 0)
- `max?: number` - Maximum value (default: 1)
- `step?: number` - Step increment (default: 0.001)
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Disabled state

### DualRangeSlider

A dual-handle range slider for intervals, built on rc-slider.

**Props:**

- `values: [number, number]` - Current range values
- `onChange: (values: [number, number]) => void` - Change handler
- `min?: number` - Minimum value (default: 0)
- `max?: number` - Maximum value (default: 20)
- `step?: number` - Step increment (default: 1)
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Disabled state
- `overlayStyle?: "timeline" | "default"` - Style variant for timeline overlays

### ImageGrid

A selectable grid of images/items.

**Props:**

- `items: ImageGridItem[]` - Array of items to display
- `activeIndex: number | null` - Currently selected item index
- `onSelectionChange: (index: number | null) => void` - Selection handler
- `className?: string` - Additional CSS classes
- `itemClassName?: string` - Additional CSS classes for items
- `imageSize?: number` - Image size in pixels (default: 64)
- `columns?: number` - Number of columns (default: 2)

**ImageGridItem type:**

```typescript
interface ImageGridItem {
  id: number;
  image: string;
  alt?: string;
}
```

### ColorDisplay

A color picker/display component with optional opacity control.

**Props:**

- `color: string` - Current color (hex without #)
- `onColorChange?: (color: string) => void` - Color change handler
- `opacity?: number` - Current opacity (0-100, default: 100)
- `onOpacityChange?: (opacity: number) => void` - Opacity change handler
- `showOpacity?: boolean` - Show opacity controls (default: true)
- `className?: string` - Additional CSS classes
- `colorBoxClassName?: string` - Additional CSS classes for color box
- `readonly?: boolean` - Read-only mode

### FormSubmitButton

A submit button with loading states and variants.

**Props:**

- `isLoading?: boolean` - Loading state
- `loadingText?: string` - Text to show when loading (default: "Loading...")
- `children: React.ReactNode` - Button content
- `className?: string` - Additional CSS classes
- `disabled?: boolean` - Disabled state
- `variant?: "primary" | "secondary"` - Button variant (default: "primary")
- `size?: "sm" | "md" | "lg"` - Button size (default: "md")
- `type?: "button" | "submit" | "reset"` - Button type (default: "submit")
- `onClick?: () => void` - Click handler

## Usage

```typescript
import {
  NumberInput,
  RangeSlider,
  DualRangeSlider,
  ImageGrid,
  ColorDisplay,
  FormSubmitButton
} from "#components/form";

// Example usage
<NumberInput value={width} onChange={setWidth} prefix="W" />
<RangeSlider value={opacity} onChange={setOpacity} min={0} max={1} />
<FormSubmitButton isLoading={isSubmitting}>Save Changes</FormSubmitButton>
```

## Styling

All components use the existing Atomiton design system classes and maintain the same visual appearance as the original implementations. The components follow the established patterns for surface colors, transitions, and spacing.
