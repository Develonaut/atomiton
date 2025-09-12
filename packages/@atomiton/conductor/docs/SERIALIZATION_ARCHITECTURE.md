# Blueprint Serialization Architecture

## Ownership: @atomiton/conductor

The conductor package owns all Blueprint serialization/deserialization responsibilities.

## Why Conductor Owns This

1. **Single Responsibility**: Conductor orchestrates execution, which includes loading/saving
2. **Encapsulation**: Keeps storage implementation details out of editor/UI
3. **Flexibility**: Can change storage format without affecting other packages
4. **Clean Boundaries**: UI works with objects, conductor handles persistence

## Architecture

```typescript
// Core serialization interface
export interface IBlueprintSerializer {
  toYAML(blueprint: BlueprintDefinition): string;
  fromYAML(yamlContent: string): BlueprintDefinition;
  toJSON(blueprint: BlueprintDefinition): string;
  fromJSON(jsonContent: string): BlueprintDefinition;
}

// Implementation
export class BlueprintSerializer implements IBlueprintSerializer {
  toYAML(blueprint: BlueprintDefinition): string {
    return yaml.dump(blueprint, {
      indent: 2,
      lineWidth: -1, // No line wrapping
      noRefs: true, // No YAML references
    });
  }

  fromYAML(yamlContent: string): BlueprintDefinition {
    const parsed = yaml.load(yamlContent);
    return this.validateBlueprint(parsed);
  }

  toJSON(blueprint: BlueprintDefinition): string {
    return JSON.stringify(blueprint, null, 2);
  }

  fromJSON(jsonContent: string): BlueprintDefinition {
    const parsed = JSON.parse(jsonContent);
    return this.validateBlueprint(parsed);
  }

  private validateBlueprint(data: any): BlueprintDefinition {
    // Zod validation here
    return blueprintSchema.parse(data);
  }
}
```

## Storage Layer

```typescript
export interface IBlueprintStorage {
  save(blueprint: BlueprintDefinition): Promise<void>;
  load(blueprintId: string): Promise<BlueprintDefinition>;
  list(): Promise<BlueprintMetadata[]>;
  delete(blueprintId: string): Promise<void>;
  exists(blueprintId: string): Promise<boolean>;
}

export class DesktopBlueprintStorage implements IBlueprintStorage {
  private serializer = new BlueprintSerializer();
  private blueprintDir = path.join(os.homedir(), "Atomiton", "Blueprints");

  async save(blueprint: BlueprintDefinition): Promise<void> {
    await this.ensureDirectory();
    const yaml = this.serializer.toYAML(blueprint);
    const filepath = this.getBlueprintPath(blueprint.id);
    await fs.writeFile(filepath, yaml, "utf-8");
  }

  async load(blueprintId: string): Promise<BlueprintDefinition> {
    const filepath = this.getBlueprintPath(blueprintId);
    const yaml = await fs.readFile(filepath, "utf-8");
    return this.serializer.fromYAML(yaml);
  }

  private getBlueprintPath(id: string): string {
    return path.join(this.blueprintDir, `${id}.blueprint.yaml`);
  }

  private async ensureDirectory(): Promise<void> {
    await fs.mkdir(this.blueprintDir, { recursive: true });
  }
}
```

## Data Flow

```
┌─────────────┐    JSON     ┌─────────────┐    YAML     ┌─────────────┐
│   Editor    │ ◄──────────► │  Conductor  │ ◄──────────► │ File System │
│  (React)    │     IPC     │ Serializer  │   Storage   │    YAML     │
└─────────────┘             └─────────────┘             └─────────────┘
```

### Save Flow

1. Editor creates Blueprint object
2. Sends via IPC as JSON to conductor
3. Conductor deserializes JSON to object
4. Conductor serializes object to YAML
5. Saves YAML to file system

### Load Flow

1. Conductor loads YAML from file system
2. Deserializes YAML to object
3. Serializes object to JSON for IPC
4. Editor receives JSON and works with object

## File Structure

```
~/Atomiton/Blueprints/
├── data-pipeline.blueprint.yaml
├── image-processor.blueprint.yaml
└── web-scraper.blueprint.yaml
```

## Format Standards

### YAML Storage Format

```yaml
# Human-readable with comments
id: data-pipeline
name: Data Processing Pipeline
version: 1.0.0
description: Processes CSV files and sends to API

# Blueprint interface when used as node
interface:
  inputs:
    - id: csvFile
      name: CSV File
      dataType: file
      required: true

# Internal workflow
nodes:
  - id: csv-reader
    type: "@atomiton/nodes/csv-reader"
    runtime: { language: typescript }
    position: { x: 100, y: 200 }

connections:
  - source: { node: input, port: csvFile }
    target: { node: csv-reader, port: file }
```

### Runtime JSON Format

- Compact, no comments
- Used for IPC and execution
- Same structure, different serialization

## Error Handling

```typescript
export class SerializationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SerializationError";
  }
}

// Usage
try {
  const blueprint = serializer.fromYAML(content);
} catch (error) {
  throw new SerializationError("Failed to parse Blueprint YAML", error, {
    blueprintId,
    filepath,
  });
}
```

## Testing Strategy

### Unit Tests

- YAML ↔ Object conversion
- JSON ↔ Object conversion
- Validation edge cases
- Error scenarios

### Integration Tests

- Save/load round-trip
- File system operations
- IPC serialization

```typescript
describe("BlueprintSerializer", () => {
  it("should round-trip YAML conversion", () => {
    const original = createTestBlueprint();
    const yaml = serializer.toYAML(original);
    const restored = serializer.fromYAML(yaml);
    expect(restored).toEqual(original);
  });
});
```

## Performance Considerations

### Lazy Loading

- Only load Blueprint metadata for list operations
- Full content loaded on demand

### Caching

- In-memory cache for frequently accessed Blueprints
- Cache invalidation on file changes

### Streaming

- Stream large Blueprints instead of loading entirely into memory
- Useful for complex nested workflows

## Migration Strategy

### v1.0: Basic Implementation

- YAML storage
- JSON IPC
- File system operations

### v2.0: Enhanced Features

- Compression for large Blueprints
- Incremental save/load
- Version migration support

## Benefits

1. **Separation of Concerns**: UI doesn't know about storage format
2. **Format Flexibility**: Easy to change storage format
3. **Type Safety**: Validation at serialization boundaries
4. **Performance**: Optimized for desktop usage patterns
5. **Human-Friendly**: YAML is readable and Git-friendly

---

**Last Updated**: 2025-01-11
**Owner**: @atomiton/conductor
**Status**: Architecture defined, ready for implementation
