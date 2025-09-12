# Code Review Checklist

**PR/Task:** \***\*\*\*\*\***\_\***\*\*\*\*\***  
**Reviewer:** \***\*\*\*\*\***\_\***\*\*\*\*\***  
**Date:** \***\*\*\*\*\***\_\***\*\*\*\*\***

## 🚨 Critical (Must Pass)

### Type Safety & Build

- [ ] **NO `any` types** anywhere in the code
- [ ] `pnpm typecheck` - passes with no errors
- [ ] `pnpm lint` - passes with no errors or warnings
- [ ] `pnpm test` - all tests pass
- [ ] `pnpm build` - builds successfully

### Code Quality

- [ ] **No redundant comments** (remove one-liners that just repeat code)
- [ ] **No commented-out code** (use git history instead)
- [ ] **Files < 500 lines** (break up if larger)
- [ ] **Functions < 50 lines** (refactor if larger)

## 🍱 Bento Box Compliance

- [ ] **Single responsibility** - each file/function does ONE thing
- [ ] **No utility grab bags** - utilities are logically grouped
- [ ] **Clear boundaries** - well-defined interfaces
- [ ] **Composable** - small pieces that work together

## ⚛️ React Hooks Best Practices

- [ ] **Hooks are contracts** - hooks manage React lifecycle, not business logic
- [ ] **Logic in utils** - functional logic extracted to testable util functions
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
- Files over 500 lines
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
   pnpm typecheck && pnpm lint && pnpm test && pnpm build
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
   ✅ File Size: PASS - Largest file is 234 lines
   ⚠️  Comments: FIXED - Removed 12 redundant comments
   ```

4. **Only mark as complete when ALL checks pass**

---

_Based on [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md)_
