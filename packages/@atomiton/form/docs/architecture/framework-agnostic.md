# UI Framework Agnostic Architecture

## Overview

The @atomiton/form package is designed with a framework-agnostic core, enabling it to work with any UI framework or vanilla JavaScript.

## Current Architecture

Currently, the package is tightly coupled with React:

```
@atomiton/form (React-dependent)
├── Components (React)
├── Hooks (React)
├── Store (Zustand - framework agnostic)
└── Validators (framework agnostic)
```

## Target Architecture

The goal is to separate concerns into distinct packages:

```
@atomiton/form-core (No framework dependencies)
├── Store (Zustand)
├── Validators
├── Form Engine
└── Types

@atomiton/form-react
├── Components
├── Hooks
└── React Adapters

@atomiton/form-vue
├── Components
├── Composables
└── Vue Adapters

@atomiton/form-solid
├── Components
├── Stores
└── Solid Adapters
```

## Core Package Design

### Form Engine

The core form engine will be a pure JavaScript class:

```typescript
class FormEngine<T> {
  private store: FormStore<T>;
  private validators: Map<string, ValidatorFunction[]>;

  constructor(config: FormConfig<T>) {
    this.store = createFormStore(config);
    this.validators = new Map();
  }

  // Framework-agnostic methods
  setValue(field: keyof T, value: T[keyof T]): void;
  getValue(field: keyof T): T[keyof T];
  validate(): Promise<boolean>;
  submit(handler: (values: T) => void): Promise<void>;

  // Subscribe to changes (for framework adapters)
  subscribe(listener: (state: FormState<T>) => void): () => void;
}
```

### Validation Layer

Validators remain framework-agnostic:

```typescript
interface Validator {
  validate(value: unknown): ValidationResult;
}

// Adapters for validation libraries
const zodAdapter = createAdapter(zodSchema);
const yupAdapter = createAdapter(yupSchema);
const joiAdapter = createAdapter(joiSchema);
```

## Framework Adapters

### React Adapter

```typescript
// Hooks
function useFormEngine<T>(config: FormConfig<T>): FormEngine<T> {
  const engineRef = useRef<FormEngine<T>>();

  if (!engineRef.current) {
    engineRef.current = new FormEngine(config);
  }

  const state = useSyncExternalStore(engineRef.current.subscribe, () =>
    engineRef.current.getState(),
  );

  return { engine: engineRef.current, state };
}

// Components
export function Form({ engine, children }) {
  // React-specific implementation
}
```

### Vue Adapter

```typescript
// Composable
export function useForm<T>(config: FormConfig<T>) {
  const engine = new FormEngine(config);
  const state = reactive(engine.getState());

  engine.subscribe((newState) => {
    Object.assign(state, newState);
  });

  return { state, engine };
}

// Component
export default {
  setup(props) {
    const { state, engine } = useForm(props.config);
    return { state, engine };
  },
};
```

### Vanilla JavaScript

```typescript
// Direct usage without framework
const form = new FormEngine({
  initialValues: { email: "", password: "" },
});

// Register validators
form.addValidator("email", emailValidator);

// Subscribe to changes
form.subscribe((state) => {
  updateUI(state);
});

// Handle submission
document.querySelector("form").onsubmit = async (e) => {
  e.preventDefault();
  await form.submit((values) => {
    console.log("Submitted:", values);
  });
};
```

## Web Components Wrapper

For universal compatibility:

```typescript
class FormElement extends HTMLElement {
  private engine: FormEngine;

  connectedCallback() {
    const config = JSON.parse(this.getAttribute("config") || "{}");
    this.engine = new FormEngine(config);
    this.render();
  }

  render() {
    // Render form using shadow DOM
  }
}

customElements.define("atomiton-form", FormElement);
```

Usage:

```html
<atomiton-form config='{"initialValues": {}}'></atomiton-form>
```

## Migration Strategy

### Phase 1: Extract Core

1. Move store logic to form-core
2. Extract validators to form-core
3. Create FormEngine class

### Phase 2: React Adapter

1. Create React-specific package
2. Migrate existing components
3. Create adapter hooks

### Phase 3: Other Frameworks

1. Vue adapter and components
2. Solid adapter and components
3. Svelte adapter and components

### Phase 4: Web Components

1. Create web components wrapper
2. Ensure shadow DOM compatibility
3. Test cross-framework usage

## Benefits

### For Developers

- Use forms in any framework
- Smaller bundle sizes (only include what you need)
- Consistent API across frameworks
- Better testability

### For Maintenance

- Single source of truth for logic
- Framework updates don't affect core
- Easier to add new framework support
- Cleaner separation of concerns

### For Performance

- Optimized for each framework
- Tree-shaking friendly
- Lazy loading capabilities
- Reduced runtime overhead

## Challenges and Solutions

### Challenge: Type Safety

**Solution**: Generate TypeScript definitions for each adapter from core types

### Challenge: Framework-Specific Features

**Solution**: Extend core functionality in adapters while maintaining compatibility

### Challenge: Testing

**Solution**: Test core logic independently, framework adapters separately

### Challenge: Documentation

**Solution**: Shared documentation for core, framework-specific guides for adapters

## Example: Current vs Future

### Current (React Only)

```typescript
import { Form, TextField } from '@atomiton/form';

function MyForm() {
  return (
    <Form onSubmit={handleSubmit}>
      <TextField name="email" />
    </Form>
  );
}
```

### Future (Any Framework)

**React:**

```typescript
import { Form, TextField } from "@atomiton/form-react";
// Same API as current
```

**Vue:**

```vue
<template>
  <Form :config="config" @submit="handleSubmit">
    <TextField name="email" />
  </Form>
</template>

<script setup>
import { Form, TextField } from "@atomiton/form-vue";
</script>
```

**Vanilla JS:**

```javascript
import { FormEngine } from "@atomiton/form-core";

const form = new FormEngine({ initialValues: {} });
form.mount("#form-container");
```

## Timeline

- **Q1 2026**: Core extraction and React adapter
- **Q2 2026**: Vue and Solid adapters
- **Q3 2026**: Web Components and other frameworks
- **Q4 2026**: Documentation and migration tools

## Success Metrics

- Support for 4+ frameworks
- < 10KB core bundle size
- Zero breaking changes for React users
- 90% code reuse across adapters
- Framework-agnostic test coverage > 95%
