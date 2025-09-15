/**
 * Smoke test for useNodeTypes hook integration with @atomiton/nodes
 *
 * This test ensures that the nodeTypes hook correctly:
 * 1. Maps all node types from @atomiton/nodes to ReactFlow
 * 2. Uses the correct type identifiers
 * 3. Maintains consistency between what nodes export and what editor expects
 */

import { getNodes, getNodeTypes } from "@atomiton/nodes";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNodeTypes } from "./useNodeTypes";

// Mock the Node component
vi.mock("../components/Node", () => ({
  default: () => null,
}));

describe("useNodeTypes smoke test", () => {
  it("should create ReactFlow node types for all registered nodes", () => {
    const { result } = renderHook(() => useNodeTypes());
    const nodeTypes = result.current;

    // Get all registered node types from @atomiton/nodes
    const registeredNodeTypes = getNodeTypes();

    // Verify all node types are present in the ReactFlow nodeTypes
    for (const nodeType of registeredNodeTypes) {
      expect(nodeTypes).toHaveProperty(nodeType);
      expect(nodeTypes[nodeType]).toBeDefined();
    }
  });

  it("should use consistent type identifiers with hyphen format", () => {
    const { result } = renderHook(() => useNodeTypes());
    const nodeTypes = result.current;

    // Check known node types that were causing warnings
    const expectedTypes = [
      "csv-reader",
      "file-system",
      "http-request",
      "shell-command",
      "image-composite",
      "code",
      "loop",
      "parallel",
      "transform",
    ];

    for (const type of expectedTypes) {
      expect(nodeTypes).toHaveProperty(type);
    }
  });

  it("should handle composite nodes correctly", () => {
    const { result } = renderHook(() => useNodeTypes());
    const nodeTypes = result.current;

    // Composite nodes should use "composite" as their type
    expect(nodeTypes).toHaveProperty("composite");
    expect(nodeTypes["composite"]).toBeDefined();
  });

  it("should map all nodes to the same Node component", () => {
    const { result } = renderHook(() => useNodeTypes());
    const nodeTypes = result.current;

    // All node types should use the same React component
    const nodeTypeValues = Object.values(nodeTypes);
    expect(nodeTypeValues.length).toBeGreaterThan(0);

    // All should be the same component reference
    const firstComponent = nodeTypeValues[0];
    for (const component of nodeTypeValues) {
      expect(component).toBe(firstComponent);
    }
  });

  it("should match the actual nodes exported from @atomiton/nodes", () => {
    const nodes = getNodes();
    const { result } = renderHook(() => useNodeTypes());
    const nodeTypes = result.current;

    // Each node from getNodes should have a corresponding ReactFlow nodeType
    for (const node of nodes) {
      const nodeType = node.metadata.type;
      expect(nodeTypes).toHaveProperty(nodeType);
    }
  });
});
