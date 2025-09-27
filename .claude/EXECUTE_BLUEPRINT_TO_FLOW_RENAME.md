# Rename Flow to Flow Throughout Monorepo

## Task

Rename all instances of "Flow/flow" to "Flow/flow" across the entire Atomiton
monorepo. This is a terminology change only - no logic changes.

## Execution Steps

### Step 1: Search and Replace in All Files

Execute these find/replace operations in this exact order across all files
(excluding node_modules, .git, dist, .turbo):

1. **Exact case replacements:**
   - `Flow` → `Flow`
   - `Flows` → `Flows`
   - `flow` → `flow`
   - `flows` → `flows`
   - `FLOW` → `FLOW`
   - `FLOWS` → `FLOWS`

2. **Compound terms:**
   - `FlowStore` → `FlowStore`
   - `FlowEngine` → `FlowEngine`
   - `FlowExecutor` → `FlowExecutor`
   - `FlowValidator` → `FlowValidator`
   - `FlowConfig` → `FlowConfig`
   - `FlowNode` → `FlowNode`
   - `FlowState` → `FlowState`
   - `FlowAction` → `FlowAction`
   - `FlowTemplate` → `FlowTemplate`
   - `FlowGallery` → `FlowGallery`
   - `FlowEditor` → `FlowEditor`
   - `FlowWorkflow` → `FlowWorkflow`
   - `MyFlows` → `MyFlows`
   - `useFlowStore` → `useFlowStore`
   - `createFlow` → `createFlow`
   - `loadFlow` → `loadFlow`
   - `saveFlow` → `saveFlow`
   - `executeFlow` → `executeFlow`
   - `validateFlow` → `validateFlow`
   - `flowData` → `flowData`
   - `setFlowData` → `setFlowData`
   - `flowTemplates` → `flowTemplates`
   - `flowId` → `flowId`
   - `flowName` → `flowName`
   - `flowPath` → `flowPath`
   - `flowConfig` → `flowConfig`
   - `flowSchema` → `flowSchema`
   - `flowToYaml` → `flowToYaml`
   - `yamlToFlow` → `yamlToFlow`

### Step 2: Rename Files

Find and rename all files containing "flow" in their name:

```bash
# Find all files with flow in the name
find . -type f -name "*flow*" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/.turbo/*"

# Rename pattern examples:
# flow-store.ts → flow-store.ts
# FlowEditor.tsx → FlowEditor.tsx
# flow.types.ts → flow.types.ts
# flow-utils.test.ts → flow-utils.test.ts
# FLOW_CONSTANTS.ts → FLOW_CONSTANTS.ts
```

### Step 3: Rename Directories

Find and rename all directories containing "flow":

```bash
# Find all directories with flow in the name
find . -type d -name "*flow*" -not -path "*/node_modules/*" -not -path "*/.git/*"

# Rename pattern examples:
# flows/ → flows/
# flow-templates/ → flow-templates/
# flow-examples/ → flow-examples/
```

### Step 4: Update Import Paths

After renaming files and directories, update all import statements that
reference the old paths:

```typescript
// Before
import { Flow } from "./flows/Flow";
import { useFlowStore } from "@/stores/flow-store";
import { FlowEditor } from "../components/FlowEditor";

// After
import { Flow } from "./flows/Flow";
import { useFlowStore } from "@/stores/flow-store";
import { FlowEditor } from "../components/FlowEditor";
```

### Step 5: Update Configuration Files

Check and update these configuration files:

- `package.json` files (descriptions, scripts)
- `tsconfig.json` files (path mappings)
- `vite.config.ts` files (aliases)
- `.env` files (environment variables like `FLOW_API_URL` → `FLOW_API_URL`)

### Step 6: Update Documentation

Update all markdown files:

- README.md files
- CURRENT.md, NEXT.md, COMPLETED.md
- Files in `/docs` directory
- Any other `.md` files

### Step 7: Update Test Files

Update test descriptions and mock data:

```typescript
// Before
describe('Flow validation', () => {
  it('should validate flow schema', () => {
    const mockFlow = { ... };
  });
});

// After
describe('Flow validation', () => {
  it('should validate flow schema', () => {
    const mockFlow = { ... };
  });
});
```

### Step 8: Update UI Text

Update all user-facing strings:

```typescript
// Before
const message = "Flow saved successfully";
const error = "Failed to load flow";
const label = "Create new flow";

// After
const message = "Flow saved successfully";
const error = "Failed to load flow";
const label = "Create new flow";
```

## Verification

After completing the replacements, run these commands to verify:

```bash
# 1. Search for any remaining instances of "flow"
grep -ri "flow" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.turbo --exclude="FLOW_TO_FLOW_MIGRATION.md" --exclude="IMPLEMENT_LEFTHOOK_PERFORMANCE.md" --exclude="REMOVE_LINT_STAGED_KEEP_LEFTHOOK.md" --exclude="FIX_PRECOMMIT_HOOKS.md"

# 2. Build the project
pnpm build

# 3. Run tests
pnpm test

# 4. Type check
pnpm typecheck

# 5. Lint
pnpm lint
```

## Important Notes

1. **DO NOT CHANGE** any business logic - only rename
2. **EXCLUDE** from changes:
   - node_modules/
   - .git/
   - dist/
   - .turbo/
   - This migration document
   - External package names

3. **BE CAREFUL** with:
   - Case sensitivity (Flow vs flow vs FLOW)
   - Partial word matches (ensure "flow" in "flowed" isn't changed)
   - Context (some instances might be in comments about old versions)

4. **PRESERVE** functionality:
   - All tests should still pass
   - No TypeScript errors
   - Application should work exactly as before

## Expected File Changes

You should see changes in approximately these areas:

- ~/packages/@atomiton/store/ (state management)
- ~/packages/@atomiton/core/ (core engine)
- ~/packages/@atomiton/yaml/ (serialization)
- ~/apps/client/src/ (UI components and routes)
- ~/docs/ (documentation)
- Various test files
- Configuration files

## Commit Message

After all changes are complete and verified:

```bash
git add .
git commit -m "refactor: rename Flow to Flow throughout monorepo

- Renamed all Flow references to Flow
- Updated file and directory names
- Updated imports and documentation
- No functional changes, terminology update only"
```

## Success Criteria

- [ ] No instances of "flow" remain (except in excluded files)
- [ ] All packages build successfully
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Application runs correctly
- [ ] Documentation is updated
