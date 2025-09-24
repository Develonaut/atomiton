# Form Package Strategy - @atomiton/form

## Overview

This document outlines the strategy for creating a **validation-agnostic** form
package that can work with any validation library (Zod, Yup, Joi, custom) while
providing first-class support for Zod.

## Core Philosophy

The form package should be **validation-agnostic** at its core:

- Base `Form` component works with any validation strategy
- Adapters for specific validation libraries (Zod, Yup, etc.)
- Zod gets first-class treatment with a dedicated adapter
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
│  - Control components                       │
│  - Field configuration                      │
├─────────────────────────────────────────────┤
│  Adapters                                   │
│  - /zod → ZodForm (first-class)            │
│  - /yup → YupForm                          │
│  - /joi → JoiForm                          │
└─────────────────────────────────────────────┘
```

## Package Structure

```
packages/@atomiton/form/
├── src/
│   ├── index.ts                    # Core exports
│   ├── core/
│   │   ├── Form.tsx                # Base form (validation-agnostic)
│   │   ├── FormField.tsx
│   │   ├── types.ts                # Core types
│   │   └── controls/               # All control components
│   ├── adapters/
│   │   ├── zod/
│   │   │   ├── index.ts           # Export ZodForm
│   │   │   ├── ZodForm.tsx        # Zod-specific wrapper
│   │   │   └── inference.ts       # Zod type inference
│   │   ├── yup/
│   │   │   └── YupForm.tsx
│   │   └── joi/
│   │       └── JoiForm.tsx
│   └── utils/
│       └── validation.ts           # Validation helpers
```

## API Design

### Core Form (Validation-Agnostic)

```typescript
import { Form } from '@atomiton/form';

const fields = {
  name: {
    controlType: 'text',
    label: 'Name',
    placeholder: 'Enter name',
    required: true
  },
  age: {
    controlType: 'number',
    label: 'Age',
    min: 0,
    max: 120
  }
};

// Option 1: Custom validation function
function CustomValidationForm() {
  return (
    <Form
      fields={fields}
      defaultValues={{ name: '', age: 0 }}
      validate={(values) => {
        const errors: Record<string, string> = {};
        if (!values.name) errors.name = 'Name is required';
        if (values.age < 18) errors.age = 'Must be 18+';
        return errors;
      }}
      onSubmit={(values) => console.log(values)}
    />
  );
}

// Option 2: No validation (just structure)
function NoValidationForm() {
  return (
    <Form
      fields={fields}
      defaultValues={{ name: '', age: 0 }}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### Zod Adapter (First-Class Support)

```typescript
import { ZodForm } from '@atomiton/form/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Must be 18+')
});

// ZodForm automatically:
// - Extracts validation from schema
// - Infers types
// - Can optionally infer control types from schema
function MyZodForm() {
  return (
    <ZodForm
      schema={schema}
      fields={fields}  // Optional - can infer from schema
      defaultValues={{ name: '', age: 0 }}
      onSubmit={(values) => console.log(values)}
    />
  );
}

// Advanced: Let Zod infer everything
function AutoZodForm() {
  return (
    <ZodForm
      schema={schema}
      // No fields needed - inferred from schema!
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### Yup Adapter Example

```typescript
import { YupForm } from '@atomiton/form/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  age: yup.number().min(18, 'Must be 18+')
});

function MyYupForm() {
  return (
    <YupForm
      schema={schema}
      fields={fields}
      defaultValues={{ name: '', age: 0 }}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### Custom Validation Adapter

```typescript
import { createFormAdapter } from "@atomiton/form";

// Create your own adapter for any validation library
const CustomForm = createFormAdapter({
  extractValidation: (schema) => {
    // Convert your schema to validation function
    return (values) => {
      // Your validation logic
      return errors;
    };
  },
  inferFields: (schema) => {
    // Optionally infer fields from schema
    return fields;
  },
});
```

## Node Integration

```typescript
// Current implementation (Zod-specific)
import { ZodForm } from '@atomiton/form/zod';

function NodeProperties({ nodeId }) {
  const node = getNode(nodeId);
  const config = getNodeConfig(node.type);

  return (
    <ZodForm
      schema={config.schema}      // Zod schema
      fields={config.fields}       // UI configuration
      defaultValues={node.data || config.defaults}
      onSubmit={(values) => updateNodeData(nodeId, values)}
    />
  );
}
```

## Benefits of Validation-Agnostic Approach

1. **Flexibility**: Not locked into any validation library
2. **Future-Proof**: Can adapt to new validation libraries
3. **Gradual Migration**: Can switch validation libraries without rewriting
   forms
4. **Custom Logic**: Support complex business validation rules
5. **Performance**: Can optimize validation strategy per form
6. **Testing**: Easier to test without validation dependencies

## Implementation Phases

### Phase 1: Core Package

- Build validation-agnostic Form component
- Implement all control types
- Support custom validation functions

### Phase 2: Zod Adapter

- Create ZodForm component
- Add schema introspection
- Implement field inference from Zod schemas

### Phase 3: Additional Adapters

- Add Yup adapter
- Add Joi adapter
- Document custom adapter creation

### Phase 4: Advanced Features

- Conditional fields
- Array/nested object support
- Dynamic form generation

## Type Safety Strategy

```typescript
// Core types (validation-agnostic)
interface FormProps<T = any> {
  fields: FieldsConfig;
  defaultValues?: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => void;
  onChange?: (values: T) => void;
}

// Zod adapter maintains full type safety
interface ZodFormProps<T extends z.ZodType> {
  schema: T;
  fields?: FieldsConfig; // Optional with Zod
  defaultValues?: z.infer<T>;
  onSubmit: (values: z.infer<T>) => void;
  onChange?: (values: z.infer<T>) => void;
}
```

## Migration Path

1. Extract current form logic to core Form component
2. Create ZodForm adapter for current use cases
3. Update NodeProperties to use ZodForm
4. Add other adapters as needed

---

## Implementation Prompt

```
I need to implement the @atomiton/form package as a validation-agnostic form builder with first-class Zod support.

Requirements:
1. Core Form component that works without any validation library
2. Support for custom validation functions
3. ZodForm adapter that provides first-class Zod integration
4. All existing control types (text, number, boolean, select, etc.)
5. Clean separation between core and adapters

The package should:
- Be validation-library agnostic at its core
- Provide adapters for popular validation libraries
- Give Zod first-class treatment with automatic inference
- Support custom validation strategies
- Maintain full type safety where possible

Start with the core Form component and ZodForm adapter, as these are needed for the current node configuration use case.
```

---

_Last Updated: 2025-01-10_ _Status: Ready for Implementation_
