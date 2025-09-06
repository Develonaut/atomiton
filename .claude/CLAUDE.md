# Claude and Claude Agent Instructions - Atomiton Project

## 🚨 MANDATORY WORKFLOW - READ FIRST 🚨

**See [Workflow Documentation](./workflow/README.md) for ALL requirements.**

**Key Requirements:**

1. Follow [MANDATORY_CHECKLIST.md](./workflow/MANDATORY_CHECKLIST.md) before ANY work
2. Complete ALL steps in [EXECUTION_PLAN.md](./workflow/EXECUTION_PLAN.md)
3. ONLY create worktrees for NEW features/efforts (not when assisting)
4. Use TodoWrite to track workflow progress

**YOU CANNOT PROCEED WITHOUT FOLLOWING THE WORKFLOW.**

### When Invoking Agents

See [AGENT_INVOCATION.md](./workflow/AGENT_INVOCATION.md) for how to properly invoke agents with workflow compliance.

### Workflow Enforcement

The execution plan is NOT optional. It applies to:

- Claude (you) directly
- ALL agents invoked via Task tool
- ANY code changes or implementations

Work that doesn't follow this workflow will be rejected. No exceptions.

## 🎯 Project Overview

Atomiton is a Blueprint automation platform that enables visual workflow creation through a node-based editor. The project uses a monorepo structure with separate UI and API packages.

## 📁 Documentation Structure

Project documentation is split between Claude-specific config and general docs:

```
atomiton/                       # Project root
├── .claude/                    # Claude-specific configuration
│   ├── CLAUDE.md              # This file - main entry point
│   ├── settings.local.json    # Permissions and settings
│   └── agents/                # Agent personas (Claude-specific)
├── docs/                       # General project documentation
│   ├── TODO.md                # Centralized TODO list
│   ├── guidelines/            # Document management & archiving
│   ├── development/           # Code quality & standards
│   ├── architecture/          # System architecture docs
│   ├── deployment/            # Production & operations
│   ├── planning/              # Project planning docs
│   ├── status/                # Project status and tracking
│   ├── ui/                    # UI design and components
│   └── reports/              # Analysis reports
└── [workspace directories]
```

## 🚀 Quick Start for Agents

### 🚨 MANDATORY FOR ALL AGENTS

- **BEFORE ANY WORK**: [Code Quality Requirements](../docs/development/README.md) - ALL agents MUST run format/lint/typecheck/build before completing work
- **Agent workflows**: [Agents Overview](./agents/README.md) - Team coordination and specific requirements
- **Guidelines**: [Guidelines Index](../docs/guidelines/README.md) - Environment restrictions and development standards

## 🔗 Essential Documentation Links

### Agent Management

- [Agent Team Overview](./agents/README.md)
- [Agent Execution Plan](./agents/coordination/AGENT_EXECUTION_PLAN.md)
- [Agent Personas](./agents/personas/AGENT_PERSONAS.md)

### Development Guidelines

- [Development Overview](../docs/development/README.md)
- [Development Process](../docs/development/archive/PROCESS.md)
- [Core Values](../docs/development/archive/CORE_VALUES.md)
- [TypeScript Guidelines](../docs/development/archive/TYPESCRIPT.md)
- [Testing Strategy](../docs/development/archive/TESTING.md)

### Technical Architecture

- [Architecture Overview](../docs/architecture/README.md)
- [Project Architecture](../docs/architecture/archive/SYSTEM.md)
- [Technical Stack](../docs/architecture/archive/STACK.md)
- [Navigation Structure](../docs/architecture/archive/NAVIGATION.md)
- [Node System Integration](../docs/architecture/archive/INTEGRATION.md)
- [Blueprint Guide](../docs/architecture/archive/BLUEPRINT_GUIDE.md)

### Migration Documentation

Migration plans are documented in package-specific ROADMAP files:

- UI Migration: `/packages/ui/ROADMAP.md`
- Core Migration: `/packages/core/ROADMAP.md`

## ✅ Permissions

This project has comprehensive permissions configured in `.claude/settings.local.json`:

- Full read/write access to all project files
- All common development tools and commands pre-approved
- Web search and documentation fetch enabled

## 📦 Workspace Structure

Packages are organized under `packages/@atomiton/`:

- `packages/@atomiton/ui` - UI components and design system
- `packages/@atomiton/core` - Core Blueprint engine
- `packages/@atomiton/nodes` - Node implementations
- `packages/@atomiton/store` - State management
- `packages/@atomiton/events` - Event system
- `packages/@atomiton/di` - Dependency injection
- `apps/client` - Main Vite React application
- `apps/desktop` - Electron desktop wrapper

## 🔄 Important Notes

1. **Single Source of Truth**: This file is the main entry point. All workspace CLAUDE.md files reference back here.
2. **Documentation Location**: All documentation lives in `/docs/` to avoid .claude nesting issues
3. **Permission Inheritance**: Permissions granted at root level apply to all subdirectories
4. **No Permission Prompts**: With the comprehensive settings.local.json, agents should never need to ask for file access

## 📝 Core Development Values

- Never add comments unless explicitly requested
- Prefer editing existing files over creating new ones
- Never create documentation files unless explicitly requested
- Follow existing code conventions and patterns
- Run format/lint/typecheck/build before completing work
- Log progress to `.claude/LOG.md` (1 line per milestone)

---

**Last Updated**: 2025-09-06
**Documentation Root**: `./docs/` (relative to project root)
