# Editor Package Performance Standards

## 🎯 Performance Contract

This document defines the **non-negotiable** performance standards for the @atomiton/editor package. These standards are enforced through automated tests that **MUST PASS** before any code can be pushed.

## 📊 Critical Performance Metrics

### 1. Rapid State Updates

**Context**: During node dragging, viewport panning, and zoom operations

| Metric                     | Threshold      | Rationale                                         |
| -------------------------- | -------------- | ------------------------------------------------- |
| Max re-renders during drag | ≤ 2 per update | Maintains 60fps during drag operations            |
| Max re-renders during pan  | ≤ 1 total      | Viewport changes shouldn't affect node components |
| Max re-renders during zoom | ≤ 1 per update | Zoom is isolated from other state                 |

### 2. Component Re-render Prevention

**Context**: Preventing unnecessary React re-renders through shallow comparison

| Metric                           | Threshold                   | Rationale                                                  |
| -------------------------------- | --------------------------- | ---------------------------------------------------------- |
| Min re-render prevention rate    | ≥ 80%                       | Shallow comparison must eliminate most unnecessary renders |
| Selection-only component renders | 0 for non-selection updates | Selection hooks must be perfectly isolated                 |
| Array reference reuse            | 100% when content unchanged | Shallow comparison must preserve references                |

### 3. Memory Usage

**Context**: Preventing memory leaks and excessive allocations

| Metric                               | Threshold                                 | Rationale                                  |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------ |
| Max memory growth during stress test | ≤ 10%                                     | Prevents memory leaks during long sessions |
| Max array allocations per update     | ≤ 1                                       | Minimize garbage collection pressure       |
| Reference stability                  | Unchanged arrays must keep same reference | Critical for React performance             |

### 4. Execution Performance

**Context**: Raw hook execution speed

| Metric                         | Threshold | Rationale                              |
| ------------------------------ | --------- | -------------------------------------- |
| Max hook execution time        | < 1ms     | Hooks must be lightweight              |
| Max batch update time          | < 16ms    | Maintain 60fps (16.67ms frame budget)  |
| Benchmark regression tolerance | < 5%      | Performance must not degrade over time |

## 🔧 Implementation Details

### useEditorStore Hook

Our custom `useEditorStore` wrapper provides automatic shallow comparison to prevent unnecessary re-renders:

```typescript
// ✅ GOOD - Uses shallow comparison automatically
const nodes = useEditorStore((state) => {
  return Array.from(state.nodeLookup.values()).map(
    (nodeInternal) => nodeInternal.internals.userNode as EditorNode,
  );
});

// ❌ BAD - No shallow comparison, will re-render unnecessarily
const nodes = useStore((state) => {
  // Creates new array on every state change
  return Array.from(state.nodeLookup.values());
});
```

### Key Performance Wins

1. **Shallow Comparison by Default**
   - Prevents re-renders when arrays/objects have same values but different references
   - Particularly important during viewport changes that don't affect nodes

2. **Optimized Selectors**
   - Use `Array.from()` instead of manual iteration
   - Single Map lookup for related data (e.g., node and its selection state)

3. **Proper Memoization**
   - Only memoize what actually changes
   - Avoid over-memoization of stable references

## 🧪 Testing Requirements

### Pre-Push Tests (MANDATORY)

```bash
pnpm test:pre-push
```

Runs:

- Performance contract tests (`test:performance`)
- Benchmark tests (`test:benchmark`)

### Performance Contract Tests

Located in `src/__tests__/performance/performance-contract.test.tsx`

These tests verify:

- Re-render prevention during rapid updates
- Component isolation (e.g., viewport changes don't affect node components)
- Memory usage patterns
- Hook execution speed

### Benchmark Tests

Located in `src/__tests__/benchmark/performance.bench.ts`

These tests measure:

- Hook execution speed with various data sizes (100, 1000, 10000 nodes)
- Selection operations performance
- Edge operations performance
- Batch update performance

## 📈 Monitoring Performance

### During Development

```bash
# Watch performance tests during development
pnpm test:performance:watch

# Run benchmarks to check for regressions
pnpm test:benchmark
```

### CI/CD Pipeline

Performance tests are automatically run:

- On every pull request
- Before allowing merge to main
- As part of the pre-push hook

## 🚨 What Happens When Performance Drops?

If performance tests fail:

1. **Build will fail** - CI pipeline will block the PR
2. **Push will be rejected** - Pre-push hook prevents bad code from reaching remote
3. **Investigation required** - Use benchmark comparison to identify regression source

### Common Causes of Performance Regressions

1. **Missing shallow comparison** - Forgetting to use `useEditorStore`
2. **Creating arrays in render** - Arrays/objects created during render cause re-renders
3. **Incorrect dependencies** - Including unnecessary deps in `useCallback`/`useMemo`
4. **Selector inefficiency** - Using `.filter()` or `.find()` instead of Map lookups

## 💡 Best Practices

### DO ✅

- Always use `useEditorStore` instead of raw `useStore`
- Combine related selectors to reduce Map lookups
- Use `Array.from()` for array creation
- Test performance impact of new hooks with benchmarks

### DON'T ❌

- Create new arrays/objects in render without memoization
- Add unnecessary dependencies to hooks
- Use array methods when Map lookup is available
- Over-memoize stable references

## 📝 Maintenance

This document and its associated tests are **living standards**. They should be:

- Updated when new performance requirements are identified
- Reviewed quarterly for relevance
- Enhanced with new test cases as the editor grows

**Last Updated**: 2024-01-18
**Next Review**: 2024-04-18
