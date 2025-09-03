# Brainwave 2.0 Theme System

## Overview

Atomiton uses **Brainwave 2.0** as our design foundation - a clean, minimal light theme that provides a professional aesthetic for our automation platform. Our existing Tailwind configuration perfectly captures this design language with clean surfaces and subtle typography.

## What is Brainwave 2.0?

Brainwave 2.0 is a clean, minimal light theme characterized by:

- **Clean light backgrounds** with grayscale shades (shade-01 to shade-09)
- **Simple, professional** interface elements
- **Minimal visual effects** focused on content clarity
- **Inter typography** with careful spacing and weights
- **Clean, accessible** color palette

## Current Implementation

Our Tailwind configuration already implements Brainwave 2.0 perfectly:

### Color System (From Tailwind Config)

```css
/* Light theme shades (shade-01 to shade-09) */
--shade-01: #fcfcfc; /* Lightest background */
--shade-02: #f8f7f7; /* Secondary background */
--shade-03: #f1f1f1; /* Tertiary background */
--shade-04: #ececec; /* Border color */
--shade-05: #e2e2e2; /* Border color */
--shade-06: #7b7b7b; /* Secondary text */
--shade-07: #323232; /* Primary text */
--shade-08: #222222; /* Darker text */
--shade-09: #121212; /* Darkest text/primary */

/* Semantic colors */
--color-green: #55b93e;
--color-orange: #e36323;
--color-red: #fe5938;
--color-blue: #3582ff;
--color-yellow: #ffb73a;
--color-purple: #8755e9;
```

### Typography (From Tailwind Config)

```css
/* Inter font family with comprehensive text styles */
h1: 3rem (48px) - line-height: 3.45rem - weight: 400
h2: 2.5rem (40px) - line-height: 3rem - weight: 400
h3: 2rem (32px) - line-height: 2.5rem - weight: 400
h4: 1.75rem (28px) - line-height: 2.25rem - weight: 400
h5: 1.5rem (24px) - line-height: 2rem - weight: 500
h6: 1.25rem (20px) - line-height: 1.75rem - weight: 500

body-sm: 0.6875rem (11px) - weight: 500
body-md: 0.75rem (12px) - weight: 500
body-lg: 0.8125rem (13px) - weight: 400
heading: 0.875rem (14px) - weight: 500
title: 0.9375rem (15px) - weight: 400
title-lg: 1.125rem (18px) - weight: 400
```

## Mantine Theme Translation

The goal is a simple, direct translation of our existing Tailwind values to Mantine:

```typescript
// packages/theme/src/index.ts
import { MantineThemeOverride } from "@mantine/core";

export const brainwaveTheme: MantineThemeOverride = {
  colorScheme: "light", // Brainwave 2.0 is a light theme
  primaryColor: "shade",

  colors: {
    // Direct translation of shade-01 through shade-09
    shade: [
      "#fcfcfc", // shade-01
      "#f8f7f7", // shade-02
      "#f1f1f1", // shade-03
      "#ececec", // shade-04
      "#e2e2e2", // shade-05
      "#7b7b7b", // shade-06
      "#323232", // shade-07
      "#222222", // shade-08
      "#121212", // shade-09
    ],

    // Semantic colors exactly as defined
    green: ["#55b93e"], // Single color, not scale
    orange: ["#e36323"],
    red: ["#fe5938"],
    blue: ["#3582ff"],
    yellow: ["#ffb73a"],
    purple: ["#8755e9"],
  },

  fontFamily: "Inter, sans-serif",

  // Typography matching our CSS variables exactly
  headings: {
    sizes: {
      h1: { fontSize: "3rem", lineHeight: "3.45rem" },
      h2: { fontSize: "2.5rem", lineHeight: "3rem" },
      h3: { fontSize: "2rem", lineHeight: "2.5rem" },
      h4: { fontSize: "1.75rem", lineHeight: "2.25rem" },
      h5: { fontSize: "1.5rem", lineHeight: "2rem" },
      h6: { fontSize: "1.25rem", lineHeight: "1.75rem" },
    },
  },

  // Shadows from our CSS variables
  shadows: {
    toolbar:
      "0px 1px 4px -4px rgba(0, 0, 0, 0.075), 0px 8px 16px -12px rgba(0, 0, 0, 0.125)",
    "prompt-input":
      "inset 0 2px 0 0 #ffffff, 0px 18px 24px -20px rgba(0, 0, 0, 0.125), 0px 8px 16px -12px rgba(0, 0, 0, 0.075)",
    "depth-01":
      "0 6px 3px 0 rgba(0, 0, 0, 0.01), 0 3px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 1px 0 rgba(0, 0, 0, 0.02)",
    popover:
      "0 153px 61px 0 rgba(0, 0, 0, 0.01), 0 86px 52px 0 rgba(0, 0, 0, 0.04), 0 38px 38px 0 rgba(0, 0, 0, 0.06), 0 10px 21px 0 rgba(0, 0, 0, 0.07)",
  },
};
```

## Implementation Status

### ✅ Complete

- Tailwind configuration with perfect Brainwave 2.0 implementation
- CSS variables for all colors, typography, and shadows
- Clean light theme aesthetic

### 🔄 In Progress

- Direct translation to Mantine theme
- Simple theme package without unnecessary abstractions

### 📋 Next Steps

1. Create simple Mantine theme file
2. Remove any complex utilities or abstractions
3. Use Vite for building theme package
4. Export clean theme object

## Key Principles

- **Direct translation** - No interpretation, just convert existing values
- **Light theme** - Brainwave 2.0 is clean and light, not dark
- **No glass morphism** - Clean surfaces, not glassmorphic effects
- **Minimal abstractions** - Simple theme object, no complex utilities
- **Existing values only** - Use what's already working in Tailwind

---

**Note**: This is a straightforward translation of our existing, working Tailwind configuration to Mantine. No design changes, no fancy effects - just making Mantine understand our existing Brainwave 2.0 values.
