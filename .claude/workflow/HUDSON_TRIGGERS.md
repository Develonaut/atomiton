# Hudson Workflow Triggers

## When to Invoke Hudson

Hudson should be invoked PROACTIVELY in these scenarios:

### 1. Pre-Implementation Review (MANDATORY)

**When:** Before ANY new tool, script, or custom solution
**Trigger Phrases:**

- "Let's write a script to..."
- "We need a custom solution for..."
- "I'll create a utility to handle..."
- "We should build our own..."

**Hudson's Role:** Research and document existing solutions BEFORE any code is written

### 2. Package.json Script Additions

**When:** Adding or modifying any npm/pnpm scripts
**Questions Hudson Asks:**

- Does the tool already provide this command?
- Can we use pnpm filtering instead of a custom script?
- Is there a standard npm script name for this?

### 3. Testing Configuration Changes

**When:** Modifying test setup or adding test utilities
**Hudson Checks:**

- Are we using Vitest projects correctly?
- Are we leveraging Playwright's built-in features?
- Do we need custom test runners or does the framework handle it?

### 4. Build/Dev Configuration

**When:** Touching vite.config, tsconfig, or build scripts
**Hudson Ensures:**

- Using shared presets from @atomiton/vite-config
- Not duplicating configuration across packages
- Leveraging Vite's built-in features

### 5. CI/CD Pipeline Changes

**When:** Modifying GitHub Actions or deployment scripts
**Hudson Validates:**

- Using GitHub Actions features (matrices, caching, artifacts)
- Not writing bash scripts for what Actions provides
- Following GitHub's recommended patterns

## Integration with Other Agents

### Hudson + Voorhees

- **Hudson:** "Use the framework's solution"
- **Voorhees:** "Make the framework's solution simpler"
- Together: Prevent both NIH and over-complexity

### Hudson + Michael

- **Michael:** Designs the architecture
- **Hudson:** Ensures we use standard tools to implement it
- Result: Well-architected systems using proven tools

### Hudson + Brian

- **Brian:** Defines what needs testing
- **Hudson:** Ensures we use testing framework features
- Result: Comprehensive testing without custom test infrastructure

## Red Flags That Trigger Hudson

1. **Custom Scripts in package.json**

   ```json
   "scripts": {
     "custom-test": "node scripts/runTests.js"  // 🚨 Hudson: "Use Vitest!"
   }
   ```

2. **Wrapper Functions Around Framework Features**

   ```typescript
   // 🚨 Hudson: "Vitest already has this!"
   export function customTestRunner() { ... }
   ```

3. **Complex Build Orchestration**

   ```json
   "build:all": "npm run build:1 && npm run build:2 && ..."
   // 🚨 Hudson: "Use Turbo/nx/pnpm -r!"
   ```

4. **Reinventing Configuration**
   ```typescript
   // 🚨 Hudson: "Use shared presets!"
   export const customViteConfig = { ... }
   ```

## Hudson's Standard Responses

### For Testing

"Vitest has projects for multi-package testing. Playwright has fixtures for test setup. Jest has built-in mocking. Which feature do you need?"

### For Building

"Vite handles HMR, env variables, and proxying. Turbo/nx handle orchestration. What specific problem are we solving?"

### For Scripts

"pnpm has filtering (-F), recursion (-r), and workspaces. GitHub Actions has matrices. What can't these handle?"

### For Configuration

"We have shared configs in @atomiton/\*-config packages. Why do we need custom configuration?"

## Workflow Integration Points

### Stage 1: Planning & Architecture Review

- **First:** Hudson researches existing solutions
- **Then:** Voorhees simplifies the approach
- **Finally:** Michael validates architecture

### Stage 2: During Development

- Hudson monitors for custom implementations
- Immediately stops work if standard solution found
- Documents the standard approach

### Stage 3: Code Review

- Hudson audits final implementation
- Ensures no NIH crept in during development
- Validates tool usage follows best practices

## Success Metrics

- Zero custom test runners (use Vitest projects)
- Zero custom build scripts (use tool features)
- Minimal package.json scripts (leverage tool capabilities)
- No wrapper utilities around framework features
- Consistent configuration using shared presets

---

**Remember:** Hudson's job is to be the voice saying "The tool already does this" BEFORE we write code, not after.
