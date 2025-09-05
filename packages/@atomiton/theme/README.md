# @atomiton/theme

Unified theme system for the Atomiton monorepo. Single source of truth for design tokens, colors, spacing, typography, and Tailwind configuration. Built for seamless shadcn/ui integration.

## Architecture

This package implements a three-layer theme architecture:

```
Token Layer (this package) → Component Layer (@atomiton/ui) → Application Layer (apps/*)
```

## Installation

```bash
pnpm add @atomiton/theme@workspace:*
```

## Usage

### Tailwind v4 with CSS Variables

```css
/* apps/client/tailwind.css */
@import "tailwindcss";
@import "@atomiton/theme/css";

/* Scan your source files */
@source "./src/**/*.{js,ts,jsx,tsx,css}";
```

### Import in Your App

```css
/* apps/client/src/index.css */
@import "../tailwind.css";
```

### Access CSS Variables Directly

```css
/* Import just the variables */
@import "@atomiton/theme/variables";
```

## Design Tokens

### Core Shade System

Our grayscale system using 9 carefully selected shades:

```css
/* CSS Variables */
--shade-01: #fcfcfc;  /* Primary backgrounds */
--shade-02: #f8f7f7;  /* Secondary backgrounds */
--shade-03: #f1f1f1;  /* Tertiary backgrounds */
--shade-04: #ececec;  /* Borders */
--shade-05: #e2e2e2;  /* Dividers */
--shade-06: #7b7b7b;  /* Secondary text */
--shade-07: #323232;  /* Dark accents */
--shade-08: #222222;  /* Dark backgrounds */
--shade-09: #121212;  /* Primary text */

/* Tailwind Classes */
bg-shade-01 through bg-shade-09
text-shade-01 through text-shade-09
border-shade-01 through border-shade-09
```

### Brand Colors

```css
/* Primary brand palette */
--color-green: #55b93e;
--color-orange: #e36323;
--color-red: #fe5938;
--color-blue: #3582ff;
--color-yellow: #ffb73a;
--color-purple: #8755e9;

/* Tailwind Classes */
bg-green, text-green, border-green
bg-orange, text-orange, border-orange
/* ... etc */
```

### Semantic Colors (shadcn/ui Compatible)

```css
/* Surface colors */
--color-primary: var(--shade-09);
--color-secondary: var(--shade-06);
--color-surface-01: var(--shade-01);
--color-surface-02: var(--shade-02);
--color-surface-03: var(--shade-03);

/* Tailwind Classes */
bg-primary, bg-secondary
bg-surface-01, bg-surface-02, bg-surface-03
```

## Typography System

Custom typography scale with line heights and letter spacing:

```css
/* Headings */
.text-h1 through .text-h6

/* Body text */
.text-body-sm  /* 0.6875rem */
.text-body-md  /* 0.75rem */
.text-body-lg  /* 0.8125rem */

/* Specialized text */
.text-heading    /* 0.875rem */
.text-title      /* 0.9375rem */
.text-title-lg   /* 1.125rem */

/* Paragraphs */
.text-p-sm  /* 0.8125rem */
.text-p-md  /* 0.9375rem */
```

## Spacing System

Comprehensive spacing using calc-based system:

```css
/* Base unit */
--spacing: 0.25rem;

/* Calculated values */
--spacing-12: calc(var(--spacing) * 12);  /* 3rem */
--spacing-66: calc(var(--spacing) * 66);  /* 16.5rem */
/* ... and many more */

/* Tailwind Classes */
p-12, m-66, gap-2.75, space-x-1.25
```

## Shadows

Pre-defined shadow styles:

```css
--shadow-toolbar
--shadow-prompt-input
--shadow-depth-01
--shadow-popover

/* Tailwind Classes */
shadow-toolbar, shadow-prompt-input, shadow-depth-01, shadow-popover
```

## Package Structure

```
@atomiton/theme/
├── src/
│   ├── index.css      # Main theme configuration with @theme
│   └── variables.css  # Raw CSS variables
├── docs/
│   ├── THEME_ARCHITECTURE.md
│   └── UI_PACKAGE_MIGRATION.md
├── COMPLETED.md       # What's been done
├── CURRENT.md         # Active work
├── NEXT.md           # Upcoming features
├── ROADMAP.md        # Long-term vision
└── README.md         # This file
```

## Current Status

✅ **Phase 1: Foundation** - Complete

- Centralized 170+ CSS variables
- Migrated to Tailwind v4 with @theme directive
- Pure CSS configuration (no JavaScript build required)

🚧 **Phase 2: shadcn/ui Integration** - In Progress

- Mapping Atomiton colors to shadcn semantic tokens
- Creating theme variants (light, dark, brainwave)

## Upcoming Features

- Runtime theme switching
- TypeScript type definitions for all tokens
- Theme preview/editor tool
- Figma token sync
- Dark mode support
- A11y compliance checking

## Migration from tailwind-config

This package was renamed from `@atomiton/tailwind-config` to `@atomiton/theme` to better reflect its expanded role as the central theme system. Update your imports:

```diff
- import "@atomiton/tailwind-config/css"
+ import "@atomiton/theme/css"
```

## Documentation

- [Theme Architecture](./docs/THEME_ARCHITECTURE.md) - Detailed architecture guide
- [UI Migration Guide](./docs/UI_PACKAGE_MIGRATION.md) - Component migration strategy
- [Roadmap](./ROADMAP.md) - Long-term vision and milestones

## License

MIT
