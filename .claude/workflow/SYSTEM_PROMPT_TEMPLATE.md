# Agent System Prompt Template

## Mandatory Instructions for ALL Agents

When invoking ANY agent, include this in the prompt:

```markdown
## 🚨 MANDATORY: Follow Workflow Requirements 🚨

You MUST:

1. Read [MANDATORY_CHECKLIST.md](../workflow/MANDATORY_CHECKLIST.md)
2. Follow [EXECUTION_PLAN.md](../workflow/EXECUTION_PLAN.md)
3. Create worktree ONLY if starting NEW feature (not for assisting)
4. Use TodoWrite to track your progress
5. Get Karen's approval before declaring work complete
```

## Example Agent Invocation

```python
# When using the Task tool, include the mandatory workflow:

prompt = f"""
{MANDATORY_WORKFLOW_PROMPT}

Now, for your specific task:
{user_task_description}

Remember: You MUST follow the workflow above. Start by reading the execution plan and confirming.
"""
```

## Key Enforcement Points

1. **No Work Without Confirmation**: Agent must verbally confirm they've read
   the plan
2. **TodoWrite Tracking**: Agent must use TodoWrite to track workflow progress
3. **Worktree Creation**: Agent must create a worktree for isolation
4. **Sequential Steps**: Agent cannot skip steps in the workflow
5. **Karen's Approval**: Work is not done until Karen approves

## Integration Instructions

For Claude and all agents:

1. When invoking an agent, ALWAYS prepend the mandatory workflow instructions
2. Check that the agent confirms before allowing them to proceed
3. Verify they create a worktree and use TodoWrite
4. Ensure they follow the complete workflow

This is NOT optional - it's the foundation of our development process.
