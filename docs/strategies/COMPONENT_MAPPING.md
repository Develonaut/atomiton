# Component Mapping Analysis

## Complete Component Inventory

### Duplicate Components Analysis

| Component       | apps/client          | packages/ui           | Migration Strategy    | Priority |
| --------------- | -------------------- | --------------------- | --------------------- | -------- |
| **Button**      | ✅ Traditional React | ✅ CVA + styled       | Use adapter pattern   | P1       |
| **Field**       | ✅ Basic input       | ✅ Advanced features  | Direct replacement    | P1       |
| **Image**       | ✅ Simple wrapper    | ✅ Optimized          | Direct replacement    | P1       |
| **Search**      | ✅ Basic search      | ✅ Enhanced search    | Evaluate features     | P2       |
| **Select**      | ✅ Dropdown          | ✅ Advanced select    | Direct replacement    | P2       |
| **Switch**      | ✅ Toggle            | ✅ Toggle with states | Direct replacement    | P1       |
| **Tabs**        | ✅ Navigation        | ✅ Compound component | Adapt implementation  | P2       |
| **Tooltip**     | ✅ react-tooltip     | ✅ Radix-based        | Direct replacement    | P1       |
| **Export**      | ✅ App-specific      | ✅ Generic export     | Evaluate differences  | P3       |
| **Layout**      | ✅ Page layouts      | ✅ Layout system      | Hybrid approach       | P3       |
| **Toolbar**     | ✅ App toolbar       | ✅ Generic toolbar    | Keep app-specific     | P4       |
| **VideoPlayer** | ✅ Custom player     | ✅ Media player       | Evaluate features     | P4       |
| **Zoom**        | ✅ Zoom controls     | ✅ Zoom utility       | Direct replacement    | P3       |
| **Folder**      | ✅ Folder item       | ✅ Folder + Folders   | Merge implementations | P3       |
| **Link**        | ✅ Router Link       | ✅ Generic link       | Use adapter           | P2       |
| **Group**       | ✅ Grouping          | ✅ Group component    | Evaluate differences  | P3       |
| **Upload**      | ✅ File upload       | ✅ Enhanced upload    | Direct replacement    | P3       |

### Comment System Components

| Component           | apps/client Path                     | packages/ui Path    | Notes               |
| ------------------- | ------------------------------------ | ------------------- | ------------------- |
| **Comment Display** | `/Comments/Comment/`                 | `/Comment/`         | Different structure |
| **New Comment**     | `/Comments/NewComment/`              | `/NewComment/`      | Different features  |
| **Comment Message** | `/Comments/Comment/Message/`         | Part of `/Comment/` | Integrated in UI    |
| **Add User**        | `/Comments/NewComment/AddUser/`      | Not in UI           | App-specific        |
| **Image Preview**   | `/Comments/NewComment/ImagePreview/` | Not in UI           | App-specific        |
| **Add Files**       | `/Comments/NewComment/AddFiles/`     | Not in UI           | App-specific        |
| **Comment Pin**     | Not in client                        | `/CommentPin/`      | UI-only feature     |
| **Comment Cursor**  | Not in client                        | `/CommentCursor/`   | UI-only feature     |
| **Quick Comment**   | Not in client                        | `/QuickComment/`    | UI-only feature     |

### Unique to apps/client (No Migration Needed)

| Component          | Purpose            | Location           | Keep Reason             |
| ------------------ | ------------------ | ------------------ | ----------------------- |
| **Assets**         | Asset management   | `/Assets/`         | App-specific feature    |
| **Catalog**        | Product catalog    | `/Catalog/`        | Business logic          |
| **Gallery**        | Media gallery      | `/Gallery/`        | App feature             |
| **LayoutEditor**   | Layout editing     | `/LayoutEditor/`   | App feature             |
| **Login**          | Authentication     | `/Login/`          | App-specific auth       |
| **Projects**       | Project management | `/Projects/`       | Business feature        |
| **RightSidebar**   | App sidebar        | `/RightSidebar/`   | Contains app logic      |
| **LeftSidebar**    | Navigation         | `/LeftSidebar/`    | App navigation          |
| **User**           | User components    | `/User/`           | App user logic          |
| **Emoji**          | Emoji picker       | `/Emoji/`          | Uses emoji-picker-react |
| **Filters**        | Data filtering     | `/Filters/`        | App-specific filters    |
| **Icon**           | Icon system        | `/Icon/`           | String-based API        |
| **Modal**          | Modal dialogs      | `/Modal/`          | App modals              |
| **PanelMessage**   | Panel messages     | `/PanelMessage/`   | App messaging           |
| **ResizeImage**    | Image resize       | `/ResizeImage/`    | Image manipulation      |
| **Test**           | Test component     | `/Test/`           | Development only        |
| **ProfileDetails** | Profile display    | `/ProfileDetails/` | User feature            |
| **Navigation**     | App navigation     | `/Navigation/`     | Routing logic           |

### Unique to packages/ui (Available for Use)

| Component            | Purpose             | Benefits            |
| -------------------- | ------------------- | ------------------- |
| **AssetCard**        | Asset display card  | Reusable asset UI   |
| **AssetItem**        | Asset list item     | Consistent display  |
| **Card**             | Generic card        | Base primitive      |
| **ColorPicker**      | Color selection     | Advanced picker     |
| **DeleteFile**       | File deletion UI    | Consistent UX       |
| **ExploreCard**      | Exploration UI      | Discovery feature   |
| **FileMenu**         | File operations     | Dropdown menu       |
| **FiltersMenu**      | Filter menu         | Reusable filters    |
| **GuidelineSidebar** | Guidelines UI       | Documentation       |
| **HeaderMinimal**    | Minimal header      | Layout variant      |
| **HeaderSimple**     | Simple header       | Layout variant      |
| **HeaderAsset**      | Asset header        | Specialized header  |
| **Invite**           | Invitation UI       | User invites        |
| **Logo**             | Brand logo          | Consistent branding |
| **NewField**         | Field creation      | Dynamic forms       |
| **Notification**     | Single notification | Alert system        |
| **PriceCard**        | Pricing display     | Commerce UI         |
| **ProfileMenu**      | Profile dropdown    | User menu           |
| **PromptInput**      | AI prompt UI        | AI features         |
| **RowCards**         | Card layout         | Layout utility      |
| **SceneCard**        | Scene display       | 3D/Scene UI         |
| **SelectAI**         | AI selection        | AI features         |
| **Settings**         | Settings UI         | Configuration       |
| **ShareFile**        | File sharing        | Collaboration       |
| **SharePost**        | Post sharing        | Social features     |
| **ShareProfile**     | Profile sharing     | Social features     |
| **SubmitButton**     | Form submit         | Form utility        |
| **ThemeProvider**    | Theme context       | Theming             |
| **UploadAvatar**     | Avatar upload       | Profile feature     |
| **Variations**       | Design variations   | Design system       |

## Styling System Comparison

### CSS Variables (apps/client)

```css
/* apps/client/src/index.css */
:root {
  --shade-01: #fcfcfc;
  --shade-02: #f8f7f7;
  --shade-03: #f1f1f1;
  --shade-04: #ececec;
  --shade-05: #e2e2e2;
  --shade-06: #7b7b7b;
  --shade-07: #323232;
  --shade-08: #222222;
  --shade-09: #121212;
  /* + 138 more variables */
}
```

### Theme Tokens (packages/ui + theme)

```typescript
// packages/theme/src/tokens.ts
export const tokens = {
  colors: {
    neutral: {
      /* scaled values */
    },
    primary: {
      /* brand colors */
    },
    semantic: {
      /* status colors */
    },
  },
  spacing: {
    /* consistent spacing */
  },
  typography: {
    /* type system */
  },
};
```

## Import Path Migration

### Before Migration

```typescript
// apps/client/src/pages/SomePage.tsx
import Button from "@/components/Button";
import Field from "@/components/Field";
import { Search } from "@/components/Search";
import Icon from "@/components/Icon";
```

### After Migration

```typescript
// apps/client/src/pages/SomePage.tsx
import { Button, Field, Search } from "@atomiton/ui";
import Icon from "@/components/Icon"; // Keep app-specific
```

### With Adapters

```typescript
// apps/client/src/components/adapters/index.ts
export { Button } from "./ButtonAdapter";
export { Link } from "./LinkAdapter";

// Usage
import { Button, Link } from "@/components/adapters";
```

## Package Structure Recommendations

### Current Structure

```
packages/ui/src/
├── components/     # All components mixed
├── styles/        # Global styles
└── utils/         # Utilities
```

### Recommended Structure

```
packages/ui/src/
├── primitives/    # Base components (Button, Input)
├── components/    # Composed components
├── layouts/       # Layout components
├── patterns/      # Complex patterns (Comments)
├── system/        # Styled system
├── utils/         # Utilities
└── index.ts       # Barrel exports
```

## Migration Complexity Matrix

| Component | Code Complexity | Style Complexity | Dependency Count | Risk Level |
| --------- | --------------- | ---------------- | ---------------- | ---------- |
| Image     | Low             | Low              | 0                | ✅ Low     |
| Button    | Low             | Medium           | 1 (router)       | ⚠️ Medium  |
| Field     | Low             | Low              | 0                | ✅ Low     |
| Search    | Medium          | Low              | 1 (icon)         | ⚠️ Medium  |
| Select    | Medium          | Medium           | 2                | ⚠️ Medium  |
| Comments  | High            | High             | 5+               | 🔴 High    |
| Export    | High            | Medium           | 3+               | 🔴 High    |
| Layout    | High            | High             | Many             | 🔴 High    |

## Testing Requirements

### Unit Test Coverage Needed

| Component | Current Coverage | Required Coverage | Test Types        |
| --------- | ---------------- | ----------------- | ----------------- |
| Button    | Unknown          | 90%+              | Unit, Visual      |
| Field     | Unknown          | 90%+              | Unit, A11y        |
| Search    | Unknown          | 85%+              | Unit, Integration |
| Select    | Unknown          | 85%+              | Unit, A11y        |
| Tabs      | Unknown          | 80%+              | Unit, Navigation  |
| Comments  | Unknown          | 85%+              | Unit, Integration |

### Visual Regression Tests

Components requiring visual regression tests:

- All form components (Button, Field, Select, Switch)
- Layout components (Headers, Sidebars)
- Interactive components (Tabs, Tooltips, Modals)
- Theme-dependent components

## Performance Considerations

### Bundle Size Impact

| Component | Current Size | UI Package Size | Difference |
| --------- | ------------ | --------------- | ---------- |
| Button    | ~2KB         | ~3KB (CVA)      | +1KB       |
| Field     | ~3KB         | ~4KB            | +1KB       |
| Select    | ~5KB         | ~6KB            | +1KB       |
| Comments  | ~15KB        | ~12KB           | -3KB       |

### Code Splitting Opportunities

```typescript
// Lazy load heavy components
const Comments = lazy(() => import("@atomiton/ui/patterns/Comments"));
const Export = lazy(() => import("@atomiton/ui/components/Export"));
const Gallery = lazy(() => import("@/components/Gallery")); // Keep local
```

## Deprecation Timeline

### Phase 1 (Immediate)

- Mark duplicate components as deprecated
- Add console warnings in development

### Phase 2 (Week 4)

- Remove deprecated components from new features
- Update existing usage

### Phase 3 (Week 8)

- Remove deprecated components
- Clean up old imports

## Migration Tracking

Use this checklist to track migration progress:

### ✅ Completed

- [ ] Component analysis
- [ ] Dependency mapping
- [ ] Strategy documentation

### 🚧 In Progress

- [ ] Configuration updates
- [ ] Simple component migration

### 📋 Planned

- [ ] Form components
- [ ] Layout components
- [ ] Complex systems
- [ ] Testing
- [ ] Optimization

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-09  
**Related**: UI_PACKAGE_MIGRATION.md
