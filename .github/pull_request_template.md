## Description

<!-- Provide a brief description of the changes -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to
      not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)

## Pre-Submission Checklist

### 🚨 Critical Requirements

- [ ] **NO `any` types** in the code
- [ ] `pnpm typecheck` passes without errors
- [ ] `pnpm lint` passes without warnings
- [ ] `pnpm test` all tests pass
- [ ] `pnpm build` succeeds

### 📝 Code Quality

- [ ] Removed all redundant/obvious comments
- [ ] No commented-out code
- [ ] All files < 500 lines
- [ ] All functions < 50 lines
- [ ] Follows [Bento Box Principles](../docs/BENTO_BOX_PRINCIPLES.md)

### 🧪 Testing

- [ ] Added tests for new functionality
- [ ] All existing tests still pass
- [ ] Edge cases covered

### 📚 Documentation

- [ ] Updated relevant documentation
- [ ] Added JSDoc for public APIs
- [ ] Updated README if needed

## Screenshots/Recordings

<!-- If applicable, add screenshots or recordings to help explain your changes -->

## Breaking Changes

<!-- List any breaking changes and migration instructions -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Review Checklist

_For reviewers: See [Code Review Guidelines](../docs/CODE_REVIEW_GUIDELINES.md)_

---

**Reminder:** This PR should be ready to ship to production without additional
work.
