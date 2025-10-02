# Group Node

## Overview

The Group Node is a container node that groups multiple nodes together into a
reusable workflow. It allows you to organize related nodes, create reusable
patterns, and build hierarchical workflows.

## Purpose

Group nodes are essential for:

- Organizing complex workflows into logical sections
- Creating reusable sub-workflows
- Building nested hierarchies of nodes
- Managing execution context for child nodes
- Implementing modular workflow design

## How It Works

A Group node acts as a container that:

1. Contains one or more child nodes
2. Manages execution flow between child nodes via edges
3. Passes input data to child nodes
4. Collects and returns output from child nodes
5. Controls execution settings (timeout, retries, parallel execution)

## Parameters

### Core Parameters

| Parameter  | Type    | Default | Description                                        |
| ---------- | ------- | ------- | -------------------------------------------------- |
| `timeout`  | number  | 30000   | Maximum execution time in milliseconds (1s - 5min) |
| `retries`  | number  | 1       | Number of retry attempts on failure (0-10)         |
| `parallel` | boolean | false   | Execute child nodes in parallel when possible      |

### Common Parameters (All Nodes)

| Parameter     | Type    | Default | Description             |
| ------------- | ------- | ------- | ----------------------- |
| `enabled`     | boolean | true    | Whether node executes   |
| `label`       | string  | -       | Custom node label       |
| `description` | string  | -       | Custom node description |

## Execution Flow

### Sequential Execution (Default)

When `parallel: false`:

1. Child nodes execute following the edge connections
2. Data flows from one node to the next via edges
3. Execution stops if any node fails (unless retries configured)
4. Final output is collected from terminal nodes

### Parallel Execution

When `parallel: true`:

1. Nodes without dependencies execute simultaneously
2. Nodes with dependencies wait for their inputs
3. Maximizes throughput for independent operations
4. Results are collected as each branch completes

## Input/Output

### Input Ports

| Port      | Type | Description                                 |
| --------- | ---- | ------------------------------------------- |
| `trigger` | any  | Input to trigger group execution (optional) |

### Output Ports

| Port     | Type | Description                    |
| -------- | ---- | ------------------------------ |
| `result` | any  | Result from the group workflow |

## Use Cases

### 1. Organizing Complex Workflows

Group related operations together for clarity:

```
Group: "Data Processing"
├── HTTP Request - Fetch data
├── Transform - Filter records
├── Transform - Map fields
└── File System - Save result
```

### 2. Creating Reusable Sub-Workflows

Build reusable patterns that can be saved and imported:

```
Group: "User Authentication"
├── HTTP Request - Call auth API
├── Transform - Extract token
└── Edit Fields - Store token
```

### 3. Parallel Processing

Process multiple operations simultaneously:

```
Group: "Multi-Source Data Fetch"
├── HTTP Request - Source A (parallel)
├── HTTP Request - Source B (parallel)
├── HTTP Request - Source C (parallel)
└── Transform - Merge results
```

### 4. Error Isolation

Isolate risky operations with retry logic:

```
Group: "External API Call" (retries: 3)
├── HTTP Request - Call unstable API
└── Transform - Parse response
```

## Common Patterns

### Sequential Pipeline

```
Group: "ETL Pipeline"
├── Node A → Node B → Node C → Node D
```

Use for: Data transformations, processing pipelines

### Fan-Out/Fan-In

```
Group: "Parallel Processing"
├── Input
│   ├── Process A
│   ├── Process B
│   └── Process C
└── Merge Results
```

Use for: Independent parallel operations with result aggregation

### Conditional Branches

```
Group: "Conditional Logic"
├── Input
├── Branch A (if condition)
└── Branch B (else condition)
```

Use for: Different paths based on conditions

### Nested Groups

```
Group: "Parent Workflow"
├── Group: "Sub-workflow A"
├── Group: "Sub-workflow B"
└── Final Node
```

Use for: Complex multi-level workflows

## Best Practices

### Organization

- **Name groups descriptively** - Use clear names that explain the group's
  purpose
- **Keep groups focused** - Each group should have a single responsibility
- **Limit nesting depth** - Avoid deeply nested groups (max 3-4 levels)
- **Document complex logic** - Use descriptions for groups with complex behavior

### Performance

- **Use parallel execution** - Enable parallel mode for independent operations
- **Set appropriate timeouts** - Balance between allowing completion and
  preventing hangs
- **Minimize group overhead** - Don't create unnecessary groups for single nodes
- **Consider batch size** - Group operations into reasonable batch sizes

### Error Handling

- **Configure retries wisely** - Use retries for transient failures only
- **Isolate risky operations** - Put unreliable operations in separate groups
- **Handle failures gracefully** - Design groups to fail gracefully and return
  useful errors
- **Log execution context** - Use group names to provide execution context in
  logs

### Reusability

- **Create modular groups** - Design groups to be self-contained and reusable
- **Parameterize inputs** - Make groups configurable via input parameters
- **Document interfaces** - Clearly define expected inputs and outputs
- **Version your groups** - Track changes to reusable group patterns

## Technical Notes

### Execution Context

Each group creates its own execution context that:

- Tracks execution state for all child nodes
- Manages timeout and retry behavior
- Collects execution metrics
- Provides logging context

### Data Flow

- Data flows between nodes via edges
- Each node receives inputs from connected nodes
- Output from one node becomes input to connected nodes
- Group output is determined by terminal nodes (nodes with no outgoing edges)

### Performance Characteristics

- **Sequential execution**: Linear time proportional to child nodes
- **Parallel execution**: Time proportional to longest branch
- **Memory usage**: Grows with number of child nodes and data size
- **Overhead**: Minimal overhead per group (< 1ms typically)

### Limitations

- Maximum nesting depth: Not enforced but recommended < 5 levels
- Maximum child nodes: Not enforced but recommended < 100 per group
- Timeout range: 1s - 5min (extendable via configuration)
- Retry range: 0-10 attempts

## Examples

### Example 1: Data Fetch and Transform Pipeline

```javascript
// Group node with sequential processing
{
  type: "group",
  parameters: {
    timeout: 30000,
    retries: 2,
    parallel: false
  },
  nodes: [
    { type: "http-request", parameters: { url: "api.example.com/data" } },
    { type: "transform", parameters: { operation: "filter" } },
    { type: "transform", parameters: { operation: "map" } },
    { type: "file-system", parameters: { operation: "write" } }
  ]
}
```

### Example 2: Parallel API Calls

```javascript
// Group node with parallel execution
{
  type: "group",
  parameters: {
    timeout: 60000,
    retries: 1,
    parallel: true
  },
  nodes: [
    { type: "http-request", parameters: { url: "api1.example.com" } },
    { type: "http-request", parameters: { url: "api2.example.com" } },
    { type: "http-request", parameters: { url: "api3.example.com" } },
    { type: "transform", parameters: { operation: "reduce" } }
  ]
}
```

### Example 3: Nested Workflow

```javascript
// Parent group containing sub-groups
{
  type: "group",
  parameters: { timeout: 90000 },
  nodes: [
    {
      type: "group",
      name: "Fetch Data",
      nodes: [/* ... */]
    },
    {
      type: "group",
      name: "Process Data",
      nodes: [/* ... */]
    },
    {
      type: "group",
      name: "Save Results",
      nodes: [/* ... */]
    }
  ]
}
```

## Related Nodes

- **Parallel Node** - Specialized parallel execution with advanced control
- **Loop Node** - Iterate over data with child nodes
- **Transform Node** - Transform data within groups
- **All other nodes** - Can be contained within groups

## Migration Notes

The Group node replaces the deprecated "Flow" and "Composite" terminology:

- **Old**: Composite Node, Flow
- **New**: Group Node
- Groups are simply nodes that contain other nodes via the `nodes` array
  property
