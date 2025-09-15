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
- ✅ **@atomiton/events testing infrastructure fixed** - Added smoke tests, benchmarks, and all 8 test scripts functional (Jan 13, 2025)

### 📊 Current Priorities

## 🎯 TOP PRIORITY: Blueprint Workflow Implementation

### Phase 1: Blueprint Loading & Editing System

**Development Strategy**: Each step below should be developed in its own git worktree to enable parallel development without conflicts.

#### Step 1: Blueprint Template Creation

**Worktree**: `wtnew blueprint-templates`
**Status**: 🔴 **CRITICAL - START HERE**

Create example blueprints that appear in the Explore Gallery:

- HelloWorld blueprint (simple console.log node)
- DataTransform blueprint (CSV → HTTP → Transform chain)
- ImageProcessor blueprint (FileSystem → ImageComposite → FileSystem)

**Agent Prompt**:

```
Create three example YAML blueprint templates for the Explore Gallery. Use the existing @atomiton/nodes package (9 node types available: code, csvReader, fileSystem, httpRequest, imageComposite, loop, parallel, shellCommand, transform) to build:
1. HelloWorld - Simple greeting workflow
2. DataTransform - CSV processing pipeline
3. ImageProcessor - Image manipulation workflow

Store templates in apps/client/src/data/blueprints/ and update Explore Gallery to load them. Follow the mandatory workflow and coordinate with agents as required.
```

#### Step 2: Gallery-to-Editor Loading

**Worktree**: `wtnew gallery-editor-integration`
**Status**: 🔴 **CRITICAL**

Enable clicking blueprints in gallery to load them into the React Flow editor:

- Update Gallery Item click handlers
- Implement blueprint→ReactFlow conversion using @atomiton/yaml package
- Route to editor with loaded blueprint
- Display nodes on canvas with proper positioning

**Agent Prompt**:

```
Implement loading blueprints from Explore Gallery into the React Flow editor. The gallery already exists, YAML conversion exists in @atomiton/yaml package, and basic React Flow editor exists in @atomiton/editor package. Connect these pieces to load selected blueprints into the editor canvas with proper node positioning and connections. Follow the mandatory workflow and coordinate with agents as required.
```

#### Step 3: Blueprint Save/Restore

**Worktree**: `wtnew blueprint-persistence`
**Status**: 🔴 **CRITICAL**

Implement saving edited blueprints:

- Save current editor state to YAML format using @atomiton/yaml
- Implement React Flow save/restore patterns from https://reactflow.dev/examples/interaction/save-and-restore
- Store in localStorage initially, prepare for backend integration
- Add save/load UI controls to editor

**Agent Prompt**:

```
Implement blueprint save/restore functionality for the React Flow editor. Use the @atomiton/yaml package for conversion and follow React Flow save/restore patterns. Add save/load UI controls and localStorage persistence. Editor package already has React Flow setup. Follow the mandatory workflow and coordinate with agents as required.
```

#### Step 4a: Individual Node Testing

**Worktree**: `wtnew node-testing-ui`
**Status**: 🟡 **HIGH**

Enable testing individual nodes during editing:

- Add "Test Node" button to selected nodes
- Integrate with @atomiton/conductor package for execution
- Display test results inline
- Handle nodes that can't be tested individually

**Agent Prompt**:

```
Add individual node testing capability to the editor. When a node is selected, provide a "Test Node" button that executes just that node using the @atomiton/conductor execution engine. Display results inline and handle cases where nodes can't run in isolation. The conductor package exists with execution capabilities. Follow the mandatory workflow and coordinate with agents as required.
```

#### Step 4b: Full Blueprint Execution

**Worktree**: `wtnew blueprint-execution`
**Status**: 🟡 **HIGH**

Implement full blueprint execution:

- Add "Run Blueprint" button to editor toolbar
- Execute entire workflow using @atomiton/conductor
- Show real-time execution status on nodes
- Display final results and any errors

**Agent Prompt**:

```
Implement full blueprint execution in the editor. Add a "Run Blueprint" button that executes the entire workflow using @atomiton/conductor, shows real-time status on nodes, and displays results. The conductor package has execution capabilities and the editor has React Flow integration. Follow the mandatory workflow and coordinate with agents as required.
```

#### Step 5: My Scenes Integration

**Worktree**: `wtnew my-scenes-integration`
**Status**: 🟢 **MEDIUM**

Enable saving custom blueprints to My Scenes:

- Create My Scenes page layout (similar to Explore Gallery)
- Save user-created/modified blueprints separately from templates
- Enable loading saved blueprints back into editor
- Add blueprint management (rename, delete, duplicate)

**Agent Prompt**:

```
Create My Scenes functionality for user-created blueprints. Build a page similar to Explore Gallery that shows user-saved blueprints, enables loading them into the editor, and provides management features (rename, delete, duplicate). Integrate with the existing persistence system from Step 3. Follow the mandatory workflow and coordinate with agents as required.
```

### Secondary Priorities (After Blueprint System)

1. **🔴 Node Inspector** - Display/edit node properties in right sidebar (CRITICAL)
2. **🔴 Data Connections** - Enable node-to-node data flow connections
3. **🟢 Visual Feedback** - Show execution status on nodes
4. **🟢 Validation Package** - Extract Zod usage into @atomiton/validation package
5. **🟢 Shared Vite Config** - Create @atomiton/vite-config package to reduce duplication in build configurations
6. **🟢 Standardize Default Exports** - Unify all non-UI packages to use default exports for ES6 class-based APIs (e.g., `import store from '@atomiton/store'` instead of `import { store } from '@atomiton/store'`)
7. **🟢 User Authentication** - Create @atomiton/auth package using Supabase Auth for user accounts and identity management

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

**2. @atomiton/events** ✅ **COMPLETED (Jan 13, 2025)**

```
COMPLETED: Fixed the @atomiton/events package to meet testing requirements:
- ✅ Added smoke tests in src/__tests__/emitter.smoke.test.ts for event system functionality
- ✅ Added benchmarks in src/__benchmarks__/emitter.bench.ts for event dispatching performance
- ✅ All 8 test scripts are functional (not placeholders)
- ✅ Test configuration block already existed in vite.config.ts
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

CRITICAL: Simplify store package - remove unnecessary abstractions
- The current @atomiton/store package is overcomplicated with custom APIs
- Should be simplified to basic Zustand utilities/helpers instead of complex abstraction
- Currently used by blueprint store but should be refactored to direct Zustand usage
- Store package should provide common patterns, not reinvent Zustand's API
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

## 🔗 URL Centralization - apps/client

Create a url.ts file in apps/client/src/constants/ to centralize all important URLs.

### Application Routes

- `/` - Home page with My Scenes gallery
- `/explore` - Explore Gallery with blueprint templates
- `/editor` - Blueprint editor (React Flow canvas)
- `/editor/:id` - Edit specific blueprint by ID

### API Endpoints (Future)

- `/api/blueprints` - Blueprint CRUD operations
- `/api/blueprints/:id` - Individual blueprint operations
- `/api/templates` - Template listing
- `/api/users` - User management

### External URLs

- Documentation: `https://docs.atomiton.com`
- GitHub Issues: `https://github.com/anthropics/claude-code/issues`
- Support: `https://support.atomiton.com`

---

**Last Updated**: 2025-01-15
