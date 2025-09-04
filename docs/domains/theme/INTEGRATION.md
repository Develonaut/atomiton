# Theme Architecture Strategy

## Overview

The `@atomiton/theme` package serves as the single source of truth for all visual design decisions across the Atomiton ecosystem. It must be framework-agnostic while providing seamless integration with Tailwind CSS, React components, and the node editor.

## Research: How Other Frameworks Handle Theming

### Material UI (MUI)

```tsx
// Theme object with nested structure
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  typography: {
    h1: { fontSize: "2rem" },
  },
  spacing: 8, // Base unit
});

// Provider pattern
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>;
```

**Key Insights**:

- Deeply nested theme object
- Runtime theme switching via Provider
- Theme object can be serialized to JSON
- Extensive TypeScript support

### Mantine

```tsx
// Theme configuration
const theme = {
  colors: {
    brand: ['#F0F', '#E0E', ...], // 10 shades
  },
  primaryColor: 'brand',
  fontFamily: 'Verdana',
};

<MantineProvider theme={theme}>
  <App />
</MantineProvider>
```

**Key Insights**:

- Color scales (10 shades per color)
- Simple, flat structure where possible
- CSS variables generated from theme
- Can merge with default theme

### Chakra UI

```tsx
const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7fafc",
      900: "#1a202c",
    },
  },
  config: {
    cssVarPrefix: "chakra",
    initialColorMode: "light",
  },
});
```

**Key Insights**:

- Extends base theme
- CSS variable prefix configuration
- Semantic color tokens
- Responsive design tokens

### Ant Design

```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: "#00b96b",
      borderRadius: 2,
    },
    algorithm: theme.darkAlgorithm, // or compactAlgorithm
  }}
>
  <App />
</ConfigProvider>
```

**Key Insights**:

- Design tokens approach
- Theme algorithms for variants
- Component-specific token overrides
- Less variables under the hood

### Tailwind CSS

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
        }
      }
    }
  }
}

// CSS variables approach
@layer base {
  :root {
    --color-primary: 59 130 246;
  }
  .dark {
    --color-primary: 147 197 253;
  }
}
```

**Key Insights**:

- Build-time configuration
- CSS variables for runtime theming
- Utility class generation
- Plugin system for extensions

### Radix UI

```css
/* Pure CSS variables */
:root {
  --gray-1: hsl(0, 0%, 99%);
  --gray-2: hsl(0, 0%, 97.3%);
  --radius-1: 3px;
  --space-1: 4px;
}
```

**Key Insights**:

- No JavaScript theme object
- Pure CSS variable approach
- Framework agnostic
- Composable with any system

## Proposed Architecture for @atomiton/theme

### Core Theme Structure

```typescript
// packages/theme/src/schema.ts
interface AtomitonTheme {
  // Meta
  name: string;
  version: string;
  mode: "light" | "dark" | "auto";

  // Design Tokens
  colors: {
    // Semantic colors
    primary: ColorScale;
    secondary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;

    // Neutral colors
    gray: ColorScale;
    slate: ColorScale;

    // Special purpose
    background: {
      default: string;
      paper: string;
      elevated: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
  };

  typography: {
    fonts: {
      sans: string;
      serif: string;
      mono: string;
    };
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      // ...
    };
    weights: {
      thin: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: Record<string, string>;
  };

  spacing: {
    unit: number; // Base unit in px
    scale: Record<string, string>; // 0, 1, 2, 4, 8, etc.
  };

  radii: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };

  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  transitions: {
    durations: {
      instant: string;
      fast: string;
      normal: string;
      slow: string;
    };
    easings: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };

  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };

  // Component-specific tokens (optional)
  components?: {
    button?: {
      height: {
        sm: string;
        md: string;
        lg: string;
      };
      padding: {
        sm: string;
        md: string;
        lg: string;
      };
    };
    // ... other components
  };
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Default
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}
```

### Theme Package API

```typescript
// packages/theme/src/index.ts
export class ThemeManager {
  private theme: AtomitonTheme;
  private listeners: Set<(theme: AtomitonTheme) => void>;

  constructor(initialTheme: AtomitonTheme) {
    this.theme = initialTheme;
    this.listeners = new Set();
  }

  // Get current theme
  getTheme(): AtomitonTheme {
    return this.theme;
  }

  // Update theme (partial updates)
  updateTheme(updates: DeepPartial<AtomitonTheme>): void {
    this.theme = deepMerge(this.theme, updates);
    this.notifyListeners();
  }

  // Subscribe to theme changes
  subscribe(listener: (theme: AtomitonTheme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Export formats
  toCSSVariables(): string {
    return generateCSSVariables(this.theme);
  }

  toTailwindConfig(): TailwindConfig {
    return generateTailwindConfig(this.theme);
  }

  toJSON(): string {
    return JSON.stringify(this.theme);
  }

  // Import formats
  static fromJSON(json: string): ThemeManager {
    return new ThemeManager(JSON.parse(json));
  }
}
```

### Integration Strategies

#### 1. Tailwind Integration

```javascript
// tailwind.config.js
import { themeManager } from "@atomiton/theme";

export default {
  theme: {
    extend: themeManager.toTailwindConfig(),
  },
  plugins: [
    // Plugin to inject CSS variables
    require("@atomiton/theme/tailwind-plugin"),
  ],
};
```

#### 2. React/UI Integration

```tsx
// packages/ui/src/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeManager, AtomitonTheme } from "@atomiton/theme";

const ThemeContext = createContext<AtomitonTheme | null>(null);

export function ThemeProvider({ themeManager, children }) {
  const [theme, setTheme] = useState(themeManager.getTheme());

  useEffect(() => {
    // Subscribe to theme changes
    return themeManager.subscribe(setTheme);
  }, [themeManager]);

  useEffect(() => {
    // Inject CSS variables
    const root = document.documentElement;
    const cssVars = themeManager.toCSSVariables();

    // Apply CSS variables to root
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used within ThemeProvider");
  return theme;
};
```

#### 3. Node Editor Integration

```typescript
// packages/nodes/src/theme-adapter.ts
import { ThemeManager } from "@atomiton/theme";

export class NodeThemeAdapter {
  constructor(private themeManager: ThemeManager) {}

  // Convert theme to node editor styles
  getNodeStyles() {
    const theme = this.themeManager.getTheme();
    return {
      node: {
        background: theme.colors.background.paper,
        border: `1px solid ${theme.colors.gray[300]}`,
        borderRadius: theme.radii.md,
        boxShadow: theme.shadows.md,
      },
      edge: {
        stroke: theme.colors.primary[500],
        strokeWidth: 2,
      },
      // ... more node-specific styles
    };
  }

  // Export for React Flow or other libraries
  toReactFlowTheme() {
    // Convert to React Flow theme format
  }
}
```

### CSS Variable Generation

```typescript
// Example output
function generateCSSVariables(theme: AtomitonTheme): string {
  return `
    :root {
      /* Colors */
      --color-primary-50: ${theme.colors.primary[50]};
      --color-primary-100: ${theme.colors.primary[100]};
      /* ... all color scales */
      
      /* Typography */
      --font-sans: ${theme.typography.fonts.sans};
      --text-xs: ${theme.typography.sizes.xs};
      /* ... */
      
      /* Spacing */
      --spacing-1: ${theme.spacing.scale[1]};
      --spacing-2: ${theme.spacing.scale[2]};
      /* ... */
      
      /* Radii */
      --radius-sm: ${theme.radii.sm};
      --radius-md: ${theme.radii.md};
      /* ... */
    }
  `;
}
```

### Build-Time vs Runtime

```typescript
// Build-time (for Tailwind)
// packages/theme/build.js
import { defaultTheme } from "./src/themes/default";
import fs from "fs";

// Generate static files at build time
fs.writeFileSync(
  "./dist/tailwind.config.js",
  generateTailwindConfig(defaultTheme),
);
fs.writeFileSync("./dist/variables.css", generateCSSVariables(defaultTheme));

// Runtime (for dynamic theming)
// In the app
const themeManager = new ThemeManager(defaultTheme);

// User changes theme
themeManager.updateTheme({
  colors: {
    primary: newPrimaryColorScale,
  },
});
// CSS variables automatically update
```

## Implementation Phases

### Phase 1: Core Theme Structure

- [ ] Define TypeScript interfaces
- [ ] Create default Brainwave 2.0 theme
- [ ] Implement ThemeManager class
- [ ] Add theme validation

### Phase 2: Export Formats

- [ ] CSS variable generator
- [ ] Tailwind config generator
- [ ] JSON serialization
- [ ] TypeScript type exports

### Phase 3: Integration Adapters

- [ ] Tailwind plugin
- [ ] React ThemeProvider
- [ ] Node editor adapter
- [ ] Build tools

### Phase 4: Theme Tools

- [ ] Theme builder UI
- [ ] Color scale generator
- [ ] Theme migration tools
- [ ] Theme documentation

## Benefits of This Approach

1. **Single Source of Truth**: One theme object controls everything
2. **Framework Agnostic**: Pure data structure that can be consumed anywhere
3. **Type Safe**: Full TypeScript support
4. **Runtime Configurable**: Can change themes without rebuild
5. **Build-Time Optimized**: Can generate static assets for production
6. **Extensible**: Can add custom tokens for specific needs
7. **Standards Based**: Uses CSS variables for maximum compatibility

## Usage Examples

### In UI Components

```tsx
// Components use CSS variables
const Button = styled.button`
  background: var(--color-primary-500);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);

  &:hover {
    background: var(--color-primary-600);
  }
`;
```

### With Tailwind

```tsx
// Tailwind classes generated from theme
<button className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-md">
  Click me
</button>
```

### In Node Editor

```tsx
const nodeStyles = nodeThemeAdapter.getNodeStyles();
// Apply to React Flow or custom renderer
```

## Migration Path

1. Start with static theme in `packages/theme`
2. Components consume via CSS variables
3. Add runtime configuration later
4. Gradually migrate existing styles

---

**Last Updated**: 2025-09-04
**Status**: Architecture Design Phase
