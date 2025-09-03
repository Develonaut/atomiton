# Visual Testing Guide for Atomiton Client

This guide explains how to use the comprehensive visual testing setup for the Atomiton client application. The system captures and compares screenshots across Next.js and Vite environments to ensure visual consistency during the migration.

## Overview

The visual testing system includes:

- **15+ routes** covered with full-page screenshots
- **Desktop and mobile** viewport testing
- **Next.js vs Vite** environment comparison
- **3D content handling** with proper WebGL waits
- **Dynamic content masking** to prevent false positives
- **Responsive breakpoint** testing for critical routes

## Quick Start

### 1. Capture Baseline Snapshots (First Time)

```bash
# Start Next.js server
npm run dev

# In another terminal, capture baseline snapshots
npm run test:baseline
```

This creates baseline screenshots from the Next.js environment that other environments will be compared against.

### 2. Run Full Visual Comparison

```bash
# Starts both servers and runs all comparisons
npm run test:visual-full
```

### 3. Run Specific Environment Tests

```bash
# Test only Next.js
npm run test:visual-nextjs

# Test only Vite
npm run test:visual-vite

# Update snapshots if changes are expected
npm run test:visual-update
```

## Detailed Usage

### Testing Specific Routes

The visual tests cover all these routes:

- `/` - Home page
- `/create` - 3D creation interface
- `/explore` - Main explore page with 3D content
- `/explore/details` - Explore details
- `/explore/designs` - Design showcase with 3D
- `/explore/animations` - Animation showcase with 3D
- `/profile` - User profile page
- `/pricing` - Pricing information
- `/likes` - User likes page
- `/updates` - Updates/notifications
- `/sign-in` - Sign in form
- `/create-account` - Account creation form
- `/reset-password` - Password reset form
- `/assets/3d-objects` - 3D objects asset browser
- `/assets/materials` - Materials asset browser

### Environment Projects

The Playwright configuration defines these projects:

- `nextjs-desktop` - Next.js on desktop viewport (1920x1080)
- `nextjs-mobile` - Next.js on mobile viewport (Pixel 5)
- `vite-desktop` - Vite on desktop viewport (1920x1080)
- `vite-mobile` - Vite on mobile viewport (Pixel 5)

### Manual Server Control

If you want more control over server startup:

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Vite
npm run dev:vite

# Terminal 3: Run tests (servers must be running)
npx playwright test visual-snapshots.spec.ts
```

### Advanced Usage

#### Run Specific Projects

```bash
# Run only desktop tests
npx playwright test visual-snapshots.spec.ts --project=nextjs-desktop --project=vite-desktop

# Run only mobile tests
npx playwright test visual-snapshots.spec.ts --project=nextjs-mobile --project=vite-mobile

# Run single project
npx playwright test visual-snapshots.spec.ts --project=vite-desktop
```

#### Update Snapshots

```bash
# Update all snapshots
npm run test:visual-update

# Update specific project snapshots
npx playwright test visual-snapshots.spec.ts --project=nextjs-desktop --update-snapshots
```

#### Debug Failed Tests

```bash
# Run in headed mode to see browser
npx playwright test visual-snapshots.spec.ts --headed

# Debug specific test
npx playwright test visual-snapshots.spec.ts --debug --grep "home"

# View test report
npm run test:report
```

## Test Structure

### Route Categories

Tests are organized by route categories:

1. **Main Routes** - Core application pages
2. **Explore Routes** - Content discovery pages with 3D
3. **User Routes** - Profile and personal pages
4. **Auth Routes** - Authentication forms
5. **Info Routes** - Static information pages
6. **Asset Routes** - Asset browser pages

### Viewport Testing

Each route is tested across multiple viewports:

- **Desktop** (1920x1080) - Standard desktop
- **Mobile** (Pixel 5) - Mobile portrait
- **Tablet** (768x1024) - Tablet portrait (critical routes only)
- **Desktop Large** (1440x900) - Large desktop (critical routes only)
- **Desktop XL** (1920x1080) - Extra large desktop (critical routes only)

### Special Handling

#### 3D Content Routes

Routes with 3D content (`/create`, `/explore/*`, assets pages) receive special handling:

- Extended timeouts (60-90 seconds)
- WebGL context waiting
- Canvas element detection
- Additional stability delays
- Loading indicator waits

#### Dynamic Content Masking

Dynamic elements are automatically masked to prevent false positives:

- Timestamps (`[data-testid="timestamp"]`, `.timestamp`)
- Random IDs (`[data-testid="random-id"]`)
- Session IDs (`[data-testid="session-id"]`)
- Date/time displays (`.date-time`)

## Helper Scripts

### `scripts/run-visual-tests.sh`

Main script for running comprehensive visual tests.

```bash
# Run all tests
./scripts/run-visual-tests.sh

# Run only Next.js tests
./scripts/run-visual-tests.sh --nextjs-only

# Run only Vite tests
./scripts/run-visual-tests.sh --vite-only

# Update snapshots
./scripts/run-visual-tests.sh --update-snapshots

# Run specific project
./scripts/run-visual-tests.sh --project nextjs-desktop
```

### `scripts/capture-baselines.sh`

Quick script to capture baseline snapshots from Next.js.

```bash
# Capture all baselines (Next.js server must be running)
./scripts/capture-baselines.sh
```

## Configuration

### Playwright Configuration

The `playwright.config.ts` is configured with:

- **Threshold**: 0.3 (30% difference tolerance)
- **Animation handling**: Disabled during screenshots
- **Caret hiding**: Prevents cursor interference
- **Full page screenshots**: Captures entire page content
- **Extended timeouts**: Up to 90 seconds for 3D content

### Test Helpers

Located in `tests/utils/test-helpers.ts`:

- `waitFor3DContent()` - Waits for WebGL and 3D rendering
- `waitForPageLoad()` - Standard page load waiting
- `takePageSnapshot()` - Standardized screenshot capture
- `getMaskSelectors()` - Dynamic content masking

## Troubleshooting

### Common Issues

#### Tests Timing Out

- Increase timeout in test configuration
- Check if servers are running on correct ports
- Verify 3D content is loading properly

#### False Positives

- Add problematic elements to mask selectors
- Increase threshold tolerance temporarily
- Check for dynamic content causing differences

#### Server Not Starting

- Check if ports 3000 and 3001 are available
- Kill existing processes: `lsof -ti:3000 | xargs kill`
- Verify npm scripts are working individually

### Debug Commands

```bash
# Check server status
curl -s http://localhost:3000 && echo "Next.js OK"
curl -s http://localhost:3001 && echo "Vite OK"

# View running processes on ports
lsof -i :3000
lsof -i :3001

# Clean test artifacts
rm -rf test-results/
```

## CI/CD Integration

For continuous integration, use:

```yaml
# Example GitHub Actions step
- name: Run Visual Tests
  run: |
    npm run dev &
    npm run dev:vite &
    sleep 10
    npm run test:visual
```

## Best Practices

1. **Update baselines** when UI changes are intentional
2. **Run tests locally** before committing changes
3. **Use specific projects** for faster iteration
4. **Mask dynamic content** to prevent false positives
5. **Allow sufficient time** for 3D content to load
6. **Check both environments** during migrations

## Files Overview

- `tests/visual-snapshots.spec.ts` - Main test file
- `playwright.config.ts` - Configuration with multiple projects
- `scripts/run-visual-tests.sh` - Comprehensive test runner
- `scripts/capture-baselines.sh` - Baseline capture script
- `tests/utils/test-helpers.ts` - Utility functions
- `docs/VISUAL_TESTING.md` - This documentation

This setup provides comprehensive visual regression testing to ensure consistency across different environments and during platform migrations.
