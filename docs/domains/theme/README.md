# @atomiton/theme - Dracula Design System

## Purpose

A centralized theme package that provides the Dracula color palette, design tokens, and Mantine integration for the entire Atomiton platform. This package ensures visual consistency across all UI components while creating a beautiful, polished experience that differentiates Atomiton in the automation tools market.

## Status: 🟡 In Development

Currently scaffolded with minimal implementation. The theme system is referenced throughout the codebase but needs to be fully implemented with the complete Dracula palette and design tokens.

## Design Philosophy

### Visual Identity

- **Dark-first**: Dracula theme as the primary interface paradigm
- **Beautiful by default**: Every component should be visually appealing
- **Polished experience**: Smooth animations, thoughtful interactions
- **Professional feel**: Clean, modern aesthetic that builds trust

### Key Differentiator

While competitors like n8n and Zapier focus on functionality first, Atomiton leads with beauty. Our Dracula theme system makes automation tools enjoyable to use, not just functional.

## Color Palette

### Core Dracula Colors

```typescript
export const COLORS = {
  // Primary background and surfaces
  background: "#282a36", // Main background
  currentLine: "#44475a", // Hover states, selection
  foreground: "#f8f8f2", // Primary text
  comment: "#6272a4", // Secondary text, disabled states

  // Accent colors
  cyan: "#8be9fd", // Info, data types
  green: "#50fa7b", // Success, strings
  orange: "#ffb86c", // Warnings, numbers
  pink: "#ff79c6", // Arrays, special states
  purple: "#bd93f9", // Primary brand, objects
  red: "#ff5555", // Errors, deletion
  yellow: "#f1fa8c", // Highlights, booleans
} as const;
```

### Extended Color System

```typescript
export const UI_COLORS = {
  primary: "#bd93f9", // Purple - main brand color
  secondary: "#8be9fd", // Cyan - secondary actions
  accent: "#ff79c6", // Pink - call-to-action elements
} as const;

export const STATUS_COLORS = {
  success: "#50fa7b", // Green - success states
  warning: "#ffb86c", // Orange - warnings
  error: "#ff5555", // Red - errors
  info: "#8be9fd", // Cyan - information
} as const;

export const CATEGORY_COLORS = {
  // Node categories
  data: "#8be9fd", // Data nodes
  "data-input": "#50fa7b", // Input nodes
  output: "#ff79c6", // Output nodes
  transformation: "#bd93f9", // Transform nodes
  processing: "#ffb86c", // Processing nodes
  utility: "#f1fa8c", // Utility nodes
  api: "#ff5555", // API nodes
  filesystem: "#6272a4", // File operations
  control: "#44475a", // Control flow
} as const;
```

## Architecture

### Theme Structure

```
packages/theme/
├── src/
│   ├── colors/
│   │   ├── dracula.ts      # Core Dracula palette
│   │   ├── semantic.ts     # Semantic color mappings
│   │   └── categories.ts   # Node category colors
│   ├── mantine/
│   │   ├── theme.ts        # Mantine theme configuration
│   │   ├── components.ts   # Component overrides
│   │   └── global.ts       # Global styles
│   ├── tokens/
│   │   ├── spacing.ts      # Design tokens for spacing
│   │   ├── typography.ts   # Font and text styles
│   │   └── shadows.ts      # Shadow definitions
│   └── index.ts            # Main exports
```

### Integration Points

1. **Mantine Integration**

   ```typescript
   import { DraculaTheme } from '@atomiton/theme';
   import { MantineProvider } from '@mantine/core';

   <MantineProvider theme={DraculaTheme}>
     <App />
   </MantineProvider>
   ```

2. **CSS Variables**

   ```css
   :root {
     --color-background: #282a36;
     --color-foreground: #f8f8f2;
     --color-primary: #bd93f9;
     /* ... all theme colors as CSS variables */
   }
   ```

3. **Type Safety**
   ```typescript
   interface ThemeColors {
     background: string;
     foreground: string;
     primary: string;
     // ... full type definitions
   }
   ```

## Current Implementation

### What Exists

- Basic directory structure in `packages/theme/`
- References throughout codebase expecting `@atomiton/theme` imports
- Color constants defined in `packages/core/src/theme/theme.ts` (temporary)
- Mantine integration planned in UI components

### What Needs Implementation

- Complete Dracula color palette in dedicated files
- Mantine theme configuration with overrides
- Design tokens for spacing, typography, shadows
- CSS variable generation for runtime theming
- Type definitions for theme system
- Component-specific style overrides

## Integration with UI Components

### Component Theming Strategy

```typescript
// Each component gets consistent theming
const NodeComponent = styled.div`
  background: var(--color-node-background);
  border: 1px solid var(--color-current-line);
  color: var(--color-foreground);

  &:hover {
    background: var(--color-selection);
  }

  &.selected {
    border-color: var(--color-primary);
  }
`;
```

### Brainwave 2.0 Visual Effects

```typescript
const BrainwaveEffects = {
  background: "rgba(68, 71, 90, 0.8)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(248, 248, 242, 0.1)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
} as const;
```

## Roadmap

### Phase 1: Foundation (Current - Week 1)

- [ ] Implement complete Dracula color palette
- [ ] Create Mantine theme configuration
- [ ] Set up CSS variable system
- [ ] Add TypeScript definitions
- [ ] Create basic design tokens

### Phase 2: Enhancement (Week 2)

- [ ] Add component-specific overrides
- [ ] Implement Brainwave 2.0 visual utilities
- [ ] Create animation presets
- [ ] Add theme switching capability
- [ ] Performance optimization

### Phase 3: Advanced Features (Week 3)

- [ ] Custom theme builder
- [ ] Theme variants (different Dracula shades)
- [ ] High contrast accessibility mode
- [ ] Component showcase/documentation
- [ ] Theme testing utilities

### Phase 4: Polish & Extensibility (Week 4)

- [ ] Community theme support
- [ ] Theme marketplace preparation
- [ ] Advanced animation system
- [ ] Performance monitoring
- [ ] Documentation site

## Learning from n8n's Theme Approach

### What n8n Does Well

- Consistent visual hierarchy
- Clean, professional aesthetic
- Good contrast ratios
- Responsive design patterns

### Areas for Improvement

- Limited customization options
- Inconsistent component styling
- Mixed CSS approaches (inline + classes)
- Performance issues with large workflows

### Our Advantages

1. **Single Source of Truth**: Centralized theme package prevents inconsistencies
2. **Better Performance**: CSS variables + Mantine optimization
3. **Beautiful by Default**: Dracula theme creates emotional connection
4. **Type Safety**: Full TypeScript support for theme system
5. **Extensibility**: Built for customization and variants

## Design Tokens

### Spacing Scale

```typescript
export const SPACING = {
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 16, // 1rem
  lg: 24, // 1.5rem
  xl: 32, // 2rem
  xxl: 48, // 3rem
} as const;
```

### Typography Scale

```typescript
export const TYPOGRAPHY = {
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'JetBrains Mono, "Fira Code", "SF Mono", Consolas, monospace',
  },
  sizes: {
    xs: 12, // Small labels
    sm: 14, // Body text
    md: 16, // Default
    lg: 18, // Headings
    xl: 24, // Large headings
    xxl: 32, // Hero text
  },
} as const;
```

### Shadow System

```typescript
export const SHADOWS = {
  sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
  md: "0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)",
  lg: "0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)",
  xl: "0 20px 40px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.15)",
} as const;
```

## Performance Targets

- **Theme load time**: < 10ms
- **CSS generation**: < 5ms
- **Runtime theme switching**: < 100ms
- **Memory footprint**: < 1MB
- **Bundle size**: < 50KB

## Quality Standards

- **Accessibility**: WCAG 2.1 AA compliant color contrasts
- **Cross-browser**: Support Chrome, Firefox, Safari, Edge
- **Responsive**: Mobile-first design tokens
- **Type Safety**: 100% TypeScript coverage
- **Testing**: Visual regression tests for all theme variations

## Usage Examples

### Basic Theme Usage

```typescript
import { COLORS, DraculaTheme } from '@atomiton/theme';

const MyComponent = () => (
  <div style={{
    backgroundColor: COLORS.background,
    color: COLORS.foreground
  }}>
    Themed component
  </div>
);
```

### Advanced Mantine Integration

```typescript
import { MantineProvider } from '@mantine/core';
import { DraculaTheme, createThemeOverrides } from '@atomiton/theme';

const theme = createThemeOverrides({
  primaryColor: 'purple',
  fontFamily: 'Inter, sans-serif',
});

<MantineProvider theme={theme}>
  <App />
</MantineProvider>
```

---

**Status**: 🟡 In Development  
**Priority**: High (foundational)  
**Lead**: Ryan (Component Perfectionist)  
**Dependencies**: Mantine UI integration  
**Last Updated**: September 2, 2025
