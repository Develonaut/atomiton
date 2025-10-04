# Node Weight Calibration Guide

## Overview

Node weights determine how different operations contribute to overall execution
progress. This guide explains how to measure, calculate, and adjust weights to
ensure progress bars accurately reflect the work being done.

## Why Calibration Matters

Without proper weight calibration:

- ❌ Progress bar jumps irregularly (fast nodes cause big jumps, slow nodes
  barely move)
- ❌ User perception is off ("90% complete" but still 2 minutes remaining)
- ❌ Time estimates are inaccurate

With proper calibration:

- ✅ Progress bar moves smoothly and predictably
- ✅ User sees accurate representation of remaining work
- ✅ Time estimates are meaningful

## Calibration Process

### Step 1: Collect Execution Data

Run your flows with real data and collect timing information:

```bash
# Enable debug logging for execution timing
DEBUG=conductor:* pnpm dev

# Or use slowMo to observe execution patterns
# In Debug Page UI: Set slowMo to "Very Slow" (7500ms)
```

Look for log entries like:

```
Node execution completed { nodeId: 'node-1', nodeName: 'HTTP Request', duration: 2453 }
Node execution completed { nodeId: 'node-2', nodeName: 'Transform Data', duration: 127 }
Node execution completed { nodeId: 'node-3', nodeName: 'Save to File', duration: 891 }
```

### Step 2: Calculate Execution Ratios

Create a spreadsheet or table with your measurements:

| Node Type   | Avg Duration (ms) | Ratio to Baseline |
| ----------- | ----------------- | ----------------- |
| httpRequest | 2453              | 19.3x             |
| transform   | 127               | 1.0x (baseline)   |
| fileWrite   | 891               | 7.0x              |

**Choosing a baseline:**

- Pick a common, medium-speed operation (e.g., `transform`, `fileRead`)
- Calculate all other operations relative to this baseline
- This makes the math easier and weights more intuitive

### Step 3: Convert Ratios to Weights

Use the ratios to set weights, rounding to nice numbers:

```typescript
// Baseline: transform = 50 (arbitrary starting point)
transform: 50,

// httpRequest is ~19x slower than transform
// 50 × 19.3 = 965 → round to 1000 for simplicity
httpRequest: 1000,

// fileWrite is ~7x slower than transform
// 50 × 7.0 = 350 → round to 350
fileWrite: 350,
```

**Rounding guidelines:**

- < 100: Round to nearest 10 (e.g., 47 → 50)
- 100-1000: Round to nearest 50 (e.g., 347 → 350)
- > 1000: Round to nearest 100 (e.g., 1230 → 1200)

Precision doesn't matter - what matters is the **ratio** between weights.

### Step 4: Update weights.ts

Edit `/packages/@atomiton/nodes/src/graph/weights.ts`:

```typescript
export const DEFAULT_NODE_WEIGHTS: Record<string, number> = {
  // ... existing weights ...

  /** HTTP/REST API calls - measured avg: 2450ms */
  httpRequest: 1000, // Adjusted from 500 based on real data

  /** Data transformation - baseline operation */
  transform: 50,

  /** File write - measured avg: 890ms */
  fileWrite: 350, // Adjusted from 200 based on real data
};
```

**Important:** Add a comment explaining the adjustment so future maintainers
understand the reasoning.

### Step 5: Test Progress Distribution

Run a test flow with the new weights and verify progress feels accurate:

```typescript
// Example test flow: 3 operations
// - httpRequest (weight=1000) → should contribute ~74% of total progress
// - transform (weight=50)      → should contribute ~4% of total progress
// - fileWrite (weight=350)     → should contribute ~22% of total progress
// Total weight = 1000 + 50 + 350 = 1400

// Expected progress distribution:
// 0% → 74% (httpRequest completes)
// 74% → 78% (transform completes)
// 78% → 100% (fileWrite completes)
```

Use the Debug Page execution trace to verify:

```json
{
  "timestamp": "10:23:45.123",
  "progress": 74,
  "message": "Executing: Transform Data"
}
```

If the actual progress doesn't match expected distribution:

- Double-check your duration measurements
- Verify the weight calculations
- Consider if the operation varies significantly (e.g., file size dependent)

## Advanced Calibration

### Handling Variable Operations

Some operations have variable execution times (e.g., `httpRequest` depends on
network, `database` depends on query):

**Option 1: Use Average Case**

```typescript
// Most HTTP requests take 500-2000ms
// Average: ~1000ms
httpRequest: 1000,
```

**Option 2: Use Pessimistic Case**

```typescript
// Slow network could take 5000ms
// Use pessimistic estimate for better UX (progress moves faster than expected)
httpRequest: 2000,
```

**Option 3: Make Weights Configurable**

```typescript
// Allow users to tune weights per environment
const weights = {
  ...DEFAULT_NODE_WEIGHTS,
  ...(config.customWeights || {}),
};
```

### Calibrating Group Nodes

Group nodes (nodes with children) inherit weights from their children:

```typescript
// Group weight = sum of child weights
// If group contains: httpRequest(1000) + transform(50) + fileWrite(350)
// Effective weight = 1400
```

No special calibration needed - group weights are automatically calculated.

### Calibrating Loop Nodes

Loop iteration count affects weight:

```typescript
// Base loop overhead
loop: 20,

// But actual weight = iterations × child_weight
// If looping 10 times over transform(50):
// Effective weight = 10 × 50 = 500
```

Current limitation: We don't yet support dynamic weight adjustment for loops.
Use conservative loop overhead weight.

## Common Pitfalls

### ❌ Pitfall 1: Using Milliseconds as Weights

```typescript
// DON'T: Copying exact durations
httpRequest: 2453,  // Too precise, hard to reason about
transform: 127,
fileWrite: 891,
```

**Why it's wrong:** Weights are ratios, not durations. Use simple, round
numbers.

✅ **Better:**

```typescript
httpRequest: 2500,  // ~20x transform
transform: 100,     // baseline
fileWrite: 900,     // ~9x transform
```

### ❌ Pitfall 2: Not Testing Edge Cases

Only testing with "typical" flows can hide weight issues.

**Test these scenarios:**

- All fast operations (should still show incremental progress)
- All slow operations (should still complete in reasonable time)
- Single slow operation (should show majority of progress when it completes)
- Mixed fast/slow (progress should feel smooth, not jumpy)

### ❌ Pitfall 3: Over-Optimizing

Don't spend hours tuning weights to perfection.

**Good enough:**

- Progress moves smoothly
- No huge jumps (e.g., 10% → 90%)
- Roughly matches user perception of work

**Perfect (but not worth the effort):**

- Progress exactly matches wall-clock time
- All operations measured to millisecond precision

## Monitoring & Maintenance

### When to Re-Calibrate

Recalibrate weights when:

- Adding new node types (measure and add weights)
- Infrastructure changes (e.g., faster servers, different network)
- User feedback (e.g., "progress bar is jumpy")
- Major refactoring of node executors

### Telemetry (Future Enhancement)

Consider adding automatic weight calibration:

```typescript
// Automatically track actual execution times
// and suggest weight adjustments

const telemetry = {
  httpRequest: {
    samples: 1523,
    avgDuration: 2341,
    suggestedWeight: 1200, // vs current 1000
    confidence: 0.95,
  },
};
```

This could be a future enhancement to make calibration data-driven.

## Example: Full Calibration Session

Let's walk through calibrating a real flow:

### 1. Baseline Measurements

```
Flow: User Registration
├─ validate-email (transform)     →  45ms
├─ check-duplicate (database)     → 234ms
├─ hash-password (transform)      →  67ms
├─ create-user (database)         → 312ms
└─ send-welcome-email (email)     → 1892ms
```

### 2. Calculate Ratios (baseline = transform @ 50)

```
validate-email:   45ms  → 1.0x  → weight = 50
check-duplicate:  234ms → 5.2x  → weight = 260
hash-password:    67ms  → 1.5x  → weight = 75
create-user:      312ms → 6.9x  → weight = 345
send-welcome:     1892ms→ 42.0x → weight = 2100
```

### 3. Update Weights

```typescript
export const DEFAULT_NODE_WEIGHTS: Record<string, number> = {
  transform: 50, // baseline
  database: 300, // avg of check-duplicate(260) and create-user(345)
  email: 2100, // measured from send-welcome
};
```

### 4. Verify Progress Distribution

```
Total weight = 50 + 260 + 75 + 345 + 2100 = 2830

Expected progress:
0%   → 1.8%  (validate-email: 50/2830)
1.8% → 11.0% (check-duplicate: 260/2830)
11%  → 13.6% (hash-password: 75/2830)
13.6%→ 25.8% (create-user: 345/2830)
25.8%→ 100%  (send-welcome: 2100/2830 = 74.2%)
```

### 5. Test & Confirm

Run the flow with slowMo and verify the progress bar matches expectations. The
email operation should dominate the progress (74% of total).

---

## Summary

**Key Takeaways:**

1. Weights are **ratios**, not absolute durations
2. Measure real execution times, calculate ratios, round to nice numbers
3. Document your reasoning when adjusting weights
4. Test with diverse flows to verify progress feels accurate
5. Re-calibrate when infrastructure or operations change

**Remember:** Perfect is the enemy of good. Aim for "progress feels smooth and
accurate" not "progress is mathematically perfect."
