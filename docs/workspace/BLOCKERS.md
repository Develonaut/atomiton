# Current Blockers

## Active Blockers

### 1. Tailwind to Mantine Migration Required First

**Impact**: Can't populate theme/ui packages yet  
**Details**:

- Theme and UI packages are empty placeholders
- Need to complete Tailwind → Mantine migration first
- Then move components to packages/ui
- Theme will be Mantine-based configuration

**Next Steps**:

1. Complete Vite migration (simpler build)
2. Execute Tailwind to Mantine migration
3. Extract components to packages/ui
4. Configure Mantine theme in packages/theme

### 2. Package Integration Sequencing

**Impact**: Can't wire packages until migrations done
**Details**:

- Core, nodes, electron packages added but not wired
- Waiting for UI framework migration
- Theme package will be single source of truth

**Resolution Path**: Migration first, then integration

## Resolved Blockers

None yet

## Notes

- Theme package will be **Mantine-based** (not custom CSS)
- Theme is **single source of truth** for all visual aspects
- Future: Multiple theme options (user choice)
- Current: Focus on one great theme during migration

---

**Last Updated**: 2025-01-02
