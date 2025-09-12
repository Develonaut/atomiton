# Workflow Enforcement Checklist

## Quick Reference

All workflow requirements are defined in:

- **[MANDATORY_CHECKLIST.md](./MANDATORY_CHECKLIST.md)** - Required steps before work
- **[EXECUTION_PLAN.md](./EXECUTION_PLAN.md)** - Full workflow details

## Key Checks

Before starting:

- [ ] Read mandatory workflow
- [ ] Verbal confirmation given
- [ ] Worktree created (ONLY for new features, not assisting)
- [ ] TodoWrite tracking active

Cannot complete without:

- [ ] Quality checks pass (exit code 0)
- [ ] Review checklist completed (see [REVIEW_CHECKLIST.md](../../docs/REVIEW_CHECKLIST.md))
- [ ] No `any` types in code
- [ ] No redundant comments
- [ ] Files < 500 lines
- [ ] Karen's final approval using checklist

## For Agent Invocations

When using Task tool:

- [ ] Include mandatory workflow prompt from `HOW_TO_INVOKE_AGENTS.md`
- [ ] Verify agent confirms reading execution plan
- [ ] Verify agent creates worktree
- [ ] Verify agent uses TodoWrite
- [ ] Check agent follows ALL workflow steps

## Red Flags (Work Must Be Rejected)

- ❌ No confirmation of reading execution plan
- ❌ No worktree created
- ❌ No TodoWrite tracking
- ❌ Skipped workflow steps
- ❌ Declared "complete" without Karen's approval
- ❌ Quality checks not run or failing
- ❌ No progress logged to `.claude/LOG.md`
- ❌ Any `any` types present in code
- ❌ Redundant comments not removed
- ❌ Files over 500 lines not refactored
- ❌ Review checklist not completed

## Enforcement Actions

If workflow not followed:

1. **STOP** all work immediately
2. Direct back to `AGENT_EXECUTION_PLAN.md`
3. Require restart with proper compliance
4. Document violation in `.claude/LOG.md`

## Key Files

- **Workflow Definition**: `.claude/agents/coordination/AGENT_EXECUTION_PLAN.md`
- **How to Invoke**: `.claude/HOW_TO_INVOKE_AGENTS.md`
- **Agent Templates**: `.claude/agents/AGENT_SYSTEM_PROMPT.md`
- **Main Instructions**: `.claude/CLAUDE.md`
- **Review Checklist**: `docs/REVIEW_CHECKLIST.md`
- **Code Review Guidelines**: `docs/CODE_REVIEW_GUIDELINES.md`
- **Agent Instructions**: `docs/AGENT_INSTRUCTIONS.md`

## Remember

**NO EXCEPTIONS** - The workflow is mandatory for:

- Claude directly
- All agents
- All code changes
- All implementations

Even "quick fixes" must follow the workflow.
