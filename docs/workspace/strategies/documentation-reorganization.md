# Documentation Reorganization Plan

## Executive Summary

Based on the n8n analysis and review of existing documentation, here's a proposed reorganization that emphasizes architectural domains while keeping it manageable for a solo developer.

## Key Insights from n8n Analysis

### What n8n Does Well

- **Clear package boundaries** with @n8n namespace pattern
- **Separation of concerns** between workflow, execution, and nodes
- **Modular architecture** that's extensible without modifying core
- **Strong TypeScript interfaces** defining contracts between domains

### What We Should Do Better

- **Simpler documentation** focused on building, not theory
- **Domain-driven structure** that maps to actual code packages
- **Action-oriented guides** over conceptual explanations
- **Living documentation** that evolves with the codebase

## Proposed Documentation Structure

```
docs/
├── README.md                    # Quick start & project overview
├── CONTRIBUTING.md              # How to contribute
├── ARCHITECTURE.md              # High-level architecture (1-2 pages max)
│
├── domains/                     # Core architectural domains (mirrors packages)
│   ├── README.md               # Domain overview & relationships
│   ├── core/                   # @atomiton/core domain
│   │   ├── README.md          # Core abstractions & interfaces
│   │   ├── types.md           # Type definitions & contracts
│   │   └── patterns.md        # DI, service locator patterns
│   ├── workflow/               # @atomiton/workflow domain
│   │   ├── README.md          # Execution engine overview
│   │   ├── streaming.md       # Streaming architecture (our advantage)
│   │   └── state.md           # State management patterns
│   ├── nodes/                  # @atomiton/nodes domain
│   │   ├── README.md          # Node system architecture
│   │   ├── creating-nodes.md  # How to build custom nodes
│   │   └── catalog.md         # Built-in node reference
│   ├── editor/                 # @atomiton/editor domain
│   │   ├── README.md          # Visual editor architecture
│   │   ├── react-flow.md      # React Flow integration
│   │   └── canvas.md          # Canvas & interaction patterns
│   └── runtime/                # @atomiton/runtime domain
│       ├── README.md          # Execution runtime
│       ├── sandbox.md         # Security & isolation
│       └── workers.md         # Worker threads & parallelization
│
├── guides/                      # Practical, task-oriented guides
│   ├── getting-started.md     # 5-minute quickstart
│   ├── first-blueprint.md     # Build your first automation
│   ├── desktop-setup.md       # Electron app setup
│   ├── node-development.md    # Creating custom nodes
│   └── performance.md         # Performance optimization
│
├── reference/                   # API & configuration reference
│   ├── api/                   # API documentation
│   ├── config/                # Configuration options
│   └── cli/                   # CLI commands
│
├── decisions/                   # Architecture Decision Records (ADRs)
│   ├── README.md              # Index of decisions
│   ├── 001-monorepo.md        # Why monorepo with pnpm
│   ├── 002-vite-over-nextjs.md # Why Vite instead of Next.js
│   ├── 003-streaming.md       # Why streaming architecture
│   └── 004-desktop-first.md   # Why desktop-first approach
│
├── research/                    # Research & analysis (existing)
│   ├── n8n-analysis.md        # n8n architecture analysis
│   └── competitor-analysis.md  # Market research
│
└── project/                     # Project management (simplified)
    ├── ROADMAP.md              # Development roadmap
    ├── TODO.md                 # Current tasks
    └── CHANGELOG.md            # Release history
```

## Domain Descriptions

### Core Domain (@atomiton/core)

**Purpose**: Foundation layer providing types, interfaces, and shared utilities  
**Key Concepts**: Dependency injection, service patterns, event system  
**Dependencies**: None (foundation layer)

### Workflow Domain (@atomiton/workflow)

**Purpose**: Blueprint definition and workflow orchestration  
**Key Concepts**: DAG execution, connection validation, state management  
**Dependencies**: Core

### Nodes Domain (@atomiton/nodes)

**Purpose**: Extensible node system and built-in implementations  
**Key Concepts**: Node registry, plugin architecture, type safety  
**Dependencies**: Core, Workflow

### Editor Domain (@atomiton/editor)

**Purpose**: Visual Blueprint editor and canvas interactions  
**Key Concepts**: React Flow integration, drag-and-drop, property panels  
**Dependencies**: Core, Workflow, Nodes

### Runtime Domain (@atomiton/runtime)

**Purpose**: Sandboxed execution environment and job processing  
**Key Concepts**: Worker threads, streaming data, resource limits  
**Dependencies**: Core, Workflow, Nodes

## Migration Plan

### Phase 1: Structure Creation (Immediate)

1. Create new `domains/` directory structure
2. Create README.md for each domain with:
   - Purpose statement
   - Key interfaces/types
   - Dependencies
   - Example usage

### Phase 2: Content Migration (Week 1)

1. Extract relevant content from existing docs to domain-specific docs
2. Move architecture details from `/architecture/` to `/domains/`
3. Consolidate development guidelines into domain patterns
4. Archive redundant/outdated docs

### Phase 3: Simplification (Week 2)

1. Remove conceptual documentation without practical value
2. Combine overlapping documents
3. Ensure each doc has clear action items
4. Add code examples to every domain doc

### Phase 4: Validation (Ongoing)

1. Test documentation by building a feature end-to-end
2. Get feedback from contributors (when they arrive)
3. Update based on actual development needs
4. Keep docs in sync with code

## Documentation Principles

### 1. Domain-Driven

- Documentation structure mirrors package structure
- Each domain is self-contained with clear boundaries
- Dependencies explicitly documented

### 2. Action-Oriented

- Every doc should answer "How do I...?"
- Include code examples, not just theory
- Link to actual implementation files

### 3. DRY (Don't Repeat Yourself)

- Single source of truth for each concept
- Cross-reference instead of duplicating
- Archive outdated versions

### 4. Incremental

- Start with essential domains (core, workflow, nodes)
- Add detail as implementation progresses
- Don't over-document unbuilt features

### 5. Measurable

- Each domain doc should be < 5 pages
- Setup guides should work in < 5 minutes
- API docs auto-generated where possible

## What Gets Removed/Archived

### Archive (move to /archive subdirectories)

- Detailed implementation plans for unbuilt features
- Conceptual documents without practical application
- Multiple versions of the same information
- Task tracking in documentation (use TODO.md only)

### Consolidate

- Merge overlapping architecture docs into domain docs
- Combine multiple strategy docs into decision records
- Unify development guidelines into domain patterns

### Remove

- Empty placeholder files
- Outdated migration strategies (once complete)
- Speculative features not in roadmap

## Success Metrics

1. **Developer Onboarding**: New contributor can understand architecture in < 30 minutes
2. **Feature Development**: Can implement new node type using only docs in < 1 hour
3. **Maintenance**: Documentation updates take < 10% of feature development time
4. **Clarity**: No more than 3 levels of nesting in docs structure
5. **Currency**: All code examples compile and run

## Next Steps

1. **Create domain structure** with empty READMEs
2. **Document Core domain** first (it's the foundation)
3. **Extract interfaces** from n8n analysis into domain docs
4. **Write first ADR** explaining monorepo decision
5. **Test with real task**: Create a simple node following only docs

## Notes for Solo Developer

- **Don't over-document**: Write docs when you'd forget how something works
- **Code is truth**: When in doubt, read the code, not the docs
- **Iterate quickly**: Perfect documentation is the enemy of shipping
- **Learn from n8n**: Their architecture is good, their docs are overwhelming
- **AI-friendly**: Structure docs so AI assistants can navigate easily

---

**Created**: January 2, 2025  
**Status**: Proposal for documentation reorganization  
**Next Review**: After implementing first domain package
