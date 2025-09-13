# Performance Benchmarks

This folder contains performance benchmarks for the @atomiton/nodes package using Vitest's benchmarking capabilities.

## Folder Structure

```
__benchmarks__/
├── README.md                      # This file
├── PERFORMANCE_REPORT.md          # Latest performance optimization report
├── lazy-loading.bench.ts          # Benchmarks for lazy loading system
└── composite-execution.bench.ts   # Benchmarks for composite node execution
```

## Naming Convention

- **Folder**: `__benchmarks__` (double underscore prefix indicates tooling/testing folders)
- **Files**: `*.bench.ts` for benchmark test files
- **Reports**: `*_REPORT.md` for performance analysis documentation

## Running Benchmarks

```bash
# Run all benchmarks
pnpm test:benchmark

# Run specific benchmark file
pnpm vitest bench lazy-loading.bench.ts

# Run with detailed output
pnpm vitest bench --reporter=verbose
```

## Available Benchmarks

### Lazy Loading Performance (`lazy-loading.bench.ts`)

Tests the performance of the lazy loading system:

- Node metadata access without loading
- Dynamic import performance (first load vs cached)
- Parallel vs sequential loading
- Search and filtering without loading nodes

### Composite Execution Performance (`composite-execution.bench.ts`)

Tests composite node execution at scale:

- Execution with 10, 50, and 100 nodes
- Validation performance with large graphs
- Edge traversal algorithms
- Memory usage patterns

## Writing New Benchmarks

Follow this template for new benchmark files:

```typescript
/**
 * Benchmark for [feature name]
 */

import { describe, bench } from "vitest";

describe("[Feature] Performance", () => {
  bench("operation name", () => {
    // Code to benchmark
  });

  bench("async operation", async () => {
    // Async code to benchmark
  });
});
```

## Performance Targets

Based on our benchmarks, these are the performance targets:

| Operation                    | Target        | Current         |
| ---------------------------- | ------------- | --------------- |
| Node metadata access         | >20M ops/sec  | 24M ops/sec ✅  |
| Single node load (first)     | >1M ops/sec   | 1.9M ops/sec ✅ |
| Single node load (cached)    | >1M ops/sec   | 1.8M ops/sec ✅ |
| 100-node composite execution | >100K ops/sec | 159K ops/sec ✅ |
| Edge traversal (100 nodes)   | >50K ops/sec  | 97K ops/sec ✅  |

## Benchmark Results Interpretation

The benchmark output includes:

- **hz**: Operations per second
- **min/max**: Minimum and maximum execution time
- **mean**: Average execution time
- **p75/p99/p995/p999**: Percentile latencies
- **rme**: Relative margin of error
- **samples**: Number of samples collected

## Continuous Performance Monitoring

To prevent performance regressions:

1. Run benchmarks before major changes
2. Compare results with baseline in `PERFORMANCE_REPORT.md`
3. Investigate any regression >10%
4. Update the report after optimizations

## Related Documentation

- [Testing Strategy](../../../docs/development/TESTING.md)
- [Performance Report](./PERFORMANCE_REPORT.md)
- [Bundle Size Analysis](../dist/stats.html) (generated after build)
