# @atomiton/yaml

High-performance YAML parsing and serialization utilities for the Atomiton ecosystem.

## Features

- **Singleton API**: Clean ES6 class-based singleton interface
- **Fast & Efficient**: Built on the performant `yaml` library with streaming support
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Safe parsing with detailed error reporting
- **File Operations**: Async file reading/writing utilities
- **Validation**: Built-in validation utilities for YAML structures
- **Formatting**: Format, minify, and prettify YAML content
- **Stream Support**: Handle large YAML files with streaming API
- **Benchmarked**: Comprehensive performance benchmarks included

## Installation

```bash
pnpm add @atomiton/yaml
```

## Usage

### Using the Singleton API (Recommended)

```typescript
import { yaml } from "@atomiton/yaml";

// Parse YAML string
const data = yaml.parse(`
name: John Doe
age: 30
active: true
`);

// Stringify to YAML
const yamlString = yaml.stringify({
  name: "Jane Doe",
  age: 25,
  active: false,
});
```

### Data Conversion Pattern

The package provides explicit conversion methods following the [storage ↔ runtime pattern](./ARCHITECTURE.md):

```typescript
import { yaml } from "@atomiton/yaml";

// Loading from storage (YAML → JSON)
const blueprint = yaml.fromYaml(yamlString);

// Saving to storage (JSON → YAML)
const yamlString = yaml.toYaml(blueprint);

// JSON operations (for API consistency)
const data = yaml.fromJson(jsonString);
const jsonString = yaml.toJson(data, 2);
```

### Safe Parsing with Error Handling

```typescript
import { yaml } from "@atomiton/yaml";

const result = yaml.safeParse(yamlString);
if (result.errors) {
  console.error("Parse errors:", result.errors);
} else {
  console.log("Parsed data:", result.data);
}
```

### File Operations

```typescript
import { yaml } from "@atomiton/yaml";

// Read YAML file
const config = await yaml.readFile("./config.yaml");

// Write YAML file
await yaml.writeFile("./output.yaml", {
  timestamp: new Date().toISOString(),
  data: config,
});
```

### Validation

```typescript
import { yaml } from "@atomiton/yaml";

// Validate required fields
const errors = yaml.validateRequired(data, ["name", "email", "user.id"]);

// Create custom validator
const isValidConfig = yaml.createValidator<Config>((data): data is Config => {
  return (
    yaml.validateType(data, "object") &&
    "version" in data &&
    yaml.validateType(data.version, "string")
  );
});
```

### Formatting

```typescript
import { yaml } from "@atomiton/yaml";

// Format with default options
const formatted = yaml.format(yamlString);

// Prettify with custom indent
const pretty = yaml.prettify(yamlString, 4);

// Minify for compact storage
const minified = yaml.minify(yamlString);
```

### Stream Processing

```typescript
import { yaml } from "@atomiton/yaml";

// Process multiple documents in a YAML stream
const documents = await yaml.parseStream(multiDocYaml, {
  onDocument: (doc, index) => {
    console.log(`Processing document ${index}:`, doc);
  },
  onError: (error) => {
    console.error("Stream error:", error);
  },
});
```

## API Reference

The package provides a singleton `yaml` instance with the following methods:

### Parsing Methods

- `yaml.parse<T>(input: string, options?: YamlParseOptions): T`
- `yaml.safeParse<T>(input: string, options?: YamlParseOptions): ParseResult<T>`
- `yaml.parseDocument(input: string, options?: YamlParseOptions): Document`
- `yaml.parseMultiple(input: string, options?: YamlParseOptions): Document[]`
- `yaml.parseStream(input: string, options?: StreamParseOptions): Promise<YamlDocument[]>`
- `yaml.isValid(input: string, options?: YamlParseOptions): boolean`

### Stringification Methods

- `yaml.stringify(value: unknown, options?: YamlStringifyOptions): string`
- `yaml.stringifyWithComments(value: unknown, comments?: {...}, options?: YamlStringifyOptions): string`
- `yaml.format(input: string, options?: YamlStringifyOptions): string`
- `yaml.minify(input: string): string`
- `yaml.prettify(input: string, indent?: number): string`
- `yaml.toDocument(value: YamlDocument): Document`

### File Operations

- `yaml.readFile<T>(filePath: string, options?: YamlParseOptions): Promise<T>`
- `yaml.safeReadFile<T>(filePath: string, options?: YamlParseOptions): Promise<ParseResult<T>>`
- `yaml.writeFile(filePath: string, data: unknown, options?: YamlStringifyOptions): Promise<void>`

### Validation Methods

- `yaml.validateRequired(data: YamlDocument, requiredFields: string[]): YamlError[]`
- `yaml.validateType(value: unknown, expectedType: string): boolean`
- `yaml.validateEnum<T>(value: unknown, allowedValues: readonly T[]): value is T`
- `yaml.validatePattern(value: string, pattern: RegExp): boolean`
- `yaml.validateRange(value: number, min?: number, max?: number): boolean`
- `yaml.validateArrayLength(array: unknown[], minLength?: number, maxLength?: number): boolean`
- `yaml.createValidator<T>(schema: (data: unknown) => data is T): ValidationSchema<T>`
- `yaml.validateSchema<T>(data: unknown, schema: ValidationSchema<T>): YamlError[]`

### Conversion Methods

- `yaml.fromYaml<T>(yamlString: string): T` - Convert YAML string to JSON object
- `yaml.toYaml(jsonObject: unknown, options?: YamlStringifyOptions): string` - Convert JSON object to YAML string
- `yaml.fromJson<T>(jsonString: string): T` - Parse JSON string to object
- `yaml.toJson(object: unknown, indent?: number): string` - Convert object to JSON string

### Direct Utility Access

For advanced users who need direct access to the underlying utilities, all functions are still available via direct import:

```typescript
import { parseYaml, stringifyYaml } from "@atomiton/yaml";
```

## License

Private - Atomiton Internal Use Only
