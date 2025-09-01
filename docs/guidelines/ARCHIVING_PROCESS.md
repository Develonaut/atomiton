# Document Archiving Process

**Owner**: Barbara (Documentation Orchestrator)  
**Created**: 2025-08-31  
**Purpose**: Define clear archiving process for documentation

## What is Archiving?

**Archiving** is the process of preserving important documentation that is:

- No longer current or accurate
- Contains valuable design intentions or historical context
- Too verbose for active use but worth keeping for reference
- Superseded by newer approaches but still informative

## When to Archive (Not Delete)

Archive documents when they are:

- **Outdated but valuable** - Old designs that show evolution
- **Verbose but comprehensive** - Detailed specs worth preserving
- **Aspirational** - Design goals not yet implemented
- **Historical** - Show how decisions were made
- **Reference material** - May be needed for future decisions

## When to Delete (Not Archive)

Delete documents that are:

- **Completely wrong** - Factually incorrect with no value
- **Duplicate** - Exact copies with no unique information
- **Temporary** - Meeting notes, scratch work
- **Misleading** - Would cause confusion if kept
- **No historical value** - Random notes with no context

## Archiving Process

### 1. Identify Document for Archiving

```bash
# Document is outdated but contains valuable information
# Example: 1,500 line architecture doc for broken system
```

### 2. Create Archive Location

```bash
# Create archive folder if it doesn't exist
mkdir -p .claude/project/architecture/archive
mkdir -p .claude/agents/archive
mkdir -p .claude/guidelines/archive
```

### 3. Move or Copy to Archive

```bash
# For git-tracked files, preserve history
git mv original.md archive/original_ARCHIVED_2025-08-31.md

# For design docs, clearly mark as designs
mv architecture.md archive/architecture_DESIGN.md
```

### 4. Add Archive Header

```markdown
# [Document Title] - ARCHIVED

**Status**: ARCHIVED  
**Archived Date**: 2025-08-31  
**Reason**: [Why this was archived]  
**Current Alternative**: [Link to current docs]

---

## ⚠️ **WARNING**: This document is archived and may not reflect current reality.

[Original content follows]
```

### 5. Update References

- Remove links from active documentation
- Update README files to note archived status
- Add entry to archive README explaining what and why

### 6. Create Simplified Replacement

- Extract key concepts still relevant
- Create concise version for active use
- Link to archive for "full historical version"

## Archive Structure

```
.claude/
├── project/
│   └── architecture/
│       ├── README.md           # Current, simplified docs
│       ├── CURRENT_STATE.md    # Actual state
│       └── archive/
│           ├── README.md       # Explains archived content
│           └── *_DESIGN.md     # Original design docs
├── guidelines/
│   └── archive/
│       └── *_ARCHIVED_*.md    # Old guidelines
└── reports/
    └── archive/
        └── *_ARCHIVED_*.md    # Old reports
```

## Archive Naming Convention

- **Design Documents**: `[NAME]_DESIGN.md`
- **Outdated Docs**: `[NAME]_ARCHIVED_[DATE].md`
- **Old Versions**: `[NAME]_v[VERSION].md`
- **Historical**: `[NAME]_HISTORICAL.md`

## Archive README Template

```markdown
# [Folder] Archive

## Purpose

Preserve [what] for [why]

## Contents

- **File1** - [Description] (Archived: [Date])
- **File2** - [Description] (Archived: [Date])

## Status

These documents are NOT current. See [current location] for active documentation.
```

## Key Principles

1. **Preserve Knowledge** - Don't lose valuable information
2. **Clear Marking** - Always mark archived docs as such
3. **Easy Discovery** - Archive should be searchable
4. **No Confusion** - Clear separation from active docs
5. **Traceability** - Document why things were archived

## When Barbara Should Archive

Before deleting >50 lines of documentation, ask:

1. Does it contain design intentions? → Archive
2. Does it show decision history? → Archive
3. Could it help future debugging? → Archive
4. Is it completely wrong? → Delete
5. Is it exact duplicate? → Delete

---

**Remember**: Archiving preserves institutional knowledge while keeping active docs clean and current.
