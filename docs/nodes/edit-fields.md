# Edit Fields Node

## Overview

The Edit Fields Node creates or modifies data fields with simple key-value
pairs. It's the easiest way to create structured data, set values, and prepare
data for downstream nodes.

## Purpose

Edit Fields nodes are essential for:

- Creating simple data structures
- Setting field values
- Preparing data for other nodes
- Adding metadata and timestamps
- Building JSON objects
- Quick data generation

## Parameters

### Core Parameters

| Parameter     | Type    | Default | Description                              |
| ------------- | ------- | ------- | ---------------------------------------- |
| `values`      | object  | {}      | **Required**. Key-value pairs to set     |
| `keepOnlySet` | boolean | false   | Remove all fields except those being set |

### Default Values

```javascript
{
  message: "Hello World from Atomiton!",
  timestamp: "{{$now}}",
  author: "Atomiton Flow System"
}
```

### Common Parameters

| Parameter     | Type    | Default | Description             |
| ------------- | ------- | ------- | ----------------------- |
| `enabled`     | boolean | true    | Whether node executes   |
| `label`       | string  | -       | Custom node label       |
| `description` | string  | -       | Custom node description |

## Input/Output

### Input Ports

| Port    | Type | Required | Description                 |
| ------- | ---- | -------- | --------------------------- |
| `input` | any  | No       | Existing data to merge with |

### Output Ports

| Port     | Type   | Description            |
| -------- | ------ | ---------------------- |
| `result` | object | Object with set fields |

## Behavior

### Default (keepOnlySet: false)

Merges new values with existing data:

```javascript
// Input: { id: 123, name: "Existing" }
// Values: { status: "active", updated: "2024-01-15" }
// Output: { id: 123, name: "Existing", status: "active", updated: "2024-01-15" }
```

### keepOnlySet: true

Replaces all data with only set fields:

```javascript
// Input: { id: 123, name: "Existing", old: "data" }
// Values: { status: "active", updated: "2024-01-15" }
// Output: { status: "active", updated: "2024-01-15" }
```

## Use Cases

### 1. Create Simple Data

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      message: "Hello World",
      timestamp: "{{$now}}",
      status: "success"
    }
  }
}
```

### 2. Add Metadata

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      processedAt: "{{$now}}",
      processedBy: "workflow-123",
      version: "1.0"
    },
    keepOnlySet: false
  }
}
```

### 3. Prepare API Request

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      method: "POST",
      endpoint: "/api/users",
      body: {
        name: "John Doe",
        email: "john@example.com"
      }
    }
  }
}
```

### 4. Set Default Values

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      status: "{{$input.status || 'pending'}}",
      priority: "{{$input.priority || 'normal'}}",
      assignee: "{{$input.assignee || 'unassigned'}}"
    }
  }
}
```

### 5. Transform Data Structure

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      id: "{{$input.userId}}",
      name: "{{$input.fullName}}",
      email: "{{$input.emailAddress}}"
    },
    keepOnlySet: true  // Only keep mapped fields
  }
}
```

## Template Expressions

Values support template expressions:

| Expression          | Description          | Example                |
| ------------------- | -------------------- | ---------------------- |
| `{{$now}}`          | Current timestamp    | "2024-01-15T10:30:00Z" |
| `{{$input.field}}`  | Access input field   | "{{$input.name}}"      |
| `{{$output.field}}` | Previous node output | "{{$output.result}}"   |
| `{{$env.VAR}}`      | Environment variable | "{{$env.API_KEY}}"     |

## Common Patterns

### Data Preparation

```
Edit Fields (prepare) → HTTP Request → Transform
```

### Adding Metadata

```
Process Data → Edit Fields (add metadata) → File System (save)
```

### Default Values

```
Input → Edit Fields (defaults) → Validate → Process
```

### Data Mapping

```
API Response → Edit Fields (map) → Database Insert
```

## Best Practices

### Field Design

- **Use descriptive names** - Clear, self-documenting field names
- **Follow conventions** - camelCase, snake_case, etc.
- **Keep it simple** - Use Edit Fields for simple data only
- **Type consistency** - Maintain consistent types per field

### Templates

- **Validate expressions** - Test template expressions
- **Handle missing data** - Provide defaults with `||`
- **Escape special chars** - Quote strings properly
- **Document dynamic values** - Note which fields are templated

### When to Use

**Use Edit Fields when:**

- Creating simple data structures
- Setting static or dynamic values
- Adding metadata
- Quick data preparation

**Use Transform Node instead when:**

- Complex data transformations
- Array operations
- Conditional logic
- Computed values

## Technical Notes

### Field Evaluation

Fields are evaluated in definition order. Later fields can reference earlier
ones.

### Type Handling

- Strings: `"text"`
- Numbers: `123` or `"{{123}}"`
- Booleans: `true` or `"{{true}}"`
- Objects: `{ nested: "value" }`
- Arrays: `["item1", "item2"]`

### Merge Behavior

Uses shallow merge by default. For deep merge, chain multiple Edit Fields nodes
or use Transform node.

## Examples

### Example 1: Create API Payload

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      api_key: "{{$env.API_KEY}}",
      timestamp: "{{$now}}",
      request: {
        method: "GET",
        endpoint: "/users"
      }
    }
  }
}
```

### Example 2: Add Processing Metadata

```javascript
// After HTTP Request
{
  type: "edit-fields",
  parameters: {
    values: {
      originalData: "{{$input}}",
      fetchedAt: "{{$now}}",
      source: "external-api",
      processed: false
    },
    keepOnlySet: false
  }
}
```

### Example 3: Data Mapping

```javascript
{
  type: "edit-fields",
  parameters: {
    values: {
      user_id: "{{$input.id}}",
      user_name: "{{$input.name}}",
      user_email: "{{$input.email}}",
      created_at: "{{$now}}"
    },
    keepOnlySet: true
  }
}
```

## Related Nodes

- **Transform Node** - Complex transformations
- **HTTP Request Node** - Use Edit Fields to prepare requests
- **File System Node** - Prepare data before writing
- **Group Node** - Combine with other nodes

## Future Enhancements

- Deep merge support
- Field validation
- Type coercion
- Conditional field setting
- Array field operations
- Function expressions
