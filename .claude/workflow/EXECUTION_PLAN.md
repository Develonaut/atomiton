# Agent Execution Plan - Workflow Source of Truth

**CRITICAL**: This document defines the WORKFLOW for all agent work. For
technical standards, see the [Guidelines](../../../docs/guides/README.md).

## Table of Contents

- [Agent Execution Plan - Workflow Source of Truth](#agent-execution-plan---workflow-source-of-truth)
  - [Table of Contents](#table-of-contents)
  - [Mandatory Requirements](#mandatory-requirements)
  - [Required Guidelines Review](#required-guidelines-review)
  - [File Access Permissions](#file-access-permissions)
  - [Progress Logging Requirements](#progress-logging-requirements)
  - [Complete Work Verification Process](#complete-work-verification-process)
    - [1. Before Development: Planning \& Architecture Review](#1-before-development-planning--architecture-review)
    - [2. During Development: Quality Consultation](#2-during-development-quality-consultation)
    - [3. Before Completion: Code Quality Standards](#3-before-completion-code-quality-standards)
    - [4. Initial Code Review](#4-initial-code-review)
    - [5. Documentation Update](#5-documentation-update)
    - [6. Final Verification](#6-final-verification)
  - [Critical Rules](#critical-rules)
    - [Code Submission](#code-submission)
    - [Status Updates and Document Management](#status-updates-and-document-management)
    - [Technical Standards](#technical-standards)
    - [Definition of "Complete"](#definition-of-complete)
  - [Workflow Summary](#workflow-summary)
  - [Referenced Guidelines](#referenced-guidelines)
  - [Important Note on Archived Documents](#important-note-on-archived-documents)
  - [For MVP Implementation](#for-mvp-implementation)

## Mandatory Requirements

1. **ALL agents MUST follow this workflow before starting ANY work**
2. **NO code can be added, committed, or pushed without EXPLICIT permission from
   Ryan**
3. **This workflow supersedes all other workflow documentation**
4. **ALL agents MUST log progress to `.claude/LOG.md` using format:
   `[YYYY-MM-DD HH:MM] [Agent] Status` (1 line max)**

## Required Guidelines Review

**BEFORE STARTING ANY WORK**, ALL agents MUST review:

- **[Guidelines README](../../../docs/guides/README.md)** - READ THIS FIRST -
  Index to all technical standards and requirements
- **[Development Principles](../../../docs/guides/DEVELOPMENT_PRINCIPLES.md)** -
  Core development principles
- **[Code Style](../../../docs/guides/CODE_STYLE.md)** - Code style and quality
  standards

**For Testing Work Specifically:**

- **[Testing Strategy](../../../docs/testing/README.md)** - Complete testing
  philosophy (60% E2E, 30% Integration, 10% Unit)
- **[When & Where to Test](../../../docs/testing/WHEN_AND_WHERE.md)** - Test
  placement guide (Electron/UI = E2E)
- **[Testing Quick Reference](../../../docs/testing/QUICK_REFERENCE.md)** -
  Quick lookup for test patterns

## File Access Permissions

Agents have automatic permission for all file operations within the `atomiton`
directory:

- Read, write, edit, search any files
- Create new files as needed
- Use all discovery tools (Glob, Grep, Read, bash commands)

**Note**: Git operations (add, commit, push) still require explicit Ryan
permission.

## Progress Logging Requirements

**ALL agents MUST log progress at these checkpoints:**

- Task start: `[HH:MM] [Agent] Started [task description]`
- Major milestones: `[HH:MM] [Agent] [What was completed]`
- Task completion: `[HH:MM] [Agent] Completed [task] - [outcome]`

Keep entries to 1 line maximum. Write to `.claude/LOG.md`.

**IMPORTANT**: Agents should NEVER read LOG.md - it's purely for Ryan's
tracking. Just append your progress.

## Complete Work Verification Process

Every task, regardless of size or complexity, MUST follow this complete
workflow:

### 1. Before Development: Planning & Architecture Review

**REQUIRED for ALL work:**

- **Guilliman**: Research existing tools BEFORE any custom implementation
  - Check if framework/library already provides the solution
  - Research standard approaches to the problem
  - Document why custom solution is needed if no standard exists
  - Block custom scripts/tools when built-in solutions exist
  - Enforce: "The framework already solved this"

- **Voorhees**: Cut through architectural complexity - find the SIMPLEST
  solution
  - Challenge every abstraction and pattern
  - Question if features are actually needed (YAGNI)
  - Eliminate over-engineering before it starts
  - **Review ALL barrel exports (index.ts)** - only allow for component
    composition
  - Mandate: "What's the SIMPLEST possible solution that meets requirements?"
  - Remember: Simple > Complex > Complicated

**REQUIRED if changes involve adding/removing major components or significant
updates:**

- **Michael**: Ensure no architecture issues will arise
  - Validate against system design principles
  - Check for breaking changes
  - Confirm alignment with overall architecture

### 2. During Development: Quality Consultation

**REQUIRED checks during implementation:**

- **Guilliman**: Monitor for NIH (Not Invented Here) syndrome
  - Stop custom implementations when discovering built-in solutions
  - Audit package.json scripts for unnecessary complexity
  - Ensure using tool features (Vitest projects, Playwright fixtures, etc.)
  - Challenge: "Why are we writing this instead of using X?"

- **Voorhees**: Ruthlessly slash complexity during implementation
  - Cut unnecessary abstractions
  - Remove clever code in favor of obvious code
  - Eliminate premature optimization
  - Challenge every design pattern - is it needed?
  - **Block unnecessary barrel exports** - direct imports for
    utils/types/services
  - Enforce: "Make it work, make it right, make it simple"

- **Brian**: Determine testing requirements following simplified rules
  - **MUST review testing docs first**:
    [Testing Strategy](../../../docs/testing/README.md)
  - **Apply simplified naming**: Only `.test.ts` and `.spec.ts` files allowed
  - **Follow placement rules**: Electron/UI = E2E, Data pipelines = Integration,
    Complex algorithms = Unit
  - **Enforce 60/30/10 distribution**: Primarily E2E tests
  - **No component unit tests**: Convert to E2E
  - **No Electron tests without UI**: Must be E2E

### 3. Before Completion: Code Quality Standards

**MANDATORY - ALL must pass with exit code 0:**

See [Development Process](../../../docs/development/archive/PROCESS.md) for
complete technical requirements.

**MANDATORY - Package Version Management:**

When making changes to any package (`packages/@atomiton/*` or `apps/*`):

1. **Update CHANGELOG.md** in the package directory:
   - Add changes under "Unreleased" section during development
   - Follow [Keep a Changelog](https://keepachangelog.com/) format
   - Include ALL changes: Added, Changed, Fixed, Removed

2. **Bump package version** in package.json:
   - Patch version (0.0.x) for bug fixes
   - Minor version (0.x.0) for new features or breaking changes in pre-1.0
   - Major version (x.0.0) for breaking changes after 1.0

3. **Update CHANGELOG header** from "Unreleased" to version number with date

**Work is NOT complete until ALL checks pass AND versioning is updated.**

### 4. Initial Code Review

- **Karen**: Reviews all code changes
  - Validates implementation meets requirements
  - Ensures code quality standards are met
  - Confirms all tests and checks pass
  - Approves code for documentation phase

### 5. Documentation Update

**ONLY after Karen approves code:**

- **Barbara**: Updates all affected documentation
  - Updates technical documentation
  - Updates user-facing documentation
  - Ensures README files are current
  - Updates architectural diagrams if needed

### 6. Final Verification

- **Karen**: Final review of everything
  - Reviews Barbara's documentation updates
  - Validates entire change set
  - Gives final approval
  - **ONLY Karen can declare work officially finished**

## Critical Rules

### Code Submission

**NEVER attempt to:**

- `git add` without explicit permission
- `git commit` without explicit permission
- `git push` without explicit permission
- Create pull requests without explicit permission

**ALWAYS:**

- Show code changes for review first
- Wait for explicit permission before any git operations
- Follow the complete workflow above

### Status Updates and Document Management

**NEVER add status information to workflow documents:**

- NO emergency banners, crisis alerts, or current status in workflow documents
- NO project status updates in AGENT_EXECUTION_PLAN.md
- NO temporary status information in permanent process documentation
- Workflow documents must remain status-agnostic and timeless

**STATUS UPDATES BELONG IN:**

- `/CURRENT.md` - Primary project status document (root level)
- `/docs/TODO.md` - Task-specific status tracking
- Dedicated status files, NOT process documentation

**Barbara and Karen:** Direct ALL status updates to appropriate STATUS
documents, never workflow documents.

### Technical Standards

**ALL technical requirements are referenced from the
[Guidelines README](../../../docs/guidelines/README.md)** which indexes
standards in:

- [Development Process](../../../docs/development/archive/PROCESS.md) - Code
  quality and validation
- [TypeScript Standards](../../../docs/development/archive/TYPESCRIPT.md) -
  TypeScript requirements
- [Core Values](../../../docs/development/archive/CORE_VALUES.md) - Development
  principles

### Definition of "Complete"

ALL agents MUST follow this workflow. Work is ONLY complete when:

1. **Guidelines have been reviewed**
   ([Guidelines README](../../../docs/guidelines/README.md) and all referenced
   standards)
2. Voorhees has approved the approach
3. Michael has validated architecture (if applicable)
4. Brian has confirmed testing approach
5. ALL code quality checks pass with exit code 0
6. Karen has approved the code
7. Barbara has updated documentation
8. Karen has given final approval of everything

## Workflow Summary

```
START
  ↓
[Guidelines Review] → Read Guidelines README → All Standards
  ↓
[Planning] → Voorhees (strategy) → Michael (if major changes)
  ↓
[Implementation] → Code → Voorhees (complexity) → Brian (tests)
  ↓
[Quality] → Format → Lint → TypeCheck → Build → Tests
  ↓
[Review] → Karen (code review)
  ↓
[Documentation] → Barbara (updates)
  ↓
[Final] → Karen (final approval)
  ↓
END (Work is officially complete)
```

## Referenced Guidelines

This workflow references technical requirements from the
**[Guidelines README](../../../docs/guides/README.md)** which indexes all
standards and requirements across:

- Development standards in `/docs/guides/`
- UI standards in `/packages/ui/docs/`
- Package integration patterns in `/docs/guides/PACKAGE_INTEGRATION.md`

## Important Note on Archived Documents

**CRITICAL**: Any documents in `archived/` folders contain outdated information
and should NEVER be used for current work. They are kept solely for historical
reference. Always use the current, non-archived versions of documents.

## For MVP Implementation

For specific MVP prototype implementation details, see package-specific ROADMAP
files:

- UI Migration: `/packages/ui/ROADMAP.md`
- Core Migration: `/packages/core/ROADMAP.md`

---

**Remember**: No shortcuts. Every step is mandatory. Work is not done until
Karen says it's done.

Last Updated: 2025-08-31
