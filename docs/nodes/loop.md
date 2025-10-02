# Loop Node

## Overview

The Loop Node enables iteration over data collections and repeated execution of
child nodes. It supports multiple loop strategies including forEach, times, and
while loops, with control over batch processing, error handling, and
parallelization.

## Purpose

Loop nodes are essential for:

- Iterating over arrays and collections
- Repeated execution of workflows
- Batch processing of data
- Conditional iteration
- Data aggregation and accumulation
- Parallel processing of items

## Loop Types

### forEach

Iterate over each item in an array

**Use case**: Process array elements, transform collections

### times

Execute a specific number of times

**Use case**: Generate sequences, repeat operations N times

### while

Execute while a condition is true

**Use case**: Conditional iteration, dynamic loops

## Parameters

### Core Parameters

| Parameter   | Type   | Default   | Description                                         |
| ----------- | ------ | --------- | --------------------------------------------------- |
| `loopType`  | enum   | "forEach" | **Required**. Loop strategy (forEach, times, while) |
| `array`     | array  | []        | Array to iterate (forEach only)                     |
| `count`     | number | 10        | Number of iterations (times only)                   |
| `condition` | string | "false"   | JavaScript condition (while only)                   |

### Control Parameters

| Parameter         | Type    | Default | Description                             |
| ----------------- | ------- | ------- | --------------------------------------- |
| `batchSize`       | number  | 1       | Process items in batches of this size   |
| `maxIterations`   | number  | 1000    | Safety limit on total iterations        |
| `delay`           | number  | 0       | Delay between iterations (milliseconds) |
| `continueOnError` | boolean | false   | Continue iterating if an item fails     |
| `collectResults`  | boolean | true    | Collect results from each iteration     |

### Parallel Execution

| Parameter     | Type    | Default | Description                             |
| ------------- | ------- | ------- | --------------------------------------- |
| `parallel`    | boolean | false   | Execute iterations in parallel          |
| `concurrency` | number  | 1       | Max concurrent iterations (if parallel) |

### Range Parameters (times loop)

| Parameter    | Type   | Default | Description             |
| ------------ | ------ | ------- | ----------------------- |
| `startValue` | number | 0       | Starting value          |
| `endValue`   | number | 10      | Ending value            |
| `stepSize`   | number | 1       | Increment per iteration |

### Common Parameters (All Nodes)

| Parameter     | Type    | Default | Description                 |
| ------------- | ------- | ------- | --------------------------- |
| `enabled`     | boolean | true    | Whether node executes       |
| `timeout`     | number  | 30000   | Maximum execution time (ms) |
| `retries`     | number  | 1       | Retry attempts on failure   |
| `label`       | string  | -       | Custom node label           |
| `description` | string  | -       | Custom node description     |

## Input/Output

### Input Ports

| Port        | Type   | Required    | Description                       |
| ----------- | ------ | ----------- | --------------------------------- |
| `array`     | array  | Conditional | Array to iterate (forEach only)   |
| `condition` | string | Conditional | Condition expression (while only) |

### Output Ports

| Port             | Type    | Description                          |
| ---------------- | ------- | ------------------------------------ |
| `result`         | object  | Complete loop result with metadata   |
| `results`        | array   | Array of results from each iteration |
| `iterationCount` | number  | Total iterations completed           |
| `errors`         | array   | Array of errors encountered          |
| `success`        | boolean | Whether all iterations succeeded     |
| `duration`       | number  | Total loop execution time (ms)       |

### Result Object Structure

```javascript
{
  result: {
    results: [],      // Array of iteration results
    iterationCount: 5, // Number of iterations
    errors: [],       // Errors encountered
    success: true,    // All succeeded
    duration: 1234,   // Execution time
    completed: true,  // Loop finished
    stopped: false    // Loop stopped early
  },
  results: [],        // Alias for result.results
  iterationCount: 5,  // Alias
  errors: [],         // Alias
  success: true,      // Alias
  duration: 1234      // Alias
}
```

## Loop Types in Detail

### forEach Loop

Iterate over each element in an array:

```javascript
{
  loopType: "forEach",
  array: [1, 2, 3, 4, 5],
  collectResults: true
}
// Executes child nodes for each item
// Current item available as $item
// Index available as $index
```

**Use cases**:

- Process each record in a dataset
- Transform array elements
- Validate multiple items
- Batch operations on collections

### times Loop

Execute a specific number of times:

```javascript
{
  loopType: "times",
  count: 10,
  startValue: 0,
  endValue: 10,
  stepSize: 1
}
// Executes child nodes 10 times
// Current value available as $iteration
// Index available as $index
```

**Use cases**:

- Generate sequences
- Repeat operation N times
- Create test data
- Polling with retry limit

### while Loop

Execute while a condition is true:

```javascript
{
  loopType: "while",
  condition: "iteration < 100",
  maxIterations: 1000
}
// Executes while condition is true
// Current iteration available as $iteration
// Safely limited by maxIterations
```

**Use cases**:

- Conditional iteration
- Dynamic loops
- Process until condition met
- Polling operations

## Iteration Context

Each iteration has access to special variables:

| Variable     | Type   | Description                        |
| ------------ | ------ | ---------------------------------- |
| `$item`      | any    | Current array item (forEach only)  |
| `$index`     | number | Current iteration index (0-based)  |
| `$iteration` | number | Current iteration number (1-based) |
| `$results`   | array  | Results collected so far           |
| `$errors`    | array  | Errors encountered so far          |

## Use Cases

### 1. Process Array of Items

```javascript
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" }
    ],
    continueOnError: true
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://api.example.com/items/{{$item.id}}",
        method: "POST",
        body: "{{$item}}"
      }
    }
  ]
}
```

### 2. Batch Processing

```javascript
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$largeDataset}}",
    batchSize: 50,
    parallel: true,
    concurrency: 5,
    continueOnError: true
  }
}
```

### 3. Retry with Backoff

```javascript
{
  type: "loop",
  parameters: {
    loopType: "times",
    count: 5,
    delay: 1000,  // 1 second between retries
    continueOnError: true
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://flaky-api.example.com/data"
      }
    }
  ]
}
```

### 4. Polling Operation

```javascript
{
  type: "loop",
  parameters: {
    loopType: "while",
    condition: "$results[$results.length - 1]?.status !== 'complete'",
    maxIterations: 60,
    delay: 5000,  // Poll every 5 seconds
    collectResults: true
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://api.example.com/job/{{$jobId}}/status"
      }
    }
  ]
}
```

### 5. Generate Test Data

```javascript
{
  type: "loop",
  parameters: {
    loopType: "times",
    count: 100,
    startValue: 1,
    endValue: 101,
    stepSize: 1
  },
  nodes: [
    {
      type: "edit-fields",
      parameters: {
        values: {
          id: "{{$iteration}}",
          name: "User {{$iteration}}",
          email: "user{{$iteration}}@example.com"
        }
      }
    }
  ]
}
```

## Common Patterns

### Map Pattern

```
Loop (forEach) → Transform → Collect Results
```

Transform each item in an array.

### Filter Pattern

```
Loop (forEach) → Conditional → Process if match
```

Process only items that match criteria.

### Reduce Pattern

```
Loop (forEach) → Aggregate → Accumulate
```

Reduce array to single value.

### Batch Pattern

```
Loop (forEach, batchSize: 50) → Process Batch → Collect
```

Process items in batches for efficiency.

### Retry Pattern

```
Loop (times: 3, delay: 1000) → Attempt → Break on success
```

Retry operation with backoff.

### Polling Pattern

```
Loop (while: condition) → Check Status → Continue/Break
```

Poll until condition met.

## Best Practices

### Performance

- **Use batching** - Process items in batches for large datasets
- **Enable parallelization** - Use parallel mode for independent operations
- **Set appropriate concurrency** - Balance speed and resource usage
- **Limit iterations** - Always set maxIterations for while loops
- **Collect selectively** - Disable collectResults if not needed

### Error Handling

- **Use continueOnError** - Don't fail entire loop for one item
- **Log errors** - Track which items failed
- **Implement retry logic** - Retry failed items
- **Validate inputs** - Check array/condition before looping
- **Handle edge cases** - Empty arrays, null items, etc.

### Memory Management

- **Process in batches** - Don't load entire result set in memory
- **Disable collection** - Set collectResults: false for large loops
- **Stream when possible** - Consider streaming for very large datasets
- **Clean up resources** - Release resources after each iteration
- **Monitor memory** - Watch memory usage with large loops

### Loop Design

- **Keep iterations small** - Each iteration should be quick
- **Make iterations idempotent** - Safe to retry
- **Avoid nested loops** - Consider alternative patterns
- **Use appropriate delay** - Balance speed and rate limits
- **Document loop purpose** - Clarify what loop accomplishes

### Conditions (while loops)

- **Keep conditions simple** - Easy to understand and debug
- **Avoid infinite loops** - Always set maxIterations
- **Use clear break conditions** - Make exit conditions obvious
- **Handle edge cases** - Consider empty results, nulls
- **Test thoroughly** - Verify condition logic before production

## Technical Notes

### Execution Model

- **Sequential**: Iterations execute one after another
- **Parallel**: Multiple iterations execute simultaneously
- **Batch**: Items grouped and processed together

### Concurrency

- When `parallel: true` and `concurrency: 5`:
  - Max 5 iterations run simultaneously
  - New iterations start as others complete
  - Results collected and ordered

### Batch Processing

- When `batchSize: 50`:
  - Array split into chunks of 50
  - Each batch processed together
  - Useful for database operations, API calls

### Safety Limits

- **maxIterations**: Prevents runaway loops (default 1000)
- **timeout**: Overall loop timeout
- **Individual timeouts**: Each child node has own timeout

### Performance Characteristics

- **Sequential forEach**: O(n) time
- **Parallel forEach**: O(n/concurrency) time (roughly)
- **Memory**: O(n) if collecting results, O(1) otherwise
- **Overhead**: Minimal per iteration (< 1ms typically)

## Error Scenarios

### Array Not Provided

```javascript
{
  error: "Array is required for forEach loop",
  loopType: "forEach"
}
```

### Max Iterations Exceeded

```javascript
{
  error: "Max iterations exceeded",
  maxIterations: 1000,
  stopped: true
}
```

### Child Node Failure

```javascript
{
  success: false,
  errors: [
    {
      iteration: 5,
      error: "HTTP request failed",
      item: { id: 5 }
    }
  ],
  iterationCount: 10
}
```

### Timeout

```javascript
{
  error: "Loop timeout exceeded",
  timeout: 30000,
  iterationCount: 15,  // Completed 15 before timeout
  stopped: true
}
```

## Examples

### Example 1: Process API Paginated Results

```javascript
{
  type: "loop",
  parameters: {
    loopType: "while",
    condition: "$results[$results.length - 1]?.hasMore === true",
    maxIterations: 100,
    collectResults: true
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://api.example.com/data",
        params: {
          page: "{{$iteration}}",
          limit: "50"
        }
      }
    }
  ]
}
```

### Example 2: Parallel File Processing

```javascript
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$fileList}}",
    parallel: true,
    concurrency: 10,
    continueOnError: true,
    collectResults: true
  },
  nodes: [
    {
      type: "file-system",
      parameters: {
        operation: "read",
        path: "{{$item}}"
      }
    },
    {
      type: "transform",
      parameters: {
        operation: "map",
        transformFunction: "item => processData(item)"
      }
    },
    {
      type: "file-system",
      parameters: {
        operation: "write",
        path: "/output/{{$item}}"
      }
    }
  ]
}
```

### Example 3: Rate-Limited API Calls

```javascript
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$userIds}}",
    delay: 200,  // 5 requests per second
    continueOnError: true,
    batchSize: 1,
    parallel: false
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://api.example.com/users/{{$item}}",
        method: "GET"
      }
    }
  ]
}
```

### Example 4: Conditional Processing

```javascript
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$records}}",
    continueOnError: true
  },
  nodes: [
    {
      type: "group",
      nodes: [
        // Conditional logic based on $item properties
        {
          type: "transform",
          parameters: {
            operation: "filter",
            transformFunction: "item => item.status === 'active'"
          }
        },
        {
          type: "http-request",
          parameters: {
            url: "https://api.example.com/process",
            method: "POST",
            body: "{{$item}}"
          }
        }
      ]
    }
  ]
}
```

## Related Nodes

- **Parallel Node** - Specialized parallel execution without iteration
- **Transform Node** - Transform array data (map, filter, reduce)
- **Group Node** - Container for loop child nodes
- **HTTP Request Node** - Often used within loops for API calls
- **File System Node** - Batch file processing

## Future Enhancements

- Break/continue statements
- Nested loop support
- Dynamic batch sizing
- Progress reporting
- Resume from failure
- Custom iteration strategies
- Iterator protocol support
- Async iterators
