# Node Configuration System Architecture

## Overview

The Atomiton node configuration system provides a declarative way to define configurable properties for Blueprint nodes using Zod schemas. The system automatically generates property panels in the editor, allowing users to configure node behavior through a type-safe, schema-driven interface.

This architecture uses **React Hook Form + Zod** as the foundation, with a custom abstraction layer for dynamic form generation, providing optimal performance, flexibility, and developer experience.

## System Requirements

### Core Capabilities

1. **Schema-driven forms** - Generate property panels from Zod schemas in node configurations
2. **Dynamic field rendering** - Automatically map data types to appropriate UI controls
3. **Conditional logic** - Show/hide fields based on other field values
4. **Performance** - Handle complex forms without re-render issues
5. **Extensibility** - Support custom controls and validation rules
6. **Type safety** - Full TypeScript support with Zod integration

## Technology Stack

### Core Libraries

**React Hook Form**: Form state management and validation

- Lightweight (25KB) and performant with minimal re-renders
- Native Zod integration via resolvers
- Uncontrolled components for better performance
- useFieldArray for dynamic fields
- Excellent TypeScript support

**Zod**: Schema definition and validation

- Already used throughout the codebase
- Type-safe schema definitions
- Runtime validation with compile-time types
- Extensible with custom validation rules

### Architecture Decision

React Hook Form + Zod was selected for the node configuration system because:

- **Performance**: Minimal re-renders and lightweight bundle size
- **Integration**: Native Zod support via resolvers
- **Flexibility**: Full control over UI component mapping
- **Maturity**: 1.2M+ developers and proven at scale
- **Consistency**: Leverages existing Zod investment

## System Architecture

### Two-Tier Design

```
┌─────────────────────────────────────────┐
│           Node Configuration             │
│         (Zod Schemas + Metadata)         │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│         Property Panel System            │
│  ┌────────────────────────────────────┐  │
│  │   Schema Analyzer (Zod → Metadata) │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │   Control Mapper (Type → Component)│  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │   React Hook Form Integration      │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          Rendered Property UI            │
└─────────────────────────────────────────┘
```

### Implementation Strategy

#### Phase 1: Foundation

1. **Node-side Schema Definition**

   ```typescript
   // In node config files
   export const nodeConfigSchema = z.object({
     url: z.string().url().describe("API endpoint"),
     method: z.enum(["GET", "POST"]).describe("HTTP method"),
     timeout: z.number().min(0).max(30000).describe("Request timeout"),
     headers: z.record(z.string()).optional(),
   });

   // Metadata for UI hints
   export const nodeConfigMeta = {
     url: { control: "url", placeholder: "https://api.example.com" },
     method: { control: "select" },
     timeout: { control: "slider", min: 0, max: 30000, step: 100 },
     headers: { control: "json", collapsible: true },
   };
   ```

2. **Editor-side Control Mapping**
   ```typescript
   // Control registry and mapper
   const controlMap = {
     text: TextInput,
     url: UrlInput,
     select: SelectField,
     slider: SliderControl,
     json: JsonEditor,
     // ... more mappings
   };
   ```

#### Phase 2: Dynamic Form Generation

```typescript
// PropertyPanel component
function PropertyPanel({ nodeConfig }) {
  const { schema, metadata, defaults } = nodeConfig;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const fields = generateFieldsFromSchema(schema, metadata);

  return (
    <Form {...form}>
      {fields.map(field => (
        <DynamicField
          key={field.name}
          field={field}
          control={form.control}
        />
      ))}
    </Form>
  );
}
```

#### Phase 3: Advanced Features

- **Conditional Fields**: Use React Hook Form's `watch` + Zod's `refine()`
- **Dynamic Arrays**: Leverage `useFieldArray` for lists
- **Custom Validators**: Extend Zod schemas with `.superRefine()`
- **Field Dependencies**: Implement reactive field updates

## Key Implementation Decisions

### 1. Keep Zod as Source of Truth

- All validation logic in Zod schemas
- UI hints in separate metadata objects
- Type safety maintained throughout

### 2. Control Component Library

- Build reusable control components
- Each control handles its specific type
- Register controls dynamically

### 3. Performance Optimizations

- Use React Hook Form's uncontrolled components
- Implement field-level validation
- Lazy load complex controls (JSON editor, etc.)

### 4. Extensibility Points

- Custom control registration
- Schema transformers for special cases
- Hooks for pre/post validation

## Implementation Phases

### Phase 1: Foundation

- Basic text/number/boolean controls
- Core schema analyzer and control mapper
- React Hook Form integration

### Phase 2: Enhanced Controls

- Arrays, objects, conditional fields
- Complex UI controls (JSON editor, color picker)
- Field validation and error handling

### Phase 3: Advanced Features

- Custom control registration system
- Conditional logic and field dependencies
- Performance optimizations and lazy loading

## Development Guidelines

### Testing Strategy

- **Unit Tests**: Control mappings and schema analysis
- **Integration Tests**: Form generation and validation
- **E2E Tests**: Property panel interactions in editor

### Performance Considerations

- Use React Hook Form's uncontrolled components
- Implement field-level validation
- Lazy load complex controls (JSON editor, etc.)
- Profile form performance with complex node configurations

### Maintenance

- Clear separation between node configs and editor UI
- Consistent control interface contracts
- Comprehensive control development documentation

## Benefits

The node configuration system provides:

- **Type Safety**: Full TypeScript support with Zod schemas
- **Performance**: Minimal re-renders with React Hook Form
- **Developer Experience**: Declarative configuration definitions
- **Extensibility**: Custom controls and validation rules
- **Consistency**: Unified property panel experience across all nodes
