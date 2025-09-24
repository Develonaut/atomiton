# System Props

System Props are standardized convenience properties supported by all Atomiton
lower-level components. They provide consistent shortcuts and aliases across the
entire component library.

## What are System Props?

System Props are a predefined set of prop transformations that make components
easier to use:

- **Shortcuts**: `fullW` instead of `fullWidth`, `fw` for `fontWeight`
- **Aliases**: `startIcon` as an alternative to `leftIcon`
- **Derived states**: `loading` automatically sets `disabled`
- **Consistent patterns**: Typography uses 2-letter codes (`fs`, `fw`, `ff`),
  layout uses explicit names (`fullW`, `fullH`)

## Supported System Props

All lower-level components (Box, Stack, Button, Input, etc.) support these
props:

### Layout Props

| System Prop | Resolves To  | Description                                   |
| ----------- | ------------ | --------------------------------------------- |
| `fullW`     | `fullWidth`  | Makes component take full width of container  |
| `fullH`     | `fullHeight` | Makes component take full height of container |
| `w`         | `width`      | Component width                               |
| `h`         | `height`     | Component height                              |
| `minW`      | `minWidth`   | Minimum width                                 |
| `minH`      | `minHeight`  | Minimum height                                |
| `maxW`      | `maxWidth`   | Maximum width                                 |
| `maxH`      | `maxHeight`  | Maximum height                                |

### Spacing Props - Margin

| System Prop | Resolves To    | Description                        |
| ----------- | -------------- | ---------------------------------- |
| `m`         | `margin`       | Margin on all sides                |
| `mt`        | `marginTop`    | Top margin                         |
| `mr`        | `marginRight`  | Right margin                       |
| `mb`        | `marginBottom` | Bottom margin                      |
| `ml`        | `marginLeft`   | Left margin                        |
| `mx`        | `marginX`      | Horizontal margin (left and right) |
| `my`        | `marginY`      | Vertical margin (top and bottom)   |
| `ms`        | `marginStart`  | Start margin (RTL-friendly)        |
| `me`        | `marginEnd`    | End margin (RTL-friendly)          |

### Spacing Props - Padding

| System Prop | Resolves To     | Description                         |
| ----------- | --------------- | ----------------------------------- |
| `p`         | `padding`       | Padding on all sides                |
| `pt`        | `paddingTop`    | Top padding                         |
| `pr`        | `paddingRight`  | Right padding                       |
| `pb`        | `paddingBottom` | Bottom padding                      |
| `pl`        | `paddingLeft`   | Left padding                        |
| `px`        | `paddingX`      | Horizontal padding (left and right) |
| `py`        | `paddingY`      | Vertical padding (top and bottom)   |
| `ps`        | `paddingStart`  | Start padding (RTL-friendly)        |
| `pe`        | `paddingEnd`    | End padding (RTL-friendly)          |

### Display & Position Props

| System Prop | Resolves To | Description           |
| ----------- | ----------- | --------------------- |
| `d`         | `display`   | CSS display property  |
| `pos`       | `position`  | CSS position property |

### Color & Background Props

| System Prop | Resolves To       | Description          |
| ----------- | ----------------- | -------------------- |
| `bg`        | `background`      | Background shorthand |
| `bgColor`   | `backgroundColor` | Background color     |

### Typography Props

| System Prop | Resolves To     | Description    |
| ----------- | --------------- | -------------- |
| `fs`        | `fontSize`      | Font size      |
| `fw`        | `fontWeight`    | Font weight    |
| `ff`        | `fontFamily`    | Font family    |
| `lh`        | `lineHeight`    | Line height    |
| `ls`        | `letterSpacing` | Letter spacing |
| `ta`        | `textAlign`     | Text alignment |

### Icon Props (Adornments Pattern)

| System Prop | Resolves To | Description                     |
| ----------- | ----------- | ------------------------------- |
| `startIcon` | `leftIcon`  | Icon at the start (left in LTR) |
| `endIcon`   | `rightIcon` | Icon at the end (right in LTR)  |

> **Future Consideration**: The icon/adornment pattern could be expanded to
> support all directions (left, top, right, bottom) with consistent naming like
> `{direction}{Noun}` (e.g., `topBadge`, `bottomLabel`). This would provide a
> standardized way to attach UI elements in any direction.

### State Props

| System Prop | Side Effect          | Description                                      |
| ----------- | -------------------- | ------------------------------------------------ |
| `loading`   | Sets `disabled=true` | Loading state automatically disables interaction |

## Usage Examples

### Basic Shortcuts

```tsx
// Using system props (shortcuts)
<Button fullW startIcon={<SaveIcon />} loading>
  Save Document
</Button>

// Equivalent to:
<Button fullWidth leftIcon={<SaveIcon />} loading disabled>
  Save Document
</Button>
```

### Spacing Props

```tsx
// Using spacing shortcuts
<Box p={4} mx="auto" mt={2}>
  <Card px={3} py={2} mb={4}>
    <Text fs="lg" mb={1}>Title</Text>
    <Text>Content</Text>
  </Card>
</Box>

// Equivalent to:
<Box padding={4} marginX="auto" marginTop={2}>
  <Card paddingX={3} paddingY={2} marginBottom={4}>
    <Text fontSize="lg" marginBottom={1}>Title</Text>
    <Text>Content</Text>
  </Card>
</Box>
```

### Typography Props

```tsx
// Using typography shortcuts
<Text fs="lg" fw="bold" lh="1.2" ls="0.1em" ta="center">
  Heading Text
</Text>

<Text ff="mono" fs="sm" fw="400">
  Code snippet with monospace font
</Text>

// Equivalent to:
<Text fontSize="lg" fontWeight="bold" lineHeight="1.2" letterSpacing="0.1em" textAlign="center">
  Heading Text
</Text>

<Text fontFamily="mono" fontSize="sm" fontWeight="400">
  Code snippet with monospace font
</Text>
```

### Layout & Display Props

```tsx
// Using layout shortcuts
<Stack w="100%" h="100vh" d="flex" pos="relative">
  <Box minW={200} maxW={400} bg="#f5f5f5">
    Sidebar
  </Box>
  <Box fullW fullH bgColor="white">
    Main Content
  </Box>
</Stack>

// Equivalent to:
<Stack width="100%" height="100vh" display="flex" position="relative">
  <Box minWidth={200} maxWidth={400} background="#f5f5f5">
    Sidebar
  </Box>
  <Box fullWidth fullHeight backgroundColor="white">
    Main Content
  </Box>
</Stack>
```

## How It Works

System Props are resolved through a centralized map (`SYSTEM_PROPS_MAP`) that
ensures consistency:

```tsx
// The map defines all transformations
export const SYSTEM_PROPS_MAP = {
  // Layout shorthands (explicit to avoid collision with font props)
  fullW: "fullWidth",
  fullH: "fullHeight",
  w: "width",
  h: "height",
  minW: "minWidth",
  minH: "minHeight",
  maxW: "maxWidth",
  maxH: "maxHeight",

  // Spacing shorthands - margin
  m: "margin",
  mt: "marginTop",
  mr: "marginRight",
  mb: "marginBottom",
  ml: "marginLeft",
  mx: "marginX",
  my: "marginY",
  ms: "marginStart",
  me: "marginEnd",

  // Spacing shorthands - padding
  p: "padding",
  pt: "paddingTop",
  pr: "paddingRight",
  pb: "paddingBottom",
  pl: "paddingLeft",
  px: "paddingX",
  py: "paddingY",
  ps: "paddingStart",
  pe: "paddingEnd",

  // Display & Position
  d: "display",
  pos: "position",

  // Colors & Background
  bg: "background",
  bgColor: "backgroundColor",

  // Typography shorthands
  fs: "fontSize",
  fw: "fontWeight",
  ff: "fontFamily",
  lh: "lineHeight",
  ls: "letterSpacing",
  ta: "textAlign",

  // Icon aliases
  startIcon: "leftIcon",
  endIcon: "rightIcon",
} as const;
```

Components use the `useComponent` hook which automatically resolves these props:

```tsx
const Component = (inProps) => {
  const { props } = useComponent({
    props: inProps,
    name: "Button",
  });

  // props.fullW → props.fullWidth (resolved)
  // props.fw → props.fontWeight (resolved)
  // props.startIcon → props.leftIcon (resolved)
};
```

## Benefits

1. **Consistency**: Same shortcuts work everywhere
2. **Discoverability**: Documented set of supported props
3. **Type Safety**: Full TypeScript support
4. **Maintainability**: Single source of truth for prop resolution
5. **Backwards Compatible**: Original prop names still work

## Adding New System Props

To add new system props:

1. Update `SYSTEM_PROPS_MAP` in `systemProps.ts`
2. Update `SystemProps` interface
3. Document in this file
4. All components automatically support the new prop

## Component Requirements

For a component to support System Props:

```tsx
// 1. Include SystemProps in your type
interface ButtonProps extends SystemProps, StyleProps {
  variant?: "primary" | "secondary";
}

// 2. Use useComponent hook (it handles resolution)
const Button = (inProps: ButtonProps) => {
  const { props } = useComponent({
    props: inProps,
    name: "Button",
  });

  // props are now resolved
};
```
