import { bench, describe } from 'vitest';
import { v, validators } from "./index";

describe('Validation Benchmarks', () => {
  const UserSchema = v.object({
    name: v.string(),
    email: validators.email,
    age: v.number().optional(),
  });

  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  };

  bench('direct zod validation', () => {
    UserSchema.parse(validData);
  });

  bench('email validator', () => {
    validators.email.parse('test@example.com');
  });

  bench('uuid validator', () => {
    validators.uuid.parse('550e8400-e29b-41d4-a716-446655440000');
  });

  bench('url validator', () => {
    validators.url.parse('https://example.com/path?query=value');
  });

  bench('semver validator', () => {
    validators.semver.parse('1.2.3');
  });
});
