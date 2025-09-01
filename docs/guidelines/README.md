# Documentation & Development Guidelines

## Purpose

Clear, concise guidelines for maintaining documentation and development standards across the Atomiton project.

## Documentation Standards

### Core Principle: Documents Explain, They Don't Track

**Documents should contain:**

- ✅ Concepts and architecture
- ✅ How things work and why
- ✅ Design decisions and rationale
- ✅ API references and examples
- ✅ Development philosophy

**Documents should NOT contain:**

- ❌ Task lists or TODOs (use `/docs/TODO.md`)
- ❌ Working checklists or progress tracking
- ❌ Status updates or "currently broken" alerts
- ❌ Temporal language ("now", "currently", "at this time")
- ❌ Implementation status or bug reports

### Writing Guidelines

1. **Keep it evergreen** - Write documentation that remains valid over time
2. **Vision over reality** - Document the design, track gaps in TODO.md
3. **Clear structure** - Use hierarchical headings and tables of contents
4. **Simple language** - Avoid unnecessary jargon
5. **Archive don't delete** - Move outdated docs to archive folders

## Development Standards

### Mandatory Code Quality Checks

**Before ANY code is considered complete:**

```bash
# Run in this order - ALL must pass with exit code 0
npm run format:fix     # Auto-format code
npm run lint:fix       # Auto-fix linting issues
npm run lint           # Verify no errors remain (warnings acceptable)
npm run typecheck      # TypeScript compilation check
npm run build          # Successful build
```

### Pre-Commit Hook Compliance

- ✅ **REQUIRED**: All commits must pass pre-commit hooks
- ❌ **FORBIDDEN**: Using `--no-verify` without explicit permission
- ✅ **FIX**: Address the underlying issues, don't bypass checks

### TypeScript Standards

- **NO** `@ts-ignore` or `@ts-expect-error` without permission
- **NO** `eslint-disable` comments without permission
- **NO** type casting (`as Type`) without permission
- **NO** `any` types - always use concrete types
- **ALWAYS** fix the root cause of type errors
- **NEVER** use inline `require()` statements
- **USE** `unknown` instead of `any` when type is truly unknown, then narrow it

## Document Management

### Where Things Belong

| Content Type           | Location                                 |
| ---------------------- | ---------------------------------------- |
| Tasks & TODOs          | `/docs/TODO.md`                          |
| Architecture & Design  | `/docs/architecture/README.md`           |
| Development Process    | `/docs/development/`                     |
| Guidelines & Standards | `/docs/guidelines/README.md` (this file) |
| Migration Strategies   | `/docs/strategies/`                      |
| Temporary Status       | `/docs/status/`                          |
| Historical/Outdated    | `*/archive/` folders                     |

### Document Categories

- **Architecture** - System design, technology choices, component structure
- **Development** - Process, standards, testing strategies
- **Guidelines** - Best practices, team agreements (this document)
- **Strategies** - Detailed migration and implementation plans for major changes
- **Status** - Temporary project state (not in version control ideally)

### Migration Strategies Directory

The `/docs/strategies/` directory contains detailed implementation plans for major migrations and architectural changes:

- **Purpose**: Step-by-step guides for complex technical transitions
- **Content**: Risk assessments, rollback plans, phase breakdowns, success metrics
- **Examples**: Framework migrations, database transitions, infrastructure changes
- **Naming**: Use descriptive names like `nextjs-to-vite-migration.md`

Strategy documents should include:

1. Current state analysis
2. Target state definition
3. Phase-by-phase approach with timelines
4. Risk assessment and mitigation
5. Rollback procedures
6. Success metrics and validation criteria

### Archiving Process

When documents become outdated:

1. Create `archive/` folder if it doesn't exist
2. Move file with descriptive name (e.g., `COMPONENT_DESIGN_v1.md`)
3. Add archive header noting why it was archived
4. Update any references to point to current docs

## Agent Workflow (For AI Agents)

### Mandatory Workflow

All agents must follow the complete workflow defined in the Agent Execution Plan:

1. Pre-development planning with Voorhees and Michael
2. Quality consultation during development
3. Code quality checks (all must pass)
4. Karen's code review using explicit approval criteria
5. Barbara's documentation updates
6. Karen's final approval

**NO WORK IS COMPLETE** until Karen gives final approval.

### Guidelines Compliance

Agents must review applicable guidelines before work:

- **Code Quality**: All checks must pass with exit code 0
- **TypeScript**: No suppression without permission
- **Documentation**: Follow standards in this document
- **Pre-commit**: Never use `--no-verify`

## Summary Checklists

### Before Writing Documentation

- [ ] Is this explaining a concept (not tracking tasks)?
- [ ] Will this be valid in 6 months?
- [ ] Does similar documentation already exist?
- [ ] Am I putting tasks in TODO.md instead?

### Before Committing Code

- [ ] `npm run format:fix` - auto-format code
- [ ] `npm run lint:fix` - auto-fix linting issues
- [ ] `npm run lint` - verify no errors remain
- [ ] `npm run typecheck` - passes
- [ ] `npm run build` - succeeds
- [ ] Pre-commit hooks pass (no `--no-verify`)

### When Reviewing Documentation

- [ ] No task lists or checkboxes (except examples)
- [ ] No temporal language or status updates
- [ ] Clear structure with headings
- [ ] Will remain valid over time

---

**Last Updated**: September 1, 2025  
**Status**: Living document - Update as needed  
**Archive**: Previous detailed guidelines in [`/docs/guidelines/archive/`](/docs/guidelines/archive/)
