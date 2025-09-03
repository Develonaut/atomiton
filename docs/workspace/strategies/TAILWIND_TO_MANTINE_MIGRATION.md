# Tailwind CSS & HeadlessUI to Mantine UI Migration Strategy

## Executive Summary

This document outlines a comprehensive migration strategy for transitioning the Atomiton project from Tailwind CSS AND HeadlessUI to Mantine UI. The migration will completely eliminate both Tailwind CSS and HeadlessUI dependencies, replacing them entirely with Mantine UI components while preserving the current visual design exactly.

**New Approach (Updated):** We will use the Brainwave 2.0 reference app as our migration platform. This Next.js + Tailwind app will be moved into `packages/ui`, where we'll systematically convert each component to Mantine while maintaining visual parity through Playwright snapshot testing.

**Critical Requirements:**

1. **Visual Regression Testing**: Screenshots MUST be regenerated for EVERY pull request to ensure zero visual regression
2. **HeadlessUI Removal**: ALL HeadlessUI components must be replaced with Mantine equivalents - no exceptions
3. **Visual Parity**: The application must look EXACTLY the same after migration

## Critical Migration Rules

### \u26a0\ufe0f NON-NEGOTIABLE REQUIREMENTS

1. **Visual Regression Testing on EVERY PR**
   - Screenshots MUST be regenerated for every pull request
   - ANY visual difference will BLOCK the PR until reviewed
   - **USER APPROVAL REQUIRED**: If ANY visual regression is detected, the user (Ryan) MUST explicitly approve before proceeding
   - Zero tolerance policy - pixel-perfect matching required unless explicitly approved
   - Use `npx playwright test tests/snapshots.spec.ts --update-snapshots` to regenerate

2. **Complete HeadlessUI Elimination**
   - NO HeadlessUI components can remain after migration
   - Every HeadlessUI import must be replaced with Mantine
   - This includes: Menu, Popover, Dialog, Listbox, Combobox, Disclosure, Switch, Transition
   - Mantine has equivalents for ALL HeadlessUI components

3. **Visual Parity Enforcement**
   - The application must look IDENTICAL after migration
   - No "close enough" - must be EXACT
   - Use the snapshot comparison tools to verify
   - Any visual regression is grounds for PR rejection

### Visual Regression Testing Process

```bash
# For EVERY pull request:

# 1. Before making changes, capture baseline
npm run test:snapshots

# 2. Make your Mantine migration changes

# 3. Regenerate snapshots
npx playwright test tests/snapshots.spec.ts --update-snapshots

# 4. Compare snapshots
npm run test:snapshots

# 5. If ANY differences detected:
#    - STOP and notify Ryan for review
#    - Get explicit approval before proceeding
#    - If approved: commit the new snapshots
#    - If not approved: fix the visual issues and repeat

# 6. Commit snapshots with your PR (only after approval if changes detected)
git add tests/snapshots/
git commit -m "chore: update snapshots after [component] migration"
```

## Migration Overview

### Goals

- **Completely eliminate Tailwind CSS dependency**
- **Completely eliminate HeadlessUI dependency**
- Replace both with Mantine UI for better data-heavy component support
- Maintain application functionality throughout the migration
- Preserve the current visual design and user experience (pixel-perfect)
- Enable the Compound component pattern for the packages/ui library
- Minimize risk and enable rollback at any phase

### Key Principles

1. **Incremental Migration**: Components migrated one at a time
2. **Absolute Visual Parity**: Each migrated component must match the original appearance EXACTLY
3. **Continuous Visual Regression Testing**: Screenshots regenerated and compared on EVERY PR
4. **Complete HeadlessUI Removal**: No HeadlessUI components should remain after migration
5. **Reversibility**: Each phase can be rolled back independently
6. **Zero Downtime**: Application remains functional throughout

## Phase 0: Reference App Migration Setup (NEW - 1 day)

### Objectives

- Move Brainwave 2.0 reference app into packages/ui
- Set up Playwright visual regression testing baseline
- Create component conversion tracking system

### Tasks

#### 0.1 Reference App Setup

```bash
# Copy Brainwave reference app to packages/ui
cp -r brainwave-reference-app/* packages/ui/

# Install dependencies
cd packages/ui
pnpm install

# Verify Next.js app runs
pnpm dev
```

#### 0.2 Baseline Screenshot Capture

```bash
# Set up Playwright for visual testing
pnpm add -D @playwright/test

# Create snapshot tests for ALL pages
# tests/baseline.spec.ts
test.describe('Baseline Screenshots', () => {
  const pages = [
    '/',
    '/dashboard',
    '/settings',
    // ... all reference app pages
  ];

  for (const page of pages) {
    test(`Capture ${page}`, async ({ page: browserPage }) => {
      await browserPage.goto(page);
      await browserPage.screenshot({
        path: `screenshots/baseline${page.replace('/', '-')}.png`,
        fullPage: true
      });
    });
  }
});

# Capture all baseline screenshots
pnpm playwright test tests/baseline.spec.ts
```

#### 0.3 Component Inventory & Tracking

## Baseline Screenshots Status (Captured 2025-09-02)

All baseline screenshots have been captured. Each screenshot captures the **full page** including content below the fold.

### Page Screenshots

| Page          | Path             | Screenshot Size | File                                     | Status      |
| ------------- | ---------------- | --------------- | ---------------------------------------- | ----------- |
| Home          | `/`              | 1280x720px      | `screenshots/baseline-home.png`          | ✅ Captured |
| Buttons       | `/buttons`       | 1280x4427px     | `screenshots/baseline-buttons.png`       | ✅ Captured |
| Cards         | `/cards`         | 1280x3478px     | `screenshots/baseline-cards.png`         | ✅ Captured |
| Colors        | `/colors`        | 1280x872px      | `screenshots/baseline-colors.png`        | ✅ Captured |
| Comment       | `/comment`       | 1280x1458px     | `screenshots/baseline-comment.png`       | ✅ Captured |
| Depths        | `/depths`        | 1280x720px      | `screenshots/baseline-depths.png`        | ✅ Captured |
| Dropdown      | `/dropdown`      | 1280x1862px     | `screenshots/baseline-dropdown.png`      | ✅ Captured |
| Iconography   | `/iconography`   | 1280x4888px     | `screenshots/baseline-iconography.png`   | ✅ Captured |
| Inputs        | `/inputs`        | 1280x2147px     | `screenshots/baseline-inputs.png`        | ✅ Captured |
| Menu          | `/menu`          | 1280x1667px     | `screenshots/baseline-menu.png`          | ✅ Captured |
| Modal         | `/modal`         | 1280x4144px     | `screenshots/baseline-modal.png`         | ✅ Captured |
| Notifications | `/notifications` | 1280x2200px     | `screenshots/baseline-notifications.png` | ✅ Captured |
| Prompt Input  | `/prompt-input`  | 1280x1465px     | `screenshots/baseline-prompt-input.png`  | ✅ Captured |
| Sidebar       | `/sidebar`       | 1280x2522px     | `screenshots/baseline-sidebar.png`       | ✅ Captured |
| Toolbar       | `/toolbar`       | 1280x1649px     | `screenshots/baseline-toolbar.png`       | ✅ Captured |
| Topbar        | `/topbar`        | 1280x1435px     | `screenshots/baseline-topbar.png`        | ✅ Captured |
| Typography    | `/typography`    | 1280x2195px     | `screenshots/baseline-typography.png`    | ✅ Captured |

### Component Conversion Tracking

#### Core Components to Convert

| Component     | Location                 | Uses HeadlessUI | Uses Tailwind | Mantine Equivalent | Status         |
| ------------- | ------------------------ | --------------- | ------------- | ------------------ | -------------- |
| Button        | `components/Button`      | ❌              | ✅            | Button             | ❌ Not Started |
| Card          | `components/Card`        | ❌              | ✅            | Card               | ❌ Not Started |
| Field (Input) | `components/Field`       | ❌              | ✅            | TextInput          | ❌ Not Started |
| Select        | `components/Select`      | ✅ Menu         | ✅            | Select             | ❌ Not Started |
| Switch        | `components/Switch`      | ✅ Switch       | ✅            | Switch             | ❌ Not Started |
| Tabs          | `components/Tabs`        | ❌              | ✅            | Tabs               | ❌ Not Started |
| Tooltip       | `components/Tooltip`     | ❌              | ✅            | Tooltip            | ❌ Not Started |
| ColorPicker   | `components/ColorPicker` | ✅ Popover      | ✅            | ColorPicker        | ❌ Not Started |

#### Complex Components (Multiple HeadlessUI/Tailwind)

| Component   | HeadlessUI Components Used | Status         |
| ----------- | -------------------------- | -------------- |
| Export      | Menu, Dialog               | ❌ Not Started |
| FileMenu    | Menu                       | ❌ Not Started |
| FiltersMenu | Menu                       | ❌ Not Started |
| ProfileMenu | Menu                       | ❌ Not Started |
| Settings    | Multiple                   | ❌ Not Started |
| ShareFile   | Dialog                     | ❌ Not Started |
| PromptInput | Combobox, Popover          | ❌ Not Started |

### Testing Commands

```bash
# Run baseline screenshots (already captured)
npx playwright test tests/baseline-screenshots.spec.ts

# View test report
npx playwright show-report

# Update screenshots (only after conversion is verified)
npx playwright test tests/baseline-screenshots.spec.ts --update-snapshots
```

### Verification Checkpoints

- [x] Reference app running in packages/ui ✅
- [x] All pages captured as baseline screenshots ✅
- [x] Component inventory complete ✅
- [x] Playwright visual tests configured ✅

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

## Phase 1.5: HeadlessUI Inventory & Replacement Strategy (1 day)

### Objectives

- Identify ALL HeadlessUI components in the codebase
- Map each to Mantine equivalent
- Document replacement strategy for each

### HeadlessUI Component Inventory

| HeadlessUI Component | Location              | Mantine Replacement | Notes                       |
| -------------------- | --------------------- | ------------------- | --------------------------- |
| Menu                 | LeftSidebar/Head/Menu | Menu                | Dropdown menu functionality |
| Popover              | Multiple locations    | Popover             | Tooltips and floating UI    |
| Dialog               | Modal components      | Modal               | Dialog/modal windows        |
| Listbox              | Select components     | Select              | Dropdown selections         |
| Combobox             | Search components     | Autocomplete        | Search with suggestions     |
| Disclosure           | Accordion components  | Accordion           | Expandable content          |
| Switch               | Toggle components     | Switch              | On/off toggles              |
| Transition           | Animation wrappers    | Transition          | Animation utilities         |

### Replacement Strategy

```typescript
// Example: Replacing HeadlessUI Menu with Mantine Menu
// BEFORE (HeadlessUI)
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

// AFTER (Mantine)
import { Menu } from "@mantine/core";
// Menu.Target replaces MenuButton
// Menu.Dropdown replaces MenuItems
// Menu.Item replaces MenuItem
```

### Verification

- [ ] All HeadlessUI imports identified
- [ ] Mantine replacements confirmed for each
- [ ] No functional gaps identified
- [ ] Migration complexity assessed

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
grep -r "className=" apps/client/components --include="*.tsx" > tailwind-usage.txt

# Count unique Tailwind classes
grep -oE 'className="[^"]*"' apps/client/components/**/*.tsx |
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

  // Compare screenshots - MUST be pixel perfect
  expect(mantineScreenshot).toMatchSnapshot("tabs-reference.png", {
    maxDiffPixels: 0, // ZERO tolerance for visual differences
  });
});
```

#### PR Visual Regression Workflow

```yaml
# .github/workflows/visual-regression-pr.yml
name: Visual Regression on PR
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node and pnpm
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm build

      - name: Generate new screenshots
        run: pnpm test:snapshots --update-snapshots

      - name: Compare with baseline
        run: pnpm test:snapshots

      - name: Upload diff images if failed
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-diffs
          path: tests/snapshots/diff/

      - name: Comment on PR with results
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Visual regression detected! Please review the diff images in the artifacts.'
            })
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
- [ ] Identify and remove ALL HeadlessUI usage
- [ ] Create Mantine version
- [ ] Add feature flag
- [ ] Match styling EXACTLY (pixel-perfect)
- [ ] Update unit tests
- [ ] Add visual regression test
- [ ] Regenerate screenshots
- [ ] Verify ZERO visual differences
- [ ] Test accessibility
- [ ] Document API changes
- [ ] Update Storybook (if applicable)
- [ ] Confirm NO HeadlessUI imports remain
```

### Quality Gates

Each wave must pass before proceeding:

1. All components render correctly
2. Visual regression tests pass (100% similarity - ZERO tolerance)
3. Unit tests pass
4. Accessibility audit passes
5. Performance metrics within 5% of baseline
6. NO HeadlessUI imports detected in migrated components
7. Screenshots regenerated and approved

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

#### 5.2 Remove Tailwind and HeadlessUI Dependencies

```bash
# After confirming all tests pass
# Remove Tailwind
pnpm remove tailwindcss @tailwindcss/postcss tailwind-scrollbar
rm tailwind.config.js

# Remove HeadlessUI
pnpm remove @headlessui/react

# Remove imports from globals.css
# Remove all Tailwind directives (@tailwind base, @tailwind components, @tailwind utilities)
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

## Phase 6: Final Migration to Vite (1 day)

### Objectives

- Convert packages/ui from Next.js to Vite
- Remove all Next.js dependencies
- Integrate converted components into apps/client

### Tasks

#### 6.1 Vite Conversion

```bash
# Remove Next.js dependencies
pnpm remove next react-dom

# Add Vite
pnpm add -D vite @vitejs/plugin-react

# Create vite.config.ts
# Set up library mode for component exports
```

#### 6.2 Component Library Structure

```
packages/ui/
├── src/
│   ├── components/  # All Mantine-converted components
│   │   ├── Button/
│   │   ├── Card/
│   │   └── ...
│   ├── hooks/
│   ├── utils/
│   └── index.ts    # Barrel exports
├── vite.config.ts
└── package.json
```

#### 6.3 Integration with apps/client

```typescript
// apps/client can now import from packages/ui
import { Button, Card, Input } from "@atomiton/ui";

// All components are now Mantine-based
// Visual parity confirmed through testing
```

### Verification Checkpoints

- [ ] packages/ui converted to Vite
- [ ] All components exported correctly
- [ ] apps/client successfully imports components
- [ ] Visual regression tests still passing
- [ ] No Next.js dependencies remain

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

- [ ] Visual regression tests show 100% similarity (PIXEL PERFECT)
- [ ] Screenshots regenerated for EVERY PR
- [ ] Responsive layouts maintained exactly
- [ ] Animations smooth and consistent
- [ ] Dark mode (if applicable) works correctly
- [ ] Print styles (if applicable) maintained
- [ ] NO visual differences tolerated

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

### Overall Timeline: 12 days

| Phase                    | Duration | Resources    | Dependencies |
| ------------------------ | -------- | ------------ | ------------ |
| Phase 0: Reference Setup | 1 day    | 1 developer  | None         |
| Phase 1: Foundation      | 2 days   | 1 developer  | Phase 0      |
| Phase 2: Analysis        | 1 day    | 1 developer  | Phase 1      |
| Phase 3: Pilot           | 2 days   | 1 developer  | Phase 2      |
| Phase 4: Migration       | 5 days   | 2 developers | Phase 3      |
| Phase 5: Cleanup         | 2 days   | 1 developer  | Phase 4      |
| Phase 6: Vite Conversion | 1 day    | 1 developer  | Phase 5      |

### Critical Path

1. Reference app setup in packages/ui (Phase 0)
2. Baseline screenshots captured before any changes
3. Phase 1-3 must be sequential
4. Phase 4 can be parallelized with 2 developers
5. Phase 5-6 must be sequential
6. Final integration with apps/client after all components converted

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

- ANY visual regression detected (0% tolerance)
- Performance degrades >10%
- Critical bugs found in production
- Bundle size increases >20%
- Development velocity severely impacted
- ANY HeadlessUI components cannot be properly replaced

## Post-Migration Tasks

### Verification

- [ ] Confirm ZERO HeadlessUI imports remain
- [ ] Run full visual regression suite
- [ ] Regenerate all screenshots as new baseline
- [ ] Verify 100% visual parity achieved

### Documentation Updates

- [ ] Update README with Mantine setup
- [ ] Document component API changes
- [ ] Create migration guide for contributors
- [ ] Update Storybook stories
- [ ] Record architecture decision
- [ ] Document visual regression testing process

### Team Training

- [ ] Mantine basics workshop
- [ ] Compound component pattern training
- [ ] Theme customization guide
- [ ] Best practices documentation

### Technical Debt

- [ ] Remove all Tailwind references
- [ ] Remove all HeadlessUI imports and references
- [ ] Clean up unused dependencies
- [ ] Verify NO @headlessui/react imports remain anywhere
- [ ] Optimize component bundles
- [ ] Set up component testing
- [ ] Establish component guidelines

## Migration Workflow Summary (NEW)

### The New Component-by-Component Process

1. **Start with Reference App**: Brainwave 2.0 reference app in packages/ui
2. **Capture Baseline**: Screenshot all pages with Playwright
3. **Convert Component**: Pick one component, convert from Tailwind to Mantine
4. **Visual Test**: Run Playwright to detect any visual differences
5. **Iterate**: Fix any visual discrepancies until pixel-perfect
6. **Commit**: Once perfect, commit the converted component
7. **Repeat**: Move to next component
8. **Final Step**: When all converted, remove Next.js, switch to Vite
9. **Integration**: Import all components into apps/client

### Benefits of This Approach

- **Isolated Environment**: packages/ui is separate from production code
- **Visual Safety Net**: Every change is validated against baseline screenshots
- **Incremental Progress**: One component at a time, reducing risk
- **Clean Migration**: apps/client only touched after all components ready
- **Reusable Library**: packages/ui becomes the central UI component library

## Conclusion

This updated migration strategy leverages the Brainwave 2.0 reference app as a migration platform, providing a controlled environment for component conversion. By working in packages/ui with comprehensive visual regression testing, we ensure pixel-perfect migration before touching the production application.

Key success factors:

1. Reference app provides complete component inventory
2. Baseline screenshots ensure zero visual regression
3. Isolated environment prevents production issues
4. Component-by-component approach minimizes risk
5. Final Vite conversion simplifies the stack

The estimated 12-day timeline assumes one to two developers working full-time, with potential for parallelization in Phase 4 to accelerate the migration.
