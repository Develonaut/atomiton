# How to Properly Invoke Agents with Mandatory Workflow

## The Problem

Agents often skip the AGENT_EXECUTION_PLAN.md workflow, leading to incomplete or non-compliant work.

## The Solution

When using the Task tool to invoke any agent, you MUST include the mandatory workflow instructions in your prompt.

## Template for Agent Invocation

```python
# ALWAYS use this template when invoking agents:

Task(
    subagent_type="<agent-name>",
    description="<brief-description>",
    prompt="""
    ## 🚨 MANDATORY: Follow Workflow Requirements 🚨

    You MUST:
    1. Read and follow the mandatory workflow
    2. Create worktree ONLY if starting NEW feature (not for assisting)
    3. Use TodoWrite to track progress
    4. Get Karen's approval before calling work complete

    **NOW, your specific task:**

    {actual_task_description}

    Remember: Start by reading the execution plan and confirming. No exceptions.
    """
)
```

## Examples

### Example 1: UI Component Development

```python
Task(
    subagent_type="Ryan",
    description="Create new Button component",
    prompt="""
    [INSERT MANDATORY WORKFLOW TEMPLATE ABOVE]

    Create a new Button component following our Brainwave 2.0 design system.
    It should support variants: primary, secondary, ghost.
    """
)
```

### Example 2: Backend API Development

```python
Task(
    subagent_type="Michael",
    description="Design user authentication API",
    prompt="""
    [INSERT MANDATORY WORKFLOW TEMPLATE ABOVE]

    Design and implement a RESTful API for user authentication.
    Include endpoints for login, logout, and token refresh.
    """
)
```

## Verification Checklist

When an agent returns their work, verify:

- [ ] Did they confirm reading the execution plan?
- [ ] Did they create a worktree?
- [ ] Did they use TodoWrite to track workflow steps?
- [ ] Did they follow ALL workflow steps in order?
- [ ] Did they get Karen's approval before calling work complete?
- [ ] Did they log progress to `.claude/LOG.md`?

If ANY of these are missing, the work is NOT complete.

## Common Mistakes to Avoid

1. **DON'T** invoke agents without the mandatory workflow prompt
2. **DON'T** accept work that skips workflow steps
3. **DON'T** let agents proceed without confirming they've read the plan
4. **DON'T** allow commits without explicit permission
5. **DON'T** accept "complete" status without Karen's approval

## Enforcement

If an agent doesn't follow the workflow:

1. Stop them immediately
2. Direct them back to the AGENT_EXECUTION_PLAN.md
3. Have them restart with proper workflow compliance
4. Document the issue in `.claude/LOG.md`

## Remember

The workflow is NOT optional. It's the foundation of our quality assurance process. Every agent, every time, no exceptions.
