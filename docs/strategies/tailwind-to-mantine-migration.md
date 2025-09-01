# Tailwind CSS to Mantine UI Migration Strategy

## Executive Summary

This document outlines a comprehensive migration strategy for transitioning the Atomiton project from Tailwind CSS to Mantine UI. The migration is designed to prevent application breakage, preserve the current visual design, and implement verification checkpoints throughout the process.

**Update:** The project has been downgraded from Tailwind CSS v4 to v3.4.15 to enable Vite compatibility. This doesn't change the migration strategy but simplifies it as we're now working with the more stable v3 syntax.

## Migration Overview

### Goals

- Replace Tailwind CSS with Mantine UI for better data-heavy component support
- Maintain application functionality throughout the migration
- Preserve the current visual design and user experience
- Enable the Compound component pattern for the packages/ui library
- Minimize risk and enable rollback at any phase

### Key Principles

1. **Incremental Migration**: Components migrated one at a time
2. **Visual Parity**: Each migrated component must match the original appearance
3. **Continuous Verification**: Automated tests at each phase
4. **Reversibility**: Each phase can be rolled back independently
5. **Zero Downtime**: Application remains functional throughout

## Phase 1: Foundation Setup (2 days)

### Objectives

- Install and configure Mantine alongside Tailwind
- Set up theming to match current design system
- Create migration infrastructure

### Tasks

#### 1.1 Environment Setup

```bash
# Install Mantine packages
pnpm add @mantine/core @mantine/hooks @mantine/dates @mantine/form
pnpm add -D @mantine/postcss-preset postcss-preset-mantine
```

#### 1.2 Theme Configuration

Create Mantine theme matching current Tailwind variables:

```typescript
// packages/theme/mantine-config.ts
export const mantineTheme = {
  colors: {
    shade: [
      "var(--shade-01)", // 0
      "var(--shade-02)", // 1
      "var(--shade-03)", // 2
      "var(--shade-04)", // 3
      "var(--shade-05)", // 4
      "var(--shade-06)", // 5
      "var(--shade-07)", // 6
      "var(--shade-08)", // 7
      "var(--shade-09)", // 8
      "var(--shade-09)", // 9
    ],
  },
  breakpoints: {
    xs: "480",
    sm: "767",
    md: "1023",
    lg: "1259",
    xl: "1419",
  },
  shadows: {
    toolbar: "var(--box-shadow-toolbar)",
    depth01: "var(--box-shadow-depth-01)",
    popover: "var(--box-shadow-popover)",
  },
};
```

#### 1.3 Dual Runtime Support

Configure build system to support both Tailwind and Mantine:

- Keep Tailwind CSS imports active
- Add Mantine provider to app root
- Configure PostCSS for both systems

### Verification Checkpoints

- [ ] Mantine packages installed successfully
- [ ] Theme configuration matches design tokens
- [ ] Application builds without errors
- [ ] No visual changes to existing components
- [ ] All existing tests pass

### Rollback Plan

```bash
# Remove Mantine packages
pnpm remove @mantine/core @mantine/hooks @mantine/dates @mantine/form
# Revert configuration files
git checkout -- postcss.config.js app/layout.tsx
```

## Phase 2: Component Mapping & Analysis (1 day)

### Objectives

- Catalog all components using Tailwind
- Map to Mantine equivalents
- Identify custom components requiring special attention

### Component Inventory

#### Basic Components

| Current (Tailwind) | Mantine Equivalent | Complexity |
| ------------------ | ------------------ | ---------- |
| Custom Button      | Button             | Low        |
| Custom Tabs        | Tabs               | Medium     |
| Custom Input       | TextInput          | Low        |
| Custom Select      | Select             | Low        |
| Custom Modal       | Modal              | Medium     |
| Custom Tooltip     | Tooltip            | Low        |

#### Complex Components

| Component       | Migration Strategy                            | Risk Level |
| --------------- | --------------------------------------------- | ---------- |
| ResizeImage     | Custom wrapper with Mantine Box               | High       |
| Comments system | Composite of Mantine components               | Medium     |
| Filters         | Mantine MultiSelect + custom styling          | Medium     |
| AnimateHeight   | Keep react-animate-height, style with Mantine | Low        |

### Analysis Tools

```bash
# Script to find all Tailwind class usage
grep -r "className=" apps/web/components --include="*.tsx" > tailwind-usage.txt

# Count unique Tailwind classes
grep -oE 'className="[^"]*"' apps/web/components/**/*.tsx |
  sed 's/className="//g' | sed 's/"//g' |
  tr ' ' '\n' | sort | uniq -c > tailwind-classes.txt
```

### Verification Checkpoints

- [ ] Complete component inventory created
- [ ] All Tailwind utilities documented
- [ ] Mantine equivalents identified
- [ ] Custom component strategies defined
- [ ] Risk assessment completed

## Phase 3: Migration Pilot (2 days)

### Objectives

- Migrate 2-3 simple components as proof of concept
- Establish migration patterns
- Validate visual regression testing

### Pilot Components

1. **Tabs Component** (Medium complexity)
2. **Button variations** (Low complexity)
3. **Input fields** (Low complexity)

### Migration Process

#### Step 1: Create Mantine Version

```typescript
// components/Tabs/TabsMantine.tsx
import { Tabs as MantineTabs } from '@mantine/core';

export const TabsMantine = ({ items, value, setValue }) => {
  return (
    <MantineTabs
      value={value.id}
      onChange={(val) => setValue(items.find(i => i.id === val))}
    >
      <MantineTabs.List>
        {items.map((item) => (
          <MantineTabs.Tab key={item.id} value={item.id}>
            {item.name}
          </MantineTabs.Tab>
        ))}
      </MantineTabs.List>
    </MantineTabs>
  );
};
```

#### Step 2: Feature Flag Integration

```typescript
// components/Tabs/index.tsx
const Tabs = (props) => {
  const useMantine = process.env.NEXT_PUBLIC_USE_MANTINE === 'true';
  return useMantine ? <TabsMantine {...props} /> : <TabsTailwind {...props} />;
};
```

#### Step 3: Visual Regression Testing

```typescript
// tests/visual-regression/tabs.spec.ts
test("Tabs visual consistency", async ({ page }) => {
  // Test with Tailwind
  await page.goto("/test-components/tabs?mantine=false");
  const tailwindScreenshot = await page.screenshot();

  // Test with Mantine
  await page.goto("/test-components/tabs?mantine=true");
  const mantineScreenshot = await page.screenshot();

  // Compare screenshots
  expect(mantineScreenshot).toMatchSnapshot("tabs-reference.png");
});
```

### Verification Checkpoints

- [ ] Pilot components migrated successfully
- [ ] Visual regression tests passing
- [ ] Performance metrics unchanged
- [ ] Accessibility maintained
- [ ] Feature flags working correctly

### Rollback Plan

- Toggle feature flags to use Tailwind versions
- Remove Mantine component files if needed
- Revert to previous commit if critical issues

## Phase 4: Systematic Component Migration (5 days)

### Objectives

- Migrate all components systematically
- Maintain parallel implementations
- Continuous testing and validation

### Migration Order

#### Wave 1: Foundation Components (Day 1)

- [ ] Buttons and IconButtons
- [ ] Text inputs and TextAreas
- [ ] Checkboxes and Radio buttons
- [ ] Select dropdowns

#### Wave 2: Layout Components (Day 2)

- [ ] Grid and Container
- [ ] Card and Paper
- [ ] Divider and Space
- [ ] Stack and Group

#### Wave 3: Feedback Components (Day 3)

- [ ] Modals and Drawers
- [ ] Tooltips and Popovers
- [ ] Notifications and Toasts
- [ ] Loading states and Skeletons

#### Wave 4: Data Components (Day 4)

- [ ] Tables and DataGrids
- [ ] Forms and validation
- [ ] File uploads
- [ ] Date pickers

#### Wave 5: Complex Components (Day 5)

- [ ] Navigation menus
- [ ] Search interfaces
- [ ] Custom composite components
- [ ] Animation wrappers

### Migration Checklist per Component

```markdown
- [ ] Create Mantine version
- [ ] Add feature flag
- [ ] Match styling exactly
- [ ] Update unit tests
- [ ] Add visual regression test
- [ ] Test accessibility
- [ ] Document API changes
- [ ] Update Storybook (if applicable)
```

### Quality Gates

Each wave must pass before proceeding:

1. All components render correctly
2. Visual regression tests pass (95% similarity)
3. Unit tests pass
4. Accessibility audit passes
5. Performance metrics within 5% of baseline

### Verification Checkpoints

- [ ] All components have Mantine versions
- [ ] Feature flags control all components
- [ ] Visual regression suite complete
- [ ] Performance benchmarks acceptable
- [ ] No production errors reported

## Phase 5: Tailwind Removal & Optimization (2 days)

### Objectives

- Remove Tailwind dependencies
- Optimize bundle size
- Clean up codebase

### Tasks

#### 5.1 Switch to Mantine Only

```bash
# Enable Mantine for all components
NEXT_PUBLIC_USE_MANTINE=true

# Run full test suite
pnpm test
pnpm test:visual
pnpm test:e2e
```

#### 5.2 Remove Tailwind Dependencies

```bash
# After confirming all tests pass
pnpm remove tailwindcss @tailwindcss/postcss tailwind-scrollbar
rm tailwind.config.js
# Remove Tailwind imports from globals.css
```

#### 5.3 Code Cleanup

- Remove Tailwind component versions
- Remove feature flags
- Update import statements
- Clean up unused CSS

#### 5.4 Bundle Optimization

```bash
# Analyze bundle size
pnpm build
pnpm analyze

# Expected improvements:
# - Reduced CSS bundle size
# - Better tree-shaking
# - Fewer runtime calculations
```

### Verification Checkpoints

- [ ] All Tailwind code removed
- [ ] Bundle size reduced or maintained
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Performance metrics improved

### Rollback Plan

If critical issues discovered after Tailwind removal:

1. Revert to dual-system commit
2. Re-enable feature flags
3. Investigate and fix issues
4. Retry removal process

## Phase 6: packages/ui Library Creation (1 day)

### Objectives

- Extract components to packages/ui
- Implement Compound component pattern
- Set up component exports

### Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Tabs/
│   │   ├── Input/
│   │   └── ...
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### Compound Component Pattern

```typescript
// packages/ui/src/components/Card/index.tsx
import { Card as MantineCard } from "@mantine/core";

export const Card = Object.assign(MantineCard, {
  Section: MantineCard.Section,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
```

### Verification Checkpoints

- [ ] packages/ui created and building
- [ ] All components exported correctly
- [ ] Apps can import from packages/ui
- [ ] TypeScript types working
- [ ] Component documentation complete

## Risk Assessment & Mitigation

### High-Risk Areas

#### 1. Custom Shadow Utilities

**Risk**: Complex box-shadow values difficult to replicate
**Mitigation**:

- Create custom Mantine theme extensions
- Use CSS variables for complex shadows
- Test thoroughly in all browsers

#### 2. Responsive Design Breakpoints

**Risk**: Different breakpoint systems may cause layout issues
**Mitigation**:

- Map breakpoints exactly in Mantine theme
- Test all responsive layouts
- Use Mantine's useMediaQuery for complex cases

#### 3. Animation Integration

**Risk**: Framer Motion may conflict with Mantine transitions
**Mitigation**:

- Test animation components thoroughly
- Use Mantine's transition system where possible
- Keep Framer Motion for complex animations

#### 4. Performance Regression

**Risk**: Mantine components may be heavier than custom Tailwind
**Mitigation**:

- Benchmark key pages before/after
- Use code splitting aggressively
- Lazy load heavy components

### Medium-Risk Areas

1. **Form Validation**: Different validation patterns
2. **Accessibility**: Ensure ARIA attributes maintained
3. **Dark Mode**: Theme switching compatibility
4. **Third-party Integrations**: Components like react-rnd

## Success Criteria

### Functional Requirements

- [ ] All pages load without errors
- [ ] All interactive components work correctly
- [ ] Forms submit and validate properly
- [ ] Navigation works as expected
- [ ] No console errors in production

### Visual Requirements

- [ ] Visual regression tests show >95% similarity
- [ ] Responsive layouts maintained
- [ ] Animations smooth and consistent
- [ ] Dark mode (if applicable) works correctly
- [ ] Print styles (if applicable) maintained

### Performance Requirements

- [ ] First Contentful Paint within 5% of baseline
- [ ] Time to Interactive within 5% of baseline
- [ ] Bundle size not increased by more than 10%
- [ ] Lighthouse scores maintained or improved

### Developer Experience

- [ ] Component APIs well documented
- [ ] TypeScript support complete
- [ ] Development build time acceptable
- [ ] Hot reload working correctly
- [ ] Debugging tools functional

## Timeline & Resources

### Overall Timeline: 11 days

| Phase               | Duration | Resources    | Dependencies |
| ------------------- | -------- | ------------ | ------------ |
| Phase 1: Foundation | 2 days   | 1 developer  | None         |
| Phase 2: Analysis   | 1 day    | 1 developer  | Phase 1      |
| Phase 3: Pilot      | 2 days   | 1 developer  | Phase 2      |
| Phase 4: Migration  | 5 days   | 2 developers | Phase 3      |
| Phase 5: Cleanup    | 2 days   | 1 developer  | Phase 4      |
| Phase 6: Library    | 1 day    | 1 developer  | Phase 5      |

### Critical Path

1. Vite migration must be complete (prerequisite)
2. Phase 1-3 must be sequential
3. Phase 4 can be parallelized with 2 developers
4. Phase 5-6 must be sequential

## Monitoring & Verification

### Automated Checks

```yaml
# .github/workflows/migration-tests.yml
name: Migration Tests
on: [push, pull_request]
jobs:
  visual-regression:
    steps:
      - run: pnpm test:visual

  performance:
    steps:
      - run: pnpm lighthouse

  bundle-analysis:
    steps:
      - run: pnpm build && pnpm analyze
```

### Manual Testing Checklist

- [ ] Test all user flows
- [ ] Check responsive designs
- [ ] Verify keyboard navigation
- [ ] Test with screen readers
- [ ] Cross-browser testing
- [ ] Performance profiling

### Rollback Triggers

Initiate rollback if:

- Visual regression tests fail >5% of components
- Performance degrades >10%
- Critical bugs found in production
- Bundle size increases >20%
- Development velocity severely impacted

## Post-Migration Tasks

### Documentation Updates

- [ ] Update README with Mantine setup
- [ ] Document component API changes
- [ ] Create migration guide for contributors
- [ ] Update Storybook stories
- [ ] Record architecture decision

### Team Training

- [ ] Mantine basics workshop
- [ ] Compound component pattern training
- [ ] Theme customization guide
- [ ] Best practices documentation

### Technical Debt

- [ ] Remove all Tailwind references
- [ ] Clean up unused dependencies
- [ ] Optimize component bundles
- [ ] Set up component testing
- [ ] Establish component guidelines

## Conclusion

This migration strategy provides a systematic, low-risk approach to transitioning from Tailwind CSS to Mantine UI. The phased approach ensures the application remains functional throughout the migration, while comprehensive testing and verification steps prevent regression. The use of feature flags and parallel implementations allows for quick rollback if issues arise.

Key success factors:

1. Incremental migration minimizes risk
2. Visual regression testing ensures design consistency
3. Feature flags enable safe testing in production
4. Comprehensive rollback plans at each phase
5. Clear success criteria and verification checkpoints

The estimated 11-day timeline assumes one to two developers working full-time, with potential for parallelization in Phase 4 to accelerate the migration.
