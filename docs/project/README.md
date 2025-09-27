# Atomiton Project Overview

**Open Source Visual Automation Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-blue)](https://www.typescriptlang.org/)
[![Powered by React](https://img.shields.io/badge/Powered%20by-React-61dafb)](https://reactjs.org/)

## 🎯 What is Atomiton?

Atomiton is a desktop-first, AI-native automation platform that transforms
complex workflows into visual Flows. Think of it as n8n's simpler, faster, more
modern cousin - built for individual creators and small teams who want powerful
automation without enterprise complexity.

### Our Mission

> Transform complex workflows into visual Flows that anyone can create, with AI
> assistance at every step, running entirely on your machine with zero
> infrastructure costs.

## 🚀 Why Atomiton?

### The Problem

- **n8n** is powerful but complex (500+ nodes, enterprise-focused, heavy
  infrastructure)
- **Zapier/Make** are expensive and cloud-dependent
- **Writing scripts** requires coding knowledge and maintenance
- **AI tools** are disconnected from automation workflows

### Our Solution

- **Desktop-first**: Runs on your machine, full file system access, no CORS
  issues
- **AI-native**: Built for LLMs from day one, not retrofitted
- **Simple**: 20-50 essential nodes that cover 90% of use cases
- **Fast**: 10-30x faster than n8n through streaming architecture
- **Free**: Core platform free forever, no infrastructure costs

## 🏗️ Project Status

**Current Phase**: Foundation (Alpha) - Building core systems

### What Works Now

- ✅ Monorepo structure with pnpm workspaces
- ✅ React Flow visual editor
- ✅ Dracula theme system
- ✅ TypeScript strict mode
- ✅ Quality pipeline (linting, formatting)

### Coming Soon (Q1 2025)

- 🚧 Execution engine with streaming
- 🚧 10-15 essential nodes
- 🚧 Electron desktop app
- 🚧 AI workflow assistance
- 🚧 Flow file format (.atom files)

## 💡 Key Differentiators

### vs n8n

| Feature     | n8n                       | Atomiton                 |
| ----------- | ------------------------- | ------------------------ |
| Nodes       | 500+ (overwhelming)       | 20-50 (essential)        |
| Performance | Memory-heavy, slow        | Streaming, 10-30x faster |
| Setup       | Docker, database, complex | Download and run         |
| Target      | IT departments            | Individual creators      |
| AI Support  | Retrofitted               | Native from day one      |

### Unique Advantages

1. **Zero Infrastructure**: Everything runs locally, no cloud costs
2. **Modern Stack**: Vite, React 18, Mantine UI (not webpack legacy)
3. **Desktop Power**: Full file system access, OS integration
4. **AI-First**: Natural language to workflow, smart debugging
5. **Developer Friendly**: YAML Flows, Git-friendly, hot reload

## 🛠️ Tech Stack

### Core Technologies

- **Frontend**: React 18 + Vite + Mantine UI
- **Desktop**: Electron with native OS features
- **Language**: TypeScript (strict mode)
- **Styling**: Mantine components + Dracula theme
- **Build**: Turborepo + pnpm workspaces
- **Storage**: SQLite (local, zero setup)
- **Hosting**: Cloudflare Pages (free tier)

### Architecture Highlights

- **Monorepo** with `@atomiton/*` namespace
- **Streaming execution** (process GB files without memory issues)
- **WebAssembly** for compute-intensive nodes
- **Plugin system** (coming in Phase 3)

## 📦 Project Structure

```
atomiton/
├── apps/
│   └── client/          # Main Vite application
├── packages/
│   ├── ui/             # React components & Flow editor
│   ├── core/           # Workflow engine
│   ├── nodes/          # Node implementations
│   ├── theme/          # Dracula theme system
│   ├── electron/       # Desktop app wrapper
│   └── playwright/     # E2E testing
└── docs/
    └── project/        # Project documentation (you are here)
```

## 🗺️ Roadmap

### Phase 1: Foundation (Q1 2025)

- Core execution engine
- 10-15 essential nodes
- Desktop app (Mac/Windows/Linux)
- Basic AI integration

### Phase 2: Differentiation (Q2 2025)

- Streaming architecture (10-30x faster than n8n)
- AI workflow building
- Visual debugging
- 20-30 high-quality nodes

### Phase 3: Growth (Q3-Q4 2025)

- Flow marketplace
- Plugin system
- Community features
- Sustainable monetization

[Full Roadmap →](./ROADMAP.md)

## 🤝 Contributing

We're building in public and welcome contributions! As a learning project, we're
open to experimentation and new ideas.

### How to Contribute

1. **Report bugs** or suggest features via GitHub Issues
2. **Build nodes** - easiest way to start contributing
3. **Improve docs** - help others understand the project
4. **Share Flows** - build cool automations

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/atomiton.git

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test
```

### Code Quality Standards

- TypeScript strict mode required
- Format/lint/typecheck before committing
- No comments unless explicitly needed
- Follow existing patterns

[Development Guidelines →](../README.md)

## 💰 Sustainability Model

### Free Forever

- Core workflow engine
- Desktop application
- 20-30 essential nodes
- Community marketplace
- Basic AI (you provide API keys)

### Future Pro Features (After 100+ users)

- Advanced AI features
- Priority support
- Custom node development
- Team collaboration
- Cloud backup (optional)

**Principle**: Stay free for individuals, charge only for advanced/team features

## 🎯 Target Users

### Primary: Individual Creators

- Developers automating personal workflows
- Content creators managing multi-platform publishing
- Researchers processing data pipelines
- Students learning automation

### Secondary: Small Teams

- Startups needing simple automation
- Small businesses without IT departments
- Open source projects
- Educational institutions

### NOT For (By Design)

- Large enterprises (use n8n)
- Complex orchestration (use Airflow)
- Real-time streaming (use Kafka)
- We optimize for simplicity, not scale

## 📊 Success Metrics

### Phase 1 (3 months)

- ✅ Personal dogfooding: "I use it daily"
- ✅ Working MVP
- ✅ < 5 second workflow execution
- ✅ < 100ms UI response

### Phase 2 (6 months)

- ✅ 10+ weekly active users
- ✅ First external contributor
- ✅ 10x performance vs n8n proven

### Phase 3 (12 months)

- ✅ 100+ active users
- ✅ 50+ community Flows
- ✅ Sustainable revenue model
- ✅ Mentioned in "n8n alternatives"

## 🌟 Philosophy

### Core Values

1. **Simplicity over features** - 20 great nodes > 500 mediocre ones
2. **Performance matters** - Stream don't buffer, async everything
3. **Desktop-first** - Leverage user's machine fully
4. **AI-native** - Not an afterthought but core design
5. **Open source** - Transparent development, community-driven

### What We're NOT

- Not enterprise software
- Not cloud-dependent
- Not feature-complete
- Not venture-backed
- Not trying to be everything

## 📬 Contact & Community

- **GitHub**:
  [github.com/yourusername/atomiton](https://github.com/yourusername/atomiton)
- **Discord**: Coming soon (after 10 users)
- **Website**: [atomiton.com](https://atomiton.com) (coming soon)
- **Author**: Ryan (solo developer, learning project)

## 📄 License

MIT License - Use it, modify it, learn from it!

---

**Status**: 🚧 Active Development (Alpha)  
**Started**: January 2025  
**Public Launch**: Q2 2025 (estimated)  
**Current Focus**: Building execution engine and core nodes

_Built with ❤️ by a solo developer who thinks automation should be simple, fast,
and free._
