# @atomiton/form

A minimal, focused form library for the Atomiton ecosystem. Built on **React
Hook Form** + **Zod** with automatic field generation from schemas and seamless
integration with Atomiton's node system.

## Features

- 🚀 **Minimal & Focused** - Only ~150 lines of code, zero over-engineering
- 🎯 **Schema-First** - Generate forms automatically from Zod schemas
- 🔗 **Node Integration** - Direct compatibility with Atomiton node field
  configurations
- 🎨 **Flexible UI** - Schema inference with UI metadata override support
- ⚡ **Performance** - Built on React Hook Form for optimal performance
- 🛡️ **Type Safety** - Full TypeScript support with inferred types

## Installation

```bash
pnpm add @atomiton/form
```

## Quick Start

```typescript
import { useForm, z } from '@atomiton/form'

// Define your schema
const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0).optional(),
})

// Use in your component
function MyForm() {
  const form = useForm({ schema })

  const onSubmit = (data) => {
    console.log('Form data:', data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {form.fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          <input
            {...form.register(field.name)}
            type={field.type}
            placeholder={field.placeholder}
            required={field.required}
          />
          {form.formState.errors[field.name] && (
            <span>{form.formState.errors[field.name]?.message}</span>
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Node Integration

Perfect compatibility with Atomiton node field configurations:

```typescript
import { useForm, type FieldsConfig } from "@atomiton/form";

// This matches your node's fields configuration
const nodeFields: FieldsConfig = {
  method: {
    controlType: "select",
    label: "HTTP Method",
    options: [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
    ],
  },
  url: {
    controlType: "text",
    label: "URL",
    placeholder: "https://api.example.com",
  },
};

function NodePropertyPanel({ node }) {
  const form = useForm({
    schema: node.config.schema,
    fields: node.config.fields, // Direct compatibility
  });

  // Render your form...
}
```

## API Reference

### `useForm(options)`

The main hook for creating forms.

**Parameters:**

- `schema: ZodSchema` - Zod schema defining form structure and validation
- `defaultValues?: any` - Initial form values (optional)
- `fields?: FieldsConfig` - UI metadata for form fields (optional)

**Returns:**

- All React Hook Form methods (`register`, `handleSubmit`, `formState`, etc.)
- `fields: FieldConfig[]` - Generated field configurations

### Field Types

Automatically inferred from Zod schema:

| Zod Type             | Control Type | Notes                             |
| -------------------- | ------------ | --------------------------------- |
| `z.string()`         | `text`       | Basic text input                  |
| `z.string().email()` | `email`      | Email input with validation       |
| `z.string().url()`   | `url`        | URL input with validation         |
| `z.number()`         | `number`     | Number input with min/max support |
| `z.boolean()`        | `boolean`    | Checkbox                          |
| `z.enum()`           | `select`     | Dropdown with options             |
| `z.date()`           | `date`       | Date picker                       |
| `z.optional()`       | (any)        | Makes field optional              |

### Control Types

All Atomiton node control types supported:

`text` • `textarea` • `number` • `boolean` • `select` • `file` • `email` •
`password` • `tel` • `url` • `date` • `datetime` • `color` • `range` • `json`

## Advanced Usage

### Custom Field Configuration

Override inferred types with metadata:

```typescript
const form = useForm({
  schema: z.object({
    description: z.string(),
    priority: z.number(),
  }),
  fields: {
    description: {
      controlType: "textarea", // Override inferred 'text'
      label: "Description",
      placeholder: "Enter description...",
    },
    priority: {
      controlType: "range", // Override inferred 'number'
      label: "Priority Level",
      min: 1,
      max: 10,
    },
  },
});
```

### Default Values

```typescript
const form = useForm({
  schema,
  defaultValues: {
    name: "John Doe",
    email: "john@example.com",
  },
});
```

### Field Grouping and Ordering

```typescript
const fields = {
  name: { group: "personal", order: 1 },
  email: { group: "personal", order: 2 },
  company: { group: "work", order: 1 },
};
```

## Utilities

### `generateFieldsFromSchema(schema, fields?)`

Generate field configurations from a Zod schema:

```typescript
import { generateFieldsFromSchema, z } from "@atomiton/form";

const schema = z.object({ name: z.string() });
const fields = generateFieldsFromSchema(schema);

console.log(fields);
// [{ name: 'name', type: 'text', label: 'Name', required: true }]
```

### `getDefaultValues(schema)`

Extract default values from a Zod schema:

```typescript
import { getDefaultValues, z } from "@atomiton/form";

const schema = z.object({
  name: z.string(),
  age: z.number(),
  active: z.boolean(),
});

console.log(getDefaultValues(schema));
// { name: '', age: 0, active: false }
```

## TypeScript Support

Full type inference and safety:

```typescript
const schema = z.object({
  name: z.string(),
  age: z.number().optional(),
});

const form = useForm({ schema });

// form.getValues() returns { name: string, age?: number }
// Form fields are fully typed
form.fields[0].name; // string
form.fields[0].type; // 'text' | 'number' | 'boolean' | ...
```

## Integration with React Hook Form

This package is a thin wrapper around React Hook Form. All React Hook Form
features are available:

```typescript
const form = useForm({ schema });

// Use any React Hook Form method
form.watch("fieldName");
form.setValue("fieldName", "value");
form.trigger("fieldName");
form.formState.errors;
form.formState.isValid;
// etc...
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build package
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

Part of the Atomiton project.
