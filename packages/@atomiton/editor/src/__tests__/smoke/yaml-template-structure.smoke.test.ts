/**
 * YAML Template Structure Debug Test
 *
 * This test examines the actual structure of template nodes when loaded
 * from YAML to understand why handles aren't being rendered correctly.
 */

import { templates, type CompositeDefinition } from "@atomiton/nodes/browser";
import { describe, expect, it } from "vitest";

describe("YAML Template Structure Debug", () => {
  it("examines raw template node structure from YAML", () => {
    const helloWorldTemplate = templates.find(
      (t: CompositeDefinition) =>
        t.id === "550e8400-e29b-41d4-a716-446655440001",
    );

    if (!helloWorldTemplate) {
      console.warn("Hello-world template not found");
      return;
    }

    const templateNodes = helloWorldTemplate.nodes;
    const greetingCodeNode = templateNodes.find(
      (n) => n.id === "greeting-code",
    );

    if (!greetingCodeNode) {
      console.warn("greeting-code node not found");
      return;
    }

    console.log("=== DEBUG: Raw Template Node Structure (from YAML) ===");
    console.log("Node ID:", greetingCodeNode.id);
    console.log("Node Type:", greetingCodeNode.type);
    console.log("Node Keys:", Object.keys(greetingCodeNode));
    console.log("Full Node:", JSON.stringify(greetingCodeNode, null, 2));

    // Check if the node has inputPorts and outputPorts as top-level properties
    console.log("Has inputPorts property:", "inputPorts" in greetingCodeNode);
    console.log("Has outputPorts property:", "outputPorts" in greetingCodeNode);

    // Check what's in the data property
    console.log("Node data:", greetingCodeNode.data);
    if (greetingCodeNode.data) {
      console.log("Data keys:", Object.keys(greetingCodeNode.data));
      console.log(
        "Data has inputPorts:",
        "inputPorts" in greetingCodeNode.data,
      );
      console.log(
        "Data has outputPorts:",
        "outputPorts" in greetingCodeNode.data,
      );
    }

    // Check position structure (may not exist on template nodes)
    if ("position" in greetingCodeNode) {
      console.log("Position:", greetingCodeNode.position);
    } else {
      console.log("Position: Not defined (will be set by editor)");
    }

    // Verify this is a CompositeNodeSpec, not an AtomitonNode
    expect(greetingCodeNode).toHaveProperty("id");
    expect(greetingCodeNode).toHaveProperty("type");
    // Position is optional on template nodes

    // CompositeNodeSpec DOES have inputPorts/outputPorts as they are complete node specifications
    expect(greetingCodeNode).toHaveProperty("inputPorts");
    expect(greetingCodeNode).toHaveProperty("outputPorts");
    expect(Array.isArray(greetingCodeNode.inputPorts)).toBe(true);
    expect(Array.isArray(greetingCodeNode.outputPorts)).toBe(true);
  });

  it("compares CompositeNodeSpec vs AtomitonNode structure", () => {
    // Get the template (CompositeDefinition)
    const helloWorldTemplate = templates.find(
      (t: CompositeDefinition) =>
        t.id === "550e8400-e29b-41d4-a716-446655440001",
    );

    if (!helloWorldTemplate) return;

    const compositeNodeSpec = helloWorldTemplate.nodes.find(
      (n) => n.id === "greeting-code",
    );
    if (!compositeNodeSpec) return;

    console.log("=== DEBUG: CompositeNodeSpec vs AtomitonNode ===");

    console.log("CompositeNodeSpec structure:");
    console.log("- Keys:", Object.keys(compositeNodeSpec));
    console.log("- Type:", compositeNodeSpec.type);
    console.log(
      "- Data keys:",
      compositeNodeSpec.data ? Object.keys(compositeNodeSpec.data) : "no data",
    );

    // The structure: CompositeNodeSpec includes full node definitions
    // These are complete node specifications with ports included
    // Editor can use them directly after converting to EditorNode format

    console.log("\nThis reveals the structure:");
    console.log("- Templates contain complete node specifications with ports");
    console.log("- These are fully-formed nodes ready for use in the editor");
    console.log(
      "- Editor converts CompositeNodeSpec -> EditorNode for ReactFlow",
    );
  });
});
