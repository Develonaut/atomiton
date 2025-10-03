# Migration Strategy: Replace Custom Event Emitter with eventemitter3

## Context

The conductor package currently implements a custom `ConductorEventEmitter` class (~87 lines) that duplicates functionality already provided by the battle-tested `eventemitter3` library.

## Problem Statement

Our custom event emitter implementation violates core architectural principles:

1. **Reinventing the Wheel**: Writing custom event emitter code when proven libraries exist
2. **Ignoring Standard Tools**: eventemitter3 has 75M weekly npm downloads and is TypeScript-native
3. **Creating Maintenance Burden**: Our implementation lacks features, testing, and optimization
4. **Missing Features**: No `once()`, `off()`, `listenerCount()`, event wildcards, etc.

## Why eventemitter3?

- **Battle-tested**: 75 million weekly npm downloads
- **TypeScript-native**: Excellent type support with mapped types
- **Lightweight**: Only 3KB minified
- **Feature-complete**: All standard EventEmitter methods plus extras
- **Performance**: Optimized with event pooling and fast paths
- **Industry standard**: Used by webpack, socket.io, and major frameworks

## Migration Strategy

### Step 1: Add Dependency

**Package**: `@atomiton/conductor`

```bash
cd packages/@atomiton/conductor
pnpm add eventemitter3
```

**Validation**: Verify in `packages/@atomiton/conductor/package.json`:
```json
{
  "dependencies": {
    "eventemitter3": "^5.0.1"
  }
}
```

### Step 2: Replace Custom Implementation

**File**: `packages/@atomiton/conductor/src/types/events.ts`

**Current State**: Custom `ConductorEventEmitter` class with manual listener management

**Target State**: Extend `EventEmitter` from eventemitter3 with typed event map

```typescript
/**
 * Event types for conductor execution monitoring
 */

import { EventEmitter } from 'eventemitter3';

// Keep all existing event type definitions
export type NodeEvent = {
  nodeId: string;
  timestamp: number;
};

export type NodeStartEvent = NodeEvent & {
  type: 'nodeStart';
  input?: unknown;
};

export type NodeCompleteEvent = NodeEvent & {
  type: 'nodeComplete';
  output?: unknown;
  duration: number;
};

export type NodeErrorEvent = NodeEvent & {
  type: 'nodeError';
  error: Error;
  duration: number;
};

export type NodeSkippedEvent = NodeEvent & {
  type: 'nodeSkipped';
  reason: string;
};

export type ConductorEvent =
  | NodeStartEvent
  | NodeCompleteEvent
  | NodeErrorEvent
  | NodeSkippedEvent;

/**
 * Typed event map for conductor events
 * Maps event names to their handler signatures
 */
export type ConductorEventMap = {
  nodeStart: (event: NodeStartEvent) => void;
  nodeComplete: (event: NodeCompleteEvent) => void;
  nodeError: (event: NodeErrorEvent) => void;
  nodeSkipped: (event: NodeSkippedEvent) => void;
};

/**
 * Typed event emitter for conductor execution events
 *
 * Uses eventemitter3 for battle-tested event handling with TypeScript support.
 * Provides type-safe event emission and listener registration.
 *
 * @example
 * ```typescript
 * const emitter = new ConductorEventEmitter();
 *
 * emitter.on('nodeStart', (event) => {
 *   console.log(`Node ${event.nodeId} started`);
 * });
 *
 * emitter.emit('nodeStart', {
 *   type: 'nodeStart',
 *   nodeId: 'node-1',
 *   timestamp: Date.now()
 * });
 * ```
 */
export class ConductorEventEmitter extends EventEmitter<ConductorEventMap> {}
```

**Changes**:
- Remove ~50 lines of custom listener management code
- Replace with single line extending `EventEmitter<ConductorEventMap>`
- Keep all type definitions (event types, ConductorEvent union)
- Add `ConductorEventMap` type for eventemitter3's generic type
- Update JSDoc to reflect eventemitter3 usage

### Step 3: Verify No Breaking Changes

**Files to Check**:
- `packages/@atomiton/conductor/src/conductor.ts`
- `packages/@atomiton/conductor/src/execution/progressTracker.ts`
- `apps/desktop/src/main/services/channels.ts`

**Expected**: No code changes needed - eventemitter3 API is compatible:
- `on(event, handler)` ✅
- `emit(event, data)` ✅
- `removeAllListeners()` ✅

**Bonus Features Now Available**:
```typescript
// One-time listeners (auto-removed after first call)
conductor.once('nodeComplete', (event) => { /* ... */ });

// Check listener count for debugging
const count = conductor.listenerCount('nodeStart');

// Remove specific listener
conductor.off('nodeStart', specificHandler);
```

### Step 4: Update Tests (if any exist)

**File**: Look for `packages/@atomiton/conductor/src/types/events.test.ts`

**If exists**: Update to test eventemitter3 integration
**If not**: Consider adding basic tests for event emission

### Step 5: Validation

Run validation commands:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Tests
pnpm test

# Build
pnpm build

# Runtime validation
pnpm dev
# Test flow execution and verify events are emitted correctly
```

**Success Criteria**:
- ✅ All type checks pass
- ✅ No lint errors
- ✅ All tests pass
- ✅ Build succeeds
- ✅ Flow execution works with progress tracking
- ✅ Events are emitted and received correctly

## Benefits

### Immediate
1. **Reduced Code**: Remove ~50 lines of custom implementation
2. **Better Types**: Native TypeScript support with mapped types
3. **More Features**: `once()`, `off()`, `listenerCount()`, etc.
4. **Zero Breaking Changes**: API-compatible with existing code

### Long-term
1. **Reduced Maintenance**: No custom event emitter code to maintain
2. **Known Behavior**: Standard EventEmitter API developers already know
3. **Performance**: Optimized event pooling and fast paths
4. **Reliability**: Battle-tested in production across millions of projects

## Risks & Mitigations

### Risk: Bundle Size Increase
**Mitigation**: eventemitter3 is only 3KB minified - negligible impact

### Risk: Breaking API Changes
**Mitigation**: eventemitter3 maintains Node.js EventEmitter compatibility

### Risk: TypeScript Compatibility
**Mitigation**: eventemitter3 is TypeScript-first with excellent type definitions

## Rollback Plan

If issues arise:
1. `pnpm remove eventemitter3` from @atomiton/conductor
2. Restore previous `events.ts` from git history
3. File issue with details for future attempt

## References

- [eventemitter3 npm package](https://www.npmjs.com/package/eventemitter3)
- [eventemitter3 GitHub](https://github.com/primus/eventemitter3)
- [TypeScript Support](https://github.com/primus/eventemitter3#typescript)

---

## Execution Prompt

Copy and paste this prompt to execute the migration:

```
Migrate the conductor package to use eventemitter3 instead of our custom event emitter implementation.

Follow the strategy document at .claude/strategies/MIGRATE_TO_EVENTEMITTER3.md exactly:

1. Add eventemitter3 as a dependency to @atomiton/conductor
2. Replace the custom ConductorEventEmitter implementation in packages/@atomiton/conductor/src/types/events.ts with a class that extends EventEmitter<ConductorEventMap>
3. Keep all existing event type definitions (NodeStartEvent, NodeCompleteEvent, etc.)
4. Add the ConductorEventMap type for eventemitter3's generic type parameter
5. Verify no breaking changes in conductor.ts, progressTracker.ts, or channels.ts
6. Run all validation commands (typecheck, lint, test, build)

DO NOT change any other files unless absolutely necessary for the migration to work.

After completion, confirm:
- eventemitter3 is added to package.json
- Custom event emitter code is removed
- All validation commands pass
- No breaking changes to existing usage
```
