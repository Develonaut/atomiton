# Architecture Documentation Structure

## Current Documentation

This folder contains the authoritative documentation for the Atomiton architecture.

### Core Documents

#### 📋 [ARCHITECTURE.md](./ARCHITECTURE.md)
The comprehensive architecture guide covering:
- Core architecture principles
- Domain ownership and boundaries
- Package responsibilities
- Type ownership matrix
- Node lifecycle
- Conductor & IPC interaction
- File format & storage
- Versioning strategy

#### 🚀 [POST_MIGRATION_CLEANUP_STRATEGY.md](./POST_MIGRATION_CLEANUP_STRATEGY.md)
Step-by-step migration guide for Claude Code agents:
- Ordered steps that must be executed sequentially
- Specific code prompts for each step
- Validation commands
- Success criteria

### Deprecated Documents

The following documents have been consolidated into ARCHITECTURE.md:
- ~~DOMAIN_OWNERSHIP_SUMMARY.md~~ → See "Domain Ownership" in ARCHITECTURE.md
- ~~DOMAIN_TYPES_INTERACTIONS.md~~ → See "Type Ownership Matrix" in ARCHITECTURE.md
- ~~FLOW_LIFECYCLE.md~~ → See "Node Lifecycle" in ARCHITECTURE.md
- ~~FLOWS_VS_NODES_ARCHITECTURE.md~~ → See "Foundation Principle" in ARCHITECTURE.md
- ~~VERSIONING_STRATEGY.md~~ → See "Versioning Strategy" in ARCHITECTURE.md

### Agent Configuration

#### 📁 [agents/](./agents/)
Individual agent persona definitions and instructions.

#### 📁 [workflow/](./workflow/)
Workflow templates and execution plans for multi-agent tasks.

---

## Quick Reference

### Key Architectural Decisions

1. **Everything is a NodeDefinition** - No separate Flow type
2. **@atomiton/flow package removed** - Flow is just a user concept
3. **@atomiton/nodes is the foundation** - Zero dependencies, pure structure
4. **@atomiton/conductor owns execution** - All execution types and logic
5. **@atomiton/rpc is pure transport** - No business logic
6. **Client uses Conductor** - Never touches RPC directly

### Package Import Guide

```typescript
// Structure types
import { NodeDefinition, NodePort, NodeEdge } from '@atomiton/nodes';
import { isComposite, isAtomic, createNode } from '@atomiton/nodes';

// Execution types
import { ExecutionContext, ExecutionResult } from '@atomiton/conductor';
import { createConductor, ConductorTransport } from '@atomiton/conductor';

// Storage operations
import { saveFlowFile, loadFlowFile } from '@atomiton/storage';
import type { FlowFile } from '@atomiton/storage';

// Editor transformations
import { nodeToReactFlow, reactFlowToNode } from '@atomiton/editor';

// RPC (only in transport implementations)
import type { RPCRequest, RPCResponse } from '@atomiton/rpc';
```

### Common Commands

```bash
# Validate architecture
pnpm why @atomiton/flow         # Should fail (package doesn't exist)
pnpm dlx madge --circular       # Check for circular dependencies

# Build and test
pnpm build                      # Build all packages
pnpm test                       # Run tests
pnpm dev                        # Start development server

# Type checking
pnpm tsc --noEmit              # Type check without emitting
```

---

## For Claude Code Agents

When implementing changes, refer to:

1. **[POST_MIGRATION_CLEANUP_STRATEGY.md](./POST_MIGRATION_CLEANUP_STRATEGY.md)** - For step-by-step migration
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - For domain boundaries and type ownership

Remember:
- Execute steps IN ORDER
- Validate after each step
- Keep domains separate
- No circular dependencies
