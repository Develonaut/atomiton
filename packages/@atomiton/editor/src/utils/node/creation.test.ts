import { describe, expect, it } from "vitest";
import { createEditorNode } from "#utils/node/creation";

describe("createEditorNode performance", () => {
  it("should pre-calculate port positions during creation", () => {
    const node = createEditorNode("http-request", { x: 0, y: 0 });

    // Verify ports have pre-calculated positions
    if (node.data.inputPorts.length > 0) {
      expect(node.data.inputPorts[0]).toHaveProperty("position");
      expect(node.data.inputPorts[0].position).toHaveProperty("top");
      expect(typeof node.data.inputPorts[0].position.top).toBe("string");
      expect(node.data.inputPorts[0].position.top).toMatch(/%$/);
    }

    if (node.data.outputPorts.length > 0) {
      expect(node.data.outputPorts[0]).toHaveProperty("position");
      expect(node.data.outputPorts[0].position).toHaveProperty("top");
      expect(typeof node.data.outputPorts[0].position.top).toBe("string");
      expect(node.data.outputPorts[0].position.top).toMatch(/%$/);
    }
  });

  it("should calculate correct positions for multiple ports", () => {
    const node = createEditorNode("transform", { x: 0, y: 0 });

    // If we have multiple ports, verify spacing
    if (node.data.inputPorts.length > 1) {
      const port1 = node.data.inputPorts[0];
      const port2 = node.data.inputPorts[1];

      // Check that positions are evenly distributed
      expect(port1.position.top).toContain("33.3");
      expect(port1.position.top).toContain("%");
      expect(port2.position.top).toContain("66.6");
      expect(port2.position.top).toContain("%");
    }
  });

  it("should handle nodes without ports", () => {
    const node = createEditorNode("shell-command", { x: 0, y: 0 });

    expect(node.data.inputPorts).toBeDefined();
    expect(node.data.outputPorts).toBeDefined();
    expect(Array.isArray(node.data.inputPorts)).toBe(true);
    expect(Array.isArray(node.data.outputPorts)).toBe(true);
  });
});
