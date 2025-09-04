# Theme Architecture - Integration Patterns & Implementation

## Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Core Components](#core-components)
- [Integration Patterns](#integration-patterns)
- [Implementation Details](#implementation-details)
- [Runtime Theme Switching](#runtime-theme-switching)
- [Performance Optimizations](#performance-optimizations)
- [Testing Strategy](#testing-strategy)
- [Migration Guide](#migration-guide)
- [Future Roadmap](#future-roadmap)

## Overview

The Atomiton theme system provides a centralized, type-safe approach to styling that integrates seamlessly with Mantine UI while maintaining consistency across all components. This architecture enables runtime theme switching, excellent developer experience, and extensibility for future theme variants.

## Architecture Principles

### Single Source of Truth

All color definitions, design tokens, and styling constants originate from the `@atomiton/theme` package. This prevents duplication and ensures consistency across the entire application.

### Type Safety First

Every color, spacing value, and design token is fully typed, providing excellent IDE support and preventing runtime errors.

### Performance Optimized

- CSS custom properties for runtime theming
- Minimal bundle impact through tree-shaking
- Efficient Mantine theme overrides
- Zero runtime color calculations where possible

### Extensibility Built-In

The architecture supports theme variants, custom overrides, and future monetization features like premium themes.

## Package Structure

```
packages/theme/
├── src/
│   ├── colors/
│   │   ├── index.ts           # Main color exports
│   │   ├── dracula.ts         # Core Dracula palette
│   │   ├── semantic.ts        # UI semantic colors
│   │   ├── status.ts          # Status/state colors
│   │   ├── categories.ts      # Node category colors
│   │   └── alpha.ts           # Transparent variations
│   ├── tokens/
│   │   ├── spacing.ts         # Spacing scale
│   │   ├── typography.ts      # Font definitions
│   │   ├── shadows.ts         # Box shadow definitions
│   │   ├── radius.ts          # Border radius scale
│   │   └── animation.ts       # Animation presets
│   ├── mantine/
│   │   ├── theme.ts           # Main Mantine theme
│   │   ├── components.ts      # Component overrides
│   │   ├── global.ts          # Global CSS injection
│   │   └── variants.ts        # Custom variants
│   ├── utils/
│   │   ├── colors.ts          # Color manipulation utilities
│   │   ├── css-vars.ts        # CSS variable generation
│   │   └── contrast.ts        # Accessibility helpers
│   ├── types/
│   │   ├── theme.ts           # Core theme interfaces
│   │   ├── colors.ts          # Color type definitions
│   │   └── tokens.ts          # Design token types
│   └── index.ts               # Package exports
```

## Core Interfaces

### Theme Interface

```typescript
export interface AtomitonTheme {
  name: string;
  colors: ColorScheme;
  tokens: DesignTokens;
  mantine: MantineThemeOverride;
  cssVars: CSSVariables;
}

export interface ColorScheme {
  // Base colors
  background: string;
  foreground: string;
  surface: string;
  border: string;

  // Brand colors
  primary: string;
  secondary: string;
  accent: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Interactive states
  hover: string;
  active: string;
  disabled: string;
  focus: string;

  // Data type colors
  dataTypes: DataTypeColors;

  // Node categories
  categories: CategoryColors;
}

export interface DesignTokens {
  spacing: SpacingScale;
  typography: Typography;
  shadows: ShadowScale;
  radius: RadiusScale;
  animation: AnimationPresets;
}
```

### Component Integration Interface

```typescript
export interface ThemedComponentProps {
  theme?: AtomitonTheme;
  variant?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export interface ThemeProviderProps {
  theme: AtomitonTheme;
  cssVariables?: boolean;
  children: React.ReactNode;
}
```

## Integration Patterns

### 1. Mantine Integration

#### Theme Provider Setup

```typescript
// apps/client/src/main.tsx
import { MantineProvider } from '@mantine/core';
import { DraculaTheme, generateMantineTheme } from '@atomiton/theme';

const mantineTheme = generateMantineTheme(DraculaTheme);

function App() {
  return (
    <MantineProvider theme={mantineTheme}>
      <YourApp />
    </MantineProvider>
  );
}
```

#### Component Override Pattern

```typescript
// packages/theme/src/mantine/components.ts
import { MantineTheme } from "@mantine/core";
import { COLORS, SPACING } from "../colors";

export const componentOverrides = {
  Button: (theme: MantineTheme) => ({
    styles: {
      root: {
        backgroundColor: COLORS.purple,
        color: COLORS.foreground,
        borderRadius: SPACING.md,

        "&:hover": {
          backgroundColor: COLORS.pink,
        },

        '&[data-variant="outline"]': {
          backgroundColor: "transparent",
          borderColor: COLORS.cyan,
          color: COLORS.cyan,

          "&:hover": {
            backgroundColor: COLORS.currentLine,
          },
        },
      },
    },
  }),

  Card: (theme: MantineTheme) => ({
    styles: {
      root: {
        backgroundColor: COLORS.currentLine,
        borderColor: COLORS.comment,
        color: COLORS.foreground,
      },
    },
  }),
};
```

### 2. CSS Variables Integration

#### Variable Generation

```typescript
// packages/theme/src/utils/css-vars.ts
export function generateCSSVariables(theme: AtomitonTheme): CSSVariables {
  const vars: Record<string, string> = {};

  // Color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === "string") {
      vars[`--color-${kebabCase(key)}`] = value;
    } else {
      // Handle nested color objects (dataTypes, categories)
      Object.entries(value).forEach(([subKey, subValue]) => {
        vars[`--color-${kebabCase(key)}-${kebabCase(subKey)}`] = subValue;
      });
    }
  });

  // Token variables
  Object.entries(theme.tokens.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = `${value}px`;
  });

  Object.entries(theme.tokens.radius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = `${value}px`;
  });

  return vars;
}
```

#### Runtime Application

```typescript
// packages/theme/src/utils/css-vars.ts
export function applyCSSVariables(theme: AtomitonTheme): void {
  const variables = generateCSSVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

// Usage in app
import { applyCSSVariables, DraculaTheme } from "@atomiton/theme";

// Apply theme on app start
applyCSSVariables(DraculaTheme);
```

### 3. Component Styling Patterns

#### CSS-in-JS with Theme

```typescript
// packages/ui/src/components/Node/Node.tsx
import { styled } from "@mantine/core";
import { COLORS, SPACING } from "@atomiton/theme";

const NodeContainer = styled.div<{ selected?: boolean; category?: string }>`
  background: ${COLORS.currentLine};
  border: 2px solid ${COLORS.comment};
  border-radius: ${SPACING.md}px;
  padding: ${SPACING.sm}px ${SPACING.md}px;
  color: ${COLORS.foreground};

  ${({ selected }) =>
    selected &&
    `
    border-color: ${COLORS.purple};
    box-shadow: 0 0 0 2px ${COLORS.purple}33;
  `}

  ${({ category }) =>
    category &&
    `
    border-left: 4px solid var(--color-categories-${category});
  `}
  
  &:hover {
    background: ${COLORS.selection};
    transform: translateY(-1px);
    box-shadow: ${shadows.md};
  }

  transition: all 200ms ease;
`;
```

#### CSS Variables with Components

```typescript
// Alternative approach using CSS variables
const NodeContainer = styled.div`
  background: var(--color-current-line);
  border: 2px solid var(--color-comment);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-foreground);

  &[data-selected="true"] {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-alpha);
  }

  &:hover {
    background: var(--color-hover);
    transform: translateY(-1px);
  }
`;
```

### 4. Type-Safe Color Access

#### Color Hook Pattern

```typescript
// packages/theme/src/hooks/useColors.ts
export function useColors() {
  const theme = useMantineTheme();

  return {
    // Direct color access
    colors: COLORS,

    // Semantic helpers
    getPrimaryColor: () => COLORS.purple,
    getStatusColor: (status: 'success' | 'warning' | 'error' | 'info') =>
      STATUS_COLORS[status],
    getCategoryColor: (category: string) =>
      CATEGORY_COLORS[category] || COLORS.purple,
    getDataTypeColor: (dataType: string) =>
      DATA_TYPE_COLORS[dataType] || COLORS.foreground,

    // Utility functions
    withAlpha: (color: string, alpha: number) =>
      `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`,
    getContrastText: (backgroundColor: string) =>
      getContrastColor(backgroundColor),
  };
}

// Usage in components
const MyComponent = () => {
  const { colors, getCategoryColor, withAlpha } = useColors();

  return (
    <div style={{
      backgroundColor: getCategoryColor('data'),
      borderColor: withAlpha(colors.purple, 0.5),
    }}>
      Themed content
    </div>
  );
};
```

## Advanced Patterns

### 1. Theme Switching

#### Theme Context

```typescript
// packages/theme/src/context/ThemeContext.tsx
interface ThemeContextValue {
  currentTheme: AtomitonTheme;
  availableThemes: AtomitonTheme[];
  setTheme: (theme: AtomitonTheme) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>();

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(DraculaTheme);

  const setTheme = useCallback((theme: AtomitonTheme) => {
    setCurrentTheme(theme);
    applyCSSVariables(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, ... }}>
      <MantineProvider theme={generateMantineTheme(currentTheme)}>
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};
```

### 2. Brainwave 2.0 Visual Components

#### Glass Effect Utility

```typescript
// packages/theme/src/utils/glass.ts
export interface GlassProps {
  strength?: "subtle" | "medium" | "strong";
  blur?: number;
  opacity?: number;
}

export function createGlassStyle(props: GlassProps = {}) {
  const { strength = "medium", blur, opacity } = props;

  const configs = {
    subtle: { blur: 5, opacity: 0.3 },
    medium: { blur: 10, opacity: 0.5 },
    strong: { blur: 20, opacity: 0.8 },
  };

  const config = configs[strength];
  const finalBlur = blur ?? config.blur;
  const finalOpacity = opacity ?? config.opacity;

  return {
    background: `rgba(68, 71, 90, ${finalOpacity})`,
    backdropFilter: `blur(${finalBlur}px)`,
    border: "1px solid rgba(248, 248, 242, 0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  };
}

// Usage
const GlassPanel = styled.div<GlassProps>`
  ${(props) => createGlassStyle(props)}
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
`;
```

### 3. Animation Integration

#### Animation Presets

```typescript
// packages/theme/src/tokens/animation.ts
export const ANIMATION_PRESETS = {
  // Transitions
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",

  // Easings
  easeOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeIn: "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  // Complex animations
  slideIn: "slideIn 200ms ease-out",
  fadeIn: "fadeIn 150ms ease-out",
  scaleIn: "scaleIn 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  // Hover effects
  lift: "transform 200ms ease, box-shadow 200ms ease",
  glow: "box-shadow 300ms ease",
} as const;

// Keyframes
export const KEYFRAMES = `
  @keyframes slideIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;
```

## Performance Considerations

### Bundle Optimization

```typescript
// Tree-shakeable exports
export { COLORS } from "./colors/dracula";
export { SPACING } from "./tokens/spacing";
export { DraculaTheme } from "./themes/dracula";

// Conditional imports for large utilities
export const colorUtils = {
  // Lazy load color manipulation functions
  lighten: () => import("./utils/color-manipulation").then((m) => m.lighten),
  darken: () => import("./utils/color-manipulation").then((m) => m.darken),
};
```

### Runtime Performance

- CSS variables eliminate JavaScript color calculations
- Mantine theme caching prevents unnecessary re-renders
- Selective re-application of styles during theme switches

### Memory Management

- Theme objects are frozen to prevent mutations
- CSS variable cleanup on theme changes
- Efficient event listener management in theme context

## Testing Strategy

### Theme Testing

```typescript
// packages/theme/src/__tests__/theme.test.ts
describe("Dracula Theme", () => {
  it("should have all required colors defined", () => {
    expect(DraculaTheme.colors.background).toBeDefined();
    expect(DraculaTheme.colors.primary).toBeDefined();
  });

  it("should generate valid CSS variables", () => {
    const vars = generateCSSVariables(DraculaTheme);
    expect(vars["--color-background"]).toBe("#282a36");
  });

  it("should maintain accessibility standards", () => {
    const contrastRatio = getContrastRatio(
      DraculaTheme.colors.foreground,
      DraculaTheme.colors.background,
    );
    expect(contrastRatio).toBeGreaterThan(7); // WCAG AA
  });
});
```

### Visual Regression Tests

```typescript
// Integration with Playwright for visual testing
test("theme consistency across components", async ({ page }) => {
  await page.goto("/storybook");

  // Test each component with theme applied
  const components = ["Button", "Card", "Node", "Panel"];

  for (const component of components) {
    await page.locator(`[data-testid="${component}"]`).screenshot({
      path: `screenshots/theme-${component}.png`,
    });
  }
});
```

---

**Next Steps**:

1. Implement the complete theme package structure
2. Create Mantine integration layer
3. Add theme switching capabilities
4. Build testing utilities
5. Create performance monitoring for theme operations
