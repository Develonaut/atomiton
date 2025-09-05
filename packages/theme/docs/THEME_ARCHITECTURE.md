# Theme Package Architecture

## Vision: Design System Foundation

This document outlines the architecture for `@atomiton/theme` - the design system foundation that provides tokens and primitives for the entire Atomiton ecosystem.

## Architectural Layers

```
┌─────────────────────────────────────────┐
│         apps/client                     │ ← Application Layer
│   • Composes layouts using UI components│   (Business logic & routing)
│   • Manages application state           │
│   • Implements business features        │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│         @atomiton/ui                    │ ← Component Layer
│   • Reusable components (Button, Card)  │   (Visual components)
│   • Component-specific styling          │
│   • Uses theme tokens for consistency   │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│         @atomiton/theme                 │ ← Token Layer
│   • Design tokens (colors, spacing)     │   (Design system)
│   • CSS variables & Tailwind config     │
│   • Theme switching logic               │
└─────────────────────────────────────────┘
```

### Separation of Concerns

- **@atomiton/theme**: Pure design tokens - no components, just variables
- **@atomiton/ui**: Component implementations using theme tokens
- **apps/client**: Application that composes UI components into features

## Current State

We've successfully transformed `@atomiton/tailwind-config` into `@atomiton/theme` which **is fully operational** with centralized CSS variables. Our accomplishments:

- ✅ Renamed package to better reflect its role as the theme system
- ✅ Centralized 170+ CSS variables from across the monorepo
- ✅ Migrated to Tailwind v4 with pure CSS `@theme` directive
- ✅ Fixed all compatibility issues (spacing, colors, shadows)
- ✅ Both `apps/client` and `packages/ui` now import from `@atomiton/theme`
- ✅ No duplicate variable definitions remain
- ✅ Changes in one place update everywhere

Next we need to add capabilities while **preserving this working setup**:

- shadcn/ui compatible CSS variables (in HSL format)
- Runtime theme switching capabilities
- TypeScript definitions for type safety
- Dark mode support

## Current Issues

1. **Incomplete shadcn Integration**: Need proper CSS variable structure for shadcn components
2. **No Runtime Theme Switching**: All theme changes require rebuilds
3. **Missing Dark Mode**: No dark theme variables defined
4. **Type Safety**: No TypeScript definitions for theme tokens

## Implementation Strategy

### Next Phase: Enhanced Theme Capabilities

The `@atomiton/theme` package **is fully functional**. We'll enhance it by:

1. **Preserving everything that works** - all existing variables and imports remain
2. **Adding** shadcn-compatible CSS variables alongside existing ones
3. **Adding** theme switching capabilities without breaking current usage
4. **Adding** TypeScript definitions for better DX
5. **Zero breaking changes** - maintaining backward compatibility

### Enhanced Package Structure

```
packages/theme/
├── package.json            # ✅ Updated with new name
├── src/
│   ├── index.css           # ✅ Main entry with @theme directive
│   ├── variables.css       # ✅ 170+ CSS variables centralized
│   ├── shadcn.css          # 🚧 shadcn-compatible variables (PLANNED)
│   └── themes/
│       ├── light.css       # 📋 Light theme (PLANNED)
│       ├── dark.css        # 📋 Dark theme (PLANNED)
│       └── brainwave.css   # 📋 Brainwave 2.0 theme (PLANNED)
├── docs/
│   ├── THEME_ARCHITECTURE.md  # ✅ This document
│   └── UI_PACKAGE_MIGRATION.md # ✅ Migration guide
├── types/
│   └── index.d.ts          # 📋 TypeScript definitions (PLANNED)
├── COMPLETED.md            # ✅ Completed tasks
├── CURRENT.md              # ✅ Active work
├── NEXT.md                 # ✅ Upcoming features
└── ROADMAP.md              # ✅ Long-term vision

```

### 1. shadcn-Compatible Variables (`shadcn.css`)

New file that bridges our design system with shadcn requirements:

```css
/* packages/theme/src/shadcn.css */

@layer base {
  :root {
    /* shadcn requires HSL format for color opacity support */
    --background: 0 0% 99%; /* #fcfcfc -> hsl */
    --foreground: 0 0% 7%; /* #121212 -> hsl */

    --card: 0 0% 99%; /* Same as background */
    --card-foreground: 0 0% 7%;

    --popover: 0 0% 99%;
    --popover-foreground: 0 0% 7%;

    --primary: 0 0% 7%; /* #121212 -> hsl */
    --primary-foreground: 0 0% 99%;

    --secondary: 0 0% 48%; /* #7b7b7b -> hsl */
    --secondary-foreground: 0 0% 99%;

    --muted: 0 0% 95%; /* #f1f1f1 -> hsl */
    --muted-foreground: 0 0% 48%;

    --accent: 0 0% 95%;
    --accent-foreground: 0 0% 7%;

    --destructive: 9 97% 61%; /* #fe5938 -> hsl */
    --destructive-foreground: 0 0% 99%;

    --border: 0 0% 93%; /* #ececec -> hsl */
    --input: 0 0% 93%;
    --ring: 0 0% 48%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 7%; /* #121212 -> hsl */
    --foreground: 0 0% 99%;

    --card: 0 0% 13%; /* #222222 -> hsl */
    --card-foreground: 0 0% 99%;

    --popover: 0 0% 13%;
    --popover-foreground: 0 0% 99%;

    --primary: 0 0% 99%;
    --primary-foreground: 0 0% 7%;

    --secondary: 0 0% 20%; /* #323232 -> hsl */
    --secondary-foreground: 0 0% 99%;

    --muted: 0 0% 20%;
    --muted-foreground: 0 0% 60%;

    --accent: 0 0% 20%;
    --accent-foreground: 0 0% 99%;

    --destructive: 9 97% 61%;
    --destructive-foreground: 0 0% 99%;

    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 0 0% 60%;
  }
}
```

### 2. Main Entry Point (`index.css`)

Combine all theme layers:

```css
/* packages/theme/src/index.css */

/* Import Tailwind v4 */
@import "tailwindcss";

/* Import our CSS variables */
@import "./variables.css";
@import "./shadcn.css";

/* Define Tailwind v4 theme using @theme */
@theme {
  /* Map shadcn variables to Tailwind theme */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  /* Legacy Atomiton colors */
  --color-shade-01: var(--shade-01);
  --color-shade-02: var(--shade-02);
  --color-shade-03: var(--shade-03);
  --color-shade-04: var(--shade-04);
  --color-shade-05: var(--shade-05);
  --color-shade-06: var(--shade-06);
  --color-shade-07: var(--shade-07);
  --color-shade-08: var(--shade-08);
  --color-shade-09: var(--shade-09);

  /* Brand colors */
  --color-green: #55b93e;
  --color-orange: #e36323;
  --color-red: #fe5938;
  --color-blue: #3582ff;
  --color-yellow: #ffb73a;
  --color-purple: #8755e9;

  /* Border radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
}
```

### 3. TypeScript Definitions (`types/index.d.ts`)

Provide type safety for theme tokens:

```typescript
// packages/theme/types/index.d.ts

export interface ThemeColors {
  // shadcn colors
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;

  // Atomiton shades
  "shade-01": string;
  "shade-02": string;
  "shade-03": string;
  "shade-04": string;
  "shade-05": string;
  "shade-06": string;
  "shade-07": string;
  "shade-08": string;
  "shade-09": string;

  // Brand colors
  green: string;
  orange: string;
  red: string;
  blue: string;
  yellow: string;
  purple: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  radius: string;
  fontFamily: {
    sans: string;
    mono: string;
  };
}

export type Theme = "light" | "dark" | "brainwave";

export function applyTheme(theme: Theme): void;
export function getThemeColors(): ThemeColors;
```

### 4. Package Configuration

Current `package.json` (operational):

```json
{
  "name": "@atomiton/theme",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    "./css": "./src/index.css",        ✅ Active
    "./variables": "./src/variables.css" ✅ Active
  }
}
```

Future exports (planned):

```json
{
  "exports": {
    "./css": "./src/index.css",
    "./variables": "./src/variables.css",
    "./shadcn": "./src/shadcn.css",     📋 Planned
    "./types": "./types/index.d.ts"     📋 Planned
  }
}
```

## Consumer Usage

### Layer 1: Theme Package (Design Tokens Only)

Current implementation:

```css
/* packages/theme/src/index.css */
@import "./variables.css"; /* ✅ 170+ design tokens */

@theme {
  /* ✅ Tailwind v4 theme configuration */
  /* All spacing, colors, shadows mapped */
}
```

Future enhancement:

```css
/* packages/theme/src/index.css */
@import "./variables.css";
@import "./shadcn.css"; /* 📋 shadcn-compatible variables */

@theme {
  /* Existing configuration remains */
}
```

### Layer 2: UI Package (Component Library)

```css
/* packages/ui/tailwind.css */
@import "@atomiton/theme/css"; /* Import design tokens */

/* Scan UI components for Tailwind classes */
@source "./src/**/*.{js,ts,jsx,tsx}";
```

Component examples using theme tokens:

```tsx
// packages/ui/src/components/Button.tsx
export const Button = ({ variant = "primary", ...props }) => {
  // Uses theme tokens via Tailwind classes
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      className={cn(styles[variant], "px-4 py-2 rounded-md")}
      {...props}
    />
  );
};

// packages/ui/src/components/Card.tsx
export const Card = ({ children }) => (
  // Uses Atomiton shade tokens
  <div className="bg-shade-01 border border-shade-04 rounded-lg p-4">
    {children}
  </div>
);
```

### Layer 3: Client Application (Layouts & Features)

```css
/* apps/client/tailwind.css */
@import "tailwindcss";
@import "@atomiton/theme/css"; /* Import design tokens */

/* Scan both client layouts and UI components */
@source "./src/**/*.{js,ts,jsx,tsx}";
@source "../../packages/ui/src/**/*.{js,ts,jsx,tsx}";
```

Layout composition using UI components:

```tsx
// apps/client/src/layouts/Dashboard.tsx
import { Button, Card } from "@atomiton/ui";

export const Dashboard = () => (
  <div className="grid grid-cols-12 gap-4 p-6">
    <aside className="col-span-3">
      <Card>
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <Button variant="ghost">Home</Button>
        <Button variant="ghost">Settings</Button>
      </Card>
    </aside>
    <main className="col-span-9">
      <Card>{/* Application content */}</Card>
    </main>
  </div>
);
```

### Theme Switching (Managed by UI Package)

Since theme switching is a UI concern, the ThemeSwitcher component lives in the UI package:

```typescript
// packages/ui/src/components/ThemeSwitcher.tsx
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Apply theme class to root element
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-lg bg-secondary text-secondary-foreground"
    >
      Toggle Theme
    </button>
  );
}
```

The client app simply uses the component:

```tsx
// apps/client/src/App.tsx
import { ThemeSwitcher } from "@atomiton/ui";

export function App() {
  return (
    <header>
      <ThemeSwitcher />
    </header>
  );
}
```

## Benefits of This Architecture

### Clear Separation

- **Theme**: Only tokens, no opinions about components
- **UI**: Component implementations, no application logic
- **Client**: Application features, no component definitions

### Maintainability

1. **Single Source of Truth**: Change a color in theme, updates everywhere
2. **Component Reusability**: UI components work in any Atomiton app
3. **Layout Flexibility**: Client can compose UI components freely

### Developer Experience

- **Type Safe**: TypeScript definitions flow through all layers
- **Predictable**: Clear boundaries between concerns
- **Scalable**: Easy to add new tokens, components, or features

## Migration Path

### Phase 1: Evolve tailwind-config → theme (PRESERVE WORKING STATE)

1. Rename package from `@atomiton/tailwind-config` to `@atomiton/theme`
2. **Keep all existing files intact** - they're already working!
3. **Add** (don't replace) `shadcn.css` with HSL-based variables
4. Update `index.css` to import both existing and new variables
5. Add TypeScript definitions

### Phase 2: Update Consumers (MINIMAL CHANGES)

1. Update package imports only:
   - `@atomiton/tailwind-config/css` → `@atomiton/theme/css`
2. **No other changes needed** - existing variables continue to work
3. Test that all existing functionality still works
4. Then test new theme switching functionality

### Phase 3: Gradual Enhancement

1. Start using shadcn components alongside existing ones
2. Gradually migrate from `shade-*` to shadcn variables where it makes sense
3. Never break existing functionality

## Implementation Checklist

### Immediate Actions

- [ ] Rename `packages/tailwind-config` → `packages/theme`
- [ ] Create `src/shadcn.css` with HSL variables
- [ ] Update `src/index.css` to import shadcn.css
- [ ] Add TypeScript definitions in `types/`
- [ ] Update package.json exports

### Testing Requirements

- [ ] Verify shadcn component compatibility
- [ ] Test dark mode switching
- [ ] Ensure backward compatibility with shade-\* classes
- [ ] Validate TypeScript types
- [ ] Test in both client and ui packages

### Documentation Updates

- [ ] Update README in theme package
- [ ] Add migration guide for consumers
- [ ] Document theme customization process
- [ ] Add examples of using shadcn components

## Key Architectural Decisions

### Three-Layer Architecture

- **Theme Layer**: Pure design tokens (colors, spacing, typography)
- **Component Layer**: Reusable UI components using theme tokens
- **Application Layer**: Business logic composing UI components

### Why This Separation?

1. **Theme changes don't require component updates** - Just change tokens
2. **Components are app-agnostic** - Work in any Atomiton application
3. **Applications focus on features** - Not worried about component implementation

### Technical Decisions

#### Why HSL for shadcn Variables?

- shadcn/ui requires HSL for opacity support
- Enables `bg-primary/50` syntax in Tailwind
- Standard format for modern component libraries

#### Why Keep Legacy shade-\* Classes?

- Extensive usage throughout existing codebase
- Gradual migration path
- No breaking changes for existing features

#### Why Tailwind v4 Only?

- Both client and ui already use v4
- Simpler configuration with @theme directive
- Better performance with native CSS variables

## Summary

The three-layer architecture creates clear boundaries:

```
apps/client    → Builds features using UI components
     ↑
@atomiton/ui   → Provides components styled with theme tokens
     ↑
@atomiton/theme → Defines design tokens for consistency
```

This separation ensures:

- **Theme** can evolve without breaking components
- **UI** components remain reusable across applications
- **Client** focuses on business logic, not styling details

The evolution from `@atomiton/tailwind-config` to `@atomiton/theme` is the foundation that enables this clean architecture while maintaining full backward compatibility and adding shadcn/ui support.
