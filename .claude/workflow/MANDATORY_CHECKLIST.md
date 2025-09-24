# 🚨 MANDATORY PRE-WORK CHECKLIST 🚨

## Before Starting ANY Work

1. **READ** [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) - Contains the complete
   workflow
2. **CONFIRM**: State "I have read the AGENT_EXECUTION_PLAN and will follow the
   mandatory workflow"
3. **WORKTREE DECISION**:
   - **NEW feature/effort**: Create with `wtnew <feature-name>`
   - **Assisting/fixing/updating**: Use current worktree (DO NOT create new)
4. **USE TodoWrite** to track workflow steps from the execution plan

## The Execution Plan Defines

- Complete workflow steps (planning → implementation → review → approval)
- Who to consult at each stage (Voorhees, Michael, Karen, Barbara)
- Quality requirements (format/lint/typecheck/build)
- Code review checklist ([REVIEW_CHECKLIST.md](../../docs/REVIEW_CHECKLIST.md))
- When work is considered complete (Karen's approval using checklist)

## Critical Quality Gates

- **Voorhees complexity review** - Must pass simplicity check before ANY
  implementation
- **NO `any` types** - Must be fixed before completion
- **NO redundant comments** - Must be removed
- **Files < 500 lines** - Must be refactored
- **All checks pass** - `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

**This is NOT optional. ALL work follows the execution plan and checklist.**
