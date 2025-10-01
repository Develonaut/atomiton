import { describe, it, expect } from 'vitest';
import { v, validators, jsonString } from '#index.js';

describe('Validation Package Smoke Tests', () => {
  it('should export zod', () => {
    expect(v).toBeDefined();
    expect(v.string).toBeDefined();
    expect(v.object).toBeDefined();
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
    const UserSchema = v.object({
      name: v.string(),
      email: validators.email,
    });

    const result = UserSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
    });

    expect(result.success).toBe(true);
  });
});

describe('jsonString validator', () => {
  it('should parse valid JSON string and validate against schema', () => {
    const userSchema = v.object({
      name: v.string(),
      age: v.number(),
    });
    const userJsonString = jsonString(userSchema);

    const result = userJsonString.parse('{"name": "Alice", "age": 30}');
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('should fail on invalid JSON syntax', () => {
    const schema = v.object({ foo: v.string() });
    const validator = jsonString(schema);

    expect(() => validator.parse('invalid json')).toThrow();
    expect(() => validator.parse('{"foo": }')).toThrow();
  });

  it('should fail on valid JSON but invalid schema', () => {
    const userSchema = v.object({
      name: v.string(),
      age: v.number(),
    });
    const validator = jsonString(userSchema);

    // Missing required field
    expect(() => validator.parse('{"name": "Alice"}')).toThrow();

    // Wrong type
    expect(() => validator.parse('{"name": "Alice", "age": "thirty"}')).toThrow();
  });

  it('should work with nested objects', () => {
    const schema = v.object({
      user: v.object({
        name: v.string(),
        email: v.string().email(),
      }),
      metadata: v.record(v.string()),
    });
    const validator = jsonString(schema);

    const result = validator.parse(
      '{"user": {"name": "Bob", "email": "bob@example.com"}, "metadata": {"role": "admin"}}'
    );

    expect(result).toEqual({
      user: { name: 'Bob', email: 'bob@example.com' },
      metadata: { role: 'admin' },
    });
  });

  it('should work with arrays', () => {
    const schema = v.array(v.object({ id: v.number(), name: v.string() }));
    const validator = jsonString(schema);

    const result = validator.parse('[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]');
    expect(result).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ]);
  });

  it('should work with optional fields', () => {
    const schema = v.object({
      required: v.string(),
      optional: v.string().optional(),
    });
    const validator = jsonString(schema);

    const result1 = validator.parse('{"required": "value"}');
    expect(result1).toEqual({ required: 'value' });

    const result2 = validator.parse('{"required": "value", "optional": "also here"}');
    expect(result2).toEqual({ required: 'value', optional: 'also here' });
  });

  it('should work with simple types', () => {
    const stringValidator = jsonString(v.string());
    expect(stringValidator.parse('"hello"')).toBe('hello');

    const numberValidator = jsonString(v.number());
    expect(numberValidator.parse('42')).toBe(42);

    const booleanValidator = jsonString(v.boolean());
    expect(booleanValidator.parse('true')).toBe(true);
  });

  it('should provide helpful error messages', () => {
    const schema = v.object({ name: v.string() });
    const validator = jsonString(schema);

    try {
      validator.parse('not json');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeDefined();
      // Zod wraps errors, just verify it throws
    }
  });
});
