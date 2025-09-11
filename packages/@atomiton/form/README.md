# @atomiton/form

A validation-agnostic form management package for React applications with first-class Zod support, clean architecture and TypeScript support.

## Overview

This package provides a **validation-agnostic** form builder that can work with any validation library (Zod, Yup, Joi, custom) while providing first-class support for Zod.

## Why We Built This

After evaluating existing form libraries in the React ecosystem, we decided to build our own solution for the following reasons:

### Existing Libraries Considered

1. **React Hook Form** - While excellent for performance, it tightly couples form logic with React hooks, making it difficult to integrate with our Zustand-based architecture and limiting reusability across different UI contexts.

2. **Formik** - Heavy reliance on React Context causes performance issues at scale, and its validation approach doesn't align well with our schema-first node configuration system.

3. **React Final Form** - The adapter pattern is good, but the library is overly complex for our needs and doesn't provide first-class TypeScript support.

4. **Mantine Form** - Tightly coupled to Mantine UI components, which conflicts with our custom design system requirements.

### Our Requirements

- **Validation-agnostic core** with adapters for different libraries
- **First-class Zod support** for our node configuration system
- **Zustand integration** for consistent state management across the platform
- **Granular subscriptions** to prevent unnecessary re-renders
- **CSS variables** for theming without component library lock-in
- **Clean separation** between form logic and UI components

By building our own solution, we achieve:

- Perfect integration with our existing architecture
- Optimized performance using `useSyncExternalStore` for granular updates
- Flexibility to adapt to future requirements
- Consistent patterns across the Atomiton platform

## Core Philosophy

The form package is **validation-agnostic** at its core:

- Base `Form` component works with any validation strategy
- Adapters for specific validation libraries (Zod, Yup, etc.)
- Zod gets first-class treatment as the default validator
- Custom validation functions always supported

## Architecture

```
┌─────────────────────────────────────────────┐
│              Application Layer               │
│  (apps/client, other apps)                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│            @atomiton/form                   │
├─────────────────────────────────────────────┤
│  Core (validation-agnostic)                 │
│  - Form component                           │
│  - Field components                         │
│  - Zustand store integration                │
├─────────────────────────────────────────────┤
│  Adapters                                   │
│  - zodValidator (default)                   │
│  - Custom validators                        │
└─────────────────────────────────────────────┘
```

## Features

- **Validation Agnostic**: Works with any validation library or custom validators
- **Zod First-Class**: Default integration with Zod for schema validation
- **Zustand Powered**: Leverages @atomiton/store for state management
- **Type Safe**: Full TypeScript support with proper inference
- **Performance**: Optimized re-renders using `useSyncExternalStore`
- **Accessible**: Built-in ARIA attributes and semantic HTML
- **CSS Variables**: Easy theming without component library dependencies

## Installation

```bash
pnpm add @atomiton/form
```

## Basic Usage

### Simple Form (Most Common)

```typescript
import { Form, TextField, NumberField } from '@atomiton/form';

function SimpleUserForm() {
  return (
    <Form
      initialValues={{ name: '', age: 0 }}
      onSubmit={(values) => console.log(values)}
    >
      <TextField name="name" label="Name" required />
      <NumberField name="age" label="Age" min={0} max={120} />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### With Zod Validation (Default)

```typescript
import { Form, TextField, zodValidator } from '@atomiton/form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

function LoginForm() {
  return (
    <Form
      initialValues={{ email: '', password: '' }}
      validators={{
        email: zodValidator(schema.shape.email),
        password: zodValidator(schema.shape.password)
      }}
      onSubmit={(values) => console.log(values)}
      validateOnBlur
    >
      <TextField name="email" label="Email" type="email" />
      <TextField name="password" label="Password" type="password" />
      <button type="submit">Login</button>
    </Form>
  );
}
```

### Advanced Form with Store Access

```typescript
import { Form, useFormStore } from '@atomiton/form';

function AdvancedForm() {
  const formId = 'user-form';

  return (
    <Form
      config={{
        formId,
        initialValues: { name: '', email: '' },
        validateOnChange: true,
        validateOnBlur: true
      }}
      onSubmit={(values) => console.log(values)}
    >
      <TextField name="name" label="Name" />
      <TextField name="email" label="Email" />
      <FormActions formId={formId} />
    </Form>
  );
}

function FormActions({ formId }: { formId: string }) {
  const store = useFormStore(formId);

  const handleReset = () => {
    store?.resetForm();
  };

  return (
    <div>
      <button type="submit">Submit</button>
      <button type="button" onClick={handleReset}>Reset</button>
    </div>
  );
}
```

## Field Components

All field components follow the same pattern with the "Field" suffix:

- `TextField` - Text input field
- `NumberField` - Numeric input field
- `TextareaField` - Multi-line text field
- `SelectField` - Dropdown selection field
- `CheckboxField` - Boolean checkbox field
- `RadioField` - Radio button group field

## Custom Validation

### Using Custom Validators

```typescript
const customValidator = (value: any) => {
  if (value !== 'expected') {
    return { valid: false, error: 'Value must be "expected"' };
  }
  return { valid: true };
};

<Form
  initialValues={{ custom: '' }}
  validators={{
    custom: [customValidator]
  }}
  onSubmit={handleSubmit}
>
  <TextField name="custom" label="Custom Field" />
</Form>
```

### Creating a Validation Adapter

```typescript
import { createValidator } from "@atomiton/form";

// Create adapter for any validation library
const yupValidator = createValidator((schema) => {
  return async (value) => {
    try {
      await schema.validate(value);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  };
});
```

## Node Integration

The form package is designed to integrate seamlessly with the Blueprint node system:

```typescript
import { Form, zodValidator } from '@atomiton/form';

function NodeProperties({ nodeId }) {
  const node = getNode(nodeId);
  const config = getNodeConfig(node.type);

  return (
    <Form
      initialValues={node.data || config.defaults}
      validators={config.validators}  // Zod validators
      onSubmit={(values) => updateNodeData(nodeId, values)}
      validateOnChange
    >
      {config.fields.map(field => (
        <DynamicField key={field.name} {...field} />
      ))}
    </Form>
  );
}
```

## Theming

The package uses CSS variables for easy customization:

```css
:root {
  --form-field-border: 1px solid #e2e8f0;
  --form-field-border-focus: 1px solid #3b82f6;
  --form-field-bg: white;
  --form-field-text: #1a202c;
  --form-error-text: #ef4444;
  --form-helper-text: #64748b;
  --form-label-text: #334155;
}
```

## Performance

The package uses `useSyncExternalStore` for granular subscriptions to the Zustand store, ensuring:

- Only affected fields re-render on state changes
- No unnecessary re-renders of the entire form
- Optimal performance even with large forms
- Compatibility with React concurrent features

## Type Safety

Full TypeScript support with inference:

```typescript
const schema = z.object({
  name: z.string(),
  age: z.number()
});

type FormData = z.infer<typeof schema>;

<Form<FormData>
  initialValues={{ name: '', age: 0 }}
  onSubmit={(values) => {
    // values is typed as FormData
    console.log(values.name); // string
    console.log(values.age);  // number
  }}
/>
```

## API Reference

### Form Props

- `initialValues` - Initial form values
- `onSubmit` - Submit handler
- `validators` - Field validators (optional)
- `validateOnChange` - Validate on field change (default: false)
- `validateOnBlur` - Validate on field blur (default: false)
- `validateOnSubmit` - Validate before submit (default: true)
- `config` - Advanced configuration with formId and store options

### Field Props

Common props for all field components:

- `name` - Field name (required)
- `label` - Field label
- `placeholder` - Placeholder text
- `helperText` - Helper text below field
- `required` - Mark as required
- `disabled` - Disable field
- `className` - Additional CSS classes

### Hooks

- `useForm()` - Access form context
- `useFormStore(formId)` - Access form store directly
- `useField(name)` - Connect to specific field
- `useFormMode(props)` - Detect and handle form mode

## Migration Guide

### From React Hook Form

```typescript
// Before (React Hook Form)
const { register, handleSubmit } = useForm();
<input {...register('name')} />

// After (@atomiton/form)
<Form onSubmit={handleSubmit}>
  <TextField name="name" />
</Form>
```

### From Formik

```typescript
// Before (Formik)
<Formik initialValues={...} onSubmit={...}>
  <Field name="email" />
</Formik>

// After (@atomiton/form)
<Form initialValues={...} onSubmit={...}>
  <TextField name="email" />
</Form>
```

## Documentation

For detailed documentation, see the [docs](./docs/) directory:

- [Architecture Documentation](./docs/architecture/)
- [API Reference](./docs/api/)
- [Guides and Tutorials](./docs/guides/)
- [Examples](./docs/examples/)

### Key Documentation

- [UI Framework Agnostic Design](./docs/architecture/framework-agnostic.md) - Our approach to supporting multiple frameworks
- [Validation Adapters Guide](./docs/guides/validation-adapters.md) - How to use different validation libraries
- [Roadmap](./ROADMAP.md) - Future plans and vision

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup and guidelines.

## License

MIT

---

_Last Updated: 2025-01-11_
