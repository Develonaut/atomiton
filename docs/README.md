# Atomiton Documentation

Central hub for all project documentation - focused, actionable, and evergreen.

## 📚 Core Documentation

### [Architecture](./architecture/)
**Vision & system design for the Atomiton platform**
- Platform overview and core concepts
- Technology stack (current vs target)
- Package structure and responsibilities
- Implementation roadmap

### [Development](./development/)
**Standards & practices for day-to-day development**
- Development philosophy (DRY, KISS, TDD)
- Code quality pipeline (format → lint → typecheck → build)
- TypeScript standards (no `any` types!)
- Testing strategy (quality over coverage)
- Component patterns and workflow

### [Guidelines](./guidelines/)
**Documentation & development guidelines**
- Documentation standards (explain, don't track)
- Code quality requirements
- Document management and organization
- Agent workflow standards

### [TODO](./TODO.md)
**Living task list - all project tasks and priorities**
- Current sprint priorities
- Implementation roadmap tasks
- Gap tracking between vision and reality
- ⚠️ All task tracking lives here, not in other docs

## 📁 Additional Resources

### Agent System
- [Agents](./../.claude/agents/) - AI agent personas and coordination
- [Execution Plan](./../.claude/agents/coordination/AGENT_EXECUTION_PLAN.md) - Workflow requirements

### Status & Planning
- Status tracking (when needed) goes in `/docs/status/`
- Historical/outdated docs in `*/archive/` folders

## 🎯 Quick Start for Developers

1. **Read first**: [Development Standards](./development/)
2. **Understand vision**: [Architecture](./architecture/)  
3. **Check tasks**: [TODO.md](./TODO.md)
4. **Follow guidelines**: [Documentation Guidelines](./guidelines/)

## 📋 Documentation Principles

✅ **Documents should:**
- Explain concepts and architecture
- Document decisions and rationale
- Remain valid over time
- Focus on the "why" and "how"

❌ **Documents should NOT:**
- Contain task lists or TODOs
- Track progress or status
- Include "currently broken" alerts
- Use temporal language

## 🔄 Maintenance

- **Living documents** - Update as standards evolve
- **Archive outdated** - Move to `archive/` folders
- **Track gaps** - Use TODO.md for vision vs reality
- **Keep evergreen** - Write for long-term validity

---

**Last Updated**: September 1, 2025  
**Maintained by**: Documentation Team  
**Remember**: Tasks go in TODO.md, not in documentation!