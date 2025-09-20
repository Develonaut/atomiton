/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { isEditorNode } from "./EditorNode";
import type { EditorNode } from "./EditorNode";

describe("EditorNode type guards", () => {
  describe("isEditorNode", () => {
    it("should return true for valid EditorNode", () => {
      const validNode: EditorNode = {
        id: "node-1",
        type: "test-node",
        name: "Test Node",
        category: "test",
        version: "1.0.0",
        inputPorts: [],
        outputPorts: [],
        metadata: {},
        data: {},
        position: { x: 100, y: 200 },
      };

      expect(isEditorNode(validNode)).toBe(true);
    });

    it("should return true for EditorNode with all optional properties", () => {
      const fullNode: EditorNode = {
        id: "node-1",
        type: "test-node",
        name: "Test Node",
        category: "test",
        version: "1.0.0",
        inputPorts: [],
        outputPorts: [],
        metadata: {},
        data: { config: "value" },
        position: { x: 100, y: 200 },
        selected: true,
        draggable: false,
        selectable: true,
        connectable: false,
        deletable: true,
        focusable: false,
        hidden: true,
        dragging: false,
        resizing: true,
        zIndex: 10,
        ariaLabel: "Test node",
        style: { color: "red" },
        className: "test-class",
        parentNode: "parent-1",
        expandParent: true,
        positionAbsolute: { x: 150, y: 250 },
        width: 200,
        height: 100,
      };

      expect(isEditorNode(fullNode)).toBe(true);
    });

    describe("should return false for invalid inputs", () => {
      it("should reject null", () => {
        expect(isEditorNode(null)).toBe(false);
      });

      it("should reject undefined", () => {
        expect(isEditorNode(undefined)).toBe(false);
      });

      it("should reject primitives", () => {
        expect(isEditorNode("string")).toBe(false);
        expect(isEditorNode(123)).toBe(false);
        expect(isEditorNode(true)).toBe(false);
        expect(isEditorNode(Symbol("test"))).toBe(false);
      });

      it("should reject arrays", () => {
        expect(isEditorNode([])).toBe(false);
        expect(isEditorNode([1, 2, 3])).toBe(false);
        expect(isEditorNode([{ id: "node-1" }])).toBe(false);
      });

      it("should reject functions", () => {
        expect(isEditorNode(() => {})).toBe(false);
        expect(isEditorNode(function named() {})).toBe(false);
      });

      it("should reject objects missing required id", () => {
        const missingId = {
          type: "test-node",
          position: { x: 100, y: 200 },
        };
        expect(isEditorNode(missingId)).toBe(false);
      });

      it("should reject objects with non-string id", () => {
        const invalidId = {
          id: 123,
          type: "test-node",
          position: { x: 100, y: 200 },
        };
        expect(isEditorNode(invalidId)).toBe(false);
      });

      it("should reject objects missing required type", () => {
        const missingType = {
          id: "node-1",
          position: { x: 100, y: 200 },
        };
        expect(isEditorNode(missingType)).toBe(false);
      });

      it("should reject objects with non-string type", () => {
        const invalidType = {
          id: "node-1",
          type: 123,
          position: { x: 100, y: 200 },
        };
        expect(isEditorNode(invalidType)).toBe(false);
      });

      it("should reject objects missing position", () => {
        const missingPosition = {
          id: "node-1",
          type: "test-node",
        };
        expect(isEditorNode(missingPosition)).toBe(false);
      });

      it("should reject objects with null position", () => {
        const nullPosition = {
          id: "node-1",
          type: "test-node",
          position: null,
        };
        expect(isEditorNode(nullPosition)).toBe(false);
      });

      it("should reject objects with non-object position", () => {
        const invalidPosition = {
          id: "node-1",
          type: "test-node",
          position: "not-an-object",
        };
        expect(isEditorNode(invalidPosition)).toBe(false);
      });

      it("should reject position missing x coordinate", () => {
        const missingX = {
          id: "node-1",
          type: "test-node",
          position: { y: 200 },
        };
        expect(isEditorNode(missingX)).toBe(false);
      });

      it("should reject position missing y coordinate", () => {
        const missingY = {
          id: "node-1",
          type: "test-node",
          position: { x: 100 },
        };
        expect(isEditorNode(missingY)).toBe(false);
      });

      it("should reject position with non-number x", () => {
        const invalidX = {
          id: "node-1",
          type: "test-node",
          position: { x: "100", y: 200 },
        };
        expect(isEditorNode(invalidX)).toBe(false);
      });

      it("should reject position with non-number y", () => {
        const invalidY = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: "200" },
        };
        expect(isEditorNode(invalidY)).toBe(false);
      });

      it("should reject position with NaN coordinates", () => {
        const nanX = {
          id: "node-1",
          type: "test-node",
          position: { x: NaN, y: 200 },
        };
        expect(isEditorNode(nanX)).toBe(false);

        const nanY = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: NaN },
        };
        expect(isEditorNode(nanY)).toBe(false);
      });

      it("should reject position with Infinity coordinates", () => {
        const infX = {
          id: "node-1",
          type: "test-node",
          position: { x: Infinity, y: 200 },
        };
        expect(isEditorNode(infX)).toBe(false);

        const infY = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: -Infinity },
        };
        expect(isEditorNode(infY)).toBe(false);
      });
    });

    describe("edge cases and stress testing", () => {
      it("should handle empty object", () => {
        expect(isEditorNode({})).toBe(false);
      });

      it("should handle object with only some properties", () => {
        const partial = {
          id: "node-1",
          someOtherProperty: "value",
        };
        expect(isEditorNode(partial)).toBe(false);
      });

      it("should handle object with extra properties", () => {
        const extraProps = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: 200 },
          extraProperty: "should not affect validation",
          anotherExtra: 42,
        };
        expect(isEditorNode(extraProps)).toBe(true);
      });

      it("should handle circular references gracefully", () => {
        const circular: any = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: 200 },
        };
        circular.self = circular;

        // Should not throw and should return true since required props are valid
        expect(() => isEditorNode(circular)).not.toThrow();
        expect(isEditorNode(circular)).toBe(true);
      });

      it("should handle deeply nested position object", () => {
        const deepNested = {
          id: "node-1",
          type: "test-node",
          position: {
            x: 100,
            y: 200,
            nested: {
              deep: {
                property: "value",
              },
            },
          },
        };
        expect(isEditorNode(deepNested)).toBe(true);
      });

      it("should handle very large coordinate values", () => {
        const largeCoords = {
          id: "node-1",
          type: "test-node",
          position: { x: Number.MAX_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
        };
        expect(isEditorNode(largeCoords)).toBe(true);
      });

      it("should handle very small coordinate values", () => {
        const smallCoords = {
          id: "node-1",
          type: "test-node",
          position: { x: Number.EPSILON, y: -Number.EPSILON },
        };
        expect(isEditorNode(smallCoords)).toBe(true);
      });

      it("should handle empty string id", () => {
        const emptyId = {
          id: "",
          type: "test-node",
          position: { x: 100, y: 200 },
        };
        expect(isEditorNode(emptyId)).toBe(true); // Empty string is still a string
      });

      it("should handle empty string type", () => {
        const emptyType = {
          id: "node-1",
          type: "",
          position: { x: 100, y: 200 },
        };
        expect(isEditorNode(emptyType)).toBe(true); // Empty string is still a string
      });

      it("should handle Object.create(null) as position", () => {
        const nullProto = {
          id: "node-1",
          type: "test-node",
          position: Object.assign(Object.create(null), { x: 100, y: 200 }),
        };
        expect(isEditorNode(nullProto)).toBe(true);
      });
    });

    describe("performance and stress testing", () => {
      it("should handle repeated calls efficiently", () => {
        const validNode = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: 200 },
        };

        // Simulate "clicking 100 times" - repeated type guard calls
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          isEditorNode(validNode);
        }
        const end = performance.now();

        // Should complete quickly (less than 100ms for 1000 calls)
        expect(end - start).toBeLessThan(100);
      });

      it("should handle large objects efficiently", () => {
        const largeNode = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: 200 },
          // Add many extra properties to test performance
          ...Object.fromEntries(
            Array.from({ length: 1000 }, (_, i) => [`prop${i}`, `value${i}`]),
          ),
        };

        const start = performance.now();
        const result = isEditorNode(largeNode);
        const end = performance.now();

        expect(result).toBe(true);
        expect(end - start).toBeLessThan(50); // Should still be fast
      });
    });

    describe("browser compatibility edge cases", () => {
      it("should handle prototype pollution attempts", () => {
        const malicious = JSON.parse(
          '{"id":"node-1","type":"test-node","position":{"x":100,"y":200},"__proto__":{"isAdmin":true}}',
        );
        expect(isEditorNode(malicious)).toBe(true);
        // Ensure no prototype pollution occurred
        expect(({} as any).isAdmin).toBeUndefined();
      });

      it("should handle toString manipulation", () => {
        const manipulated = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: 200 },
          toString: () => "malicious",
        };
        expect(isEditorNode(manipulated)).toBe(true);
      });

      it("should handle valueOf manipulation", () => {
        const manipulated = {
          id: "node-1",
          type: "test-node",
          position: { x: 100, y: 200 },
          valueOf: () => 42,
        };
        expect(isEditorNode(manipulated)).toBe(true);
      });
    });
  });
});
