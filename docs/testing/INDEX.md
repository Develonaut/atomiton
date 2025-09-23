# Testing Documentation Index

## Current Structure

```
docs/testing/
├── README.md                   # Complete testing strategy (source of truth)
├── QUICK_REFERENCE.md         # Quick lookup guide
├── WHEN_AND_WHERE.md          # Detailed guide on test placement
├── TESTING_REVIEW_PROMPT.md  # AI compliance review prompt
├── MIGRATION_GUIDE.md         # Transition guide from old docs
└── INDEX.md                   # This file
```

## File Purposes

### 📖 [README.md](./README.md)
**Purpose**: Complete testing strategy and philosophy  
**Key Points**: 
- Inverted pyramid (60% E2E, 30% Integration, 10% Unit)
- Test user journeys, not implementation
- Simplified to only 2 file types: `.test.ts` and `.spec.ts`

### 🚀 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Purpose**: Quick lookup for common testing tasks  
**Key Points**:
- Simple decision tree
- Commands and examples
- Speed limits

### 📍 [WHEN_AND_WHERE.md](./WHEN_AND_WHERE.md)
**Purpose**: Detailed guidance on where to write different test types  
**Key Points**:
- Electron/Desktop → Always E2E
- UI interactions → Always E2E
- Data pipelines → Integration
- Complex algorithms → Unit
- Real examples from lessons learned

### 🔍 [TESTING_REVIEW_PROMPT.md](./TESTING_REVIEW_PROMPT.md)
**Purpose**: AI agent prompt for compliance audits  
**Key Points**:
- Detects violations (critical/major/minor)
- Generates detailed reports
- Tracks compliance over time

### 📋 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
**Purpose**: Guide for transitioning from old testing docs  
**Key Points**:
- What changed and why
- Migration checklist
- Timeline for changes

## Quick Decision Guide

```
Need to write a test?
  → Start with WHEN_AND_WHERE.md, then QUICK_REFERENCE.md
  
New to the team?
  → Read README.md first
  
Doing a compliance review?
  → Use TESTING_REVIEW_PROMPT.md
  
Confused about changes?
  → Check MIGRATION_GUIDE.md
```

## Key Principles

### Simplified Naming
- **Only 2 file types**: `.test.ts` and `.spec.ts`
- **No more**: `.int.test.ts`, `.smoke.test.ts`, `.bench.test.ts`
- **Folder structure determines test type**, not file naming

### Test Location Rules
- **E2E tests**: `apps/e2e/tests/*.spec.ts`
- **Integration tests**: `src/integration/*.test.ts`
- **Unit tests**: `src/[file].test.ts` (co-located)

### Key Lessons Learned
1. **Don't test Electron without UI** - It's painful and unrealistic
2. **When in doubt, go E2E** - Test at the highest level possible
3. **Folder structure > file naming** - Simpler and clearer

## Summary

We've consolidated from 6 conflicting documents to a streamlined system:
- **One strategy** (README.md)
- **Simple naming** (only `.test.ts` and `.spec.ts`)
- **Clear placement** (WHEN_AND_WHERE.md)
- **Automated review** (TESTING_REVIEW_PROMPT.md)

The approach is based on real experience - particularly the lesson that testing Electron without UI is unnecessarily difficult. Just test it the way users use it!

---

*Last Updated: 2025-01-17*