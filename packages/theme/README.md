# @atomiton/theme

Framework-agnostic theme system providing the Atomiton design language as a single source of truth for visual decisions.

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - Active development tasks
- **[Upcoming Features](./NEXT.md)** - Planned improvements
- **[Release History](./COMPLETED.md)** - Completed features

## Overview

The theme package is a framework-agnostic system that provides design tokens, color palettes, typography, spacing, and other visual constants. It exports the theme in multiple formats to support different UI frameworks while maintaining a single source of truth.

## Features

### Core Capabilities

- **Framework-agnostic design tokens** - Works with any UI framework
- **Multiple output formats** - CSS variables, Tailwind config, JSON, TypeScript
- **Dark mode support** - Built-in light/dark theme variants
- **Semantic color system** - Contextual colors for consistent UX
- **Typography scale** - Harmonious type system based on Inter font

### Export Formats

```typescript
import { AtomitonTheme } from "@atomiton/theme";

// Get theme in different formats
const cssVars = theme.toCSSVariables(); // For vanilla CSS
const tailwindConfig = theme.toTailwind(); // For Tailwind CSS
const tokens = theme.toJSON(); // For custom systems
const jsObject = theme.toObject(); // For JS frameworks
```

## Installation

```bash
pnpm add @atomiton/theme
```

## Usage

### With Tailwind CSS

```javascript
// tailwind.config.js
import { createTailwindConfig } from "@atomiton/theme";

export default createTailwindConfig({
  // Your custom extensions
});
```

### With CSS Variables

```typescript
import { ThemeManager } from "@atomiton/theme";

const manager = new ThemeManager();
manager.applyTheme("light"); // Injects CSS variables
```

### With React

```tsx
import { ThemeProvider } from "@atomiton/theme/react";

function App() {
  return <ThemeProvider theme="light">{/* Your app */}</ThemeProvider>;
}
```

### With Custom Framework

```typescript
import { theme } from "@atomiton/theme";

// Access raw theme values
const primaryColor = theme.colors.primary[500];
const spacing = theme.spacing[4];
```

## Theme Structure

```typescript
interface AtomitonTheme {
  colors: {
    // Grayscale shades
    shade: { "01": string; /* ... */ "09": string };
    // Semantic colors
    primary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
  typography: {
    fonts: { sans: string; mono: string };
    sizes: { xs: string; /* ... */ "6xl": string };
    weights: {
      /* ... */
    };
    lineHeights: {
      /* ... */
    };
  };
  spacing: { 0: string; /* ... */ 96: string };
  shadows: {
    toolbar: string;
    "prompt-input": string;
    "depth-01": string;
    popover: string;
  };
  borderRadius: {
    /* ... */
  };
  animation: {
    /* ... */
  };
}
```

## Architecture

```
packages/theme/
├── src/
│   ├── core/           # Core theme definitions
│   ├── tokens/         # Design tokens
│   ├── colors/         # Color system
│   ├── typography/     # Type system
│   ├── generators/     # Output generators
│   │   ├── css/       # CSS variables
│   │   ├── tailwind/  # Tailwind config
│   │   └── json/      # JSON tokens
│   ├── manager/        # Theme management
│   └── providers/      # Framework providers
├── docs/               # Additional documentation
│   ├── ARCHITECTURE.md # System design
│   ├── COLOR_PALETTE.md # Color specifications
│   └── INTEGRATION.md  # Framework guides
└── tests/             # Test suites
```

## Design System

### Color Philosophy

- **Grayscale-first** - Nine shades for UI hierarchy
- **Semantic colors** - Contextual meaning through color
- **Accessible contrasts** - WCAG AA compliance
- **Dark mode native** - Equal treatment of themes

### Typography

- **Inter font family** - Clean, readable, modern
- **Fluid scale** - Responsive type sizes
- **Consistent rhythm** - Harmonious line heights

### Spacing

- **4px base unit** - All spacing multiples of 4
- **Fibonacci progression** - Natural feeling gaps
- **Component-specific** - Contextual spacing tokens

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Generate theme outputs
pnpm generate
```

## Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for detailed plans including:

- Framework-agnostic refactor
- Theme builder tool
- Runtime theming
- A11y enhancements

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design
- [Color Palette](./docs/COLOR_PALETTE.md) - Color specifications
- [Integration Guide](./docs/INTEGRATION.md) - Framework setup
- [N8N Comparison](./docs/N8N_COMPARISON.md) - How we differ

## Migration from Mantine

If migrating from the Mantine-specific version:

```typescript
// Before (Mantine-specific)
import { brainwaveTheme } from '@atomiton/theme';
<MantineProvider theme={brainwaveTheme}>

// After (Framework-agnostic)
import { ThemeProvider } from '@atomiton/theme/react';
<ThemeProvider theme="light">
```

## Contributing

1. Maintain framework independence
2. Document all tokens
3. Include visual examples
4. Test across frameworks

## License

MIT - See [LICENSE](../../LICENSE) for details

---

**Package Status**: 🟡 Refactoring
**Version**: 0.2.0
**Stability**: Beta
