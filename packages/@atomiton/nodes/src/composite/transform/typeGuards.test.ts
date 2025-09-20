import { describe, expect, it } from "vitest";
import {
  extractPosition,
  isEdgeLike,
  isNodeLike,
  isRecord,
  safeBoolean,
  safeNumber,
  safeObject,
  safeString,
} from "./typeGuards";

describe("typeGuards", () => {
  describe("isRecord", () => {
    it("should return true for plain objects", () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ a: 1, b: "test" })).toBe(true);
      expect(isRecord({ nested: { deep: true } })).toBe(true);
    });

    it("should return false for null", () => {
      expect(isRecord(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isRecord(undefined)).toBe(false);
    });

    it("should return false for primitives", () => {
      expect(isRecord("string")).toBe(false);
      expect(isRecord(123)).toBe(false);
      expect(isRecord(true)).toBe(false);
      expect(isRecord(false)).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isRecord([])).toBe(false);
      expect(isRecord([1, 2, 3])).toBe(false);
      expect(isRecord(["a", "b"])).toBe(false);
    });

    it("should return false for functions", () => {
      expect(isRecord(() => {})).toBe(false);
      expect(isRecord(function test() {})).toBe(false);
    });

    it("should return false for built-in objects (not plain objects)", () => {
      expect(isRecord(new Date())).toBe(false);
      expect(isRecord(new RegExp("test"))).toBe(false);
      expect(isRecord(new Map())).toBe(false);
      expect(isRecord(new Set())).toBe(false);
    });

    it("should return true for object instances", () => {
      class TestClass {}
      expect(isRecord(new TestClass())).toBe(true);
      expect(isRecord(Object.create(null))).toBe(true);
    });
  });

  describe("isNodeLike", () => {
    it("should return true for valid node-like objects", () => {
      expect(isNodeLike({ id: "test", name: "Test", type: "debug" })).toBe(
        true,
      );
      expect(
        isNodeLike({
          id: "node1",
          name: "Node 1",
          type: "function",
          category: "logic",
        }),
      ).toBe(true);
    });

    it("should return true for objects with extra properties", () => {
      expect(
        isNodeLike({
          id: "test",
          name: "Test",
          type: "debug",
          extraProp: "should be ignored",
          reactFlowProp: true,
        }),
      ).toBe(true);
    });

    it("should return false for objects missing required fields", () => {
      expect(isNodeLike({})).toBe(false);
      expect(isNodeLike({ id: "test" })).toBe(false);
      expect(isNodeLike({ id: "test", name: "Test" })).toBe(false);
      expect(isNodeLike({ name: "Test", type: "debug" })).toBe(false);
    });

    it("should return false for objects with wrong field types", () => {
      expect(isNodeLike({ id: 123, name: "Test", type: "debug" })).toBe(false);
      expect(isNodeLike({ id: "test", name: null, type: "debug" })).toBe(false);
      expect(isNodeLike({ id: "test", name: "Test", type: 456 })).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(isNodeLike(null)).toBe(false);
      expect(isNodeLike(undefined)).toBe(false);
      expect(isNodeLike("string")).toBe(false);
      expect(isNodeLike([])).toBe(false);
    });
  });

  describe("isEdgeLike", () => {
    it("should return true for valid edge-like objects", () => {
      expect(
        isEdgeLike({
          id: "edge1",
          source: "node1",
          target: "node2",
        }),
      ).toBe(true);
    });

    it("should return true for objects with extra properties", () => {
      expect(
        isEdgeLike({
          id: "edge1",
          source: "node1",
          target: "node2",
          animated: true,
          style: { stroke: "red" },
          reactFlowProp: "ignored",
        }),
      ).toBe(true);
    });

    it("should return false for objects missing required fields", () => {
      expect(isEdgeLike({})).toBe(false);
      expect(isEdgeLike({ id: "edge1" })).toBe(false);
      expect(isEdgeLike({ id: "edge1", source: "node1" })).toBe(false);
      expect(isEdgeLike({ source: "node1", target: "node2" })).toBe(false);
    });

    it("should return false for objects with wrong field types", () => {
      expect(
        isEdgeLike({
          id: 123,
          source: "node1",
          target: "node2",
        }),
      ).toBe(false);
      expect(
        isEdgeLike({
          id: "edge1",
          source: null,
          target: "node2",
        }),
      ).toBe(false);
      expect(
        isEdgeLike({
          id: "edge1",
          source: "node1",
          target: 456,
        }),
      ).toBe(false);
    });

    it("should return false for non-objects", () => {
      expect(isEdgeLike(null)).toBe(false);
      expect(isEdgeLike(undefined)).toBe(false);
      expect(isEdgeLike("string")).toBe(false);
      expect(isEdgeLike([])).toBe(false);
    });
  });

  describe("extractPosition", () => {
    it("should extract position from direct position property", () => {
      const obj = { position: { x: 100, y: 200 } };
      expect(extractPosition(obj)).toEqual({ x: 100, y: 200 });
    });

    it("should extract position from settings.ui.position", () => {
      const obj = {
        settings: {
          ui: {
            position: { x: 50, y: 75 },
          },
        },
      };
      expect(extractPosition(obj)).toEqual({ x: 50, y: 75 });
    });

    it("should prefer direct position over settings.ui.position", () => {
      const obj = {
        position: { x: 100, y: 200 },
        settings: {
          ui: {
            position: { x: 50, y: 75 },
          },
        },
      };
      expect(extractPosition(obj)).toEqual({ x: 100, y: 200 });
    });

    it("should return default position when none found", () => {
      expect(extractPosition({})).toEqual({ x: 0, y: 0 });
      expect(extractPosition({ position: null })).toEqual({ x: 0, y: 0 });
      expect(extractPosition({ position: "invalid" })).toEqual({ x: 0, y: 0 });
    });

    it("should handle partial positions by returning default", () => {
      // isPosition requires both x and y to be numbers, so partial positions fall back to default
      expect(extractPosition({ position: { x: 100 } })).toEqual({
        x: 0,
        y: 0,
      });
      expect(extractPosition({ position: { y: 200 } })).toEqual({
        x: 0,
        y: 0,
      });
      expect(
        extractPosition({
          position: { x: "invalid", y: 200 },
        }),
      ).toEqual({ x: 0, y: 0 });
    });

    it("should handle non-object inputs gracefully", () => {
      expect(
        extractPosition(null as unknown as Record<string, unknown>),
      ).toEqual({ x: 0, y: 0 });
      expect(
        extractPosition(undefined as unknown as Record<string, unknown>),
      ).toEqual({ x: 0, y: 0 });
      expect(
        extractPosition("string" as unknown as Record<string, unknown>),
      ).toEqual({ x: 0, y: 0 });
      expect(extractPosition([] as unknown as Record<string, unknown>)).toEqual(
        { x: 0, y: 0 },
      );
    });
  });

  describe("safeString", () => {
    it("should return string values unchanged", () => {
      expect(safeString("hello")).toBe("hello");
      expect(safeString("")).toBe("");
      expect(safeString("  whitespace  ")).toBe("  whitespace  ");
    });

    it("should return default for non-string values", () => {
      expect(safeString(null)).toBe("");
      expect(safeString(undefined)).toBe("");
      expect(safeString(123)).toBe("");
      expect(safeString(true)).toBe("");
      expect(safeString({})).toBe("");
      expect(safeString([])).toBe("");
    });

    it("should use custom default value", () => {
      expect(safeString(null, "default")).toBe("default");
      expect(safeString(undefined, "fallback")).toBe("fallback");
      expect(safeString(123, "not-a-number")).toBe("not-a-number");
    });

    it("should prefer actual string over default", () => {
      expect(safeString("actual", "default")).toBe("actual");
      expect(safeString("", "default")).toBe("");
    });
  });

  describe("safeNumber", () => {
    it("should return number values unchanged", () => {
      expect(safeNumber(42)).toBe(42);
      expect(safeNumber(0)).toBe(0);
      expect(safeNumber(-15.5)).toBe(-15.5);
      expect(safeNumber(Infinity)).toBe(Infinity);
    });

    it("should return default for non-number values", () => {
      expect(safeNumber(null)).toBe(0);
      expect(safeNumber(undefined)).toBe(0);
      expect(safeNumber("123")).toBe(0);
      expect(safeNumber(true)).toBe(0);
      expect(safeNumber({})).toBe(0);
      expect(safeNumber([])).toBe(0);
    });

    it("should handle NaN", () => {
      expect(safeNumber(NaN)).toBe(NaN); // NaN is a number, so it's returned as-is
    });

    it("should use custom default value", () => {
      expect(safeNumber(null, 100)).toBe(100);
      expect(safeNumber("invalid", -1)).toBe(-1);
      expect(safeNumber(undefined, 3.14)).toBe(3.14);
    });

    it("should prefer actual number over default", () => {
      expect(safeNumber(42, 100)).toBe(42);
      expect(safeNumber(0, 100)).toBe(0);
    });
  });

  describe("safeBoolean", () => {
    it("should return boolean values unchanged", () => {
      expect(safeBoolean(true)).toBe(true);
      expect(safeBoolean(false)).toBe(false);
    });

    it("should return default for non-boolean values", () => {
      expect(safeBoolean(null)).toBe(false);
      expect(safeBoolean(undefined)).toBe(false);
      expect(safeBoolean("true")).toBe(false);
      expect(safeBoolean(1)).toBe(false);
      expect(safeBoolean(0)).toBe(false);
      expect(safeBoolean({})).toBe(false);
      expect(safeBoolean([])).toBe(false);
    });

    it("should use custom default value", () => {
      expect(safeBoolean(null, true)).toBe(true);
      expect(safeBoolean("invalid", true)).toBe(true);
      expect(safeBoolean(undefined, true)).toBe(true);
    });

    it("should prefer actual boolean over default", () => {
      expect(safeBoolean(false, true)).toBe(false);
      expect(safeBoolean(true, false)).toBe(true);
    });
  });

  describe("safeObject", () => {
    it("should return record objects unchanged", () => {
      const obj = { a: 1, b: "test" };
      expect(safeObject(obj)).toBe(obj);

      const nested = { x: { y: { z: 1 } } };
      expect(safeObject(nested)).toBe(nested);
    });

    it("should return default for non-record values", () => {
      expect(safeObject(null)).toEqual({});
      expect(safeObject(undefined)).toEqual({});
      expect(safeObject("string")).toEqual({});
      expect(safeObject(123)).toEqual({});
      expect(safeObject(true)).toEqual({});
      expect(safeObject([])).toEqual({});
    });

    it("should return default for built-in objects (not plain objects)", () => {
      const date = new Date();
      const regex = new RegExp("test");
      const map = new Map();

      expect(safeObject(date)).toEqual({});
      expect(safeObject(regex)).toEqual({});
      expect(safeObject(map)).toEqual({});
    });

    it("should use custom default value", () => {
      const defaultObj = { default: true };
      expect(safeObject(null, defaultObj)).toBe(defaultObj);
      expect(safeObject("invalid", defaultObj)).toBe(defaultObj);
      expect(safeObject([], defaultObj)).toBe(defaultObj);
    });

    it("should prefer actual record over default", () => {
      const actual = { actual: true };
      const defaultObj = { default: true };
      expect(safeObject(actual, defaultObj)).toBe(actual);
    });

    it("should handle class instances correctly", () => {
      class TestClass {
        constructor(public value: number) {}
      }
      const instance = new TestClass(42);
      expect(safeObject(instance)).toBe(instance);
    });
  });
});
