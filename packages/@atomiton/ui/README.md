---
title: "@atomiton/ui"
description: "A comprehensive UI component library and design system for the Atomiton"
stage: "alpha"
version: "0.1.0"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "ui-library"
  complexity: "complex"
  primary_language: "typescript"
---
# Atomiton UI Components

A comprehensive UI component library and design system for the Atomiton
platform. This package contains reusable components implementing the Atomiton
design system, built for desktop-first experiences.

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - What we're actively building
- **[Upcoming Features](./NEXT.md)** - Planned components and features
- **[Release History](./COMPLETED.md)** - What's been shipped

## Overview

The Atomiton UI package serves as both a component library and a visual
development environment where components are showcased, tested, and validated.
It's designed specifically for the Atomiton Flow automation platform and will be
packaged as a desktop application.

### Key Features

- **Atomiton Design System**: Complete implementation of the modern Atomiton
  design language
- **Desktop-First**: Optimized for desktop application experiences
- **Component Showcase**: Interactive pages for testing and validating
  components
- **Visual Regression Testing**: Automated screenshot testing with Playwright
- **Theme Integration**: Built-in design system and theming
- **Hot Reloading**: Real-time development with theme changes

## Technology Stack

- **Build Tool**: [Vite](https://vitejs.dev) - Fast, modern development and
  build tooling
- **Framework**: [React 19](https://react.dev) with TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with custom Atomiton
  theme
- **Routing**: [React Router v7](https://reactrouter.com) for client-side
  navigation
- **UI Primitives**: [Headless UI](https://headlessui.com) for accessible
  components
- **Testing**: [Playwright](https://playwright.dev) for visual regression tests
- **Monorepo**: Part of Turborepo-based Atomiton monorepo

## Project Structure

```
packages/ui/
├── src/                          # Vite application source
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # Application entry point
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── Button/                   # Button variations
│   ├── Layout/                   # Layout components
│   ├── ThemeProvider/            # Theme context provider
│   └── ...                       # 60+ other components
├── templates/                    # Component showcase pages
│   ├── HomePage/                 # Navigation and overview
│   ├── ButtonsPage/              # Button component demos
│   ├── ColorsPage/               # Color system showcase
│   └── ...                       # Pages for each component type
├── tests/                        # Playwright test files
├── screenshots/                  # Visual regression baselines
└── vite.config.ts               # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (managed via Turborepo)
- This package contains a built-in design system

### Installation

From the project root:

```bash
# Install all dependencies
pnpm install

# Build dependencies
pnpm build
```

### Development

```bash
# Start development server
pnpm dev

# Start with hot-reloading (recommended)
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002) to view the component
showcase.

### Available Scripts

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `pnpm dev`         | Start Vite development server          |
| `pnpm build`       | Build for production                   |
| `pnpm preview`     | Preview production build               |
| `pnpm lint`        | Run ESLint with zero warnings policy   |
| `pnpm lint:fix`    | Fix linting issues automatically       |
| `pnpm typecheck`   | Run TypeScript type checking           |
| `pnpm test`        | Run Playwright visual regression tests |
| `pnpm test:ui`     | Run tests with Playwright UI           |
| `pnpm test:headed` | Run tests in headed browser mode       |

## Component Development

### Adding New Components

1. Create component directory in `/components/`
2. Implement component with TypeScript and Tailwind
3. Create showcase page in `/templates/`
4. Add route to `src/App.tsx`
5. Update visual regression tests

### Design System Integration

Components automatically inherit from the Atomiton theme via:

- **Theme Provider**: `components/ThemeProvider` wraps the entire app
- **Tailwind Config**: Built-in design tokens for consistent theming
- **CSS Variables**: Theme-aware custom properties for colors, spacing,
  typography

### Component Guidelines

- Use TypeScript for all components
- Follow existing naming conventions
- Implement responsive design (desktop-first)
- Include proper accessibility attributes
- Document props with JSDoc comments

## Testing

### Visual Regression Testing

The package uses Playwright for comprehensive visual regression testing:

```bash
# Run all tests
pnpm test

# Update screenshots (after intentional changes)
pnpm test --update-snapshots

# Run specific test
pnpm test baseline-buttons
```

Test files are located in `/tests/` and baseline screenshots in `/screenshots/`.

### Test Structure

Each component page has corresponding Playwright tests that:

- Navigate to the component page
- Take full-page screenshots
- Compare against baseline images
- Detect visual regressions automatically

## Integration with Atomiton

This UI package integrates with the larger Atomiton ecosystem:

- **Design System**: Built-in design tokens and Tailwind configuration
- **Core Package**: Components will be consumed by `@atomiton/core` Flow engine
- **Client App**: Final application in `apps/client` uses these components
- **Desktop App**: `packages/electron` packages everything as a desktop
  application

## Desktop-First Considerations

This UI library is designed specifically for desktop applications:

- **Fixed Viewports**: Optimized for standard desktop resolutions
- **Mouse Interactions**: Hover states, right-click menus, drag-and-drop
- **Keyboard Navigation**: Full keyboard accessibility support
- **Desktop Patterns**: Native-feeling UI patterns and interactions
- **Performance**: Optimized for desktop rendering and interactions

## Monorepo Development

This package is part of the Atomiton Turborepo monorepo:

```bash
# From project root, run UI commands
pnpm --filter ui dev
pnpm --filter ui build
pnpm --filter ui test

# Run with workspace dependencies
pnpm --filter ui... dev  # Includes dependencies
```

## Contributing

1. Follow the established component patterns
2. Maintain visual regression tests
3. Update documentation for new components
4. Ensure TypeScript compliance
5. Test in desktop context

## Atomiton Design System

The components implement the complete Atomiton design system including:

- **Typography**: Responsive type scale with system fonts
- **Colors**: Semantic color system with dark/light theme support
- **Spacing**: Consistent spacing scale based on 4px grid
- **Shadows**: Layered shadow system for depth perception
- **Interactions**: Smooth animations and micro-interactions
- **Icons**: Comprehensive icon system integrated with components

For detailed design specifications, see the built-in theme configuration in this
package.
