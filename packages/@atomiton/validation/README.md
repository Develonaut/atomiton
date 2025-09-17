# @atomiton/validation

Centralized Zod exports and common validators for the Atomiton platform.

## Purpose

This package centralizes our Zod dependency in one place, making it easy to switch validation libraries if needed in the future. It's a thin wrapper that re-exports Zod directly plus a few essential validators.

## Installation

```bash
pnpm add @atomiton/validation
```

## Usage

Use Zod directly through this package:

```typescript
import { z, validators } from '@atomiton/validation';

// Use Zod as normal
const UserSchema = z.object({
  name: z.string().min(1),
  email: validators.email, // Use pre-built validators
  age: z.number().optional(),
});

// Validate data using Zod's built-in methods
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error.format());
}
```

## API

### Zod Re-exports

Everything from Zod is re-exported. Use it exactly as you would use Zod directly.

### Common Validators

- `validators.uuid` - UUID v4 validation
- `validators.email` - Email validation
- `validators.url` - URL validation
- `validators.semver` - Semantic version validation

## That's it!

No wrapper functions. No custom types. No abstractions. Just Zod + 4 validators.

Use Zod's excellent API directly. When you need a common validator, grab it from `validators`.

## License

Private - Internal use only
