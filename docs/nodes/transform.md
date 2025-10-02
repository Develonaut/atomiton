# Transform Node

## Overview

The Transform Node provides powerful data transformation capabilities for
manipulating arrays and collections within your workflows. It supports 11
different operations for mapping, filtering, sorting, grouping, and slicing
data.

## Purpose

Transform nodes are essential for:

- Reshaping data structures to match expected formats
- Filtering datasets based on conditions
- Sorting and organizing collections
- Aggregating and grouping related data
- Extracting subsets of data using pagination or slicing

## Operations

### Map

Transforms each item in an array using a custom function.

**Use Case**: Add, remove, or modify properties on objects; restructure data
format

**Parameters**:

- `transformFunction`: JavaScript function that receives each item and returns
  the transformed version

**Example**:

```javascript
// Input: [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]
// Function: item => ({ ...item, adult: item.age >= 18 })
// Output: [{ name: "Alice", age: 30, adult: true }, { name: "Bob", age: 25, adult: true }]
```

---

### Filter

Returns only items that match a condition.

**Use Case**: Remove unwanted items; extract subset meeting criteria

**Parameters**:

- `transformFunction`: JavaScript function that returns true to keep item, false
  to remove

**Example**:

```javascript
// Input: [{ name: "Alice", age: 30 }, { name: "Bob", age: 17 }]
// Function: item => item.age >= 18
// Output: [{ name: "Alice", age: 30 }]
```

---

### Reduce

Aggregates array into a single value using accumulation logic.

**Use Case**: Sum numbers; concatenate strings; build complex aggregate objects

**Parameters**:

- `transformFunction`: Function receiving `{ acc, item, index }` and returning
  new accumulator
- `reduceInitial`: Initial value for accumulator (optional, defaults to empty
  string)

**Example**:

```javascript
// Input: [{ price: 10 }, { price: 20 }, { price: 30 }]
// Function: ({ acc, item }) => acc + item.price
// Initial: "0"
// Output: 60
```

---

### Sort

Sorts array by a property key in ascending or descending order.

**Use Case**: Order items alphabetically; rank by numeric value

**Parameters**:

- `sortKey`: Property name to sort by (optional, sorts primitive values if
  omitted)
- `sortDirection`: "asc" (ascending) or "desc" (descending), defaults to "asc"

**Example**:

```javascript
// Input: [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }]
// Sort Key: "name"
// Direction: "asc"
// Output: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }]
```

---

### Group

Groups items by a shared property value into categorized collections.

**Use Case**: Categorize data; create lookup tables; aggregate by category

**Parameters**:

- `groupKey`: Property name to group by (falls back to `sortKey` if not
  provided)

**Example**:

```javascript
// Input: [{ type: "fruit", name: "apple" }, { type: "veggie", name: "carrot" }, { type: "fruit", name: "banana" }]
// Group Key: "type"
// Output: {
//   fruit: [{ type: "fruit", name: "apple" }, { type: "fruit", name: "banana" }],
//   veggie: [{ type: "veggie", name: "carrot" }]
// }
```

---

### Flatten

Flattens nested arrays to specified depth.

**Use Case**: Simplify deeply nested structures; merge sub-arrays

**Parameters**:

- `flattenDepth`: How many levels deep to flatten (1-10), defaults to 1

**Example**:

```javascript
// Input: [[1, 2], [3, [4, 5]], 6]
// Depth: 1
// Output: [1, 2, 3, [4, 5], 6]

// Input: [[1, 2], [3, [4, 5]], 6]
// Depth: 2
// Output: [1, 2, 3, 4, 5, 6]
```

---

### Unique

Removes duplicate items from array.

**Use Case**: Deduplicate data; get distinct values

**Parameters**: None

**Example**:

```javascript
// Input: [1, 2, 2, 3, 3, 3, 4]
// Output: [1, 2, 3, 4]

// Input: ["apple", "banana", "apple", "cherry"]
// Output: ["apple", "banana", "cherry"]
```

---

### Reverse

Reverses the order of array items.

**Use Case**: Invert sort order; process in reverse chronological order

**Parameters**: None

**Example**:

```javascript
// Input: [1, 2, 3, 4, 5]
// Output: [5, 4, 3, 2, 1]
```

---

### Limit

Returns first N items from array (pagination - page 1).

**Use Case**: Get top results; implement pagination; preview data sample

**Parameters**:

- `limitCount`: Number of items to return (minimum 1)

**Example**:

```javascript
// Input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Limit: 3
// Output: [1, 2, 3]
```

---

### Skip

Skips first N items and returns the rest (pagination - offset).

**Use Case**: Implement pagination offset; skip header rows; process remaining
items

**Parameters**:

- `skipCount`: Number of items to skip (minimum 0)

**Example**:

```javascript
// Input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Skip: 5
// Output: [6, 7, 8, 9, 10]
```

---

### Slice

Returns items between start and end indices (precise extraction).

**Use Case**: Extract specific range; implement custom pagination; get middle
section

**Parameters**:

- `sliceStart`: Starting index (inclusive, minimum 0)
- `sliceEnd`: Ending index (exclusive, optional - omit for rest of array)

**Example**:

```javascript
// Input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Start: 2, End: 5
// Output: [3, 4, 5]

// Input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
// Start: 5, End: undefined
// Output: [6, 7, 8, 9, 10]
```

---

## Common Use Cases

### Data Formatting Pipeline

Chain multiple transform nodes to clean and format data:

1. **Filter** - Remove invalid entries
2. **Map** - Restructure to target format
3. **Sort** - Order by priority
4. **Limit** - Take top N results

### Pagination Implementation

Combine skip and limit for offset-based pagination:

1. **Skip** - Skip (page - 1) \* pageSize items
2. **Limit** - Take pageSize items

### Category Aggregation

Group and summarize data by category:

1. **Group** - Organize by category
2. **Map** - Transform each group
3. **Reduce** - Calculate summaries per group

### Data Deduplication

Clean up duplicate entries:

1. **Sort** - Order by unique identifier
2. **Unique** - Remove duplicates
3. **Map** - Extract needed fields

---

## Parameter Reference

### Common Parameters (All Operations)

| Parameter     | Type    | Default | Description               |
| ------------- | ------- | ------- | ------------------------- |
| `enabled`     | boolean | true    | Whether node executes     |
| `timeout`     | number  | 30000   | Max execution time (ms)   |
| `retries`     | number  | 1       | Retry attempts on failure |
| `label`       | string  | -       | Custom node label         |
| `description` | string  | -       | Custom node description   |

### Operation-Specific Parameters

| Parameter           | Operations          | Type   | Required | Default        | Constraints     | Description               |
| ------------------- | ------------------- | ------ | -------- | -------------- | --------------- | ------------------------- |
| `operation`         | All                 | enum   | Yes      | "map"          | See Operations  | Transformation type       |
| `transformFunction` | map, filter, reduce | string | Yes      | "item => item" | Valid JS        | Transform logic           |
| `sortKey`           | sort, group         | string | No       | -              | -               | Property to sort/group by |
| `sortDirection`     | sort                | enum   | No       | "asc"          | "asc" or "desc" | Sort order                |
| `reduceInitial`     | reduce              | string | No       | ""             | -               | Initial accumulator value |
| `groupKey`          | group               | string | No       | -              | -               | Property to group by      |
| `flattenDepth`      | flatten             | number | No       | 1              | 1-10            | Nesting depth to flatten  |
| `limitCount`        | limit               | number | No       | -              | ≥ 1             | Items to return           |
| `skipCount`         | skip                | number | No       | -              | ≥ 0             | Items to skip             |
| `sliceStart`        | slice               | number | No       | 0              | ≥ 0             | Start index               |
| `sliceEnd`          | slice               | number | No       | -              | -               | End index (exclusive)     |

---

## Technical Notes

### Function Evaluation

Transform functions are evaluated in a sandboxed environment. Keep functions
simple and avoid side effects.

### Error Handling

If a transform function fails:

- **Map**: Falls back to adding metadata (`transformed: true`, `index`)
- **Filter**: Falls back to removing null/undefined values
- **Reduce**: Falls back to numeric sum operation

### Performance

- Operations work on array copies to prevent mutations
- Large datasets may benefit from pagination (limit/skip/slice)
- Complex transform functions may increase execution time

### Type Safety

Input data must be an array. Non-array inputs will throw an error.

---

## Examples

### Example 1: API Response Processing

```javascript
// Input: API response with nested user data
// Operations:
// 1. Flatten depth 2 - Unwrap nested arrays
// 2. Filter - Keep only active users
// 3. Map - Extract required fields
// 4. Sort by "name" ascending
// 5. Limit to 10 results
```

### Example 2: Analytics Aggregation

```javascript
// Input: Transaction records
// Operations:
// 1. Group by "category"
// 2. Map each group to calculate totals
// 3. Sort by total descending
// 4. Limit to top 5 categories
```

### Example 3: Data Cleaning

```javascript
// Input: User submissions with duplicates
// Operations:
// 1. Filter - Remove invalid entries
// 2. Unique - Remove duplicates
// 3. Map - Normalize field names
// 4. Sort by "submittedAt" descending
```
