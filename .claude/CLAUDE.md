# Claude Configuration & Documentation Guide

## Purpose

This `.claude/` directory contains the authoritative documentation and
configuration for the Atomiton project architecture, specifically designed for
Claude Code agents to execute tasks consistently and correctly.

## Documentation Structure

### 📚 Core Architecture Documents

#### [ARCHITECTURE.md](./ARCHITECTURE.md)

**The comprehensive architecture reference**

- Core principles and domain model
- Package ownership and boundaries
- Type definitions and ownership matrix
- Node lifecycle and execution flow
- Storage format and versioning strategy

#### [POST_MIGRATION_CLEANUP_STRATEGY.md](./POST_MIGRATION_CLEANUP_STRATEGY.md)

**Step-by-step migration guide**

- Ordered steps that MUST be executed sequentially
- Specific code prompts for each step
- Validation commands and success criteria
- Common pitfalls to avoid

### 🤖 Agent Configuration

#### [agents/](./agents/)

Individual Claude Code agent personas and their specializations:

- Domain-specific expertise
- Task assignments
- Behavioral guidelines

#### [workflow/](./workflow/)

Multi-agent workflow templates and execution plans:

- Task orchestration
- Agent collaboration patterns
- Validation checklists

---

## Quick Architecture Reference

### Core Decisions

1. **Everything is a NodeDefinition** - The universal type
2. **No @atomiton/flow package** - Flow is just a user concept
3. **@atomiton/nodes is the foundation** - Pure structure, zero dependencies
4. **@atomiton/conductor owns execution** - All execution types and logic
5. **@atomiton/rpc is pure transport** - Just message passing
6. **Client uses Conductor** - Never touches RPC directly
7. **No unnecessary abstractions** - Just check `node.nodes` for groups
8. **Use existing utilities** - createNodeDefinition already exists
9. **Simple API** - Just execute(node) from conductor

### The Entire API

```typescript
// Creating nodes
import { createNodeDefinition } from '@atomiton/nodes';

const node = createNodeDefinition({
  type: 'group',
  nodes: [...]
});

// Executing nodes
import { execute } from '#lib/conductor';

const result = await execute(node);
```

That's it - two functions!

### Package Dependency Rules

```
Foundation (no dependencies):
└── @atomiton/nodes

Depends on nodes only:
├── @atomiton/conductor
├── @atomiton/storage
└── @atomiton/editor

Transport layer (types only):
└── @atomiton/rpc → nodes, conductor

Applications:
├── client → conductor (never RPC directly)
└── desktop → conductor, rpc
```

### Type Import Guide

```typescript
// Creating nodes (use existing utility)
import { NodeDefinition, createNodeDefinition } from "@atomiton/nodes";

// Executing nodes (simple API)
import { execute } from "#lib/conductor";

// Storage (user concept of "flow")
import { saveFlowFile, loadFlowFile } from "@atomiton/storage";

// Visual transformation
import { nodeToReactFlow, reactFlowToNode } from "@atomiton/editor";

// Never import RPC directly in client!
// ❌ import { rpc } from '@atomiton/rpc';
// ✅ import { execute } from '#lib/conductor';
```

---

## For Claude Code Agents

### When Implementing Changes

1. **Read POST_MIGRATION_CLEANUP_STRATEGY.md first** - Follow steps IN ORDER
2. **Reference ARCHITECTURE.md** - For domain boundaries and type ownership
3. **Validate after each step** - Run the provided commands
4. **Never skip steps** - Later steps depend on earlier ones

### Key Rules

#### ✅ DO

- Use existing utilities (createNodeDefinition)
- Use simple execute(node) API
- Check `node.nodes` to see if it's a group
- Keep @atomiton/nodes pure (no execution)
- Put ALL execution types in @atomiton/conductor
- Make RPC dumb transport only
- Use "Flow" only in UI and file names
- Execute migration steps sequentially

#### ❌ DON'T

- Create new utilities when we have existing ones
- Add execution types to @atomiton/nodes
- Create a Flow type (use NodeDefinition)
- Create isAtomic/isComposite abstractions
- Move utilities "just in case" (YAGNI)
- Import RPC directly in client code
- Put business logic in RPC
- Skip validation steps

### Validation Commands

```bash
# Check architecture is correct
pnpm why @atomiton/flow         # Should fail
pnpm dlx madge --circular       # No circles
pnpm tsc --noEmit               # No type errors

# Build and test
pnpm build                      # Should succeed
pnpm test                       # All pass
pnpm dev                        # App works
```

---

## Document History

### Active Documents

- `ARCHITECTURE.md` - Consolidated architecture guide (current)
- `POST_MIGRATION_CLEANUP_STRATEGY.md` - Migration steps (current)
- `CLAUDE.md` - This file
- `agents/*` - Agent configurations
- `workflow/*` - Workflow templates

### Deprecated/Consolidated Documents

These have been merged into ARCHITECTURE.md:

- ~~DOMAIN_OWNERSHIP_SUMMARY.md~~
- ~~DOMAIN_TYPES_INTERACTIONS.md~~
- ~~FLOW_LIFECYCLE.md~~
- ~~FLOWS_VS_NODES_ARCHITECTURE.md~~
- ~~VERSIONING_STRATEGY.md~~
- ~~ARCHITECTURE_OVERVIEW.md~~
- ~~PACKAGE_DOMAIN_OWNERSHIP.md~~
- ~~POST_MIGRATION_ANALYSIS.md~~

---

## Common Questions

### Q: What's the API for creating and executing nodes?

A: Just two functions:

```typescript
import { createNodeDefinition } from '@atomiton/nodes';
import { execute } from '#lib/conductor';

const node = createNodeDefinition({ type: 'group', nodes: [...] });
const result = await execute(node);
```

### Q: Where is the Flow type defined?

A: There is no Flow type. "Flow" is just what users call a saved NodeDefinition
with child nodes.

### Q: Do we need isAtomic/isComposite utilities?

A: No. Just check `if (node.nodes && node.nodes.length > 0)` to see if it's a
group.

### Q: Which package owns ExecutionContext?

A: @atomiton/conductor owns ALL execution types.

### Q: Can the client import from @atomiton/rpc?

A: No. Client uses Conductor which internally uses RPC as transport when needed.

### Q: Where do I import NodeDefinition from?

A: Always from '@atomiton/nodes' - it's the foundation type.

### Q: What happened to @atomiton/flow package?

A: It's being removed completely. We don't need its utilities - we already have
what we need.
