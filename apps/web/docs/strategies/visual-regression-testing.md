# Visual Regression Testing Strategy for Next.js to Vite Migration

## Overview

This document outlines a comprehensive strategy for lightweight Playwright visual regression testing to ensure UI consistency during the Atomiton platform's migration from Next.js to Vite. The strategy ensures that the look and feel of the application is preserved while both systems run in parallel during the transition.

## Current State Analysis

### Existing Test Setup

- **Playwright**: v1.55.0 configured with comprehensive test suite
- **Test Coverage**: Critical routes, visual snapshots, and full route coverage
- **Configuration**: Optimized for 3D/WebGL content with extended timeouts
- **CI/CD**: GitHub Actions integration with artifact storage
- **Viewport Testing**: Mobile, tablet, desktop, and widescreen viewports

### Current Test Structure

```
tests/
├── critical-routes.spec.ts    # Smoke tests for key user paths
├── visual-snapshots.spec.ts   # Comprehensive visual testing
├── all-routes.spec.ts         # Full route coverage
├── pages/                     # Page Object Models
├── utils/                     # Test utilities and helpers
└── README.md                  # Documentation
```

### Key Features Already Implemented

- ✅ 3D/WebGL content handling with specialized wait strategies
- ✅ Multiple viewport responsive testing
- ✅ Animation-aware snapshot capture
- ✅ Loading state detection and handling
- ✅ Page Object Models for maintainable tests
- ✅ CI/CD integration with GitHub Actions

## Visual Regression Strategy for Migration

### 1. Dual Testing Approach

#### Phase 1: Baseline Capture (Next.js)

- **Goal**: Establish visual baselines from the current Next.js implementation
- **Process**:
  - Run comprehensive visual tests against Next.js (port 3000)
  - Generate baseline screenshots for all critical routes
  - Store baselines in version-controlled test-results directory
  - Document any known visual inconsistencies

#### Phase 2: Comparison Testing (Vite vs Next.js)

- **Goal**: Ensure visual parity between Vite and Next.js implementations
- **Process**:
  - Run tests against Vite implementation (port 5173)
  - Compare against Next.js baselines
  - Flag visual differences for review
  - Allow threshold-based acceptance for minor rendering differences

#### Phase 3: Transition Period (Parallel Systems)

- **Goal**: Monitor both systems during transition
- **Process**:
  - Maintain separate baseline sets for each system
  - Run comparative tests daily
  - Alert on significant visual regressions
  - Track improvement in Vite system alignment

### 2. Critical Routes for Testing

#### High Priority Routes (Must be identical)

1. **Home Page (`/`)** - First impression, marketing content
2. **Explore (`/explore`)** - 3D content showcase, animations
3. **Create (`/create`)** - Core functionality, 3D interface
4. **Sign-in (`/sign-in`)** - User authentication flow

#### Medium Priority Routes (Allow minor differences)

1. **Profile (`/profile`)** - User dashboard
2. **Assets Pages** (`/assets/*`) - Resource libraries
3. **Documentation** (`/docs/*`) - Static content

#### Low Priority Routes (Monitor only)

1. **Error Pages** (404, 500) - Edge cases
2. **Admin Routes** - Internal tools

### 3. Visual Testing Configuration

#### Screenshot Settings

```typescript
// Optimized for consistency
toHaveScreenshot: {
  threshold: 0.1,           // Strict comparison (10% difference allowed)
  animations: "disabled",   // Prevent animation flakiness
  mask: [                   // Hide dynamic elements
    '[data-testid="timestamp"]',
    '[data-testid="user-avatar"]',
    '.loading-spinner'
  ]
}
```

#### Viewport Strategy

- **Desktop**: 1440x900 (primary development viewport)
- **Tablet**: 768x1024 (critical responsive breakpoint)
- **Mobile**: 375x812 (iPhone-sized, most common mobile)

#### Wait Strategies

- **Standard Pages**: 2s after networkidle
- **3D Pages**: 5s after canvas detection + networkidle
- **Animation Pages**: Custom wait for animation completion

### 4. Implementation Plan

#### Week 1: Enhanced Configuration

- [ ] Configure dual server testing (Next.js + Vite)
- [ ] Extend playwright.config.ts for migration-specific settings
- [ ] Create environment-specific test profiles
- [ ] Implement baseline management system

#### Week 2: Baseline Generation

- [ ] Run comprehensive visual test suite against Next.js
- [ ] Generate and review all baseline screenshots
- [ ] Document known visual issues/exceptions
- [ ] Commit baselines to repository

#### Week 3: Vite Comparison Testing

- [ ] Implement Vite server integration in tests
- [ ] Create comparison test suite
- [ ] Configure difference reporting
- [ ] Set up CI/CD alerts for regressions

#### Week 4: Monitoring & Maintenance

- [ ] Deploy monitoring dashboard
- [ ] Train team on baseline updates
- [ ] Document troubleshooting procedures
- [ ] Establish review processes

### 5. Technical Implementation

#### Environment Configuration

```typescript
// playwright.config.ts extensions for migration
const config: PlaywrightTestConfig = {
  projects: [
    {
      name: "nextjs-baseline",
      use: { baseURL: "http://localhost:3000" },
      testDir: "./tests/migration/nextjs",
    },
    {
      name: "vite-comparison",
      use: { baseURL: "http://localhost:5173" },
      testDir: "./tests/migration/vite",
    },
  ],

  // Migration-specific settings
  expect: {
    toHaveScreenshot: {
      threshold: 0.1,
      animations: "disabled",
      mask: ["[data-timestamp]", "[data-dynamic]"],
    },
  },
};
```

#### Dynamic Content Handling

```typescript
// Mask dynamic elements during screenshots
const DYNAMIC_SELECTORS = [
  '[data-testid="timestamp"]', // Time-based content
  '[data-testid="user-avatar"]', // User-specific content
  '[data-testid="loading"]', // Loading states
  ".animate-pulse", // Animation elements
  ".swiper-pagination", // Carousel indicators
];

export async function takeComparisonSnapshot(
  page: Page,
  name: string,
  options?: { mask?: string[] },
) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    mask: [...DYNAMIC_SELECTORS, ...(options?.mask || [])],
  });
}
```

### 6. Failure Handling & Thresholds

#### Acceptance Criteria

- **Pixel-perfect routes**: Home, Sign-in (threshold: 0.05)
- **Functional routes**: Create, Explore (threshold: 0.1)
- **Content routes**: Profile, Assets (threshold: 0.2)

#### Failure Classification

1. **Critical**: Layout shifts, missing elements, color changes
2. **Minor**: Font rendering, minor spacing differences
3. **Acceptable**: Dynamic content differences, loading states

#### Response Actions

- **Critical Failures**: Block deployment, immediate investigation
- **Minor Failures**: Create tracking issue, review in sprint
- **Acceptable**: Document difference, update baseline if needed

### 7. Maintenance Strategy

#### Baseline Updates

```bash
# Update baselines for intentional changes
pnpm test:visual --update-snapshots --project=nextjs-baseline

# Review changes before commit
git diff test-results/
git add test-results/ && git commit -m "Update visual baselines: [reason]"
```

#### Regular Reviews

- **Weekly**: Review failed visual tests
- **Sprint**: Update baselines for new features
- **Release**: Full visual audit across all routes

#### Team Training

- **Developers**: How to update baselines, interpret failures
- **QA**: Visual difference review process
- **DevOps**: CI/CD configuration, artifact management

### 8. Performance Considerations

#### Lightweight Execution

- **Test Duration**: Target <30 seconds total execution
- **Parallel Execution**: 4 workers maximum
- **Selective Testing**: Focus on changed routes only
- **Caching**: Reuse server instances between tests

#### CI/CD Optimization

```yaml
# GitHub Actions optimization
- name: Cache Playwright browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: playwright-browsers-${{ hashFiles('package-lock.json') }}

- name: Run visual regression tests
  run: |
    pnpm test:visual --reporter=github
  timeout-minutes: 10
```

### 9. Reporting & Communication

#### Test Reports

- **HTML Report**: Detailed visual differences with side-by-side comparison
- **JSON Export**: Programmatic access for tooling integration
- **Slack Notifications**: Immediate alerts for critical failures
- **Dashboard**: Visual trend analysis over time

#### Documentation

- **Failure Playbook**: Step-by-step troubleshooting guide
- **Baseline Management**: Process for updating references
- **Team Guidelines**: When to accept vs. reject differences

### 10. Success Metrics

#### Migration Quality

- **Visual Parity**: >95% pixel-perfect match on critical routes
- **Test Stability**: <2% flaky test rate
- **Performance**: All tests complete within 30 seconds
- **Coverage**: 100% of user-facing routes tested

#### Team Efficiency

- **Resolution Time**: <2 hours for critical visual regressions
- **False Positives**: <5% of flagged differences are acceptable
- **Training**: 100% of team trained on visual testing process

## Troubleshooting Guide

### Common Visual Test Failures

#### 1. Flaky Screenshot Comparisons

**Symptoms**: Tests pass/fail inconsistently with same code

```
Error: Screenshot comparison failed:
  Expected: 1248x832
  Received: 1248x834
  Diff: 2 pixels (0.1%)
```

**Solutions**:

```bash
# Check for timing issues
pnpm test:visual --headed --timeout 60000

# Update wait strategies
# In test file:
await page.waitForTimeout(3000); // Increase wait time

# Adjust threshold if acceptable
threshold: 0.15  // Allow 15% difference
```

#### 2. Dynamic Content Interference

**Symptoms**: Tests fail due to timestamps, user data, or animations

```
Error: Screenshot differs in dynamic areas
```

**Solutions**:

```typescript
// Add more selective masking
const ADDITIONAL_MASKS = [
  '[data-testid="current-time"]',
  ".user-specific-content",
  ".random-background",
];

await takeMigrationSnapshot(page, "test.png", {
  additionalMasks: ADDITIONAL_MASKS,
});
```

#### 3. 3D Content Rendering Issues

**Symptoms**: WebGL content not fully loaded, blank canvases

```
Error: Canvas element found but appears blank
```

**Solutions**:

```typescript
// Enhanced 3D content waiting
async function waitFor3DStable(page: Page) {
  await waitFor3DContent(page);

  // Wait for WebGL context
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return false;

      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return gl && !gl.isContextLost();
    },
    { timeout: 30000 },
  );

  // Additional stabilization
  await page.waitForTimeout(5000);
}
```

#### 4. Font Loading Issues

**Symptoms**: Text appears with different fonts between runs

```
Error: Text rendering inconsistency detected
```

**Solutions**:

```typescript
// Wait for fonts to load
await page.waitForFunction(() => document.fonts.ready);

// Or add to playwright.config.ts:
use: {
  // Disable font loading from network
  extraHTTPHeaders: {
    'Cache-Control': 'no-cache'
  }
}
```

### Maintenance Procedures

#### Daily Maintenance Tasks

1. **Review Failed Tests**

```bash
# Check overnight test results
pnpm test:report

# Review failures in HTML report
open playwright-report/index.html
```

2. **Update Dynamic Selectors**

```bash
# Check for new dynamic content
grep -r "data-testid.*time\|data-testid.*dynamic" src/
```

#### Weekly Maintenance Tasks

1. **Baseline Health Check**

```bash
# Verify all baselines are current
find test-results -name "*.png" -mtime +7

# Clean outdated snapshots
pnpm test:clean-snapshots
```

2. **Performance Review**

```bash
# Analyze test execution times
pnpm test:visual --reporter=json > test-times.json

# Review slow tests
node scripts/analyze-test-performance.js test-times.json
```

#### Monthly Maintenance Tasks

1. **Full Baseline Refresh**

```bash
# Backup current baselines
cp -r test-results test-results-backup-$(date +%Y%m%d)

# Regenerate all baselines
pnpm test:visual --update-snapshots --project=nextjs-baseline
```

2. **Configuration Review**

```bash
# Review playwright config changes
git log --oneline -n 20 playwright.config.ts

# Check for new browser versions
npx playwright install --dry-run
```

### Emergency Response Procedures

#### Critical Visual Regression (Production Impact)

1. **Immediate Response** (< 5 minutes)

```bash
# Identify failing routes
pnpm test:critical --reporter=github

# Quick screenshot comparison
pnpm test:debug tests/critical-routes.spec.ts --headed
```

2. **Assessment** (< 15 minutes)

```bash
# Generate detailed diff report
pnpm test:visual --reporter=html

# Check recent commits
git log --oneline -n 10 --grep="visual\|ui\|style"
```

3. **Resolution** (< 30 minutes)

```bash
# If acceptable change, update baselines
pnpm test:visual --update-snapshots

# If bug, revert problematic commit
git revert <commit-hash>

# Verify fix
pnpm test:critical
```

#### Mass Test Failures (CI/CD Pipeline)

1. **Pipeline Halt**

```bash
# Stop current deployments
gh workflow disable "Deploy to Production"

# Check environment differences
pnpm test:debug --project=chromium --headed
```

2. **Root Cause Analysis**

```bash
# Compare browser versions
npx playwright --version
cat .github/workflows/test.yml | grep playwright

# Check system dependencies
pnpm test:install --dry-run
```

3. **Bulk Resolution**

```bash
# If environment issue, update CI
# Edit .github/workflows/test.yml

# If legitimate changes, batch update
pnpm test:visual --update-snapshots --grep="pattern"
```

### Team Training Materials

#### For Developers

**When to Update Baselines**:

- ✅ Intentional UI changes (new features, design updates)
- ✅ Library updates that change rendering (fonts, CSS frameworks)
- ✅ Browser updates that affect screenshot pixels
- ❌ Random test failures
- ❌ Dynamic content showing through
- ❌ Timing-related rendering issues

**Commands to Remember**:

```bash
# Before feature work
pnpm test:visual --grep="homepage"

# After UI changes
pnpm test:visual --update-snapshots --grep="component-affected"

# Debug failing test
pnpm test:debug tests/visual-regression.spec.ts
```

#### For QA Team

**Review Process**:

1. Examine HTML report visual diffs
2. Classify changes: Critical/Minor/Acceptable
3. Verify changes match design specifications
4. Test cross-browser compatibility
5. Approve/reject baseline updates

**Quality Gates**:

- All critical routes must pass pixel-perfect comparison
- UI component changes must be design-approved
- Mobile responsive tests must maintain layout integrity

### Integration with Development Workflow

#### Pre-commit Hooks

```bash
# Add to .husky/pre-commit
pnpm test:critical --passWithNoTests
```

#### Pull Request Integration

```yaml
# .github/workflows/visual-regression.yml
- name: Visual Regression Tests
  run: |
    pnpm test:visual --reporter=github

- name: Upload Visual Diff Report
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: visual-diff-report
    path: playwright-report/
```

#### Deployment Gates

```bash
# Block deployment on critical visual failures
if ! pnpm test:critical; then
  echo "Critical visual tests failed - blocking deployment"
  exit 1
fi
```

This comprehensive troubleshooting guide ensures the team can quickly identify, diagnose, and resolve visual regression issues while maintaining the quality and stability of the migration process.

## Conclusion

This strategy provides a comprehensive approach to maintaining visual consistency during the Next.js to Vite migration. By leveraging the existing robust Playwright infrastructure and implementing migration-specific enhancements, we can ensure a seamless user experience throughout the transition.

The lightweight, maintainable approach focuses on critical user journeys while providing the flexibility to handle the complexities of 3D content and animations that are central to the Atomiton platform.

---

**Document Status**: Complete v1.0  
**Author**: Brian (Testing Specialist)  
**Created**: September 1, 2025  
**Last Updated**: September 1, 2025
