# Claude Agent Instructions - Atomiton Project

- Always instruct agents to review the AGENT_EXECUTION_PLAN.md before starting a task. An agent should verbally confirm they have reviewed the AGENT_EXECUTION_PLAN.md before they are allowed to start.

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

### Migration Strategies

- [Next.js to Vite Migration](../docs/strategies/nextjs-to-vite-migration.md)
- [Tailwind to Mantine Migration](../docs/strategies/tailwind-to-mantine-migration.md)

## ✅ Permissions

This project has comprehensive permissions configured in `.claude/settings.local.json`:

- Full read/write access to all project files
- All common development tools and commands pre-approved
- Web search and documentation fetch enabled

## 📦 Workspace Structure

Each package/app has its own `.claude/CLAUDE.md` that references this root configuration:

- `packages/ui/.claude/CLAUDE.md` - UI components and Blueprint editor
- `packages/core/.claude/CLAUDE.md` - Core Blueprint engine
- `packages/nodes/.claude/CLAUDE.md` - Node implementations
- `packages/theme/.claude/CLAUDE.md` - Dracula theme
- `packages/electron/.claude/CLAUDE.md` - Desktop app
- `packages/playwright/.claude/CLAUDE.md` - E2E tests
- `apps/client/.claude/CLAUDE.md` - Main Vite application

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

**Last Updated**: 2025-08-31
**Documentation Root**: `./docs/` (relative to project root)