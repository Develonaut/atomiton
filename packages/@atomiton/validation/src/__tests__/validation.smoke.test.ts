import { describe, it, expect } from 'vitest';
import { z, validators } from '../index.js';

describe('Validation Package Smoke Tests', () => {
  it('should export zod', () => {
    expect(z).toBeDefined();
    expect(z.string).toBeDefined();
    expect(z.object).toBeDefined();
  });

  it('should validate with essential validators', () => {
    expect(() => validators.email.parse('test@example.com')).not.toThrow();
    expect(() => validators.uuid.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
    expect(() => validators.url.parse('https://example.com')).not.toThrow();
    expect(() => validators.semver.parse('1.2.3')).not.toThrow();
  });

  it('should handle validation errors', () => {
    expect(() => validators.email.parse('invalid-email')).toThrow();
  });

  it('should use zod directly for schemas', () => {
    const UserSchema = z.object({
      name: z.string(),
      email: validators.email,
    });

    const result = UserSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
    });

    expect(result.success).toBe(true);
  });
});
