# E2E User Journey Tests

## 🎯 Purpose

These E2E tests simulate **real user journeys** through the application. Each
test file represents a specific user persona completing a critical workflow.

**If any of these tests fail, it indicates that a critical user flow is
broken.**

## 📝 Naming Convention

All E2E tests follow this pattern:

```
user-journey-[action-or-goal].spec.ts
```

Examples:

- `user-journey-template-to-editor.spec.ts` - User selecting a template and
  editing it
- `user-journey-flow-creation.spec.ts` - User creating a new flow from
  scratch
- `user-journey-homepage-navigation.spec.ts` - First-time user exploring the app
- `user-journey-editor-node-connections.spec.ts` - User connecting nodes in the
  editor

## 👥 User Personas & Journeys

### 1. **First-Time User** (`user-journey-homepage-navigation.spec.ts`)

- Lands on homepage
- Explores navigation options
- Discovers features
- **Critical Flow**: App discovery and onboarding

### 2. **Template User** (`user-journey-template-to-editor.spec.ts`)

- Browses available templates
- Selects a template
- Opens it in editor
- Makes modifications
- **Critical Flow**: Template selection → Editor workflow

### 3. **Flow Creator** (`user-journey-flow-creation.spec.ts`)

- Creates new flow
- Adds nodes
- Configures connections
- Saves flow
- **Critical Flow**: Complete flow creation workflow

### 4. **Power User** (`user-journey-editor-node-connections.spec.ts`)

- Opens editor
- Adds multiple nodes
- Creates complex connections
- Tests advanced features
- **Critical Flow**: Advanced editor operations

### 5. **Developer** (`user-journey-debug-mode-activation.spec.ts`)

- Enables debug mode
- Inspects node states
- Views console output
- **Critical Flow**: Debugging and troubleshooting

## 🚨 When Tests Fail

A failing user journey test means:

1. **Immediate Action Required** - A critical user flow is broken
2. **User Impact** - Real users cannot complete this workflow
3. **Priority Fix** - Should be treated as P0/P1 issue

## 💡 Writing New User Journey Tests

When adding new tests, ask yourself:

1. **Who is the user?** (persona)
2. **What are they trying to accomplish?** (goal)
3. **What is the happy path?** (steps)
4. **What would prevent success?** (failure points)

Example structure:

```typescript
test.describe("User Journey: [Persona] [Goal]", () => {
  test("[User action verb] and [expected outcome]", async ({ page }) => {
    // Step 1: User arrives
    await page.goto("/");

    // Step 2: User performs action
    await page.click("...");

    // Step 3: Verify outcome
    await expect(...).toBeVisible();

    // Step 4: Continue journey...
  });
});
```

## 🔄 Test Execution

### Run all user journey tests:

```bash
pnpm test:e2e
```

### Run specific journey:

```bash
pnpm test:e2e user-journey-template
```

### Debug mode (headed):

```bash
pnpm test:e2e --headed
```

## 📊 Coverage Goals

We aim to cover:

- **100%** of critical user flows
- **90%** of common user paths
- **70%** of edge cases

If a user reports an issue, it should be added as a user journey test to prevent
regression.
