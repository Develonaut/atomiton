import { describe, it, expect } from "vitest";
import {
  safeStringify,
  hasCircularReference,
  getNestedValue,
  setNestedValue,
  deepClone
} from "./object.js";

describe("Object Utilities", () => {
  describe("safeStringify", () => {
    it("should stringify normal objects", () => {
      const obj = { name: "John", age: 30 };
      expect(safeStringify(obj)).toBe('{"name":"John","age":30}');
    });

    it("should handle circular references", () => {
      const obj: any = { name: "John" };
      obj.self = obj;
      expect(safeStringify(obj)).toBe("[CIRCULAR_OR_INVALID]");
    });

    it("should handle null and undefined", () => {
      expect(safeStringify(null)).toBe("null");
      expect(safeStringify(undefined)).toBe(undefined);
    });

    it("should handle arrays", () => {
      expect(safeStringify([1, 2, 3])).toBe("[1,2,3]");
    });

    it("should handle nested objects", () => {
      const obj = { user: { name: "John", details: { age: 30 } } };
      expect(safeStringify(obj)).toBe('{"user":{"name":"John","details":{"age":30}}}');
    });
  });

  describe("hasCircularReference", () => {
    it("should return false for normal objects", () => {
      const obj = { name: "John", age: 30 };
      expect(hasCircularReference(obj)).toBe(false);
    });

    it("should return true for circular references", () => {
      const obj: any = { name: "John" };
      obj.self = obj;
      expect(hasCircularReference(obj)).toBe(true);
    });

    it("should return false for null and primitives", () => {
      expect(hasCircularReference(null)).toBe(false);
      expect(hasCircularReference(undefined)).toBe(false);
      expect(hasCircularReference("string")).toBe(false);
      expect(hasCircularReference(123)).toBe(false);
      expect(hasCircularReference(true)).toBe(false);
    });

    it("should handle nested circular references", () => {
      const obj: any = { user: { name: "John" } };
      obj.user.parent = obj;
      expect(hasCircularReference(obj)).toBe(true);
    });

    it("should handle arrays with circular references", () => {
      const arr: any = [1, 2, 3];
      arr.push(arr);
      expect(hasCircularReference(arr)).toBe(true);
    });

    it("should handle complex nested structures without circular refs", () => {
      const obj = {
        users: [
          { name: "John", posts: [{ title: "Post 1" }, { title: "Post 2" }] },
          { name: "Jane", posts: [{ title: "Post 3" }] }
        ]
      };
      expect(hasCircularReference(obj)).toBe(false);
    });
  });

  describe("getNestedValue", () => {
    const testObj = {
      user: {
        name: "John",
        profile: {
          age: 30,
          address: {
            city: "New York",
            country: "USA"
          }
        }
      },
      items: ["a", "b", "c"]
    };

    it("should get top level properties", () => {
      expect(getNestedValue(testObj, "items")).toEqual(["a", "b", "c"]);
    });

    it("should get nested properties", () => {
      expect(getNestedValue(testObj, "user.name")).toBe("John");
      expect(getNestedValue(testObj, "user.profile.age")).toBe(30);
      expect(getNestedValue(testObj, "user.profile.address.city")).toBe("New York");
    });

    it("should return undefined for non-existent paths", () => {
      expect(getNestedValue(testObj, "user.nonexistent")).toBeUndefined();
      expect(getNestedValue(testObj, "user.profile.nonexistent.deep")).toBeUndefined();
    });

    it("should handle null/undefined objects", () => {
      expect(getNestedValue(null, "any.path")).toBeUndefined();
      expect(getNestedValue(undefined, "any.path")).toBeUndefined();
    });

    it("should handle empty paths", () => {
      expect(getNestedValue(testObj, "")).toBe(testObj);
    });
  });

  describe("setNestedValue", () => {
    it("should set top level properties", () => {
      const obj = {};
      setNestedValue(obj, "name", "John");
      expect(obj).toEqual({ name: "John" });
    });

    it("should set nested properties", () => {
      const obj: any = {};
      setNestedValue(obj, "user.name", "John");
      expect(obj).toEqual({ user: { name: "John" } });
    });

    it("should set deeply nested properties", () => {
      const obj: any = {};
      setNestedValue(obj, "user.profile.address.city", "New York");
      expect(obj).toEqual({
        user: {
          profile: {
            address: {
              city: "New York"
            }
          }
        }
      });
    });

    it("should overwrite existing values", () => {
      const obj = { user: { name: "John" } };
      setNestedValue(obj, "user.name", "Jane");
      expect(obj.user.name).toBe("Jane");
    });

    it("should handle existing partial paths", () => {
      const obj: any = { user: {} };
      setNestedValue(obj, "user.profile.age", 30);
      expect(obj).toEqual({ user: { profile: { age: 30 } } });
    });

    it("should handle empty path", () => {
      const obj = { name: "original" };
      setNestedValue(obj, "", "new value");
      // Empty path should not modify the object
      expect(obj).toEqual({ name: "original" });
    });
  });

  describe("deepClone", () => {
    it("should clone primitive values", () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
      expect(deepClone("string")).toBe("string");
      expect(deepClone(123)).toBe(123);
      expect(deepClone(true)).toBe(true);
    });

    it("should clone arrays", () => {
      const original = [1, 2, { a: 3 }];
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it("should clone objects", () => {
      const original = { name: "John", details: { age: 30 } };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.details).not.toBe(original.details);
    });

    it("should clone Date objects", () => {
      const date = new Date("2023-01-01");
      const cloned = deepClone(date);
      
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
      expect(cloned instanceof Date).toBe(true);
    });

    it("should handle circular references gracefully", () => {
      const original: any = { name: "John" };
      original.self = original;
      
      const cloned = deepClone(original);
      
      // Should return the original object when circular reference detected
      expect(cloned).toBe(original);
    });

    it("should clone nested structures", () => {
      const original = {
        users: [
          { name: "John", posts: [{ title: "Post 1" }] },
          { name: "Jane", posts: [{ title: "Post 2" }] }
        ],
        meta: {
          created: new Date("2023-01-01"),
          tags: ["important", "work"]
        }
      };
      
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.users).not.toBe(original.users);
      expect(cloned.users[0]).not.toBe(original.users[0]);
      expect(cloned.meta.created).not.toBe(original.meta.created);
    });
  });

  describe("Performance", () => {
    it("should handle large objects efficiently", () => {
      const largeObj = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        nested: { value: i * 2 }
      }));

      const start = performance.now();
      const result = deepClone(largeObj);
      const duration = performance.now() - start;

      expect(result).toEqual(largeObj);
      expect(result).not.toBe(largeObj);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it("should detect circular references quickly", () => {
      const obj: any = { level1: { level2: { level3: {} } } };
      obj.level1.level2.level3.circular = obj;

      const start = performance.now();
      const hasCircular = hasCircularReference(obj);
      const duration = performance.now() - start;

      expect(hasCircular).toBe(true);
      expect(duration).toBeLessThan(10); // Should complete within 10ms
    });
  });
});