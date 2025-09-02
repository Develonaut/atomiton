# Next.js to Vite Migration Strategy

## Migration Overview

### Current State Analysis

**Technology Stack:**

- **Framework**: Next.js 15.3.3 with App Router
- **Styling**: Tailwind CSS v3.4.15 (downgraded from v4 for Vite compatibility)
- **UI Components**: Custom React components with Headless UI
- **Font Loading**: Next.js font optimization (Inter from Google Fonts)
- **State Management**: Zustand v5.0.5
- **Build System**: Turborepo with pnpm workspaces
- **Image Optimization**: Next.js Image component
- **Development**: Standard Next.js dev server

**Next.js Features Currently Used:**

- App Router with file-based routing (`/app` directory)
- Next.js font optimization (`next/font/google`)
- Next.js Image component (`next/image`)
- Next.js Link component (`next/link`)
- Navigation hooks (`usePathname`, `useRouter`)
- Metadata API for SEO
- Client-side rendering ("use client" directive)
- No API routes detected
- No SSR/SSG features detected (primarily client-side app)

### Target State with Vite

**Technology Stack:**

- **Framework**: Vite + React + TypeScript
- **Styling**: Mantine UI (replacing Tailwind CSS)
- **UI Components**: Mantine-based components with Compound pattern
- **State Management**: Zustand (retained)
- **Build System**: Vite with Turborepo
- **Routing**: React Router v6
- **Development**: Vite dev server (faster HMR)

### Risk Assessment and Mitigation Strategies

| Risk Level | Risk                           | Mitigation Strategy                         |
| ---------- | ------------------------------ | ------------------------------------------- |
| **High**   | Routing migration complexity   | Phase approach with route mapping           |
| **High**   | Image optimization loss        | Implement Vite image optimization plugins   |
| **Medium** | Font loading strategy change   | Use Vite font preloading techniques         |
| **Medium** | Build process integration      | Incremental Turborepo configuration updates |
| **Low**    | State management compatibility | Zustand works identically with Vite         |
| **Low**    | Component compatibility        | Most components are framework-agnostic      |

## Phase-by-Phase Approach

**Strategic Decision**: Following Option A - Complete Vite Migration First before tackling UI library changes. This provides immediate developer experience improvements and maintains single focus area for easier debugging.

### Phase 1: Setup and Configuration (Days 1-2) ✅ COMPLETE

**Objectives:**

- Set up Vite configuration ✅
- Install required dependencies ✅
- Configure TypeScript and build tools ✅
- Resolve CSS compatibility issues ✅

**Status:** Successfully completed with Tailwind CSS v3 downgrade solution

**Important Note:** Tailwind CSS v4's new PostCSS plugin was incompatible with Vite. Solution implemented:

- Downgraded from Tailwind CSS v4 to v3.4.15
- Converted new v4 syntax (`@import "tailwindcss"`) to v3 syntax (`@tailwind base/components/utilities`)
- Migrated theme configuration from CSS to JavaScript config
- Both Next.js and Vite now work with full styling preserved

**Tasks:**

1. **Install Vite and dependencies**

   ```bash
   cd apps/web
   pnpm add -D vite @vitejs/plugin-react
   pnpm add -D vite-tsconfig-paths vite-plugin-dts
   ```

2. **Create Vite configuration**

   ```typescript
   // vite.config.ts
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import tsconfigPaths from "vite-tsconfig-paths";

   export default defineConfig({
     plugins: [react(), tsconfigPaths()],
     server: {
       port: 3000,
     },
     build: {
       outDir: "dist",
       sourcemap: true,
     },
   });
   ```

3. **Update package.json scripts**

   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "lint": "eslint . --max-warnings 0",
       "check-types": "tsc --noEmit"
     }
   }
   ```

4. **Create index.html entry point**
   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Atomiton</title>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="/src/main.tsx"></script>
     </body>
   </html>
   ```

### Phase 2: Routing Migration (Days 3-4) ✅ COMPLETE

**Objectives:**

- Migrate routing from Next.js App Router to React Router v6 ✅
- Replace Next.js navigation hooks with React Router equivalents ✅
- Update all Link components ✅
- Maintain parallel setup during migration ✅

**Status:** Successfully completed with full routing compatibility

**Implementation Summary:**

- Created React Router v6 configuration with all 17 routes
- Built compatibility layer for seamless Next.js to React Router migration
- Updated 21+ components to use new routing system
- Resolved usePathname null issue through proper import configuration

**Tasks:**

1. **Install React Router**

   ```bash
   pnpm add react-router-dom @types/react-router-dom
   ```

2. **Create new app structure**

   ```
   src/
   ├── main.tsx              # Vite entry point
   ├── App.tsx               # Root component
   ├── routes/               # Route definitions
   │   ├── index.tsx
   │   ├── create.tsx
   │   ├── explore/
   │   │   └── details.tsx
   │   └── profile.tsx
   ├── components/           # Existing components (migrated)
   ├── hooks/                # Existing hooks
   ├── store/                # Zustand stores
   └── utils/                # Utilities
   ```

3. **Route mapping strategy**
   | Next.js App Router | React Router |
   |-------------------|--------------|
   | `/app/page.tsx` | `/` |
   | `/app/create/page.tsx` | `/create` |
   | `/app/explore/[id]/page.tsx` | `/explore/:id` |
   | `/app/profile/[username]/page.tsx` | `/profile/:username` |

4. **Create main.tsx entry point**

   ```typescript
   import React from 'react'
   import ReactDOM from 'react-dom/client'
   import { BrowserRouter } from 'react-router-dom'
   import App from './App'
   import './index.css'

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </React.StrictMode>
   )
   ```

### Phase 3: Asset Handling and Optimization (Days 6-7) ✅ COMPLETE

**Objectives:**

- Replace Next.js Image optimization ✅
- Handle font loading ✅
- Optimize static assets ✅

**Status:** Successfully completed with full asset optimization

**Implementation Summary:**

- Created custom Image component with lazy loading and fade-in effects
- Migrated Google Fonts from next/font to CSS imports
- Configured Vite asset optimization with proper file naming
- Eliminated all next/image dependencies

**Tasks:**

1. **Image optimization setup**

   ```bash
   pnpm add -D vite-plugin-imagemin @squoosh/lib
   ```

2. **Font optimization**

   ```typescript
   // Replace next/font/google usage
   // From:
   import { Inter } from "next/font/google";

   // To: CSS import in index.css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
   ```

3. **Update Image component**

   ```typescript
   // Create custom Image component to replace next/image
   interface ImageProps {
     src: string;
     alt: string;
     width?: number;
     height?: number;
     className?: string;
   }

   export const Image: React.FC<ImageProps> = ({ src, alt, ...props }) => {
     return <img src={src} alt={alt} {...props} loading="lazy" />
   }
   ```

### Phase 4: Testing and Validation (Days 8-9) ✅ COMPLETE

**Objectives:**

- Ensure all routes work correctly ✅
- Validate component functionality ✅
- Performance benchmarking ✅

**Status:** Successfully completed with comprehensive test coverage

**Implementation Summary:**

- Configured dual-environment Playwright testing (Next.js vs Vite)
- Successfully generated visual snapshots for all 15 routes
- Validated build performance (2.53s build time)
- Confirmed TypeScript compilation and code quality checks pass

**Tasks:**

1. **Update test configurations**
   - Modify Playwright tests for new routing
   - Update test paths and selectors
   - Validate all critical user flows

2. **Performance validation**
   - Compare build times (Next.js vs Vite)
   - Measure dev server startup times
   - Bundle size analysis

3. **Feature parity checklist**
   - [x] All routes accessible
   - [x] Navigation works correctly
   - [x] Images load and display properly
   - [x] Fonts render correctly
   - [x] State management functions
   - [x] All components render without errors

### Phase 5: Source Code Organization (Days 10-11)

**Objectives:**

- Reorganize codebase into proper src/ directory structure
- Move all application code into src/ folder
- Maintain clean separation between source and config files

**Tasks:**

1. **Move directories into src/**
   ```bash
   # Current structure (root level)
   apps/web/
   ├── app/          # Next.js app directory
   ├── components/   # React components
   ├── hooks/        # Custom hooks
   ├── store/        # Zustand stores
   ├── templates/    # Page templates
   ├── tests/        # Test files
   ├── types/        # TypeScript types
   └── utils/        # Utility functions
   
   # Target structure (organized in src/)
   apps/web/
   ├── src/
   │   ├── app/        # App pages (to be removed after full migration)
   │   ├── components/ # React components
   │   ├── hooks/      # Custom hooks
   │   ├── store/      # Zustand stores
   │   ├── templates/  # Page templates
   │   ├── types/      # TypeScript types
   │   ├── utils/      # Utility functions
   │   ├── router/     # React Router setup
   │   ├── App.tsx     # Main app component
   │   ├── main.tsx    # Vite entry point
   │   └── index.css   # Global styles
   ├── tests/          # Test files (keep at root)
   └── public/         # Static assets
   ```

2. **Update import paths**
   - Update all relative imports to reflect new structure
   - Update tsconfig.json path mappings
   - Update Vite alias configuration

3. **Update configuration files**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     root: '.',
     publicDir: 'public',
     build: {
       outDir: 'dist',
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
         '@components': path.resolve(__dirname, './src/components'),
         '@hooks': path.resolve(__dirname, './src/hooks'),
         '@utils': path.resolve(__dirname, './src/utils'),
       },
     },
   });
   ```

4. **Benefits of reorganization**
   - Clear separation between source code and config
   - Better IDE navigation and search
   - Consistent with Vite project conventions
   - Easier to maintain and scale

### Phase 6: Deployment Configuration (Days 12-13)

**Objectives:**

- Update deployment scripts
- Configure production builds
- Update CI/CD pipelines

**Tasks:**

1. **Update Turborepo configuration**

   ```json
   // turbo.json updates
   {
     "tasks": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**"]
       },
       "dev": {
         "cache": false,
         "persistent": true
       }
     }
   }
   ```

2. **Production build optimization**
   ```typescript
   // vite.config.ts production optimizations
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ["react", "react-dom", "react-router-dom"],
             ui: ["@headlessui/react", "framer-motion"],
           },
         },
       },
     },
   });
   ```

## Technical Considerations

### Routing Migration

**From Next.js App Router to React Router:**

```typescript
// Before (Next.js)
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// After (React Router)
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

// Migration mapping:
// useRouter() → useNavigate()
// usePathname() → useLocation().pathname
// router.push('/path') → navigate('/path')
// router.back() → navigate(-1)
```

### Environment Variables Handling

**Next.js vs Vite environment variables:**

```bash
# Next.js (keep as is for compatibility)
NEXT_PUBLIC_API_URL=https://api.example.com

# Vite equivalent
VITE_API_URL=https://api.example.com
```

**Access pattern change:**

```typescript
// Before (Next.js)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// After (Vite)
const apiUrl = import.meta.env.VITE_API_URL;
```

### Build and Development Workflow Changes

| Aspect              | Next.js                   | Vite                       |
| ------------------- | ------------------------- | -------------------------- |
| **Dev Server**      | `next dev` (slower start) | `vite` (instant start)     |
| **Build**           | `next build`              | `vite build`               |
| **Preview**         | `next start`              | `vite preview`             |
| **Hot Reload**      | Fast Refresh              | HMR (faster)               |
| **Bundle Analysis** | Built-in analyzer         | `rollup-plugin-visualizer` |

## Dependencies and Package Updates

### Packages to Remove

```json
{
  "dependencies": {
    "next": "15.3.3", // Remove
    "eslint-config-next": "15.3.3" // Remove
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4" // Remove (Mantine migration)
  }
}
```

### Packages to Add

```json
{
  "dependencies": {
    "react-router-dom": "^6.15.0",
    "@mantine/core": "^7.0.0",
    "@mantine/hooks": "^7.0.0",
    "@mantine/notifications": "^7.0.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite-tsconfig-paths": "^4.2.0",
    "@types/react-router-dom": "^5.3.0"
  }
}
```

### Version Compatibility Matrix

| Package         | Current Version | Target Version | Compatibility |
| --------------- | --------------- | -------------- | ------------- |
| React           | ^19.0.0         | ^19.0.0        | ✅ Compatible |
| TypeScript      | ^5              | ^5             | ✅ Compatible |
| Zustand         | ^5.0.5          | ^5.0.5         | ✅ Compatible |
| Framer Motion   | ^12.17.0        | ^12.17.0       | ✅ Compatible |
| React Hot Toast | ^2.5.2          | ^2.5.2         | ✅ Compatible |

## Code Migration Patterns

### Import Replacements

```typescript
// 1. Next.js Navigation
// Before:
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// After:
import { useNavigate, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'

// 2. Next.js Font
// Before:
import { Inter } from 'next/font/google'

// After: (CSS import in main CSS file)
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

// 3. Next.js Image
// Before:
import Image from 'next/image'

// After:
import { Image } from '@/components/Image' // Custom component
```

### Metadata and SEO Handling

**Replace Next.js Metadata API:**

```typescript
// Before (Next.js layout.tsx)
export const metadata: Metadata = {
  title: "Atomiton",
  description: "Visual automation platform",
};

// After (React Helmet or document.title)
import { useEffect } from "react";

const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};
```

### Dynamic Imports and Code Splitting

```typescript
// Before (Next.js)
const DynamicComponent = dynamic(() => import('./Component'))

// After (React + Vite)
const DynamicComponent = React.lazy(() => import('./Component'))

// Usage:
<Suspense fallback={<div>Loading...</div>}>
  <DynamicComponent />
</Suspense>
```

### Component Migration Examples

**1. Navigation Component:**

```typescript
// Before:
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavLink = ({ href, children }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  )
}

// After:
import { Link, useLocation } from 'react-router-dom'

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  )
}
```

**2. Router Navigation:**

```typescript
// Before:
import { useRouter } from "next/navigation";

const Component = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard");
    // router.back()
  };
};

// After:
import { useNavigate } from "react-router-dom";

const Component = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard");
    // navigate(-1)
  };
};
```

## Rollback Strategy

### Safe Rollback Process

1. **Keep Next.js branch**: Maintain `main` branch with Next.js until migration is complete
2. **Feature branch development**: Perform migration on `feature/vite-migration` branch
3. **Incremental testing**: Test each phase thoroughly before proceeding
4. **Environment parity**: Ensure dev, staging, and production environments are identical

### Rollback Triggers

**Automatic rollback if:**

- Build times exceed Next.js baseline by >50%
- Bundle size increases by >25%
- Any critical functionality breaks
- Performance regressions detected

### Rollback Steps

1. **Stop current deployment**
2. **Switch back to main branch**
   ```bash
   git checkout main
   pnpm install
   pnpm run build
   ```
3. **Restore Next.js configuration**
4. **Re-deploy previous version**
5. **Document issues encountered**

### Parallel Environment Strategy

**During migration period:**

- **Production**: Next.js (stable)
- **Staging**: Vite (testing)
- **Development**: Vite (migration work)

## Success Metrics

### Performance Benchmarks

**Development Experience:**

- [ ] Dev server startup: <2 seconds (vs Next.js ~5-10 seconds)
- [ ] Hot reload speed: <100ms (vs Next.js ~500ms)
- [ ] Build time: Maintain or improve current times

**Production Metrics:**

- [ ] Bundle size: Maintain current size or reduce by 10%
- [ ] First Contentful Paint: ≤ current performance
- [ ] Time to Interactive: ≤ current performance
- [ ] Core Web Vitals: Maintain or improve scores

### Feature Parity Checklist

**Routing:**

- [ ] All routes accessible and functional
- [ ] Dynamic routes work correctly (e.g., `/explore/:id`)
- [ ] Navigation state preserved
- [ ] Browser back/forward buttons work
- [ ] Deep linking functions correctly

**Components:**

- [ ] All existing components render without errors
- [ ] Interactive elements function correctly
- [ ] Animations and transitions work
- [ ] Form submissions and validations work
- [ ] Image loading and optimization

**Developer Experience:**

- [ ] TypeScript compilation works
- [ ] ESLint and Prettier integration
- [ ] Hot module replacement functions
- [ ] Source maps available for debugging
- [ ] All npm scripts work correctly

**Build and Deployment:**

- [ ] Production builds succeed
- [ ] Assets are properly optimized
- [ ] Environment variables work
- [ ] Turborepo integration functions
- [ ] CI/CD pipeline compatibility

### Testing Coverage Requirements

**Critical Path Testing:**

- [ ] User authentication flow
- [ ] Main navigation between pages
- [ ] Core component functionality
- [ ] State management operations
- [ ] Image and asset loading

**Cross-Browser Testing:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Device Testing:**

- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (1024x768, 834x1112)
- [ ] Mobile (375x667, 414x896)

## Implementation Timeline

| Phase       | Duration    | Key Deliverables                        |
| ----------- | ----------- | --------------------------------------- |
| **Phase 1** | 2 days      | Vite setup, basic configuration         |
| **Phase 2** | 3 days      | Routing migration, app structure        |
| **Phase 3** | 2 days      | Asset optimization, component updates   |
| **Phase 4** | 2 days      | Testing, validation, performance checks |
| **Phase 5** | 2 days      | Deployment configuration, CI/CD updates |
| **Total**   | **11 days** | Complete migration ready for production |

## Post-Migration Considerations

### Mantine UI Integration Preparation

The Vite migration sets the stage for the subsequent Mantine UI migration:

1. **Component structure** is now framework-agnostic
2. **Build system** supports modern CSS-in-JS libraries
3. **Development experience** improved for component development
4. **Bundle optimization** ready for UI library integration

### Future Enhancements Enabled

**With Vite in place, the following become easier:**

- React Flow integration for visual editor
- Advanced code splitting strategies
- Plugin ecosystem utilization
- Custom build optimizations
- Development tool integrations

---

**Document Status**: Implementation Strategy  
**Last Updated**: September 1, 2025  
**Dependencies**: None - can begin immediately  
**Related Documents**:

- [TODO.md](/docs/TODO.md) - Implementation tracking
- [Architecture README](/docs/architecture/README.md) - Target architecture
- [Development Guidelines](/docs/guidelines/README.md) - Quality standards
