# Existing Packages Integration Plan

## Overview

You have three existing packages (core, nodes, electron) ready to add to the monorepo. This plan outlines how to add them without breaking the current setup, preserving your work while we organize the architecture.

## Current Package Status

### What You Have

- **core**: Brain/API for entire application
- **nodes**: Node library and implementations
- **electron**: Desktop application wrapper

### Integration Approach

**"Add now, wire later"** - Get them in the monorepo for safekeeping without the complexity of full integration.

## Step-by-Step Integration

### Step 1: Add Packages (Immediate)

```bash
# Add your existing packages to the monorepo
cp -r ../your-previous-repo/packages/core packages/
cp -r ../your-previous-repo/packages/nodes packages/
cp -r ../your-previous-repo/packages/electron packages/

# Update root package.json to include them
# Add to "workspaces" array
```

### Step 2: Minimal Setup (Just Build)

```json
// In each package's package.json
{
  "name": "@atomiton/core", // Update naming
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}
```

### Step 3: Fix Build Errors Only

- Don't worry about wiring them to the UI yet
- Just ensure `pnpm install` and `pnpm build` work
- Comment out any breaking imports temporarily

## Package Structure After Addition

```
atomiton/
├── packages/
│   ├── core/           # ✅ Your existing core package
│   ├── nodes/          # ✅ Your existing nodes package
│   ├── electron/       # ✅ Your existing electron package
│   ├── ui/             # Existing UI components
│   ├── theme/          # Existing Dracula theme
│   ├── eslint-config/  # Existing config
│   └── typescript-config/ # Existing config
├── apps/
│   ├── client/         # Current Vite app
│   └── web/            # Current Next.js (to be migrated)
```

## What NOT to Do Yet

1. **Don't wire to UI** - Keep them isolated initially
2. **Don't refactor** - Preserve existing code as-is
3. **Don't add dependencies** - Keep it simple
4. **Don't worry about tests** - Just get building

## Benefits of Adding Now

1. **Preserve work** - Your code is safe in the monorepo
2. **Version control** - Git tracks everything
3. **Reference available** - Can look at existing implementations
4. **No pressure** - Wire them up when ready

## Future Integration Phases

### Phase 1: Assessment (After adding)

- Review existing code structure
- Compare with n8n patterns
- Identify what to keep vs. refactor

### Phase 2: Alignment (Week 2-3)

- Adopt @atomiton namespace if needed
- Implement DI pattern from n8n
- Add streaming capabilities

### Phase 3: Integration (Week 4+)

- Wire core to UI
- Connect nodes to editor
- Integrate electron wrapper

## Quick Add Commands

```bash
# 1. Add packages to monorepo
mkdir -p packages/core packages/nodes packages/electron

# 2. Copy your existing code
# (Replace paths with your actual locations)
cp -r ~/your-previous-atomiton/packages/core/* packages/core/
cp -r ~/your-previous-atomiton/packages/nodes/* packages/nodes/
cp -r ~/your-previous-atomiton/packages/electron/* packages/electron/

# 3. Install dependencies
pnpm install

# 4. Try to build (expect some errors)
pnpm build

# 5. Fix only critical build errors
# Comment out breaking imports
# Add missing dependencies
# Update TypeScript configs

# 6. Commit once building
git add packages/core packages/nodes packages/electron
git commit -m "Add existing packages (not wired up yet)"
```

## Documentation Tasks

Once packages are added, document:

1. What each package currently does
2. Key interfaces and APIs
3. Dependencies and requirements
4. Integration points with UI

## Success Criteria

✅ Packages added to monorepo  
✅ `pnpm install` completes  
✅ `pnpm build` completes (or errors are documented)  
✅ Git tracks all files  
✅ No integration required yet

## Notes

- This is about **preservation**, not perfection
- We'll refactor based on n8n patterns later
- Keep the existing code as reference
- Focus on documentation and planning for now

---

**Created**: January 2, 2025  
**Purpose**: Safe integration of existing packages  
**Status**: Ready to execute
