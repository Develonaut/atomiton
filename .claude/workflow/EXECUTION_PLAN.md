# Agent Execution Plan - Workflow Source of Truth

**CRITICAL**: This document defines the WORKFLOW for all agent work. For technical standards, see the [Guidelines](../../../docs/guides/README.md).

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
2. **NO code can be added, committed, or pushed without EXPLICIT permission from Ryan**
3. **This workflow supersedes all other workflow documentation**
4. **ALL agents MUST log progress to `.claude/LOG.md` using format: `[YYYY-MM-DD HH:MM] [Agent] Status` (1 line max)**

## Required Guidelines Review

**BEFORE STARTING ANY WORK**, ALL agents MUST review:

- **[Guidelines README](../../../docs/guides/README.md)** - READ THIS FIRST - Index to all technical standards and requirements
- **[Development Principles](../../../docs/guides/DEVELOPMENT_PRINCIPLES.md)** - Core development principles
- **[Code Style](../../../docs/guides/CODE_STYLE.md)** - Code style and quality standards

## File Access Permissions

Agents have automatic permission for all file operations within the `atomiton` directory:

- Read, write, edit, search any files
- Create new files as needed
- Use all discovery tools (Glob, Grep, Read, bash commands)

**Note**: Git operations (add, commit, push) still require explicit Ryan permission.

## Progress Logging Requirements

**ALL agents MUST log progress at these checkpoints:**

- Task start: `[HH:MM] [Agent] Started [task description]`
- Major milestones: `[HH:MM] [Agent] [What was completed]`
- Task completion: `[HH:MM] [Agent] Completed [task] - [outcome]`

Keep entries to 1 line maximum. Write to `.claude/LOG.md`.

**IMPORTANT**: Agents should NEVER read LOG.md - it's purely for Ryan's tracking. Just append your progress.

## Complete Work Verification Process

Every task, regardless of size or complexity, MUST follow this complete workflow:

### 1. Before Development: Planning & Architecture Review

**REQUIRED for ALL work:**

- **Voorhees**: Strategize the most efficient implementation approach
  - Review existing code patterns
  - Identify potential for reuse
  - Recommend simplest solution

**REQUIRED if changes involve adding/removing major components or significant updates:**

- **Michael**: Ensure no architecture issues will arise
  - Validate against system design principles
  - Check for breaking changes
  - Confirm alignment with overall architecture

### 2. During Development: Quality Consultation

**REQUIRED checks during implementation:**

- **Voorhees**: Review implementation for unnecessary complexity
  - No over-engineering
  - No premature optimization
  - No unnecessary abstractions
- **Brian**: Determine testing requirements
  - Identify what tests are needed
  - Ensure test coverage is appropriate
  - No excessive testing

### 3. Before Completion: Code Quality Standards

**MANDATORY - ALL must pass with exit code 0:**

See [Development Process](../../../docs/development/archive/PROCESS.md) for complete technical requirements.

**Work is NOT complete until ALL checks pass.**

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

- `/docs/status/CURRENT_STATUS.md` - Primary project status document
- `/docs/TODO.md` - Task-specific status tracking
- Dedicated status files, NOT process documentation

**Barbara and Karen:** Direct ALL status updates to appropriate STATUS documents, never workflow documents.

### Technical Standards

**ALL technical requirements are referenced from the [Guidelines README](../../../docs/guidelines/README.md)** which indexes standards in:

- [Development Process](../../../docs/development/archive/PROCESS.md) - Code quality and validation
- [TypeScript Standards](../../../docs/development/archive/TYPESCRIPT.md) - TypeScript requirements
- [Core Values](../../../docs/development/archive/CORE_VALUES.md) - Development principles

### Definition of "Complete"

ALL agents MUST follow this workflow. Work is ONLY complete when:

1. **Guidelines have been reviewed** ([Guidelines README](../../../docs/guidelines/README.md) and all referenced standards)
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

This workflow references technical requirements from the **[Guidelines README](../../../docs/guides/README.md)** which indexes all standards and requirements across:

- Development standards in `/docs/guides/`
- UI standards in `/packages/ui/docs/`
- Package integration patterns in `/docs/guides/PACKAGE_INTEGRATION.md`

## Important Note on Archived Documents

**CRITICAL**: Any documents in `archived/` folders contain outdated information and should NEVER be used for current work. They are kept solely for historical reference. Always use the current, non-archived versions of documents.

## For MVP Implementation

For specific MVP prototype implementation details, see package-specific ROADMAP files:

- UI Migration: `/packages/ui/ROADMAP.md`
- Core Migration: `/packages/core/ROADMAP.md`

---

**Remember**: No shortcuts. Every step is mandatory. Work is not done until Karen says it's done.

Last Updated: 2025-08-31
