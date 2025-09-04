# Workspace - Temporary Working Area

This directory is for **temporary, work-in-progress** documentation during active development sessions.

## 🎯 Purpose

**USE FOR:**

- 🚧 Active blockers being debugged
- 📝 Daily session notes with Claude
- 📄 Draft documents before finding their permanent home
- 🧪 Experimental ideas and explorations

**DO NOT USE FOR:**

- ❌ Progress tracking → Use root `/CURRENT.md`, `/NEXT.md`, `/COMPLETED.md`
- ❌ Permanent documentation → Use package-specific `docs/` folders
- ❌ General guides → Use `/docs/guides/`
- ❌ Completed strategies → Move to package ROADMAP.md files

## 📁 Structure

```
workspace/
├── README.md           # This file
├── BLOCKERS.md        # Current blockers and issues
├── sessions/          # Daily work sessions with Claude
│   ├── TEMPLATE.md    # Template for new sessions
│   └── YYYY-MM-DD.md  # Date-stamped session notes
└── *.md              # Any temporary work-in-progress files
```

## 🔄 Workflow

### Daily Sessions

1. Create a new session file: `sessions/YYYY-MM-DD.md`
2. Log work, decisions, and discoveries
3. Extract important content to permanent locations
4. Old sessions can be deleted after extracting value

### Handling Blockers

1. Document blocker in `BLOCKERS.md`
2. Work through solution with Claude
3. Once resolved, move solution to appropriate documentation
4. Remove from BLOCKERS.md

### Draft Documents

1. Create draft in workspace root
2. Iterate until ready
3. Move to permanent location:
   - Package guides → `packages/[name]/docs/`
   - General guides → `/docs/guides/`
   - Strategies → Package-specific ROADMAP.md
4. Delete from workspace

## 🗺️ Where Things Go

| Content Type              | Location                                         |
| ------------------------- | ------------------------------------------------ |
| **Progress Tracking**     | Root: `/CURRENT.md`, `/NEXT.md`, `/COMPLETED.md` |
| **Package Documentation** | `packages/[name]/docs/`                          |
| **Component Guides**      | `packages/ui/docs/`                              |
| **General Guides**        | `/docs/guides/`                                  |
| **Project Info**          | `/docs/project/`                                 |
| **Completed Strategies**  | Package ROADMAP.md files                         |
| **Research**              | `/docs/research/`                                |
| **Temporary Work**        | `/docs/workspace/` (here)                        |

## 🧹 Cleanup Policy

This folder should be kept clean:

- Session files older than 1 month can be deleted
- Resolved blockers should be removed
- Drafts should be moved once ready
- No permanent documentation should live here

---

**Remember**: This is a temporary workspace. If something is important enough to keep, it belongs somewhere else!
