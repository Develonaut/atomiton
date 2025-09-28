---
title: "@atomiton/utils"
description: "Shared utility functions for Atomiton workflow automation."
stage: "alpha"
version: "0.1.1"
last_updated: "2025-09-28"
dependencies: []
tags: []
ai_context:
  category: "utility"
  complexity: "simple"
  primary_language: "typescript"
---
# @atomiton/utils

Shared utility functions for Atomiton workflow automation.

## Installation

This package is part of the Atomiton monorepo and is available as a workspace
dependency:

```json
{
  "dependencies": {
    "@atomiton/utils": "workspace:*"
  }
}
```

## Usage

```typescript
import { titleCase, deepClone, unique, sleep, isEmail } from "@atomiton/utils";

// String utilities
const title = titleCase("hello world"); // "Hello World"

// Object utilities
const cloned = deepClone({ a: 1, b: { c: 2 } });

// Array utilities
const uniqueValues = unique([1, 2, 2, 3]); // [1, 2, 3]

// Async utilities
await sleep(1000); // Sleep for 1 second

// Validation utilities
const valid = isEmail("test@example.com"); // true
```

## API Reference

### String Utilities

- `titleCase(str)` - Convert to Title Case
- `camelCase(str)` - Convert to camelCase
- `pascalCase(str)` - Convert to PascalCase
- `kebabCase(str)` - Convert to kebab-case
- `snakeCase(str)` - Convert to snake_case
- `constantCase(str)` - Convert to CONSTANT_CASE
- `slugify(str)` - Convert to URL-safe slug
- `truncate(str, maxLength, suffix)` - Truncate with ellipsis
- `randomString(length, charset)` - Generate random string
- `template(str, data)` - Simple template replacement

### Object Utilities

- `deepClone(obj)` - Deep clone an object
- `deepMerge(target, ...sources)` - Deep merge objects
- `pick(obj, keys)` - Pick specific properties
- `omit(obj, keys)` - Omit specific properties
- `get(obj, path, defaultValue)` - Get nested property
- `set(obj, path, value)` - Set nested property
- `has(obj, path)` - Check nested property existence
- `mapValues(obj, fn)` - Map object values
- `deepEqual(a, b)` - Deep equality check

### Array Utilities

- `unique(array)` - Remove duplicates
- `uniqueBy(array, key)` - Remove duplicates by key
- `chunk(array, size)` - Split into chunks
- `flatten(array, depth)` - Flatten nested arrays
- `groupBy(array, key)` - Group by property
- `sortBy(array, key)` - Sort by property
- `difference(array1, array2)` - Find difference
- `intersection(array1, array2)` - Find intersection
- `union(array1, array2)` - Find union
- `compact(array)` - Remove falsy values

### Async Utilities

- `sleep(ms)` - Sleep for milliseconds
- `retry(fn, options)` - Retry with backoff
- `timeout(promise, ms)` - Add timeout to promise
- `debounce(fn, delay)` - Debounce function
- `throttle(fn, limit)` - Throttle function
- `sequence(tasks)` - Execute in sequence
- `parallel(tasks, concurrency)` - Execute in parallel
- `defer()` - Create deferred promise
- `AsyncQueue` - Queue async tasks

### Validation Utilities

- `isNil(value)` - Check null or undefined
- `isDefined(value)` - Check if defined
- `isString(value)` - Check if string
- `isNumber(value)` - Check if number
- `isBoolean(value)` - Check if boolean
- `isArray(value)` - Check if array
- `isPlainObject(value)` - Check if plain object
- `isDate(value)` - Check if Date
- `isPromise(value)` - Check if Promise
- `isEmpty(value)` - Check if empty
- `isEmail(value)` - Validate email
- `isURL(value)` - Validate URL
- `isUUID(value)` - Validate UUID
- `isHexColor(value)` - Validate hex color

### Type Utilities

- `DeepPartial<T>` - Deep partial type
- `DeepRequired<T>` - Deep required type
- `DeepReadonly<T>` - Deep readonly type
- `KeysOfType<T, U>` - Extract keys of type
- `MaybePromise<T>` - Promise or value
- `Nullable<T>` - Nullable type
- `NonEmptyArray<T>` - Non-empty array type
- `PartialBy<T, K>` - Partial by keys
- `RequiredBy<T, K>` - Required by keys

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run smoke tests
pnpm test:smoke

# Run benchmarks
pnpm test:benchmark

# Build package
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## License

MIT
