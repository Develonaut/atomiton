# Current Work - Atomiton Platform

## Overview

This document aggregates current work across the entire monorepo. For detailed progress, see individual CURRENT.md files in each package and app.

## Current Status: January 2025

### 🎯 Primary Focus

**Editor Node Inspector** - Implementing property configuration panel for selected nodes to enable workflow creation

### 📦 Package Status

| Package                         | Status    | Current Focus                 | Build Status |
| ------------------------------- | --------- | ----------------------------- | ------------ |
| **@atomiton/editor**            | 🔴 Active | **Node Inspector (Critical)** | ✅ Passing   |
| **@atomiton/ui**                | 🟢 Active | Component library             | ✅ Passing   |
| **@atomiton/core**              | 🟢 Active | Blueprint engine              | ✅ Passing   |
| **@atomiton/nodes**             | 🟢 Active | Node implementations          | ✅ Passing   |
| **@atomiton/store**             | 🟢 Active | State management              | ✅ Passing   |
| **@atomiton/events**            | 🟢 Active | Event system                  | ✅ Passing   |
| **@atomiton/di**                | 🟢 Active | Dependency injection          | ✅ Passing   |
| **@atomiton/eslint-config**     | ✅ Stable | Shared ESLint config          | ✅ Passing   |
| **@atomiton/typescript-config** | ✅ Stable | Shared TypeScript config      | ✅ Passing   |

### 📱 Apps Status

| App         | Status    | Current Focus          | Build Status |
| ----------- | --------- | ---------------------- | ------------ |
| **client**  | 🟢 Active | Vite-based React app   | ✅ Passing   |
| **desktop** | 🟢 Ready  | Electron wrapper ready | ✅ Passing   |

### 🚀 Recent Achievements

- ✅ Editor package created with React Flow integration
- ✅ Canvas with grid, minimap, and viewport controls
- ✅ Node palette showing available nodes from @atomiton/core
- ✅ Basic node addition and selection working
- ✅ Left/Right sidebars integrated with placeholder content
- ✅ All packages building successfully
- ✅ **@atomiton/core testing infrastructure fixed** - Added smoke tests, benchmarks, and all 8 test scripts functional (Jan 13, 2025)

### 📊 Current Priorities

1. **🔴 Node Inspector** - Display/edit node properties in right sidebar (CRITICAL)
2. **🔴 Data Connections** - Enable node-to-node data flow connections
3. **🟡 Workflow Execution** - Run workflows from the editor
4. **🟡 Save/Load** - Persist Blueprints to .atom files
5. **🟢 Visual Feedback** - Show execution status on nodes
6. **🟢 Validation Package** - Extract Zod usage into @atomiton/validation package
7. **🟢 Shared Vite Config** - Create @atomiton/vite-config package to reduce duplication in build configurations
8. **🟢 Standardize Default Exports** - Unify all non-UI packages to use default exports for ES6 class-based APIs (e.g., `import store from '@atomiton/store'` instead of `import { store } from '@atomiton/store'`)

## 🚨 CRITICAL: Testing Infrastructure Remediation

### Testing Compliance Status

Based on Karen's audit, **only 2 of 15 packages** meet our testing standards. The following packages require immediate remediation:

#### 🔴 CRITICAL PRIORITY - Core API Packages (Missing Required Tests)

**1. @atomiton/core** ✅ **COMPLETED (Jan 13, 2025)**

```
COMPLETED: Fixed the @atomiton/core package to meet testing requirements:
- ✅ Added smoke tests in src/__tests__/api.smoke.test.ts for critical API functionality
- ✅ Added benchmarks in src/__benchmarks__/api.bench.ts for performance-critical operations
- ✅ All 8 test scripts are functional (not placeholders)
- ✅ Vitest configuration properly set up
```

**2. @atomiton/events**

```
Fix the @atomiton/events package to meet our testing requirements per docs/development/PACKAGE_CREATION_GUIDE.md:
- Add smoke tests in src/__tests__/*.smoke.test.ts for event system functionality
- Add benchmarks in src/__benchmarks__/*.bench.ts for event dispatching performance
- Ensure all 8 test scripts are functional
- Add test configuration block to vite.config.ts
```

**3. @atomiton/storage**

```
Fix the @atomiton/storage package to meet our testing requirements per docs/development/PACKAGE_CREATION_GUIDE.md:
- Add smoke tests in src/__tests__/*.smoke.test.ts for storage operations
- Add benchmarks in src/__benchmarks__/*.bench.ts for read/write performance
- Ensure all 8 test scripts are functional
- Add test configuration block to vite.config.ts
```

**4. @atomiton/store**

```
Fix the @atomiton/store package to meet our testing requirements per docs/development/PACKAGE_CREATION_GUIDE.md:
- Add smoke tests in src/__tests__/*.smoke.test.ts for state management
- Add benchmarks in src/__benchmarks__/*.bench.ts for state update performance
- Ensure all 8 test scripts are functional
- Add test configuration block to vite.config.ts
```

**5. @atomiton/di**

```
Fix the @atomiton/di package to meet our testing requirements per docs/development/PACKAGE_CREATION_GUIDE.md:
- Add smoke tests in src/__tests__/*.smoke.test.ts for dependency injection
- Add benchmarks in src/__benchmarks__/*.bench.ts for container operations
- Ensure all 8 test scripts are functional
- Add test configuration block to vite.config.ts
```

#### 🟡 HIGH PRIORITY - Config Packages (Placeholder Scripts)

**6. @atomiton/eslint-config**

```
Fix the @atomiton/eslint-config package to meet our testing requirements:
- Replace all placeholder echo scripts with functional test commands
- Create vitest.config.ts for proper test configuration
- Add validation tests to verify ESLint configurations work correctly
- Ensure all 8 test scripts actually run tests (not echo statements)
```

**7. @atomiton/typescript-config**

```
Fix the @atomiton/typescript-config package to meet our testing requirements:
- Replace all placeholder echo scripts with functional test commands
- Create vitest.config.ts for proper test configuration
- Add validation tests to verify TypeScript configurations work correctly
- Ensure all 8 test scripts actually run tests (not echo statements)
```

#### 🟢 MEDIUM PRIORITY - UI/Feature Packages

**8. @atomiton/editor**

```
Fix the @atomiton/editor package to meet our testing requirements:
- Add smoke tests for critical editor functionality
- Add benchmarks for React Flow performance
- Add missing test:e2e script
- Create actual test files beyond the single Editor.test.tsx
```

**9. @atomiton/form**

```
Fix the @atomiton/form package to meet our testing requirements:
- Add smoke tests for form validation and submission
- Add benchmarks for form processing performance
- Add test configuration to vite.config.ts
- Create comprehensive test suite
```

**10. @atomiton/conductor**

```
Fix the @atomiton/conductor package to meet our testing requirements:
- Add smoke tests for workflow execution
- Add benchmarks for execution performance
- Create actual test files (currently has none)
- Ensure all test scripts are functional
```

**11. @atomiton/yaml**

```
Fix the @atomiton/yaml package to meet our testing requirements:
- Add smoke tests for YAML parsing
- Add benchmarks for parse/stringify performance
- Create comprehensive test suite
- Add test configuration block
```

**12. @atomiton/ui**

```
Fix the @atomiton/ui package to meet our testing requirements:
- Add smoke tests for critical UI components
- Add benchmarks for component rendering performance
- Expand test coverage beyond single component test
```

**13. @atomiton/hooks**

```
Fix the @atomiton/hooks package to meet our testing requirements:
- Add smoke tests for critical hooks
- Add benchmarks for hook performance
- Create actual test files (currently has none)
- Fix vite.config.ts to include test configuration
```

### Testing Requirements Summary

Per our PACKAGE_CREATION_GUIDE.md, ALL packages must have:

1. **All 8 test scripts** in package.json (functional, not placeholders):
   - `test`, `test:unit`, `test:watch`, `test:coverage`
   - `test:smoke`, `test:benchmark`, `test:e2e`, `test:all`

2. **Actual test files**:
   - Unit tests: `src/**/*.test.ts`
   - Smoke tests: `src/**/*.smoke.test.ts` (REQUIRED for API packages)
   - Benchmarks: `src/**/*.bench.ts` (REQUIRED for API packages)

3. **Proper test configuration**:
   - `vitest.config.ts` or test block in `vite.config.ts`
   - Test directories: `src/__tests__/` and `src/__benchmarks__/`

4. **No placeholder scripts** - All test commands must actually run tests

## Quick Links

- [What's Next](./NEXT.md)
- [Completed Work](./COMPLETED.md)
- [Project Roadmap](./docs/project/ROADMAP.md)

## Editor Status Summary

The editor is currently **~50% complete**. Users can:

- ✅ View available nodes in the palette
- ✅ Add nodes to the canvas
- ✅ Select nodes
- ❌ **Configure node properties** (Current blocker)
- ❌ Connect nodes for data flow
- ❌ Execute workflows
- ❌ Save/load Blueprints

**Next Milestone**: Functional workflow creation with configured, connected nodes.

---

**Last Updated**: 2025-01-10
