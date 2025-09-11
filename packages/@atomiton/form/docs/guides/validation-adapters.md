# Validation Adapters Guide

## Overview

The @atomiton/form package provides a flexible validation system that works with any validation library through adapters.

## Built-in Adapters

### Zod (Default)

Zod is the recommended validation library with first-class support:

```typescript
import { Form, TextField, zodValidator } from '@atomiton/form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+')
});

function MyForm() {
  return (
    <Form
      initialValues={{ email: '', age: 0 }}
      validators={{
        email: zodValidator(schema.shape.email),
        age: zodValidator(schema.shape.age)
      }}
      onSubmit={handleSubmit}
    >
      <TextField name="email" label="Email" />
      <NumberField name="age" label="Age" />
    </Form>
  );
}
```

### Yup

Yup support through the yupValidator adapter:

```typescript
import { Form, yupValidator } from '@atomiton/form';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email('Invalid email').required(),
  age: yup.number().min(18, 'Must be 18+').required()
});

function MyForm() {
  return (
    <Form
      initialValues={{ email: '', age: 0 }}
      validators={{
        email: yupValidator(schema.fields.email),
        age: yupValidator(schema.fields.age)
      }}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
    </Form>
  );
}
```

### Joi

Joi validation through the joiValidator adapter:

```typescript
import { Form, joiValidator } from '@atomiton/form';
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().min(18).required()
});

function MyForm() {
  return (
    <Form
      initialValues={{ email: '', age: 0 }}
      validators={{
        email: joiValidator(schema.extract('email')),
        age: joiValidator(schema.extract('age'))
      }}
      onSubmit={handleSubmit}
    >
      {/* Form fields */}
    </Form>
  );
}
```

## Custom Validators

### Simple Validator

Create custom validation logic:

```typescript
const customValidator: ValidatorFunction = async (value) => {
  if (!value || value.length < 3) {
    return { valid: false, error: 'Must be at least 3 characters' };
  }
  return { valid: true };
};

<Form
  validators={{
    username: [customValidator]
  }}
>
  <TextField name="username" />
</Form>
```

### Async Validator

Support for async validation (e.g., checking username availability):

```typescript
const checkUsername: ValidatorFunction = async (value) => {
  const response = await fetch(`/api/check-username?name=${value}`);
  const { available } = await response.json();

  if (!available) {
    return { valid: false, error: "Username already taken" };
  }
  return { valid: true };
};
```

### Composite Validators

Chain multiple validators:

```typescript
const required: ValidatorFunction = (value) => {
  if (!value) {
    return { valid: false, error: 'Required' };
  }
  return { valid: true };
};

const minLength = (min: number): ValidatorFunction => (value) => {
  if (value.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }
  return { valid: true };
};

// Use multiple validators
<Form
  validators={{
    password: [required, minLength(8)]
  }}
>
  <TextField name="password" type="password" />
</Form>
```

## Creating Custom Adapters

### Adapter Pattern

Create an adapter for any validation library:

```typescript
import type { ValidatorFunction } from "@atomiton/form";

function createCustomAdapter(schema: any): ValidatorFunction {
  return async (value: unknown) => {
    try {
      // Your validation logic here
      const result = await schema.validate(value);

      if (result.error) {
        return {
          valid: false,
          error: result.error.message,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message || "Validation failed",
      };
    }
  };
}
```

### Object Validation Adapter

For validating entire form objects:

```typescript
function createObjectAdapter(schema: any) {
  return async (values: Record<string, unknown>) => {
    try {
      const result = await schema.validate(values, {
        abortEarly: false,
      });

      if (result.errors) {
        const errors: Record<string, string> = {};
        result.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        return errors;
      }

      return {};
    } catch (error) {
      return { _form: "Validation failed" };
    }
  };
}
```

## Performance Considerations

### Debounced Validation

For expensive validations:

```typescript
import { debounce } from "lodash";

const debouncedValidator = debounce(async (value) => {
  // Expensive validation
  return checkUsername(value);
}, 500);
```

### Memoized Validation

Cache validation results:

```typescript
const cache = new Map();

const memoizedValidator: ValidatorFunction = async (value) => {
  const cacheKey = JSON.stringify(value);

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await expensiveValidation(value);
  cache.set(cacheKey, result);
  return result;
};
```

## Validation Strategies

### On Change

Validate immediately as user types:

```typescript
<Form validateOnChange>
  <TextField name="email" />
</Form>
```

### On Blur

Validate when field loses focus:

```typescript
<Form validateOnBlur>
  <TextField name="email" />
</Form>
```

### On Submit

Validate only on form submission:

```typescript
<Form validateOnSubmit>
  <TextField name="email" />
</Form>
```

### Mixed Strategy

Different strategies per field:

```typescript
<Form
  config={{
    validateOnChange: false,
    validateOnBlur: true,
    fieldConfig: {
      password: { validateOnChange: true },
      email: { validateOnBlur: true }
    }
  }}
>
  {/* Fields */}
</Form>
```

## Error Display

### Field-Level Errors

Errors are automatically passed to field components:

```typescript
<TextField
  name="email"
  // Error will be displayed automatically
/>
```

### Custom Error Display

Access errors directly:

```typescript
function CustomField({ name }) {
  const { value, error, touched } = useField(name);

  return (
    <div>
      <input value={value} />
      {touched && error && (
        <span className="error">{error}</span>
      )}
    </div>
  );
}
```

### Form-Level Errors

Handle general form errors:

```typescript
const { state } = useForm(config);

if (state.errors._form) {
  return <div className="form-error">{state.errors._form}</div>;
}
```

## Best Practices

1. **Use Schema Validation**: Prefer schema-based validation (Zod, Yup) for complex forms
2. **Validate Early**: Use validateOnBlur for better UX
3. **Clear Messages**: Provide specific, actionable error messages
4. **Async Carefully**: Debounce async validators to avoid excessive API calls
5. **Test Validators**: Unit test validation logic separately from components
6. **Type Safety**: Use TypeScript for type-safe validation
7. **Reuse Validators**: Create a library of common validators

## Migration Examples

### From React Hook Form

```typescript
// Before
const schema = yup.object({...});
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
});

// After
<Form
  validators={yupObjectValidator(schema)}
  onSubmit={handleSubmit}
>
  {/* Fields automatically handle errors */}
</Form>
```

### From Formik

```typescript
// Before
<Formik
  validationSchema={schema}
  onSubmit={handleSubmit}
>
  {({ errors, touched }) => (
    <Field name="email" />
  )}
</Formik>

// After
<Form
  validators={zodValidator(schema)}
  onSubmit={handleSubmit}
>
  <TextField name="email" />
</Form>
```
