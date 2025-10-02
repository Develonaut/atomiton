# Parallel Node

## Overview

The Parallel Node executes multiple operations simultaneously with advanced
control over concurrency, timeout, and error handling. It provides three
execution strategies for different use cases.

## Purpose

Parallel nodes are essential for:

- Running independent operations concurrently
- Improving workflow performance
- Coordinating multiple async operations
- Race conditions and timeouts
- Batch processing with concurrency control

## Execution Strategies

### all (Promise.all)

Wait for all operations to complete. Fails if any operation fails.

**Use case**: All operations must succeed, order doesn't matter

### race (Promise.race)

Return result from first operation to complete (success or failure).

**Use case**: Fastest wins, redundant operations, timeout patterns

### allSettled (Promise.allSettled)

Wait for all operations to complete, regardless of success/failure.

**Use case**: Best effort, collect all results, continue on errors

## Parameters

### Core Parameters

| Parameter          | Type    | Default      | Description                                |
| ------------------ | ------- | ------------ | ------------------------------------------ |
| `strategy`         | enum    | "allSettled" | Execution strategy (all, race, allSettled) |
| `concurrency`      | number  | 5            | Maximum concurrent operations (1-50)       |
| `operationTimeout` | number  | 30000        | Timeout per operation in milliseconds      |
| `globalTimeout`    | number  | 120000       | Timeout for all operations in milliseconds |
| `failFast`         | boolean | false        | Stop all operations on first error         |
| `maintainOrder`    | boolean | true         | Maintain input order in results            |

### Common Parameters

| Parameter     | Type    | Default | Description             |
| ------------- | ------- | ------- | ----------------------- |
| `enabled`     | boolean | true    | Whether node executes   |
| `label`       | string  | -       | Custom node label       |
| `description` | string  | -       | Custom node description |

## Input/Output

### Input Ports

| Port         | Type  | Required | Description                            |
| ------------ | ----- | -------- | -------------------------------------- |
| `operations` | array | Yes      | Array of operations to run in parallel |

### Output Ports

| Port      | Type  | Description                |
| --------- | ----- | -------------------------- |
| `results` | array | Array of operation results |

## Use Cases

### 1. Multiple API Calls

Fetch from multiple sources simultaneously:

```javascript
{
  type: "parallel",
  parameters: {
    strategy: "allSettled",
    concurrency: 5,
    operationTimeout: 10000
  },
  nodes: [
    { type: "http-request", parameters: { url: "api1.com/data" } },
    { type: "http-request", parameters: { url: "api2.com/data" } },
    { type: "http-request", parameters: { url: "api3.com/data" } }
  ]
}
```

### 2. Race Pattern

Get fastest response:

```javascript
{
  type: "parallel",
  parameters: {
    strategy: "race",
    concurrency: 3,
    globalTimeout: 5000
  },
  nodes: [
    { type: "http-request", parameters: { url: "mirror1.com" } },
    { type: "http-request", parameters: { url: "mirror2.com" } },
    { type: "http-request", parameters: { url: "mirror3.com" } }
  ]
}
```

### 3. Batch File Processing

Process files concurrently with limit:

```javascript
{
  type: "parallel",
  parameters: {
    strategy: "allSettled",
    concurrency: 10,
    operationTimeout: 30000,
    maintainOrder: false
  },
  nodes: [
    // 100 file operations, but only 10 run concurrently
  ]
}
```

## Strategies in Detail

### all Strategy

```javascript
strategy: "all";
// Behavior:
// - Waits for all operations
// - Fails immediately if any fails
// - Returns all results in order
// - Best for: All must succeed
```

### race Strategy

```javascript
strategy: "race";
// Behavior:
// - Returns first to complete
// - Cancels remaining operations
// - Can return success or error
// - Best for: Fastest wins
```

### allSettled Strategy

```javascript
strategy: "allSettled";
// Behavior:
// - Waits for all operations
// - Never fails (collects all outcomes)
// - Returns { status, value/reason } for each
// - Best for: Best effort execution
```

## Common Patterns

### Fan-Out Processing

```
Parallel → Multiple independent operations → Merge results
```

### Timeout with Fallback

```
Parallel (race) → [Operation | Timeout] → Use fastest
```

### Resilient Batch Processing

```
Parallel (allSettled) → Filter successes → Process → Log failures
```

## Best Practices

### Performance

- **Set appropriate concurrency** - Balance speed vs resources
- **Use race for redundancy** - Fastest source wins
- **Batch large operations** - Don't overwhelm system
- **Monitor resource usage** - Watch CPU, memory, network

### Error Handling

- **Use allSettled** - When partial success acceptable
- **Use all** - When all must succeed
- **Set operation timeouts** - Prevent hanging operations
- **Handle individual failures** - Process results appropriately

### Concurrency Control

- **Limit concurrent operations** - Prevent resource exhaustion
- **Consider rate limits** - Respect external API limits
- **Adjust based on workload** - Tune concurrency for your data
- **Test under load** - Verify performance at scale

## Technical Notes

### Concurrency Model

- When `concurrency: 5` and 20 operations:
  - 5 operations start immediately
  - As each completes, next operation starts
  - Total time ~= longest 4 batches of 5

### Result Format (allSettled)

```javascript
[
  { status: "fulfilled", value: result1 },
  { status: "rejected", reason: error1 },
  { status: "fulfilled", value: result2 },
];
```

### Timeout Behavior

- **operationTimeout**: Per operation, restarts for each
- **globalTimeout**: Total time for all operations
- Either timeout triggers cancellation

### Order Preservation

- **maintainOrder: true**: Results match input order (default)
- **maintainOrder: false**: Results in completion order (faster)

## Examples

### Example 1: Multi-Source Data Aggregation

```javascript
{
  type: "parallel",
  parameters: {
    strategy: "allSettled",
    concurrency: 3,
    operationTimeout: 15000,
    globalTimeout: 30000
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://api1.example.com/data",
        auth: { type: "bearer", token: "{{$token}}" }
      }
    },
    {
      type: "http-request",
      parameters: { url: "https://api2.example.com/data" }
    },
    {
      type: "file-system",
      parameters: {
        operation: "read",
        path: "/data/local.json"
      }
    }
  ]
}
// Chain with Transform to merge results:
// Transform → Filter successful → Merge data
```

### Example 2: Fastest Response Wins

```javascript
{
  type: "parallel",
  parameters: {
    strategy: "race",
    concurrency: 5,
    globalTimeout: 5000
  },
  nodes: [
    { type: "http-request", parameters: { url: "https://cdn1.example.com/data" } },
    { type: "http-request", parameters: { url: "https://cdn2.example.com/data" } },
    { type: "http-request", parameters: { url: "https://cdn3.example.com/data" } },
    { type: "http-request", parameters: { url: "https://cdn4.example.com/data" } },
    { type: "http-request", parameters: { url: "https://cdn5.example.com/data" } }
  ]
}
```

### Example 3: Controlled Batch Processing

```javascript
{
  type: "parallel",
  parameters: {
    strategy: "allSettled",
    concurrency: 20,  // Process 20 files at a time
    operationTimeout: 60000,
    globalTimeout: 600000,  // 10 min total
    maintainOrder: false  // Faster, order doesn't matter
  },
  nodes: [
    // Array of 500 file operations
    // Only 20 run concurrently
    // Results processed as they complete
  ]
}
```

## Related Nodes

- **Loop Node** - Sequential or parallel iteration
- **Group Node** - Container with parallel option
- **HTTP Request Node** - Often used in parallel
- **Transform Node** - Process parallel results

## Migration Notes

The Parallel node is distinct from Loop node's parallel execution:

- **Parallel Node**: Fixed set of operations, advanced strategies
- **Loop Node (parallel: true)**: Iterate array with parallelization

Choose Parallel when:

- You have different operations (not iteration)
- You need race or fine-grained control
- Operations are known at design time

Choose Loop when:

- Iterating over dynamic data
- Same operation for each item
- forEach/while/times patterns
