# @atomiton/blueprints

Blueprint definition, validation, and transformation utilities for the Atomiton platform.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Blueprint Management](#blueprint-management)
  - [Validation System](#validation-system)
  - [Format Transformation](#format-transformation)
  - [API Interface](#api-interface)
- [Installation](#installation)
- [Usage](#usage)
  - [Singleton API (Recommended)](#singleton-api-recommended)
  - [Blueprint Creation](#blueprint-creation)
  - [Validation](#validation)
  - [YAML Conversion](#yaml-conversion)
  - [Advanced Operations](#advanced-operations)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview

The blueprints package provides comprehensive blueprint management for the Atomiton platform, handling blueprint definitions, validation, and transformations between storage (YAML) and runtime (JSON) formats. It serves as the core library for blueprint operations across the entire platform.

## Features

### Blueprint Management

- **Complete blueprint lifecycle** - Create, validate, transform, clone, and merge blueprints
- **Type-safe definitions** - Full TypeScript support with Zod schema validation
- **Metadata tracking** - Comprehensive metadata with timestamps, authorship, and tags
- **Node compatibility** - Blueprints can be used as nodes within other blueprints

### Validation System

- **Schema validation** - Zod-based structural validation with detailed error reporting
- **Semantic validation** - Cross-reference validation for nodes and edges
- **Node type checking** - Integration with @atomiton/nodes for available node types
- **Configurable strictness** - Warning vs error modes for unknown node types

### Format Transformation

- **YAML ↔ JSON conversion** - Bidirectional transformation with round-trip validation
- **Safe parsing** - Error-safe operations with detailed error reporting
- **Format preservation** - Maintain structure and formatting when possible
- **Migration support** - Version migration for blueprint compatibility

### API Interface

- **Singleton pattern** - Clean, consistent API surface following package conventions
- **Error handling** - Comprehensive error reporting with structured error types
- **Async operations** - Promise-based API for file operations and validations
- **Utility functions** - Helper methods for common blueprint operations

## Installation

```bash
pnpm add @atomiton/blueprints
```

## Usage

### Singleton API (Recommended)

```typescript
import { blueprints } from "@atomiton/blueprints";

// Create a new blueprint
const blueprint = blueprints.create({
  id: "my-blueprint",
  name: "My Automation",
  category: "user-blueprints",
  type: "blueprint",
  description: "A sample automation blueprint",
  author: "John Doe",
  tags: ["sample", "automation"],
});
```

### Blueprint Creation

```typescript
import { blueprints } from "@atomiton/blueprints";

// Create a blueprint with nodes and edges
const blueprint = blueprints.create({
  id: "file-processor",
  name: "File Processing Workflow",
  category: "data-processing",
  type: "blueprint",
  description: "Process files with validation",
});

// Add nodes (manually for now, editor integration coming)
blueprint.nodes = [
  {
    id: "input-node",
    type: "file-reader",
    position: { x: 100, y: 100 },
    data: { path: "/input/files" },
  },
  {
    id: "process-node",
    type: "data-transformer",
    position: { x: 300, y: 100 },
    data: { format: "json" },
  },
];

blueprint.edges = [
  {
    id: "connection-1",
    source: "input-node",
    target: "process-node",
    sourceHandle: "output",
    targetHandle: "input",
  },
];
```

### Validation

```typescript
import { blueprints } from "@atomiton/blueprints";

// Validate blueprint structure and semantics
const result = blueprints.validate(blueprint);

if (!result.success) {
  console.error("Validation errors:");
  result.errors.forEach((error) => {
    console.error(`- ${error.path}: ${error.message}`);
  });
} else {
  console.log("Blueprint is valid!");
}

// Type guard for blueprints
if (blueprints.isValid(unknownData)) {
  // TypeScript knows this is a BlueprintDefinition
  console.log("Blueprint name:", unknownData.name);
}
```

### YAML Conversion

```typescript
import { blueprints } from "@atomiton/blueprints";

// Convert blueprint to YAML for storage
const yamlString = blueprints.toYaml(blueprint, {
  formatOutput: true,
  preserveComments: true,
});

// Load blueprint from YAML
const loadedBlueprint = blueprints.fromYaml(yamlString);

// Safe conversion with error handling
const result = blueprints.safeFromYaml(yamlString);
if (result.success) {
  console.log("Loaded blueprint:", result.data?.name);
} else {
  console.error("Failed to load:", result.error?.message);
}
```

### Advanced Operations

```typescript
import { blueprints } from "@atomiton/blueprints";

// Clone a blueprint with new ID
const cloned = blueprints.clone(blueprint, "new-blueprint-id", {
  name: "Cloned Blueprint",
  author: "Jane Doe",
  preserveNodeIds: false, // Generate new node IDs
});

// Merge multiple blueprints
const merged = blueprints.merge(
  [blueprint1, blueprint2, blueprint3],
  "combined-blueprint",
  "Combined Workflow",
);

// Extract metadata without full parsing
const metadata = blueprints.extractMetadata(yamlString);
console.log("Blueprint created:", metadata?.created);

// Validate round-trip conversion
const roundTripResult = blueprints.validateRoundTrip(yamlString);
if (roundTripResult.success) {
  console.log("Round-trip validation passed");
} else {
  console.error("Data integrity issues detected");
}
```

## API Reference

### Core API Methods

```typescript
interface BlueprintsAPI {
  // Creation
  create(params: BlueprintCreateParams): BlueprintDefinition;

  // Validation
  validate(
    blueprint: unknown,
    context?: BlueprintValidationContext,
  ): ValidationResult;
  isValid(blueprint: unknown): blueprint is BlueprintDefinition;
  validateSemantics(blueprint: BlueprintDefinition): ValidationResult;

  // Conversion
  fromYaml(
    yamlString: string,
    options?: TransformationOptions,
  ): BlueprintDefinition;
  toYaml(
    blueprint: BlueprintDefinition,
    options?: TransformationOptions,
  ): string;
  safeFromYaml(yamlString: string): BlueprintAPIResult<BlueprintDefinition>;
  safeToYaml(blueprint: BlueprintDefinition): BlueprintAPIResult<string>;

  // Schema
  getSchema(): BlueprintSchema;
  getSchemaVersion(): string;
  getRequiredFields(): readonly string[];

  // Utilities
  normalize(blueprint: BlueprintDefinition): BlueprintDefinition;
  extractMetadata(yamlString: string): BlueprintMetadata | null;
  validateRoundTrip(yamlString: string): TransformationResult;

  // Advanced
  clone(
    blueprint: BlueprintDefinition,
    newId: string,
    options?: CloneOptions,
  ): BlueprintDefinition;
  merge(
    blueprints: BlueprintDefinition[],
    targetId: string,
    targetName: string,
  ): BlueprintDefinition;
}
```

### Type Definitions

```typescript
interface BlueprintDefinition {
  // Core identification
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  version?: string;

  // Blueprint structure
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  variables?: BlueprintVariables;
  settings?: BlueprintSettings;

  // Required metadata
  metadata: BlueprintMetadata;

  // Node compatibility (blueprints can be used as nodes)
  inputPorts?: PortDefinition[];
  outputPorts?: PortDefinition[];
  icon?: string;
  defaultConfig?: Record<string, unknown>;
}

interface BlueprintNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface BlueprintEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: Record<string, unknown>;
}

interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}
```

## Architecture

```
packages/@atomiton/blueprints/
├── src/
│   ├── api.ts              # Main BlueprintsAPI singleton
│   ├── types.ts            # TypeScript type definitions
│   ├── schema.ts           # Zod schemas and validation
│   ├── validation.ts       # Validation logic and utilities
│   ├── transform.ts        # YAML/JSON transformation
│   ├── index.ts           # Package exports
│   └── __tests__/         # Comprehensive test suite
├── dist/                  # Built JavaScript and types
├── package.json
├── tsconfig.json
└── README.md             # This file
```

### Design Principles

- **Single Responsibility** - Focused solely on blueprint operations
- **Type Safety** - Full TypeScript coverage with runtime validation
- **Consistency** - Follows established patterns from @atomiton/yaml
- **Integration** - Works seamlessly with @atomiton/nodes and @atomiton/yaml
- **Performance** - Efficient validation and transformation algorithms

## Testing

The package includes comprehensive test coverage:

- **Unit tests** - Individual function testing with edge cases
- **Integration tests** - Cross-module functionality testing
- **Validation tests** - Schema and semantic validation scenarios
- **Transformation tests** - Round-trip and format preservation
- **API tests** - Singleton interface and error handling

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Run integration tests
pnpm test:unit
```

## Performance

Target metrics for blueprint operations:

- **Validation**: < 10ms for typical blueprints (< 100 nodes)
- **YAML conversion**: < 5ms for small blueprints, < 50ms for large ones
- **Memory usage**: < 2MB baseline, scales with blueprint size
- **Bundle size**: < 15KB gzipped

## Dependencies

- **@atomiton/yaml** - YAML transformation utilities
- **@atomiton/nodes** - Node type registry for validation
- **zod** - Runtime schema validation

## Contributing

This package handles core blueprint operations used throughout the platform:

1. **Discuss changes** in issues before implementing
2. **Maintain compatibility** - Changes affect all blueprint consumers
3. **Add comprehensive tests** for new features
4. **Update documentation** including this README and API docs
5. **Follow validation patterns** established in the codebase

## License

Private - Atomiton Internal Use Only

---

**Package Status**: 🟢 Stable  
**Version**: 0.1.0  
**Stability**: Production Ready
