# YAML Package Architecture

## Data Flow Philosophy

The `@atomiton/yaml` package implements a clear separation between storage and
runtime formats:

### Storage Format: YAML

- **When**: Persisted to disk, version control, configuration files
- **Why**: Human-readable, comments support, clean diffs in git
- **Use Cases**: Blueprint definitions, configuration files, saved states

### Runtime Format: JSON

- **When**: In-memory processing, editing, execution
- **Why**: Native JavaScript format, fast processing, single data structure
- **Use Cases**:
  - Editor: Editing blueprints, real-time updates
  - Conductor: Executing blueprints, runtime processing

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
const blueprint = yaml.fromYaml(yamlString); // YAML → JSON

// Saving to storage
const yamlString = yaml.toYaml(blueprint); // JSON → YAML

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

### For Blueprint Package

```typescript
// Loading a blueprint from disk
async function loadBlueprint(path: string): Promise<Blueprint> {
  const yamlContent = await fs.readFile(path, "utf-8");
  return yaml.fromYaml<Blueprint>(yamlContent);
}

// Saving a blueprint to disk
async function saveBlueprint(
  path: string,
  blueprint: Blueprint,
): Promise<void> {
  const yamlContent = yaml.toYaml(blueprint, {
    lineWidth: 80,
    indent: 2,
  });
  await fs.writeFile(path, yamlContent);
}
```

### For Editor

```typescript
// Editor receives JSON from storage
const blueprint = await loadBlueprint(path); // Already JSON
// ... user edits the blueprint ...
await saveBlueprint(path, blueprint); // Converts to YAML
```

### For Conductor

```typescript
// Conductor receives JSON from storage
const blueprint = await loadBlueprint(path); // Already JSON
// Execute using the same JSON structure
await conductor.execute(blueprint);
```

## Type Safety

The conversion methods are fully typed to ensure type safety across the
pipeline:

```typescript
interface Blueprint {
  name: string;
  version: string;
  nodes: Node[];
  connections: Connection[];
}

// Type-safe conversions
const blueprint = yaml.fromYaml<Blueprint>(yamlString);
const yamlString = yaml.toYaml(blueprint);
```

## Error Handling

All conversion methods include proper error handling:

```typescript
// Safe parsing with error details
const result = yaml.safeParse(yamlString);
if (result.errors) {
  console.error("Parse errors:", result.errors);
} else {
  const blueprint = result.data;
  // Process blueprint
}
```

## Future Considerations

1. **Schema Validation**: Validate blueprints during conversion
2. **Migration Support**: Handle version upgrades during fromYaml
3. **Compression**: Optional compression for large blueprints
4. **Streaming**: Stream processing for very large files
