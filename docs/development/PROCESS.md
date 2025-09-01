# Development & Quality Assurance Process

## 📑 Table of Contents

### 🚨 Mandatory Requirements

- [MANDATORY CODE QUALITY REQUIREMENTS - ALL AGENTS](#-mandatory-code-quality-requirements---all-agents) - Non-negotiable standards
  - [MANDATORY Pre-Completion Checks](#mandatory-pre-completion-checks) - Required validation steps
  - [Success Criteria - NO EXCEPTIONS](#success-criteria---no-exceptions) - What constitutes completion
  - [Agent Accountability](#agent-accountability) - Responsibility enforcement
  - [MANDATORY PRE-COMMIT HOOK COMPLIANCE](#-mandatory-pre-commit-hook-compliance) - Hook requirements
  - [If Checks Fail](#if-checks-fail) - Recovery procedures

### 🛡️ Change Management

- [MANDATORY CHANGE MANAGEMENT RULES](#️-mandatory-change-management-rules-added-2025-08-31) - New requirements
  - [Incremental Change Rule](#incremental-change-rule) - Small, tested changes
  - [Build Stability Rule](#build-stability-rule) - Maintain working state
  - [Configuration Testing Rule](#configuration-testing-rule) - Safe config changes
  - [Documentation Preservation Rule](#documentation-preservation-rule) - Protect knowledge

### 📋 Quality Standards & Prevention

- [Core Principle](#core-principle) - Validation requirements
- [Quality Standards and Best Practices](#quality-standards-and-best-practices) - Development standards
  - [Common Issues and Prevention](#common-issues-and-prevention) - Root cause prevention
  - [Critical Process Requirements](#critical-process-requirements) - Validation requirements
  - [Development Standards](#development-standards) - Quality standards
  - [Compilation Error Prevention](#compilation-error-prevention) - Prevention measures
  - [Red Flags That Should Stop Development](#red-flags-that-should-stop-development) - Warning signs
  - [Quality Gate Enforcement](#quality-gate-enforcement) - Mandatory rules
  - [Recovery Process for Compilation Errors](#recovery-process-for-compilation-errors) - Error recovery procedures

### 🚨 Critical Validation Pipeline

- [Critical Validation Pipeline](#-critical-validation-pipeline) - Complete validation process
  - [Phase 1: Pre-Change Analysis](#phase-1-pre-change-analysis) - Planning stage
  - [Phase 2: Change Implementation](#phase-2-change-implementation) - Execution stage
  - [Phase 3: Mandatory Validation](#phase-3-mandatory-validation) - Verification stage

### 🔧 Specific Scenarios & Rules

- [Specific Scenarios](#-specific-scenarios) - Common development patterns
  - [Component Extraction Process](#component-extraction-process) - Safe refactoring
  - [Import Management Rules](#import-management-rules) - Dependency handling
  - [Refactoring Safety Checklist](#refactoring-safety-checklist) - Risk mitigation
- [Red Flags (STOP and validate immediately)](#️-red-flags-stop-and-validate-immediately) - High-risk changes
  - [High-Risk Changes](#high-risk-changes) - What requires extra care
  - [Validation Triggers](#validation-triggers) - When to run full validation

### 📋 Quality Gates & Standards

- [Quality Gates](#-quality-gates) - Mandatory checkpoints
  - [Gate 1: TypeScript Validation](#gate-1-typescript-validation) - Compilation checks
  - [Gate 2: Lint Validation](#gate-2-lint-validation) - Code quality checks
  - [Gate 3: Runtime Validation](#gate-3-runtime-validation) - Functional testing
- [Communication Standards](#-communication-standards) - Progress reporting
  - [Progress Reports](#progress-reports) - How to communicate status
  - [Error Handling](#error-handling) - How to handle failures

### 🔄 Continuous Improvement

- [Continuous Improvement](#-continuous-improvement) - Process evolution
  - [After Each Session](#after-each-session) - Learning from experience
  - [Tool Integration](#tool-integration) - Workflow enhancements
- [Best Practices](#-best-practices) - Proven approaches
  - [File Organization](#file-organization) - Project structure
  - [Import Management](#import-management) - Dependency best practices
  - [Component Development](#component-development) - Development workflow

### 🎖️ Success Metrics & Final Notes

- [Success Metrics](#️-success-metrics) - What constitutes successful work

## 🚨 MANDATORY CODE QUALITY REQUIREMENTS - ALL AGENTS

**CRITICAL**: This document defines the MANDATORY technical requirements and quality validation procedures that all agents must follow.

For agent coordination and workflow orchestration, agents should follow their designated workflow process.

### **MANDATORY Pre-Completion Checks**

After making ANY code changes, agents **MUST** run these commands **IN ORDER**:

```bash
# 1. FORMATTING CHECK (MANDATORY)
npm run format:check
# If fails: npm run format

# 2. LINTING CHECK (MANDATORY)
npm run lint:fix
npm run lint
# If fails: then manual fixes if needed

# 3. TYPE CHECKING (MANDATORY)
npm run typecheck
# If fails: Fix ALL TypeScript errors before proceeding

# 4. BUILD VERIFICATION (MANDATORY)
npm run build
# If fails: Fix ALL build errors before proceeding
```

### **Success Criteria - NO EXCEPTIONS**

These technical checks are mandatory requirements for all code submissions.
Work is **ONLY** complete when **ALL** of these pass AND Karen gives final approval using her explicit completion criteria:

- ✅ **Formatting passes**: `npm run format:check` exits with code 0
- ✅ **Linting passes**: `npm run lint` shows no errors (warnings acceptable)
- ✅ **Type checking passes**: `npm run typecheck` exits with code 0
- ✅ **Build succeeds**: `npm run build` completes successfully

### **Agent Accountability**

- **ALL AGENTS** must follow the complete validation workflow including agent coordination
- **NO AGENT** can mark work complete without Karen's final approval
- **ANY AGENT** that skips mandatory technical requirements causes project-wide problems
- **Voorhees, Brian, Barbara, and Karen** verify work according to their specialized responsibilities

### **🚨 MANDATORY PRE-COMMIT HOOK COMPLIANCE**

**CRITICAL**: Pre-commit hooks are **NON-NEGOTIABLE** quality gates that **MUST NOT** be bypassed.

**ABSOLUTELY FORBIDDEN**:

- ❌ `git commit --no-verify`
- ❌ `git commit -n`
- ❌ Any method to bypass Husky pre-commit hooks
- ❌ Skipping hook validations for any reason

**REQUIRED BEHAVIOR**:

- ✅ **ALL commits must pass pre-commit hooks**
- ✅ **If hooks fail, agents MUST fix the underlying issues**
- ✅ **NO bypassing hooks without explicit permission**
- ✅ **If truly blocked, you must ask for explicit permission before using --no-verify**

**ENFORCEMENT**:

- Any agent bypassing hooks without permission violates core project quality standards
- Pre-commit hooks exist to prevent exactly the kind of compilation crisis we're currently experiencing
- Hooks that fail indicate real problems that must be addressed, not bypassed

### **If Checks Fail**

**STOP IMMEDIATELY** and:

1. Read the error messages carefully
2. Fix ALL issues found by the tools
3. Re-run the failed check to verify it passes
4. Continue with remaining checks
5. **ONLY** mark work complete after ALL checks pass

---

## 🛡️ MANDATORY CHANGE MANAGEMENT RULES (Added 2025-08-31)

### **Incremental Change Rule**

- **Maximum 20 files per commit** (exceptions require explicit approval)
- **Test after EACH incremental change**
- **Rollback immediately if build breaks**
- **BETTER**: "Fix test failures one at a time"
- **WORSE**: "Fix all test failures" (leads to 150+ file changes)

### **Build Stability Rule**

- **EVERY commit MUST maintain buildable state**
- **NO merging with TypeScript errors**
- **Tests must pass before proceeding to next change**
- **If build breaks, FIX before adding features**

### **Configuration Testing Rule**

- **Test new configs on 1-2 sample files first**
- **Gradual rollout across packages (one at a time)**
- **Document configuration changes in commit message**
- **NEVER apply aggressive rules globally without testing**

### **Documentation Preservation Rule**

- **Never delete >50% of documentation without approval**
- **Archive before deleting (git stash or backup)**
- **Preserve essential knowledge even when simplifying**
- **BETTER**: "Reduce verbosity while keeping key information"
- **WORSE**: "Delete everything and start fresh"

## Core Principle

**NEVER report success without explicit validation. Confidence must be earned through verification, not assumed.**

**KEY PRINCIPLE**: **Incremental, tested changes prevent catastrophic failures. Big-bang changes destroy working systems.**

## 🚨 Critical Validation Pipeline

Every code change MUST follow this validation sequence before reporting success:

### **Phase 1: Pre-Change Analysis**

```bash
# Before making ANY changes
1. Read and understand the current code
2. Identify all dependencies and imports
3. Plan the changes with impact assessment
4. Note which files will be affected
```

### **Phase 2: Change Implementation**

```bash
# During implementation
1. Make focused, incremental changes
2. Track all imports added/removed
3. Verify component/function usage before removal
4. Update related files simultaneously
```

### **Phase 3: Mandatory Validation**

⚠️ **CRITICAL**: The mandatory validation requirements defined at the top of this document **CAN NEVER BE SKIPPED**.

**VALIDATION PRIORITY**: When TypeScript compilation errors exist, focus FIRST on compilation until all errors are resolved, then resume full mandatory validation process.

## 🔧 Specific Scenarios

### **Component Extraction Process**

```bash
1. Pre-extraction validation
   - npx tsc --noEmit
   - Identify all imports in source file

2. Extract component code
   - Create new component file
   - Add proper imports and exports

3. Update source file
   - Add import for new component
   - Replace inline code with component usage
   - Remove unused imports (CAREFULLY)

4. Immediate validation
   - npx tsc --noEmit (both files)
   - grep for any remaining usage of removed imports

5. Full system test
   - npm run dev
   - Navigate to affected pages
   - Verify functionality works
```

### **Import Management Rules**

```bash
# Before removing any import:
grep -r "ImportName" src/path/to/file.tsx

# After adding imports:
npx tsc --noEmit --project .

# For component refactoring:
# 1. Add new imports FIRST
# 2. Update code to use new imports
# 3. Remove old imports LAST
# 4. Validate after each step
```

### **Refactoring Safety Checklist**

- [ ] Search for all usage of elements being changed
- [ ] Update imports before updating usage
- [ ] Verify TypeScript types are correct
- [ ] Test in development environment
- [ ] Check browser network/console tabs for errors

## ⚠️ Red Flags (STOP and validate immediately)

### **High-Risk Changes**

- Removing imports from files
- Moving components between files
- Changing component names or exports
- Modifying shared/reusable components
- Large file refactoring (>100 lines changed)

### **Validation Triggers**

If ANY of these occur, run full validation pipeline:

- "Cannot find module" errors
- "is not defined" errors
- Import/export mismatches
- TypeScript compilation errors
- Runtime crashes or blank pages

## 📋 Quality Gates

### **Gate 1: TypeScript Validation**

```bash
# MUST pass before proceeding
npx tsc --noEmit

# If errors found:
# - Fix ALL TypeScript errors
# - Re-run validation
# - Do NOT proceed until clean
```

### **Gate 2: Lint Validation**

```bash
# MUST address critical errors
npm run lint:fix
npm run lint

# Acceptable to proceed with:
# - Warnings (not errors)
# - Unused variable warnings (if intentional)

# MUST fix before proceeding:
# - Import/export errors
# - Syntax errors
# - Type errors
```

### **Gate 3: Runtime Validation**

```bash
# MUST verify:
npm run dev

# Wait minimum 10 seconds for:
# - Full compilation
# - Hot reload completion
# - Error detection

# Check for:
# - Server startup success
# - No compilation errors in terminal
# - Ability to navigate to affected pages
```

## 🎯 Communication Standards

### **Progress Reports**

```bash
❌ BAD: "The extraction is complete and working!"
✅ GOOD: "Extraction complete. Validating..."
[runs validation commands]
"✅ TypeScript: Clean"
"✅ ESLint: Clean"
"✅ Dev server: Running"
"✅ All validations passed - refactoring successful!"
```

### **Error Handling**

```bash
When errors found:
1. IMMEDIATELY acknowledge the error
2. Show the specific error message
3. Fix the error
4. Re-run full validation
5. Only then report resolution
```

## 🔄 Continuous Improvement

### **After Each Session**

- Review any errors that occurred
- Identify what validation step could have caught it
- Update this process if needed
- Learn from mistakes to prevent recurrence

### **Tool Integration**

Consider adding these to the development workflow:

- Pre-commit hooks for TypeScript/ESLint
- IDE integration for real-time validation
- Automated testing for critical paths

## 💡 Best Practices

### **File Organization**

- Keep related changes in single commits
- Test incrementally, not in large batches
- Maintain clear separation between refactoring and feature work

### **Import Management**

- Add imports conservatively
- Remove imports cautiously
- Always verify usage before removal
- Use IDE "find usages" features when available

### **Component Development**

- Start with working code
- Make incremental changes
- Validate each step
- Never skip validation for "small" changes

---

## 🎖️ Success Metrics

A successful development session means completing ALL technical requirements AND agent coordination steps:

Including:

- ✅ Voorhees approved the approach
- ✅ Michael validated architecture (if applicable)
- ✅ Brian confirmed testing approach
- ✅ All technical quality checks passed (detailed in this document)
- ✅ Karen approved the code
- ✅ Barbara updated documentation
- ✅ Karen gave final approval

**Remember: Taking time for proper validation prevents much larger problems later. Quality is not optional.**

---

## 🚨 Quality Standards and Best Practices

### Common Issues and Prevention

Large-scale compilation errors typically occur because:

1. **Validation was skipped** - Code was marked "complete" without compilation testing
2. **Documentation diverged** - Architecture docs didn't match actual implementations
3. **Integration wasn't tested** - Packages weren't verified to work together
4. **Complex features first** - Advanced systems built before basics worked

### Critical Process Requirements

```bash
# What SHOULD have happened but DIDN'T:
npx tsc --noEmit  # This command would have caught 170+ errors

# What DID happen instead:
"The implementation is complete and working!" # ❌ FALSE
```

### Development Standards

**ABSOLUTE REQUIREMENTS** (No exceptions):

1. **Every PR must compile cleanly** - No compilation errors allowed
2. **Cross-package testing required** - Test imports between packages
3. **Documentation must match code** - Keep architecture docs current
4. **Incremental development only** - Build foundation before complexity

### Compilation Error Prevention

```bash
# BEFORE claiming any code is complete:

# 1. Individual package compilation
npx tsc --noEmit --project packages/core/tsconfig.json
npx tsc --noEmit --project packages/ui/tsconfig.json
npx tsc --noEmit --project packages/shared/tsconfig.json

# 2. Root compilation check
npx tsc --noEmit

# 3. Build verification
npm run build

# 4. Development server test
npm run dev

# If ANY of these fail, the code is NOT complete
```

### Red Flags That Should Stop Development

**IMMEDIATE STOP SIGNALS**:

- Any TypeScript compilation error
- "Cannot find module" errors
- Missing type definition warnings
- Export/import mismatches
- Build failures of any kind

**NEVER IGNORE**:

- "Property does not exist" errors
- "Cannot assign type" errors
- "Module has no exported member" errors
- "Re-exporting a type when isolatedModules enabled" errors

### Quality Gate Enforcement

**NEW MANDATORY RULE**: Code cannot be merged if it:

- Produces any TypeScript errors
- Breaks existing functionality
- Causes build failures
- Makes tests unrunnable

### Recovery Process for Compilation Errors

**Phase 1**: Fix compilation errors systematically
**Phase 2**: Restore build system functionality
**Phase 3**: Enable testing pipeline
**Phase 4**: Validate all functionality

**During Error Recovery**: Focus on fixes first, avoid new features until system is stable

**Key Learning**: Every step of the validation process is critical. Skipping validation doesn't save time - it creates larger problems later.
