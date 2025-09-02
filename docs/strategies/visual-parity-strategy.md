# Visual Parity Strategy & Findings

## Strategy Overview

This document tracks our visual parity efforts between our Vite app and the reference Brainwave UI Kit (https://brainwave2-app.vercel.app/). It serves as:

1. **Pre-Migration Baseline** - Fix all CSS issues with current Tailwind v3
2. **Migration Validation** - Re-run after Tailwind → Mantine migration to ensure no regressions
3. **Living Documentation** - Track all findings and fixes

## Running Visual Comparisons

```bash
# Run the automated visual comparison
cd apps/web
./scripts/visual-diff.sh

# View the HTML report
open tests/snapshots/comparison/report.html
```

## Expected Differences (Ignore These)

The following differences are **intentional** and should be ignored:

### ✅ **Branding**

- **Logo**: Brainwave → Atomiton (top-left header)
- **Brand Text**: All "Brainwave" text → "Atomiton"
- **Note**: Placeholder content currently matches (will change after Tailwind migration)

---

## Current Findings (December 2, 2024)

### 🔴 **CRITICAL ISSUES** - Missing Major Components

#### 1. **Explore Page - Missing Content Grid** ✅ FIXED

- **Status**: ✅ FIXED (December 2, 2024)
- **Route**: `/explore`
- **Issue**: Main content area completely empty - no 3D object cards displayed
- **Expected**: Grid of 3D object preview cards with images
- **Root Cause**: Double opacity management conflict - both Gallery Item and Image components were managing opacity
- **Solution**: Removed opacity management from Image component to match NextImage behavior
- **Files Modified**:
  - `/src/components/Image/index.tsx` - Removed opacity state management
  - `/src/components/Gallery/Item/index.tsx` - Retained container opacity management
- **Impact**: Fixed visual rendering on all Gallery-based pages

#### 2. **Explore Sub-Pages - No Content** ✅ FIXED

- **Status**: ✅ FIXED (December 2, 2024)
- **Routes**: `/explore/designs`, `/explore/animations`
- **Issue**: Pages are blank below category pills
- **Expected**: Grid of design/animation previews
- **Root Cause**: Same opacity management conflict as main Explore page
- **Solution**: Fixed by the same Image component opacity removal
- **Impact**: All Gallery-based pages now display correctly

#### 3. **Profile Page - Empty Content Area** ✅ FIXED

- **Status**: ✅ FIXED (December 2, 2024)
- **Route**: `/profile`
- **Issue**: No user content, projects, or profile information displayed
- **Expected**: User profile with projects grid
- **Root Cause**: Same Gallery component opacity management conflict
- **Solution**: Fixed by the same Image component opacity removal
- **Impact**: Profile page Gallery now displays user projects correctly

### 🟡 **HIGH PRIORITY** - Layout & Styling Issues

#### 4. **Homepage - Extra Row of Items**

- **Status**: 🟡 HIGH
- **Route**: `/` (homepage)
- **Issue**: Shows 8 items (2 rows) instead of 4 items (1 row)
- **Expected**: Single row of 4 3D object cards
- **Fix**: Limit displayed items or adjust grid

#### 5. **Category Pills - Horizontal Scrolling**

- **Status**: 🟡 HIGH
- **Route**: `/explore`
- **Issue**: Category pills extend beyond viewport with scroll
- **Expected**: All pills visible without scrolling
- **Fix**: Adjust pill container width or wrap pills

#### 6. **AI Prompt Bar - Different Styling**

- **Status**: 🟡 HIGH
- **Routes**: `/explore`, `/`
- **Issue**: Prompt bar has different height and styling
- **Expected**: Floating prompt bar with proper shadows
- **Fix**: Match exact styling from reference

### 🟢 **MEDIUM PRIORITY** - Visual Polish

#### 7. **Card Shadows & Borders**

- **Status**: 🟢 MEDIUM
- **Routes**: All pages with cards
- **Issue**: Card shadows appear lighter/different
- **Expected**: Stronger drop shadows for depth
- **Fix**: Update shadow utilities

#### 8. **Icon Sizes in Sidebar**

- **Status**: 🟢 MEDIUM
- **Routes**: All pages
- **Issue**: Sidebar icons slightly different size
- **Expected**: Consistent icon sizing
- **Fix**: Standardize icon dimensions

#### 9. **Text Color Consistency**

- **Status**: 🟢 MEDIUM
- **Routes**: Various
- **Issue**: Some text appears lighter/darker than reference
- **Expected**: Exact color matching
- **Fix**: Verify color variables

### 🔵 **LOW PRIORITY** - Minor Differences

#### 10. **Spacing Variations**

- **Status**: 🔵 LOW
- **Routes**: All pages
- **Issue**: Minor padding/margin differences
- **Expected**: Pixel-perfect spacing
- **Fix**: Fine-tune spacing utilities

---

## Fixes Applied

### ✅ **Completed Fixes**

1. **Modal Width** (Sept 1, 2024)
   - Added maxWidth utilities: 69, 89, 99, 105, 148.5
   - File: `tailwind.config.js`

2. **Button Text Color** (Sept 1, 2024)
   - Added `text-shade-08` class to primary buttons
   - File: `src/components/Button/index.tsx`

3. **Image Component** (Sept 2, 2024)
   - Removed duplicate, kept better version
   - Added proper opacity transitions
   - File: `src/components/Image/index.tsx`

---

## Route-by-Route Status

| Route                 | Status     | Primary Issue               | Priority |
| --------------------- | ---------- | --------------------------- | -------- |
| `/`                   | 🟡 Partial | Shows 8 items instead of 4  | HIGH     |
| `/explore`            | 🔴 BROKEN  | No content grid displayed   | CRITICAL |
| `/explore/designs`    | 🔴 BROKEN  | Completely empty            | CRITICAL |
| `/explore/animations` | 🔴 BROKEN  | Completely empty            | CRITICAL |
| `/explore/details`    | ❓ Unknown | Need to test with content   | -        |
| `/create`             | ✅ Matches | Layout matches reference    | -        |
| `/profile`            | 🔴 BROKEN  | No profile content          | CRITICAL |
| `/pricing`            | ✅ Good    | Matches well                | -        |
| `/likes`              | 🟡 Partial | Similar to homepage issues  | MEDIUM   |
| `/updates`            | ✅ Good    | Matches reference           | -        |
| `/sign-in`            | ✅ Good    | Modal properly sized        | -        |
| `/create-account`     | ✅ Good    | Modal properly sized        | -        |
| `/reset-password`     | ✅ Good    | Modal properly sized        | -        |
| `/assets/3d-objects`  | 🟡 Partial | Shows content but different | MEDIUM   |
| `/assets/materials`   | 🟡 Partial | Shows content but different | MEDIUM   |

---

## Implementation Priority

### 🚨 **Phase 1: Critical Fixes** (Do First)

1. **Fix Explore page content grid** - Core functionality
2. **Fix Explore sub-pages** - Major navigation paths
3. **Fix Profile page** - User functionality
4. **Verify data loading** - Ensure content is fetching properly

### ⚠️ **Phase 2: High Priority** (Do Second)

1. **Homepage grid** - Limit to 4 items
2. **Category pills** - Fix horizontal overflow
3. **AI prompt bar** - Match exact styling
4. **Navigation consistency** - Ensure all routes work

### 📝 **Phase 3: Visual Polish** (Do Third)

1. **Card shadows** - Match reference depth
2. **Icon sizing** - Standardize dimensions
3. **Color consistency** - Verify all color values
4. **Spacing** - Fine-tune margins/padding

---

## Root Cause Analysis

### Potential Issues to Investigate:

1. **Data Loading**: Explore pages might not be fetching/displaying data
2. **Component Rendering**: Cards/grids might have conditional rendering issues
3. **Route Handling**: Sub-routes might not be properly configured
4. **State Management**: Content state might not be initialized
5. **API Connections**: Check if content endpoints are configured

### Debugging Steps:

```bash
# Check console for errors
npm run dev
# Open browser console and check for errors

# Verify component imports
grep -r "Catalog" src/
grep -r "Gallery" src/

# Check route configuration
cat src/router/index.tsx
```

---

## Testing Checklist

### Before Fixes:

- [x] Capture baseline screenshots
- [x] Document all issues
- [ ] Identify root causes
- [ ] Plan fix implementation

### After Each Fix:

- [ ] Re-run visual comparison
- [ ] Verify fix doesn't break other pages
- [ ] Update this document
- [ ] Commit fix with clear message

### Before Tailwind → Mantine Migration:

- [ ] All critical issues fixed
- [ ] All high priority issues fixed
- [ ] Create final baseline snapshots
- [ ] Document any acceptable differences

---

## Commands Reference

```bash
# Install ImageMagick for pixel-diff images
brew install imagemagick

# Run full comparison
./scripts/visual-diff.sh

# Run specific route
npx playwright test tests/visual-comparison.spec.ts --grep "explore"

# Update Vite snapshots
npx playwright test tests/snapshots.spec.ts --update-snapshots

# Start dev server on specific port
npm run dev -- --port 3001

# Check for component issues
npm run typecheck
npm run lint
```

---

## Notes

- **Critical Finding**: Multiple pages showing no content suggests data loading or component rendering issue
- **Positive**: Authentication pages (sign-in, create-account, reset-password) working well
- **Focus Area**: Explore and Profile pages are completely broken - fix these first
- Reference site uses Next.js with Tailwind v4 (we use Vite with Tailwind v3)
- Some processing differences are expected due to framework differences

---

**Last Updated**: December 2, 2024
**Next Review**: After fixing critical issues
**Document Status**: Active - Critical issues identified
