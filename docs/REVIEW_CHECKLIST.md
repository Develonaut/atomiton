## 🚨 Critical (Must Pass)

### Type Safety & Build

- [ ] **NO `any` types** anywhere in the code
- [ ] `pnpm typecheck` - passes with no errors
- [ ] `pnpm lint` - passes with no errors or warnings
- [ ] `pnpm test` - all tests pass
- [ ] `pnpm test:integration` - all integration tests pass
- [ ] `pnpm test:bench` - all benchmark tests pass
- [ ] `pnpm build` - builds successfully
- [ ] `pnpm dev` - development servers start without errors

### Code Quality

- [ ] **No redundant or unnecessary comments** (remove one-liners that just repeat code or don't add value)
- [ ] **No jsdocs for functions (unless public API or complex logic)** (use self-documenting code instead)
- [ ] **No commented-out code** (use git history instead)
- [ ] **No barreling for non component files** (import directly)
- [ ] **Files < ~250 lines** (break up if larger)
- [ ] **Functions < 20 lines** (refactor if larger)
- [ ] **Meaningful test written for new code** (not just coverage)

## 🍱 Bento Box Compliance

- [ ] **Single responsibility** - each file/function does ONE thing
- [ ] **No utility grab bags** - utilities are logically grouped
- [ ] **Clear boundaries** - well-defined interfaces
- [ ] **Composable** - small pieces that work together

## ⚛️ React Components & Hooks

### Component Architecture (Bento Box Compliance)

- [ ] **Components are UI only** - components focus on rendering and user interaction
- [ ] **No business logic in components** - complex logic lives in hooks or store actions
- [ ] **No large useEffects** - if useEffect is complex, extract to custom hook
- [ ] **No inline handlers with logic** - handlers should call hook functions or actions
- [ ] **Composable structure** - components composed of smaller, focused components
- [ ] **Performance conscious** - avoid unnecessary re-renders, use memoization where needed
- [ ] **Handlers delegate** - event handlers call hook functions, not implement logic
- [ ] **Handler Naming** - use names that match the event and start with the word "handle" (e.g. `handleOnClick`, `handleOnChange`)

### Hook Best Practices

- [ ] **Hooks are contracts** - hooks manage React lifecycle, not business logic
- [ ] **Logic in utils/stores** - functional logic extracted to testable util functions or store actions
- [ ] **Clear I/O** - util functions have predictable inputs/outputs
- [ ] **Minimal hook logic** - hooks only handle state, effects, and calling utils
- [ ] **Testable functions** - business logic can be tested without React

## 📋 Additional Checks

### Testing

- [ ] New code has tests
- [ ] Edge cases covered
- [ ] Tests are meaningful (not just coverage)

### Documentation

- [ ] Public APIs have JSDoc comments
- [ ] Complex logic is explained
- [ ] README updated if API changed
- [ ] CHANGELOG updated if needed
- [ ] Outstanding relating items in docs are removed or moved to reflect completion.

### Security

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Error messages don't leak sensitive info

## 🎯 Quick Scan Areas

### Common Issues Found

- [ ] Check for `console.log` statements
- [ ] Verify no TODO comments without tickets
- [ ] Ensure consistent error handling
- [ ] Verify proper async/await usage
- [ ] Check for proper cleanup (subscriptions, timers)

### Performance

- [ ] No unnecessary re-renders (React)
- [ ] Proper memoization where needed
- [ ] No memory leaks
- [ ] Efficient algorithms for data processing

## ✅ Approval Criteria

**Can approve when:**

- All items in "Critical" section are checked
- Bento Box principles are followed
- No unresolved discussions
- Changes match PR description

**Request changes if:**

- Any `any` types present
- Build/lint/test failures
- pnpm dev fails
- Tests are failing or missing
- Significant code quality issues
- Files over or around 250 lines
- Significant redundant comments
- Security concerns

## 📝 Review Notes

**Things that went well:**

```
-
-
-
```

**Areas for improvement:**

```
-
-
-
```

**Follow-up items:**

```
-
-
-
```

---

## For AI Agents

When using this checklist, agents should:

1. **Run all commands first:**

   ```bash
   pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm dev
   ```

2. **Auto-fix before marking complete:**
   - Remove all `any` types
   - Delete redundant comments
   - Break up large files
   - Fix all lint warnings

3. **Report status:**

   ```
   ✅ Type Safety: PASS - No any types found
   ✅ Lint: PASS - No errors or warnings
   ✅ Tests: PASS - All 47 tests passing
   ✅ Build: PASS - Built in 2.3s
   ✅ Dev: PASS - All development servers start successfully
   ✅ File Size: PASS - Largest file is 234 lines
   ⚠️  Comments: FIXED - Removed 12 redundant comments
   ```

4. **Only mark as complete when ALL checks pass**

---

_Based on [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md)_
