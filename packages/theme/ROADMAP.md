# Theme Package Roadmap

## Vision

Create a comprehensive, maintainable theme system that powers Atomiton's visual identity across all platforms while enabling rapid UI development through shadcn/ui integration.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Application Layer               │
│         (apps/client, apps/desktop, etc.)        │
└─────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────┐
│                 Component Layer                  │
│              (@atomiton/ui package)              │
│         - Composed shadcn/ui components          │
│         - Custom Atomiton components             │
└─────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────┐
│                   Token Layer                    │
│              (@atomiton/theme package)           │
│         - Design tokens (colors, spacing)        │
│         - Tailwind configuration                 │
│         - shadcn compatibility layer             │
└─────────────────────────────────────────────────┘
```

## Milestones

### Q1 2025: Foundation ✅

- [x] Package creation and setup
- [x] CSS variable centralization
- [x] Tailwind v4 migration
- [ ] Basic shadcn compatibility

### Q2 2025: Integration

- [ ] Full shadcn/ui component library
- [ ] Runtime theme switching
- [ ] Dark mode support
- [ ] Theme documentation site

### Q3 2025: Enhancement

- [ ] Advanced theme features
- [ ] Design-dev workflow tools
- [ ] Performance optimizations
- [ ] Cross-platform consistency

### Q4 2025: Ecosystem

- [ ] Figma integration
- [ ] VS Code extensions
- [ ] Theme marketplace
- [ ] Community themes

## Success Metrics

- **Developer Velocity**: 50% reduction in UI development time
- **Consistency**: 100% token adoption across components
- **Performance**: < 10kb theme bundle size
- **Accessibility**: WCAG AAA compliance
- **Maintainability**: Single source of truth for all design decisions

## Technical Requirements

### Phase 1: Core Theme System ✅

- Centralized design tokens
- Tailwind v4 configuration
- CSS custom properties
- Type-safe theme access

### Phase 2: shadcn Integration (Current)

- shadcn CLI compatibility
- Component theming API
- Variant system (CVA)
- Theme provider

### Phase 3: Runtime Features

- Dynamic theme switching
- Theme persistence
- System preference sync
- Custom theme creation

### Phase 4: Developer Experience

- Hot reload theming
- Visual theme editor
- A11y validation
- Performance monitoring

## Migration Strategy

### Step 1: Token Migration ✅

- Extract all colors, spacing, typography
- Create CSS variable system
- Map to Tailwind utilities

### Step 2: Component Preparation

- Audit component styles
- Identify theming touchpoints
- Create migration checklist

### Step 3: Incremental Updates

- Update components individually
- Maintain backward compatibility
- Provide codemods for automation

### Step 4: Deprecation

- Remove legacy styles
- Clean up old dependencies
- Final optimization pass

## Dependencies & Risks

### Dependencies

- Tailwind CSS v4
- shadcn/ui
- CVA (class-variance-authority)
- React 19

### Risks & Mitigations

| Risk                   | Impact | Mitigation                                 |
| ---------------------- | ------ | ------------------------------------------ |
| Breaking changes       | High   | Gradual migration with compatibility layer |
| Performance regression | Medium | Bundle size monitoring, lazy loading       |
| shadcn incompatibility | Medium | Custom adapter layer if needed             |
| Team adoption          | Low    | Training, documentation, tooling           |

## Resources

- [Theme Architecture](./docs/THEME_ARCHITECTURE.md)
- [UI Migration Guide](./docs/UI_PACKAGE_MIGRATION.md)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind v4 Migration](https://tailwindcss.com/docs)
