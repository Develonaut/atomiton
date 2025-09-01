# Agent Guidelines

This directory contains common guidelines and restrictions that apply to multiple agents to avoid duplication in individual agent files.

## 📋 Guidelines Index

### 🚨 CRITICAL MANDATORY REQUIREMENTS

- **[DEVELOPMENT_PROCESS.md](../development/PROCESS.md)** - **MANDATORY CODE QUALITY CHECKS** - ALL agents must run format/lint/typecheck/build before completing work
- **[DEVELOPMENT_PROCESS.md](../development/PROCESS.md)** - **MANDATORY PRE-COMMIT HOOK COMPLIANCE** - NO agent may use `--no-verify` without explicit Ryan permission

### Core Restrictions & Authority

- **[ENVIRONMENT_RESTRICTIONS.md](../development/ENVIRONMENT.md)** - Environment and repository configuration authority matrix

### ⚠️ Archived Documents

**IMPORTANT**: Any documents in `archived/` folders are OUTDATED and should NEVER be used for current work. They exist only for historical reference.

### Development Process & Standards

- **[DEVELOPMENT_PROCESS.md](../development/PROCESS.md)** - **MANDATORY TECHNICAL REQUIREMENTS** - Code quality checks, validation pipeline, and crisis management procedures
- **[DEVELOPMENT_CORE_VALUES.md](../development/CORE_VALUES.md)** - Core development principles and values

## 🎯 How Agents Should Use Guidelines

### 🚨 MANDATORY FOR ALL AGENTS

**EVERY AGENT** must follow the complete workflow defined in the Agent Execution Plan which includes:

1. Pre-development planning with Voorhees and Michael
2. Quality consultation during development
3. Code quality checks (detailed in DEVELOPMENT_PROCESS.md)
4. Karen's code review using explicit approval criteria
5. Barbara's documentation updates
6. Karen's final approval

**NO WORK IS COMPLETE** until Karen gives final approval.

**Note**: The complete workflow process is maintained separately to avoid circular documentation dependencies.

### In Agent Files

Instead of duplicating restrictions, reference the appropriate guideline:

```markdown
## CRITICAL: Guidelines Compliance

**BEFORE ANY WORK**, review applicable guidelines:

- **MANDATORY Code Quality**: [DEVELOPMENT_PROCESS.md](../../docs/development/PROCESS.md)
- **Environment Changes**: [ENVIRONMENT_RESTRICTIONS.md](../../docs/development/ENVIRONMENT.md)
- **UI Standards**: [Component Architecture](../../docs/ui/components/ARCHITECTURE.md)
- **TypeScript Standards**: [TYPESCRIPT_STANDARDS.md](../../docs/development/TYPESCRIPT.md)
```

### Benefits

- **Consistency**: Single source of truth for common rules
- **Maintainability**: Update guidelines in one place
- **Clarity**: Agents focus on their core responsibilities
- **Scalability**: Easy to add new guidelines as needed

---

**Maintained by**: All agents contribute, Parker owns environment guidelines  
**Last Updated**: 2025-01-30
