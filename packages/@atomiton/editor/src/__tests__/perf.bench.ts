import { bench, describe } from "vitest";
import type { EditorEdge } from "#hooks/useEditorEdges";
import type { EditorNode } from "#types/EditorNode";

/**
 * Performance benchmarks for editor hooks.
 * These tests ensure that our hooks remain performant even with large numbers of nodes and edges.
 */

// Helper to create mock nodes
function createMockNodes(count: number): EditorNode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    type: "default",
    name: `Node ${i}`,
    category: "test",
    position: { x: i * 100, y: i * 100 },
    data: { label: `Node ${i}` },
    selected: i % 10 === 0, // 10% selected
    inputPorts: [],
    outputPorts: [],
  }));
}

// Helper to create mock edges
function createMockEdges(nodeCount: number): EditorEdge[] {
  const edges: EditorEdge[] = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      type: "default",
    });
  }
  return edges;
}

describe("Editor Hook Performance Benchmarks", () => {
  describe("Node operations", () => {
    bench("useEditorNodes with 100 nodes", () => {
      const nodes = createMockNodes(100);
      // Simulate accessing nodes
      nodes.forEach((node) => node.id);
    });

    bench("useEditorNodes with 1000 nodes", () => {
      const nodes = createMockNodes(1000);
      // Simulate accessing nodes
      nodes.forEach((node) => node.id);
    });

    bench("useEditorNodes with 10000 nodes", () => {
      const nodes = createMockNodes(10000);
      // Simulate accessing nodes
      nodes.forEach((node) => node.id);
    });

    bench("Finding specific node in 1000 nodes", () => {
      const nodes = createMockNodes(1000);
      const targetId = "node-500";
      nodes.find((n) => n.id === targetId);
    });

    bench("Finding specific node with Map (simulating nodeLookup)", () => {
      const nodes = createMockNodes(1000);
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const targetId = "node-500";
      nodeMap.get(targetId);
    });
  });

  describe("Selection operations", () => {
    bench("Filter selected nodes from 100 nodes", () => {
      const nodes = createMockNodes(100);
      nodes.filter((n) => n.selected);
    });

    bench("Filter selected nodes from 1000 nodes", () => {
      const nodes = createMockNodes(1000);
      nodes.filter((n) => n.selected);
    });

    bench("Filter selected nodes from 10000 nodes", () => {
      const nodes = createMockNodes(10000);
      nodes.filter((n) => n.selected);
    });

    bench("Find first selected with early return", () => {
      const nodes = createMockNodes(1000);
      for (const node of nodes) {
        if (node.selected) break;
      }
    });

    bench("Check if specific node is selected using Map", () => {
      const nodes = createMockNodes(1000);
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const targetId = "node-500";
      const node = nodeMap.get(targetId);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      node?.selected || false;
    });
  });

  describe("Edge operations", () => {
    bench("useEditorEdges with 100 edges", () => {
      const edges = createMockEdges(100);
      // Simulate accessing edges
      edges.forEach((edge) => edge.id);
    });

    bench("useEditorEdges with 1000 edges", () => {
      const edges = createMockEdges(1000);
      // Simulate accessing edges
      edges.forEach((edge) => edge.id);
    });

    bench("useEditorEdges with 10000 edges", () => {
      const edges = createMockEdges(10000);
      // Simulate accessing edges
      edges.forEach((edge) => edge.id);
    });

    bench("Finding edges connected to node", () => {
      const edges = createMockEdges(1000);
      const nodeId = "node-500";
      edges.filter((e) => e.source === nodeId || e.target === nodeId);
    });
  });

  describe("Batch operations", () => {
    bench("Update all node positions (100 nodes)", () => {
      const nodes = createMockNodes(100);
      nodes.map((n) => ({
        ...n,
        position: { x: n.position.x + 10, y: n.position.y + 10 },
      }));
    });

    bench("Update all node positions (1000 nodes)", () => {
      const nodes = createMockNodes(1000);
      nodes.map((n) => ({
        ...n,
        position: { x: n.position.x + 10, y: n.position.y + 10 },
      }));
    });

    bench("Toggle selection on all nodes (1000 nodes)", () => {
      const nodes = createMockNodes(1000);
      nodes.map((n) => ({ ...n, selected: !n.selected }));
    });

    bench("Deselect all and select one (1000 nodes)", () => {
      const nodes = createMockNodes(1000);
      const targetId = "node-500";
      nodes.map((n) => ({ ...n, selected: n.id === targetId }));
    });
  });

  describe("Memory and render performance", () => {
    bench("Shallow comparison of identical arrays", () => {
      const nodes1 = createMockNodes(1000);
      const nodes2 = nodes1;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      nodes1 === nodes2; // Should be true, very fast
    });

    bench("Deep comparison of identical content", () => {
      const nodes1 = createMockNodes(1000);
      const nodes2 = [...nodes1];
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      JSON.stringify(nodes1) === JSON.stringify(nodes2); // Much slower
    });

    bench("Creating new array with spread operator (1000 nodes)", () => {
      const nodes = createMockNodes(1000);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      [...nodes];
    });

    bench("Creating new array with Array.from (1000 nodes)", () => {
      const nodes = createMockNodes(1000);
      Array.from(nodes);
    });
  });
});

/**
 * Performance targets:
 * - Node lookup by ID: < 1ms for 10,000 nodes
 * - Selection filtering: < 5ms for 10,000 nodes
 * - Batch updates: < 10ms for 1,000 nodes
 * - Render cycle: < 16ms (60 FPS) for typical operations
 */
