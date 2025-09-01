# Playwright Testing Setup - Atomiton Web App

## Overview

This document outlines the comprehensive Playwright testing setup for the Atomiton web application. The testing strategy follows Brian's implementation approach based on Voorhees' strategic guidance, focusing on critical user paths and robust 3D/animation testing.

## Test Structure

### Core Testing Philosophy
1. **Critical paths first**: Home, sign-in, create, profile routes
2. **Progressive coverage**: Smoke tests → Visual snapshots → Comprehensive coverage
3. **3D-aware**: Special handling for WebGL/3D content with proper wait strategies
4. **CI-ready**: Configured for reliable execution in continuous integration

### Test Organization

```
tests/
├── pages/                 # Page Object Models
│   ├── base-page.ts      # Common page functionality
│   ├── home-page.ts      # Home page specific actions
│   ├── sign-in-page.ts   # Sign-in page interactions
│   ├── create-page.ts    # Create page with 3D handling
│   ├── profile-page.ts   # Profile page functionality
│   └── index.ts          # Page exports
├── utils/                # Test utilities
│   └── test-helpers.ts   # Common testing functions
├── critical-routes.spec.ts    # Smoke tests for key routes
├── visual-snapshots.spec.ts   # Comprehensive visual testing
├── all-routes.spec.ts         # Full route coverage
└── README.md             # This documentation
```

## Test Types

### 1. Critical Route Smoke Tests (`critical-routes.spec.ts`)
- **Purpose**: Verify core user paths load successfully
- **Coverage**: Home, sign-in, create, profile
- **Features**:
  - Basic page loading validation
  - Form presence verification (without authentication)
  - Mobile responsiveness testing
  - Essential visual snapshots

### 2. Visual Snapshot Tests (`visual-snapshots.spec.ts`)
- **Purpose**: Comprehensive visual regression testing
- **Features**:
  - 3D content stabilization with extended wait times
  - Multiple viewport testing (mobile, tablet, desktop)
  - Animation-aware snapshot capture
  - Loading state detection

### 3. All Routes Coverage (`all-routes.spec.ts`)
- **Purpose**: Systematic testing of all application routes
- **Coverage**: All 15 identified routes
- **Features**:
  - Performance benchmarking
  - Navigation flow testing
  - Error state detection
  - Categorized route organization

## Key Features

### 3D/Animation Support
- **waitFor3DContent()**: Specialized function for WebGL content
- **Extended timeouts**: Up to 15 seconds for complex 3D scenes
- **Canvas detection**: Automatic WebGL context validation
- **Network idle**: Ensures all assets are loaded before testing

### Page Object Pattern
- **BasePage**: Common functionality for all pages
- **Specialized pages**: Route-specific interactions and validations
- **Reusable components**: Consistent selectors and wait strategies
- **Error handling**: Graceful degradation for missing elements

### CI/CD Integration
- **GitHub Actions**: Automated test execution on push/PR
- **Artifact storage**: Test reports and screenshots preserved
- **Browser installation**: Automatic Playwright browser setup
- **Parallel execution**: Optimized for CI environments

## Configuration

### Playwright Config (`playwright.config.ts`)
- **Base URL**: http://localhost:3000
- **Browsers**: Chrome, Firefox, Safari (desktop + mobile)
- **Web Server**: Automatic Next.js dev server startup
- **Visual Testing**: Threshold-based screenshot comparison
- **Reporting**: HTML reports with JSON exports

### Test Scripts (package.json)
```json
{
  "test": "playwright test",
  "test:critical": "playwright test tests/critical-routes.spec.ts",
  "test:visual": "playwright test tests/visual-snapshots.spec.ts", 
  "test:all-routes": "playwright test tests/all-routes.spec.ts",
  "test:headed": "playwright test --headed",
  "test:debug": "playwright test --debug",
  "test:ui": "playwright test --ui"
}
```

## Running Tests

### Local Development
```bash
# Install dependencies
pnpm install

# Install Playwright browsers (first time only)
pnpm run test:install

# Run all tests
pnpm run test

# Run specific test suites
pnpm run test:critical     # Smoke tests only
pnpm run test:visual      # Visual snapshots
pnpm run test:all-routes  # Comprehensive coverage

# Debug tests
pnpm run test:debug       # Step-through debugging
pnpm run test:headed      # Run with browser visible
pnpm run test:ui          # Interactive UI mode
```

### Continuous Integration
Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`
- Manual workflow dispatch

Artifacts:
- HTML test reports (30-day retention)
- Screenshots and videos of failures
- JSON test results for integration

## Test Writing Guidelines

### Page Objects
```typescript
// Use the base page for common functionality
class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
    // Define page-specific locators
  }
}
```

### 3D Content Testing
```typescript
// For pages with 3D/WebGL content
await waitFor3DContent(page);
await waitForPageLoad(page);

// For create/animation pages
const createPage = new CreatePage(page);
await createPage.waitFor3DReady();
```

### Visual Snapshots
```typescript
// Consistent snapshot capture
await takePageSnapshot(page, 'my-page.png');

// With viewport specification
await page.setViewportSize(VIEWPORTS.tablet);
await takePageSnapshot(page, 'my-page-tablet.png');
```

## Troubleshooting

### Common Issues

1. **Test Timeouts with 3D Content**
   - Increase timeout values in test configuration
   - Ensure proper wait strategies are used
   - Check for network connectivity issues

2. **Flaky Visual Tests**
   - Hide dynamic elements (timestamps, loading spinners)
   - Adjust visual comparison threshold
   - Ensure consistent wait strategies

3. **CI Failures**
   - Verify browser installation in CI environment
   - Check for headless-specific issues
   - Review artifact uploads for debugging

### Debug Commands
```bash
# Show test report
pnpm run test:report

# Run specific test file
pnpm exec playwright test tests/critical-routes.spec.ts

# Run tests with trace
pnpm exec playwright test --trace on

# Generate test files
pnpm exec playwright codegen localhost:3000
```

## Implementation Status

✅ Playwright installation and configuration
✅ Page object models for critical routes
✅ Comprehensive test utilities
✅ Critical route smoke tests
✅ Visual snapshot testing with 3D support
✅ Full route coverage implementation
✅ CI/CD GitHub Actions workflow
✅ Quality checks integration
✅ Documentation and setup instructions

## Next Steps (Phase 2)

1. **Interactive Testing**: Form submissions, user interactions
2. **API Integration**: Mock data, authentication flows
3. **Performance Testing**: Core Web Vitals, load testing
4. **Accessibility Testing**: ARIA compliance, keyboard navigation
5. **Cross-browser Validation**: Extended browser matrix testing

## Contact

For questions about the testing setup or to report issues:
- **Brian (Tester)**: Primary test implementation and maintenance
- **Team Lead**: Strategic guidance and approval process
- **Repository Issues**: Bug reports and feature requests

---

*Generated as part of the comprehensive Atomiton testing infrastructure setup*