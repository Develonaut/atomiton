import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { jsonStringCoercion, objectOrJsonString } from '#json-coercion';

describe('jsonStringCoercion', () => {
  it('parses valid JSON string', () => {
    const schema = jsonStringCoercion(z.object({ key: z.string() }));
    const result = schema.parse('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('validates parsed JSON against schema', () => {
    const schema = jsonStringCoercion(z.object({ num: z.number() }));
    const result = schema.parse('{"num": 42}');
    expect(result).toEqual({ num: 42 });
  });

  it('rejects invalid JSON string', () => {
    const schema = jsonStringCoercion(z.object({ key: z.string() }));
    expect(() => schema.parse('invalid json')).toThrow();
  });

  it('rejects JSON that does not match schema', () => {
    const schema = jsonStringCoercion(z.object({ key: z.string() }));
    expect(() => schema.parse('{"key": 123}')).toThrow();
  });

  it('works with record schemas', () => {
    const schema = jsonStringCoercion(z.record(z.string()));
    const result = schema.parse('{"a": "1", "b": "2"}');
    expect(result).toEqual({ a: '1', b: '2' });
  });

  it('works with array schemas', () => {
    const schema = jsonStringCoercion(z.array(z.number()));
    const result = schema.parse('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('works with nested object schemas', () => {
    const schema = jsonStringCoercion(
      z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      })
    );
    const result = schema.parse('{"user": {"name": "Alice", "age": 30}}');
    expect(result).toEqual({ user: { name: 'Alice', age: 30 } });
  });

  it('preserves type safety with inferred types', () => {
    const schema = jsonStringCoercion(z.object({ key: z.string() }));
    const result = schema.parse('{"key": "value"}');
    // TypeScript should infer { key: string }
    const key: string = result.key;
    expect(key).toBe('value');
  });
});

describe('objectOrJsonString', () => {
  it('accepts valid object directly', () => {
    const schema = objectOrJsonString(z.record(z.string()));
    const result = schema.parse({ key: 'value' });
    expect(result).toEqual({ key: 'value' });
  });

  it('accepts valid JSON string', () => {
    const schema = objectOrJsonString(z.record(z.string()));
    const result = schema.parse('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('validates object against schema', () => {
    const schema = objectOrJsonString(z.object({ num: z.number() }));
    expect(() => schema.parse({ num: 'not a number' })).toThrow();
  });

  it('validates JSON string against schema', () => {
    const schema = objectOrJsonString(z.object({ num: z.number() }));
    expect(() => schema.parse('{"num": "not a number"}')).toThrow();
  });

  it('rejects invalid JSON string', () => {
    const schema = objectOrJsonString(z.record(z.string()));
    expect(() => schema.parse('invalid json')).toThrow();
  });

  it('works with complex nested schemas', () => {
    const schema = objectOrJsonString(
      z.object({
        users: z.array(
          z.object({
            name: z.string(),
            roles: z.array(z.string()),
          })
        ),
      })
    );

    // As object
    const resultObj = schema.parse({
      users: [{ name: 'Alice', roles: ['admin'] }],
    });
    expect(resultObj).toEqual({
      users: [{ name: 'Alice', roles: ['admin'] }],
    });

    // As JSON string
    const resultJson = schema.parse('{"users": [{"name": "Alice", "roles": ["admin"]}]}');
    expect(resultJson).toEqual({
      users: [{ name: 'Alice', roles: ['admin'] }],
    });
  });

  it('works with record of unknown (edit-fields use case)', () => {
    const schema = objectOrJsonString(z.record(z.unknown()));

    const resultObj = schema.parse({ foo: 'bar', num: 42, nested: { a: 1 } });
    expect(resultObj).toEqual({ foo: 'bar', num: 42, nested: { a: 1 } });

    const resultJson = schema.parse('{"foo": "bar", "num": 42, "nested": {"a": 1}}');
    expect(resultJson).toEqual({ foo: 'bar', num: 42, nested: { a: 1 } });
  });

  it('can be used with default values', () => {
    const schema = objectOrJsonString(z.record(z.string())).default({});
    expect(schema.parse(undefined)).toEqual({});
  });
});
