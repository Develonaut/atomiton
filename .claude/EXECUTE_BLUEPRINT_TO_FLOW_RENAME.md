# Rename Blueprint to Flow Throughout Monorepo

## Task

Rename all instances of "Blueprint/blueprint" to "Flow/flow" across the entire
Atomiton monorepo. This is a terminology change only - no logic changes.

## Execution Steps

### Step 1: Search and Replace in All Files

Execute these find/replace operations in this exact order across all files
(excluding node_modules, .git, dist, .turbo):

1. **Exact case replacements:**
   - `Blueprint` → `Flow`
   - `Blueprints` → `Flows`
   - `blueprint` → `flow`
   - `blueprints` → `flows`
   - `BLUEPRINT` → `FLOW`
   - `BLUEPRINTS` → `FLOWS`

2. **Compound terms:**
   - `BlueprintStore` → `FlowStore`
   - `BlueprintEngine` → `FlowEngine`
   - `BlueprintExecutor` → `FlowExecutor`
   - `BlueprintValidator` → `FlowValidator`
   - `BlueprintConfig` → `FlowConfig`
   - `BlueprintNode` → `FlowNode`
   - `BlueprintState` → `FlowState`
   - `BlueprintAction` → `FlowAction`
   - `BlueprintTemplate` → `FlowTemplate`
   - `BlueprintGallery` → `FlowGallery`
   - `BlueprintEditor` → `FlowEditor`
   - `BlueprintWorkflow` → `FlowWorkflow`
   - `MyBlueprints` → `MyFlows`
   - `useBlueprintStore` → `useFlowStore`
   - `createBlueprint` → `createFlow`
   - `loadBlueprint` → `loadFlow`
   - `saveBlueprint` → `saveFlow`
   - `executeBlueprint` → `executeFlow`
   - `validateBlueprint` → `validateFlow`
   - `blueprintData` → `flowData`
   - `setBlueprintData` → `setFlowData`
   - `blueprintTemplates` → `flowTemplates`
   - `blueprintId` → `flowId`
   - `blueprintName` → `flowName`
   - `blueprintPath` → `flowPath`
   - `blueprintConfig` → `flowConfig`
   - `blueprintSchema` → `flowSchema`
   - `blueprintToYaml` → `flowToYaml`
   - `yamlToBlueprint` → `yamlToFlow`

### Step 2: Rename Files

Find and rename all files containing "blueprint" in their name:

```bash
# Find all files with blueprint in the name
find . -type f -name "*blueprint*" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/.turbo/*"

# Rename pattern examples:
# blueprint-store.ts → flow-store.ts
# BlueprintEditor.tsx → FlowEditor.tsx
# blueprint.types.ts → flow.types.ts
# blueprint-utils.test.ts → flow-utils.test.ts
# BLUEPRINT_CONSTANTS.ts → FLOW_CONSTANTS.ts
```

### Step 3: Rename Directories

Find and rename all directories containing "blueprint":

```bash
# Find all directories with blueprint in the name
find . -type d -name "*blueprint*" -not -path "*/node_modules/*" -not -path "*/.git/*"

# Rename pattern examples:
# blueprints/ → flows/
# blueprint-templates/ → flow-templates/
# blueprint-examples/ → flow-examples/
```

### Step 4: Update Import Paths

After renaming files and directories, update all import statements that
reference the old paths:

```typescript
// Before
import { Blueprint } from "./blueprints/Blueprint";
import { useBlueprintStore } from "@/stores/blueprint-store";
import { BlueprintEditor } from "../components/BlueprintEditor";

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
- `.env` files (environment variables like `BLUEPRINT_API_URL` → `FLOW_API_URL`)

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
describe('Blueprint validation', () => {
  it('should validate blueprint schema', () => {
    const mockBlueprint = { ... };
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
const message = "Blueprint saved successfully";
const error = "Failed to load blueprint";
const label = "Create new blueprint";

// After
const message = "Flow saved successfully";
const error = "Failed to load flow";
const label = "Create new flow";
```

## Verification

After completing the replacements, run these commands to verify:

```bash
# 1. Search for any remaining instances of "blueprint"
grep -ri "blueprint" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.turbo --exclude="BLUEPRINT_TO_FLOW_MIGRATION.md" --exclude="IMPLEMENT_LEFTHOOK_PERFORMANCE.md" --exclude="REMOVE_LINT_STAGED_KEEP_LEFTHOOK.md" --exclude="FIX_PRECOMMIT_HOOKS.md"

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
   - Case sensitivity (Blueprint vs blueprint vs BLUEPRINT)
   - Partial word matches (ensure "blueprint" in "blueprinted" isn't changed)
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
git commit -m "refactor: rename Blueprint to Flow throughout monorepo

- Renamed all Blueprint references to Flow
- Updated file and directory names
- Updated imports and documentation
- No functional changes, terminology update only"
```

## Success Criteria

- [ ] No instances of "blueprint" remain (except in excluded files)
- [ ] All packages build successfully
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Application runs correctly
- [ ] Documentation is updated
