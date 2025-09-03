# Brainwave 2.0 Theme System

## Overview

Atomiton uses **Brainwave 2.0** as our design foundation - a modern, sophisticated look and feel that we're adapting into a functional Mantine-based theme system. This gives us a premium, professional aesthetic that stands out in the automation tools space.

## Design Credits

**Brainwave 2.0 by UI8**

- Live Demo: https://brainwave2-app.vercel.app/
- Design Kit: https://ui8.net/ui8/products/brainwave-20-ai-powered-3d-ui-kit
- License: Commercial license purchased for Atomiton
- Usage: Inspiration and adaptation, not direct copying

## What is Brainwave 2.0?

Brainwave 2.0 is a cutting-edge design system known for:

- **Modern gradients** and sophisticated visual effects
- **Sleek, futuristic** interface elements
- **Dark mode first** with subtle accent colors
- **Smooth animations** and micro-interactions
- **Professional, premium** feel

## Our Adaptation Strategy

### From Design to Implementation

We're taking Brainwave 2.0's visual language and:

1. **Extracting color palette** and design tokens
2. **Converting to Mantine theme** configuration
3. **Creating reusable components** with the aesthetic
4. **Ensuring accessibility** while maintaining beauty
5. **Optimizing for performance** in our desktop app

### Key Visual Elements

#### Color Palette (Brainwave-inspired)

```typescript
// Primary colors from Brainwave 2.0
const colors = {
  // Deep backgrounds
  background: {
    primary: "#0A0A0B", // Near black
    secondary: "#131316", // Slightly lighter
    tertiary: "#1A1A1F", // Card backgrounds
  },

  // Accent colors
  accent: {
    primary: "#6366F1", // Electric indigo
    secondary: "#8B5CF6", // Purple gradient
    tertiary: "#06B6D4", // Cyan highlights
  },

  // Glass effects
  glass: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
    shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)",
    glow: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
  },
};
```

#### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

## Implementation with Mantine

### Theme Configuration

```typescript
// packages/theme/src/brainwave-theme.ts
import { MantineThemeOverride } from "@mantine/core";

export const brainwaveTheme: MantineThemeOverride = {
  colorScheme: "dark",
  primaryColor: "indigo",

  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5C5F66",
      "#373A40",
      "#2C2E33",
      "#1A1A1F", // Brainwave tertiary
      "#131316", // Brainwave secondary
      "#0A0A0B", // Brainwave primary
      "#000000",
    ],
    indigo: [
      // Generated scale based on Brainwave accent
      "#E8E9FF",
      "#C4C6FF",
      "#9FA2FF",
      "#7B7FFF",
      "#6366F1", // Primary
      "#5558E3",
      "#474AD5",
      "#393CC7",
      "#2B2EB9",
      "#1D20AB",
    ],
  },

  shadows: {
    md: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    xl: "0 20px 40px 0 rgba(31, 38, 135, 0.25)",
  },

  components: {
    Card: {
      styles: {
        root: {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    Button: {
      styles: {
        root: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
          },
        },
      },
    },
  },
};
```

## Visual Features

### Modern Visual Effects

- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders with opacity
- Soft shadows for depth

### Gradient Accents

- Primary actions with gradient backgrounds
- Glow effects on hover
- Gradient borders for emphasis
- Animated gradient transitions

### Dark Excellence

- True dark mode (not just gray)
- High contrast for readability
- Accent colors that pop
- Reduced eye strain

## Differentiation from Competitors

| Tool           | Theme Approach   | Our Advantage               |
| -------------- | ---------------- | --------------------------- |
| n8n            | Basic light/dark | Premium Brainwave aesthetic |
| Zapier         | Corporate clean  | Modern, futuristic feel     |
| Make           | Functional gray  | Beautiful glass effects     |
| Power Automate | Microsoft Fluent | Unique visual identity      |

## Implementation Status

### Current State

- 🔴 Theme package empty (waiting for Mantine migration)
- 🔴 Brainwave colors not yet extracted
- 🔴 Components not styled

### Next Steps

1. Complete Tailwind → Mantine migration
2. Extract Brainwave 2.0 color palette
3. Create Mantine theme configuration
4. Style all components with Brainwave aesthetic
5. Add Brainwave 2.0 visual effects

## Why Brainwave 2.0?

### For Users

- **Beautiful to use daily** - Not just functional
- **Professional appearance** - Looks premium
- **Modern aesthetic** - Feels cutting-edge
- **Dark mode perfection** - Easy on the eyes

### For Atomiton

- **Differentiation** - Unique in automation space
- **Premium feel** - Justifies pro features
- **Consistent system** - Single source of truth
- **Extensible** - Can offer theme variations

## Future Themes

While Brainwave 2.0 is our primary theme, the architecture supports:

- Alternative color schemes
- Light mode variants
- High contrast accessibility
- Custom user themes
- Theme marketplace

## Resources

- Brainwave 2.0 design reference
- Mantine theming documentation
- Glass morphism CSS techniques
- Gradient animation patterns

---

**Note**: We're taking Brainwave 2.0's look and feel and making it functional within our Mantine-based component system. This is our key visual differentiator - making automation tools beautiful, not just functional.
