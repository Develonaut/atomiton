# Next Work Queue - Atomiton Platform

## Overview

This document aggregates upcoming work across the entire monorepo. For detailed plans, see individual NEXT.md files in each package and app.

## Strategic Priorities

### 1. 🎨 UI Framework (Q3 2025)

**Goal**: Beautiful, lightweight component library

- Build core component set
- Implement Brainwave 2.0 aesthetic
- Create compound component patterns
- Full accessibility compliance

[Detailed Plan](./packages/ui/NEXT.md)

### 2. 🎯 Theme System Refactor (Q3 2025)

**Goal**: Framework-agnostic theme package

- Extract from Mantine-specific format
- Create ThemeManager with multiple outputs
- Build integration adapters
- Support runtime theme switching

[Detailed Plan](./packages/theme/NEXT.md)

### 3. 📦 Core Package Decomposition (Q4 2025)

**Goal**: Focused, single-responsibility packages

Breaking `@atomiton/core` into:

- `@atomiton/store` - State management
- `@atomiton/events` - Event system
- `@atomiton/storage` - Storage abstraction
- `@atomiton/execution` - Process execution
- `@atomiton/platform` - Platform detection

[Detailed Plan](./packages/core/NEXT.md)

### 4. 🔌 Node System Enhancement (Q4 2025)

**Goal**: Complete node library for automation

- Build 45+ essential nodes
- Hot reload for development
- Node marketplace infrastructure
- Visual node builder

[Detailed Plan](./packages/nodes/NEXT.md)

### 5. 💉 Dependency Injection (Q4 2025)

**Goal**: Enterprise-grade DI system (like n8n)

- Create `@atomiton/di` package
- Implement decorators with reflect-metadata
- Container system
- Service registration

## Upcoming Milestones

| Milestone         | Target Date   | Description              |
| ----------------- | ------------- | ------------------------ |
| UI Components MVP | Sept 30, 2025 | 15 core components ready |
| Theme System 1.0  | Oct 15, 2025  | Framework-agnostic theme |
| Core Split        | Oct 30, 2025  | Decomposed packages      |
| Node Library Beta | Nov 15, 2025  | 45+ nodes available      |
| Public Alpha      | Dec 1, 2025   | First public release     |

## Ideas Backlog

### Technical Debt

- Resolve all TypeScript errors across packages
- Achieve 80% test coverage
- Performance optimization pass
- Security audit

### Future Features

- Plugin system architecture
- WebAssembly integration
- Real-time collaboration
- AI-powered automations
- Mobile app
- Cloud hosting service

### Developer Experience

- CLI tool for project scaffolding
- VS Code extension
- Component playground
- Interactive documentation

## Resource Allocation

- **UI Team**: 70% on component library, 30% on integration
- **Core Team**: 50% on decomposition, 50% on quality
- **Node Team**: 80% on node creation, 20% on tooling
- **Theme Team**: 100% on refactor

---

**Last Updated**: 2025-09-04
**Next Review**: 2025-09-11
**Planning Horizon**: Q4 2025
