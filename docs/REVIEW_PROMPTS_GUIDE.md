# Documentation Review Prompts Guide

This guide explains how to create domain-specific review prompts for different
areas of the Atomiton documentation. Each domain should have its own review
prompt to ensure compliance with guidelines.

## Structure for Domain Review Prompts

Each domain (testing, architecture, development, etc.) should have:

```
docs/[domain]/
├── README.md                      # Main documentation (source of truth)
├── QUICK_REFERENCE.md            # Quick lookup guide
├── [DOMAIN]_REVIEW_PROMPT.md    # Compliance review prompt
└── MIGRATION_GUIDE.md            # If consolidating docs
```

## Available Domain Review Prompts

### ✅ Completed

1. **Testing** (`/docs/testing/TESTING_REVIEW_PROMPT.md`)
   - Reviews test distribution (60/30/10)
   - Identifies anti-patterns
   - Ensures E2E focus
   - Checks for data-testid usage

### 🚧 To Be Created

2. **Architecture** (`/docs/architecture/ARCHITECTURE_REVIEW_PROMPT.md`)
   - Review areas:
     - Dependency injection patterns
     - Package boundaries
     - Circular dependencies
     - Factory pattern usage
     - Event bus implementation

3. **Development** (`/docs/development/DEVELOPMENT_REVIEW_PROMPT.md`)
   - Review areas:
     - Code style consistency
     - TypeScript strict mode
     - Error handling patterns
     - Logging standards
     - Performance patterns

4. **UI/UX** (`/docs/ui/UI_REVIEW_PROMPT.md`)
   - Review areas:
     - Component composition
     - Accessibility (a11y)
     - data-testid presence
     - Theme consistency
     - Responsive design

5. **Security** (`/docs/security/SECURITY_REVIEW_PROMPT.md`)
   - Review areas:
     - IPC security
     - Input validation
     - Electron security checklist
     - Dependency vulnerabilities
     - Secrets management

6. **Performance** (`/docs/performance/PERFORMANCE_REVIEW_PROMPT.md`)
   - Review areas:
     - Bundle size
     - Render performance
     - Memory leaks
     - Canvas optimization
     - Worker thread usage

## Template for Creating New Review Prompts

```markdown
# [Domain] Compliance Review Prompt

## Instructions for AI Agent

You are conducting a [domain] compliance review of the Atomiton codebase. Your
task is to analyze [what to analyze] to ensure they follow our [domain]
guidelines. You will produce a detailed compliance report with specific issues
and recommendations.

## Your Review Process

1. **Scan the relevant files** in the following locations:
   - [List specific paths to check]
2. **Analyze each file** against our guidelines
3. **Produce a compliance report** with specific violations and fixes

## [Domain] Guidelines to Enforce

### Core Principles (MUST ENFORCE)

[List 3-5 core principles that must be followed]

### Violations to Identify

#### 🚫 CRITICAL VIOLATIONS (Must Fix)

[List patterns that must never appear]

#### ⚠️ MAJOR VIOLATIONS (Should Fix)

[List patterns that should be avoided]

#### ℹ️ MINOR VIOLATIONS (Nice to Fix)

[List patterns that could be improved]

## Report Template to Generate

[Include a structured template for the report]

## Review Commands to Execute

[List specific commands to run during review]

## Success Criteria

The codebase is compliant when:

- ✅ [Criterion 1]
- ✅ [Criterion 2]
- ✅ [Criterion 3]
```

## How to Create a New Domain Review Prompt

1. **Identify the domain's core principles** (3-5 key rules)
2. **Define what constitutes violations** (critical/major/minor)
3. **Create detection patterns** (grep commands, file patterns)
4. **Design report template** (consistent with testing example)
5. **Add success criteria** (measurable goals)

## Using Review Prompts

### Individual Review

```bash
# Copy the prompt content and ask an AI agent to:
"Review the Atomiton codebase using this prompt: [paste prompt]"
```

### Automated Review Pipeline

```bash
# Future: Create scripts that run all review prompts
pnpm run review:testing
pnpm run review:architecture
pnpm run review:all
```

### Review Schedule

| Domain       | Frequency        | Owner       |
| ------------ | ---------------- | ----------- |
| Testing      | Weekly → Monthly | Engineering |
| Architecture | Monthly          | Tech Lead   |
| Development  | Bi-weekly        | Team        |
| UI/UX        | Per PR           | Design/Eng  |
| Security     | Quarterly        | Security    |
| Performance  | Monthly          | Platform    |

## Benefits of Domain Review Prompts

1. **Consistency** - Same standards applied every review
2. **Completeness** - Nothing gets missed
3. **Actionable** - Specific issues with fixes
4. **Trackable** - Compliance scores over time
5. **Educational** - Team learns from violations

## Next Steps

1. Create review prompts for each domain as needed
2. Run initial baseline reviews
3. Track compliance scores
4. Automate where possible
5. Celebrate improvements

---

_Each domain should maintain its own review prompt to ensure guidelines are
followed consistently across the Atomiton codebase._
