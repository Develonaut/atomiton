# Node Configuration System Architecture

## Overview

The Atomiton node configuration system provides a declarative way to define configurable properties for Blueprint nodes using Zod schemas. The system automatically generates editable property forms in the editor, allowing users to configure node behavior through a type-safe, schema-driven interface.

This architecture uses **React Hook Form + Zod** as the foundation, with a custom abstraction layer for dynamic form generation, providing optimal performance, flexibility, and developer experience.

**Status**: ✅ **IMPLEMENTED** - Core system with UI metadata support is live and functional.

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

#### Phase 1: Foundation ✅ COMPLETED

1. **Node-side Schema Definition**

   ```typescript
   // In node config files - IMPLEMENTED
   export class CSVReaderNodeConfig extends NodeConfig {
     static readonly schema = z.object({
       hasHeader: z.boolean().describe("CSV has header row"),
       delimiter: z.string().describe("Column delimiter"),
       encoding: z.string().describe("File encoding"),
     });

     static readonly defaults = {
       hasHeader: true,
       delimiter: ",",
       encoding: "utf-8",
     };

     // Field configuration for form controls - IMPLEMENTED
     static readonly fields = {
       hasHeader: { label: "Has Header Row", controlType: "boolean" },
       delimiter: { label: "Delimiter", controlType: "text", placeholder: "," },
       encoding: {
         label: "Encoding",
         controlType: "select",
         options: ["utf-8", "latin1"],
       },
     };
   }
   ```

2. **Editor-side Control Mapping** ✅ IMPLEMENTED
   ```typescript
   // Control registry and mapper - IMPLEMENTED
   const renderFormControl = (field: FieldConfig, register: any, errors: any) => {
     switch (field.type) {
       case 'text': return <Input {...register(field.name)} />;
       case 'number': return <Input type="number" {...register(field.name, { valueAsNumber: true })} />;
       case 'boolean': return <Checkbox {...register(field.name)} />;
       case 'select': return <Select {...register(field.name)} options={field.options} />;
       case 'textarea': return <Textarea {...register(field.name)} />;
       case 'file': return <FileInput {...register(field.name)} />;
       // ... more control types
     }
   };
   ```

#### Phase 2: Dynamic Form Generation ✅ IMPLEMENTED

```typescript
// PropertyPanel component - IMPLEMENTED
function NodeProperties({ selectedNode }: { selectedNode: Node }) {
  const nodeConfig = selectedNode.config;
  const { schema, defaults, fields } = nodeConfig;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const formFields = generateFieldsFromSchema(schema, fields);

  return (
    <Form {...form}>
      <h3>Properties</h3>
      {formFields.map(field => (
        <div key={field.name} className="form-group">
          <label>{field.label}</label>
          {renderFormControl(field, form.register, form.formState.errors)}
          {form.formState.errors[field.name] && (
            <span className="error">{form.formState.errors[field.name]?.message}</span>
          )}
        </div>
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

## Implementation Status

### Phase 1: Foundation ✅ COMPLETED

- ✅ Basic text/number/boolean controls
- ✅ Core schema analyzer and control mapper
- ✅ React Hook Form integration
- ✅ Support for 13 control types: text, number, boolean, select, textarea, file, password, email, url, date, time, datetime-local, color
- ✅ Intelligent type inference from Zod schemas
- ✅ Form validation and error handling
- ✅ Live form updates with onChange callbacks

### Phase 2: Enhanced Controls 🚧 IN PROGRESS

- ⏳ Arrays, objects, conditional fields
- ⏳ Complex UI controls (JSON editor, color picker)
- ✅ Field validation and error handling
- ⏳ Advanced control metadata (min/max, step, placeholder)

### Phase 3: Advanced Features 📋 PLANNED

- 📋 Custom control registration system
- 📋 Conditional logic and field dependencies
- 📋 Performance optimizations and lazy loading

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

## Implementation Details

### NodeConfig Base Class Enhancement

The `NodeConfig` base class now supports field configuration and layout:

```typescript
export class NodeConfig {
  constructor(
    schema: ZodRawShape,
    defaults: T,
    metadata: {
      fields: Record<string, UIFieldMetadata>;
      layout?: {
        groups?: Record<string, { label: string; order: number }>;
      };
    },
  ) {
    this.schema = schema;
    this.defaults = defaults;
    this.fields = metadata.fields;
    this.layout = metadata.layout;
  }

  parse(data: unknown) {
    return this.schema.parse(data);
  }

  safeParse(data: unknown) {
    return this.schema.safeParse(data);
  }
}
```

### Supported Control Types

The system supports 13 control types with intelligent inference:

1. **text** - Basic text input (default for z.string())
2. **number** - Numeric input (default for z.number())
3. **boolean** - Checkbox (default for z.boolean())
4. **select** - Dropdown with options (for z.enum() or custom options)
5. **textarea** - Multi-line text input
6. **file** - File input with validation
7. **password** - Masked text input
8. **email** - Email validation input
9. **url** - URL validation input
10. **date** - Date picker
11. **time** - Time picker
12. **datetime-local** - Date and time picker
13. **color** - Color picker

### Backward Compatibility

The system maintains 100% backward compatibility:

- Nodes without UI metadata continue to work
- Display-only fallback for missing metadata
- Progressive enhancement approach

## Benefits

The implemented node configuration system provides:

- **Type Safety**: Full TypeScript support with Zod schemas
- **Performance**: Minimal re-renders with React Hook Form
- **Developer Experience**: Declarative configuration definitions
- **Extensibility**: 13+ control types with easy addition of more
- **Consistency**: Unified property panel experience across all nodes
- **Validation**: Real-time form validation with clear error messages
- **User Experience**: Intuitive form controls instead of raw JSON editing
