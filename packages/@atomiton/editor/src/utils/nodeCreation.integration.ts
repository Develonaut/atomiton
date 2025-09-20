/**
 * ReactFlow Integration Smoke Tests
 *
 * Lightweight tests to catch critical ReactFlow integration breakage early.
 * These must run in <5 seconds and focus on the most common failure points.
 *
 * Critical areas tested:
 * - Node creation with proper ReactFlow structure
 * - Edge creation logic
 * - Type compatibility after refactoring
 *
 * Performance requirement: Complete in <100ms total
 */

import { describe, expect, it } from "vitest";
import { createEdgeFromLastNode, createNode } from "./nodeCreation";

describe("ReactFlow Integration Smoke Tests", () => {
  // Core smoke test: Can we create nodes that ReactFlow can use?
  it("creates valid ReactFlow nodes", () => {
    const node = createNode("greeting", { x: 100, y: 100 });

    // Essential ReactFlow requirements
    expect(node.id).toBeDefined();
    expect(node.position).toEqual({ x: 100, y: 100 });
    expect(node.data).toBeDefined();

    // Critical: Ports must be arrays to prevent handle errors
    expect(Array.isArray(node.inputPorts)).toBe(true);
    expect(Array.isArray(node.outputPorts)).toBe(true);
  });

  // Core smoke test: Can we create edges between nodes?
  it("creates valid ReactFlow edges", () => {
    const sourceNode = createNode("greeting", { x: 0, y: 0 });
    const targetNode = createNode("display", { x: 200, y: 0 });
    const edge = createEdgeFromLastNode(sourceNode.id, targetNode.id);

    // Essential ReactFlow edge requirements
    expect(edge.id).toBeDefined();
    expect(edge.source).toBe(sourceNode.id);
    expect(edge.target).toBe(targetNode.id);
    expect(edge.source).not.toBe(edge.target);
  });

  // Performance smoke test: Operations should be fast
  it("performs node creation quickly", () => {
    const startTime = performance.now();

    // Create 10 nodes (realistic small workflow)
    const nodes = Array.from({ length: 10 }, (_, i) =>
      createNode("greeting", { x: i * 100, y: 0 }),
    );

    const duration = performance.now() - startTime;

    // Should complete very quickly
    expect(duration).toBeLessThan(10); // 10ms for 10 nodes
    expect(nodes).toHaveLength(10);
  });
});
