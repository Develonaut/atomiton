# UI Package Migration Strategy

## Executive Summary

This document outlines the phased migration strategy for consolidating UI components from `apps/client` into `@atomiton/ui` package, following industry best practices observed in major open-source projects like Vercel, Shadcn UI, and Material UI.

## Current State Analysis

### Architecture Overview

```
atomiton/
├── apps/client/          # Main Vite application (Tailwind 3.4.15)
│   └── 60+ components    # Mix of generic UI and app-specific
├── packages/ui/          # Component library (Tailwind 4.0)
│   └── 65+ components    # CVA-based styled system
└── packages/theme/       # Shared design tokens
```

### Key Differences

| Aspect                | apps/client (Current)     | packages/ui (Current)   | Target State            |
| --------------------- | ------------------------- | ----------------------- | ----------------------- |
| **Tailwind Version**  | 4.0+ ✅                   | 4.0+ ✅                 | Both on 4.0+ ✅         |
| **Tailwind Config**   | Uses @atomiton/theme ✅   | Uses @atomiton/theme ✅ | @atomiton/theme ✅      |
| **Styling Pattern**   | Direct classes + CSS vars | CVA + styled system     | Hybrid approach         |
| **Component Pattern** | Traditional React         | Compound + primitives   | Use UI package patterns |
| **TypeScript**        | Basic types               | Advanced prop resolvers | Unified types           |
| **Theme System**      | @atomiton/theme ✅        | @atomiton/theme ✅      | @atomiton/theme ✅      |

## Phase 0: Complete ✅

We've successfully completed the foundation phase:

1. **Tailwind Alignment**: Both packages now use Tailwind v4 ✅
2. **Shared Configuration**: Created `@atomiton/theme` package with centralized tokens ✅
3. **CSS Variables**: Consolidated 170+ variables into single source of truth ✅
4. **Import Simplification**: Both packages import from `@atomiton/theme/css` ✅
5. **Zero Breaking Changes**: All existing styles continue to work ✅

## Migration Phases

### Phase 0: ✅ COMPLETED - Theme Foundation

**Status**: Successfully completed and operational

**What We Built:**

- Created `@atomiton/theme` package (formerly tailwind-config)
- Migrated to Tailwind v4 with pure CSS configuration
- Centralized 170+ CSS variables
- Both apps/client and packages/ui now use the shared theme

**Current Implementation:**

```css
/* apps/client/tailwind.css */
@import "tailwindcss";
@import "@atomiton/theme/css";
@source "./src/**/*.{js,ts,jsx,tsx,css}";
```

```css
/* packages/ui/tailwind.css */
@import "@atomiton/theme/css";
```

### Phase 1: Component Migration (Ready to Start)

    extend: {
      colors: {
        // Use theme tokens as source of truth
        neutral: tokens.colors.neutral,
        primary: tokens.colors.primary,
        // Maintain backward compatibility during migration
        shade: {
          '01': tokens.colors.neutral[50],
          '02': tokens.colors.neutral[100],
          '03': tokens.colors.neutral[200],
          '04': tokens.colors.neutral[300],
          '05': tokens.colors.neutral[400],
          '06': tokens.colors.neutral[500],
          '07': tokens.colors.neutral[600],
          '08': tokens.colors.neutral[700],
          '09': tokens.colors.neutral[800]
        }
      },
      spacing: tokens.spacing,
      typography: tokens.typography,
      boxShadow: tokens.shadows,
    }

},
plugins: []
}

````

#### 0.3 Upgrade apps/client to Tailwind 4

```bash
# In apps/client directory
pnpm remove tailwindcss autoprefixer postcss
pnpm add -D @atomiton/tailwind-config@workspace:* @tailwindcss/vite
````

**Update Vite Configuration:**

```typescript
// apps/client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite"; // Add this

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(), // Add Tailwind 4 plugin
  ],
  // ... rest of config
});
```

#### 0.4 Create CSS Variable Migration Bridge

```css
/* apps/client/src/index.css */
@import "tailwindcss";

/* Migration bridge - map old CSS variables to Tailwind 4 theme values */
:root {
  /* Map to Tailwind theme tokens for gradual migration */
  --shade-01: theme(colors.shade.01);
  --shade-02: theme(colors.shade.02);
  --shade-03: theme(colors.shade.03);
  --shade-04: theme(colors.shade.04);
  --shade-05: theme(colors.shade.05);
  --shade-06: theme(colors.shade.06);
  --shade-07: theme(colors.shade.07);
  --shade-08: theme(colors.shade.08);
  --shade-09: theme(colors.shade.09);

  /* Keep app-specific variables that don't belong in theme */
  --app-sidebar-width: 260px;
  --app-header-height: 64px;

  /* Maintain existing box-shadow variables during migration */
  --box-shadow-toolbar: theme(boxShadow.toolbar);
  --box-shadow-popover: theme(boxShadow.popover);
}
```

#### 0.5 Validation Checklist

- [ ] Both packages using Tailwind 4.0
- [ ] Shared configuration package created
- [ ] Theme tokens properly mapped
- [ ] CSS variables bridge working
- [ ] Both apps/client and packages/ui build successfully
- [ ] IntelliSense working for Tailwind classes
- [ ] No visual regressions

### Phase 1: Component Integration Setup (Week 1)

**Goal**: Configure apps/client to use @atomiton/ui components

_Prerequisites: Phase 0 (Tailwind Alignment) must be complete_

#### 1.1 Update Package Dependencies

```bash
# In apps/client directory
pnpm add @atomiton/ui@workspace:* @atomiton/theme@workspace:*
```

#### 1.2 Enhanced Vite Configuration

```typescript
// apps/client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite"; // Already added in Phase 0
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // Enable direct imports during development
      "@atomiton/ui": resolve(__dirname, "../../packages/ui/src"),
      "@atomiton/theme": resolve(__dirname, "../../packages/theme/src"),
    },
  },

  server: {
    port: 3001,
    host: true,
    fs: {
      // Allow serving files from workspace packages
      allow: ["../..", "../../packages"],
    },
    watch: {
      // Watch UI package for hot reload
      ignored: ["!**/packages/ui/src/**", "!**/packages/theme/src/**"],
    },
  },

  optimizeDeps: {
    include: ["@atomiton/ui", "@atomiton/theme"],
    // Exclude during development for better HMR
    exclude: ["@atomiton/ui", "@atomiton/theme"],
  },
});
```

#### 1.3 Create Compatibility Layer

Create `apps/client/src/lib/ui-compat.ts` for styling compatibility:

```typescript
export { cn } from "@atomiton/ui/utils";
export { styled } from "@atomiton/ui/system";
```

### Phase 2: Simple Component Migration (Week 1-2)

**Goal**: Migrate components with no dependencies

#### Priority 1 Components (No Dependencies)

- [ ] Image
- [ ] Logo
- [ ] Card
- [ ] Tooltip
- [ ] Badge (if exists)

#### Migration Checklist per Component

1. Import from `@atomiton/ui` instead of local
2. Update import paths in consuming files
3. Test component rendering
4. Verify styling consistency
5. Remove local component file
6. Update any component tests

#### Example Migration

```typescript
// Before (apps/client/src/pages/Home.tsx)
import Image from "@/components/Image";

// After
import { Image } from "@atomiton/ui/components/Image";
// or with barrel export
import { Image } from "@atomiton/ui";
```

### Phase 3: Form Component Migration (Week 2-3)

**Goal**: Migrate form-related components

#### Components to Migrate

- [ ] Button (use adapter pattern)
- [ ] Field / Input
- [ ] Select
- [ ] Switch
- [ ] Search
- [ ] SubmitButton

#### Special Considerations

**Button Adapter Pattern**:
Keep existing `ButtonAdapter.tsx` for router compatibility:

```typescript
// apps/client/src/components/ButtonAdapter.tsx
import { Button as UIButton } from "@atomiton/ui";
import Link from "@/router/Link";

export function Button({ href, ...props }) {
  if (href) {
    return <Link href={href}><UIButton {...props} /></Link>;
  }
  return <UIButton {...props} />;
}
```

### Phase 4: Layout Component Migration (Week 3-4)

**Goal**: Migrate layout and navigation components

#### Components to Migrate

- [ ] Tabs
- [ ] Layout primitives
- [ ] Header variants
- [ ] Navigation elements

#### App-Specific Components to Keep

- LeftSidebar (app-specific)
- RightSidebar (contains app logic)
- LayoutEditor (app feature)
- LayoutOnlyHeader (app variant)

### Phase 5: Complex Component Systems (Week 4-5)

**Goal**: Migrate complex component systems

#### Comment System Strategy

**Option A: Full Migration**

- Replace entire comment system with packages/ui version
- Requires UX alignment

**Option B: Hybrid Approach**

- Use UI primitives from packages/ui
- Keep app-specific comment logic in apps/client

#### Export System Migration

- [ ] Evaluate Export component differences
- [ ] Migrate shared functionality
- [ ] Keep app-specific export logic

### Phase 6: Styling System Alignment (Week 5-6)

**Goal**: Unify styling approaches and complete CSS variable migration

#### Tasks

1. **CSS Variable Migration**
   - Map apps/client CSS variables to theme tokens
   - Update component styles to use theme package

2. **Tailwind Version Alignment**
   - Consider upgrading apps/client to Tailwind 4
   - Or maintain compatibility layer

3. **Remove Duplicate Styles**
   - Audit and remove redundant CSS
   - Consolidate global styles

### Phase 7: Testing & Optimization (Week 6)

**Goal**: Ensure quality and performance

#### Testing Checklist

- [ ] Unit tests for migrated components
- [ ] Visual regression tests
- [ ] E2E tests for critical flows
- [ ] Performance benchmarks
- [ ] Bundle size analysis

#### Optimization Tasks

- [ ] Tree-shaking verification
- [ ] Lazy loading implementation
- [ ] Dead code elimination
- [ ] CSS purge optimization

## Timeline Summary

| Phase       | Duration  | Description                          |
| ----------- | --------- | ------------------------------------ |
| **Phase 0** | Week 0    | Tailwind alignment and shared config |
| **Phase 1** | Week 1    | Component integration setup          |
| **Phase 2** | Weeks 1-2 | Simple component migration           |
| **Phase 3** | Weeks 2-3 | Form component migration             |
| **Phase 4** | Weeks 3-4 | Layout component migration           |
| **Phase 5** | Weeks 4-5 | Complex component systems            |
| **Phase 6** | Weeks 5-6 | Styling system alignment             |
| **Phase 7** | Week 6    | Testing & optimization               |

**Total Duration**: 6 weeks (with overlapping phases)

## Component Classification

### ✅ Safe to Migrate (Direct Replacements)

```
Button, Field, Image, Search, Select, Switch,
Tabs, Tooltip, Card, Logo, Link
```

### ⚠️ Requires Adaptation

```
Layout, Export, VideoPlayer, ViewController,
Zoom, Toolbar, Comments System, Notifications
```

### 🚫 Keep in Apps/Client (App-Specific)

```
Assets, Catalog, Gallery, LayoutEditor, Login,
Projects, RightSidebar, LeftSidebar, User,
*Adapter components, Router-specific components
```

## Success Metrics

### Phase Completion Criteria

- [ ] All identified components migrated
- [ ] Zero runtime errors
- [ ] No visual regressions
- [ ] Bundle size reduced by >20%
- [ ] Build time improved

### Quality Gates

- Lint/format passes
- TypeScript compilation succeeds
- All tests passing
- No accessibility regressions
- Performance benchmarks met

## Risk Mitigation

### Potential Risks & Solutions

| Risk                        | Impact | Mitigation                                      |
| --------------------------- | ------ | ----------------------------------------------- |
| **Styling Conflicts**       | High   | Use scoped styles, maintain compatibility layer |
| **Breaking Changes**        | High   | Incremental migration, feature flags            |
| **Performance Degradation** | Medium | Monitor bundle size, implement code splitting   |
| **Team Disruption**         | Medium | Clear communication, documentation              |
| **Theme Inconsistency**     | Low    | Centralize theme tokens early                   |

## Implementation Guidelines

### Do's

- ✅ Test each component after migration
- ✅ Use adapter pattern for compatibility
- ✅ Maintain backward compatibility
- ✅ Document breaking changes
- ✅ Run full test suite after each phase

### Don'ts

- ❌ Migrate multiple systems simultaneously
- ❌ Skip testing for "simple" components
- ❌ Remove app-specific logic prematurely
- ❌ Force architectural changes mid-migration
- ❌ Ignore TypeScript errors

## Team Responsibilities

### Agent Assignments

**Michael (Architect)**

- Review architectural decisions
- Ensure scalability patterns

**Ryan (Components)**

- Lead component migration
- Maintain design system consistency

**Brian (Testing)**

- Create test strategies
- Validate each phase

**Parker (Integration)**

- Handle build configuration
- Resolve module dependencies

## Rollback Strategy

Each phase should be reversible:

1. **Git Strategy**: Tag before each phase
2. **Feature Flags**: Toggle between old/new components
3. **Parallel Paths**: Keep old components until verified
4. **Quick Revert**: Maintain rollback scripts

## Post-Migration Cleanup

After successful migration:

1. **Remove Duplicate Components**

   ```bash
   rm -rf apps/client/src/components/[migrated-component]
   ```

2. **Update Documentation**
   - Component usage guides
   - Storybook stories
   - API documentation

3. **Archive Migration Artifacts**
   - Move compatibility layers to legacy
   - Document lessons learned

## Monitoring & Maintenance

### Key Metrics to Track

- Bundle size trends
- Build time metrics
- Component usage analytics
- Error rates
- Performance scores

### Maintenance Schedule

- Weekly: Review migration progress
- Bi-weekly: Team sync on blockers
- Monthly: Stakeholder updates

## Conclusion

This phased approach ensures systematic migration while maintaining application stability. Each phase builds upon the previous, allowing for validation and course correction as needed.

## Appendix

### A. Configuration Examples

See `/docs/strategies/examples/` for:

- Vite configurations
- Package.json examples
- TypeScript paths
- Build scripts

### B. Component Mapping

See `/docs/strategies/COMPONENT_MAPPING.md` for detailed component analysis

### C. References

- [Turborepo Examples](https://github.com/vercel/turbo/tree/main/examples)
- [Shadcn UI Patterns](https://ui.shadcn.com)
- [Vite Best Practices](https://vitejs.dev/guide/best-practices)
- [Tailwind 4.0 Migration](https://tailwindcss.com/docs/v4)

---

**Document Version**: 1.1.0  
**Last Updated**: 2025-01-09  
**Status**: Active  
**Owner**: Engineering Team

### Revision History

- v1.1.0 (2025-01-09): Added Phase 0 for Tailwind alignment and shared configuration
- v1.0.0 (2025-01-09): Initial migration strategy document
