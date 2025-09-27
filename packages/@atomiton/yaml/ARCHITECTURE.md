# YAML Package Architecture

## Data Flow Philosophy

The `@atomiton/yaml` package implements a clear separation between storage and
runtime formats:

### Storage Format: YAML

- **When**: Persisted to disk, version control, configuration files
- **Why**: Human-readable, comments support, clean diffs in git
- **Use Cases**: Flow definitions, configuration files, saved states

### Runtime Format: JSON

- **When**: In-memory processing, editing, execution
- **Why**: Native JavaScript format, fast processing, single data structure
- **Use Cases**:
  - Editor: Editing flows, real-time updates
  - Conductor: Executing flows, runtime processing

## Data Flow Patterns

```
┌─────────────┐     fromYaml()    ┌─────────────┐
│   Storage   │ ───────────────▶  │    JSON     │
│   (YAML)    │                    │  (Runtime)  │
└─────────────┘                    └─────────────┘
                                           │
                                           │
                              ┌────────────┼────────────┐
                              ▼                         ▼
                      ┌──────────────┐         ┌──────────────┐
                      │    Editor    │         │  Conductor   │
                      │  (Editing)   │         │ (Execution)  │
                      └──────────────┘         └──────────────┘
                              │
                              │ After editing
                              ▼
                      ┌─────────────┐
                      │    JSON     │
                      │  (Modified)  │
                      └─────────────┘
                              │
                              │ toYaml()
                              ▼
                      ┌─────────────┐
                      │   Storage   │
                      │   (YAML)    │
                      └─────────────┘
```

## API Methods

The yaml API provides explicit conversion methods to support this pattern:

```typescript
// Loading from storage
const flow = yaml.fromYaml(yamlString); // YAML → JSON

// Saving to storage
const yamlString = yaml.toYaml(flow); // JSON → YAML

// JSON operations (for API compatibility)
const data = yaml.fromJson(jsonString); // JSON string → Object
const jsonString = yaml.toJson(data); // Object → JSON string
```

## Benefits

1. **Single Source of Truth**: One JSON structure serves both editor and
   conductor
2. **No Data Divergence**: Editor and conductor work with identical data
   structures
3. **Clear Boundaries**: Explicit conversion points between storage and runtime
4. **Version Control Friendly**: YAML format for clean diffs and human
   readability
5. **Performance**: JSON for fast runtime processing
6. **Maintainability**: Simpler codebase with no duplicate data structures

## Implementation Guidelines

### For Flow Package

```typescript
// Loading a flow from disk
async function loadFlow(path: string): Promise<Flow> {
  const yamlContent = await fs.readFile(path, "utf-8");
  return yaml.fromYaml<Flow>(yamlContent);
}

// Saving a flow to disk
async function saveFlow(
  path: string,
  flow: Flow,
): Promise<void> {
  const yamlContent = yaml.toYaml(flow, {
    lineWidth: 80,
    indent: 2,
  });
  await fs.writeFile(path, yamlContent);
}
```

### For Editor

```typescript
// Editor receives JSON from storage
const flow = await loadFlow(path); // Already JSON
// ... user edits the flow ...
await saveFlow(path, flow); // Converts to YAML
```

### For Conductor

```typescript
// Conductor receives JSON from storage
const flow = await loadFlow(path); // Already JSON
// Execute using the same JSON structure
await conductor.execute(flow);
```

## Type Safety

The conversion methods are fully typed to ensure type safety across the
pipeline:

```typescript
interface Flow {
  name: string;
  version: string;
  nodes: Node[];
  connections: Connection[];
}

// Type-safe conversions
const flow = yaml.fromYaml<Flow>(yamlString);
const yamlString = yaml.toYaml(flow);
```

## Error Handling

All conversion methods include proper error handling:

```typescript
// Safe parsing with error details
const result = yaml.safeParse(yamlString);
if (result.errors) {
  console.error("Parse errors:", result.errors);
} else {
  const flow = result.data;
  // Process flow
}
```

## Future Considerations

1. **Schema Validation**: Validate flows during conversion
2. **Migration Support**: Handle version upgrades during fromYaml
3. **Compression**: Optional compression for large flows
4. **Streaming**: Stream processing for very large files
