# @atomiton/theme

Clean Mantine theme translation of Brainwave 2.0 design system.

## Installation

```bash
npm install @atomiton/theme @mantine/core
```

## Usage

```typescript
import { MantineProvider } from '@mantine/core';
import { brainwaveTheme } from '@atomiton/theme';

function App() {
  return (
    <MantineProvider theme={brainwaveTheme}>
      {/* Your app components */}
    </MantineProvider>
  );
}
```

## What's Included

This theme is a direct translation of our existing Tailwind configuration:

- **Colors**: Shade system (shade-01 through shade-09) + semantic colors
- **Typography**: Inter font with all text sizes from Tailwind config
- **Shadows**: Exact shadows from CSS variables (toolbar, prompt-input, depth-01, popover)
- **Spacing**: Standard spacing values
- **Border radius**: Including custom values (1.25rem, 1.75rem, 2.5rem)

## Available Exports

```typescript
import {
  brainwaveTheme, // Main theme object
  theme, // Alias for brainwaveTheme
  brainwave, // Another alias
} from "@atomiton/theme";

// Or default import
import brainwaveTheme from "@atomiton/theme";
```

## Color System

```typescript
// Use in Mantine components
<Button color="shade">Primary Action</Button>
<Badge color="green">Success</Badge>
<Alert color="red">Error Message</Alert>
```

Available colors:

- `shade` (primary) - Our 9-step grayscale system
- `green`, `orange`, `red`, `blue`, `yellow`, `purple` - Semantic colors

## Typography

Typography matches our Tailwind configuration exactly:

- Headings (h1-h6) with proper font weights
- Body text sizes (body-sm, body-md, body-lg)
- Title sizes (title, title-lg)
- Paragraph sizes (p-sm, p-md)

## Shadows

Use custom shadow names:

```typescript
<Paper shadow="toolbar">Toolbar-style shadow</Paper>
<Modal shadow="popover">Popover-style shadow</Modal>
```

Available shadows: `toolbar`, `prompt-input`, `depth-01`, `popover`

---

**Note**: This is a direct translation of our existing Brainwave 2.0 Tailwind configuration. No fancy effects or complex utilities - just clean value mapping to Mantine.
