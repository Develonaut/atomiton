import { describe, expect, it } from "vitest";
import type { CompositeEdge, INode } from "../../base/INode";
import type { NodePortDefinition } from "../../types";
import type { NodeCategory } from "../../base/types";
import {
  buildConnectedPortsMap,
  collectOutputPorts,
  collectUnconnectedInputPorts,
  createCompositeInputPort,
  createCompositeOutputPort,
  formatCompositePortId,
  formatCompositePortName,
} from "./portCollectors";

describe("Port Collectors", () => {
  const mockPort = (id: string, name: string): NodePortDefinition => ({
    id,
    name,
    type: "input",
    dataType: "string",
  });

  const mockNode = (
    id: string,
    name: string,
    inputPorts: NodePortDefinition[] = [],
    outputPorts: NodePortDefinition[] = [],
  ): INode => ({
    id,
    name,
    type: "test",
    inputPorts,
    outputPorts,
    metadata: {
      id: name,
      name,
      description: "",
      category: "data" as NodeCategory,
      icon: "file",
      version: "1.0.0",
      runtime: { language: "typescript" },
      tags: [],
      type: "atomic",
      author: "test",
    } as any,
    parameters: {
      schema: {},
      defaults: {},
      fields: {},
      parse: () => ({}),
      safeParse: () => ({ success: true, data: {} }),
      isValid: () => true,
      withDefaults: () => ({}),
    } as any,
    execute: async () => ({ success: true, data: {} }),
    validate: () => ({ valid: true, errors: [] }),
    dispose: () => {},
    isComposite: false,
  });

  describe("collectUnconnectedInputPorts", () => {
    it("should collect all input ports when no edges exist", () => {
      const nodes: INode[] = [
        mockNode("node1", "Node 1", [mockPort("in1", "Input 1")]),
        mockNode("node2", "Node 2", [mockPort("in2", "Input 2")]),
      ];
      const edges: CompositeEdge[] = [];

      const result = collectUnconnectedInputPorts(nodes, edges);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("node1_in1");
      expect(result[0].name).toBe("Node 1 - Input 1");
      expect(result[1].id).toBe("node2_in2");
      expect(result[1].name).toBe("Node 2 - Input 2");
    });

    it("should exclude connected input ports", () => {
      const nodes: INode[] = [
        mockNode("node1", "Node 1", [mockPort("in1", "Input 1")]),
        mockNode("node2", "Node 2", [mockPort("in2", "Input 2")]),
      ];
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: "node1",
          sourceHandle: "out1",
          target: "node2",
          targetHandle: "in2",
        },
      ];

      const result = collectUnconnectedInputPorts(nodes, edges);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("node1_in1");
      expect(result[0].name).toBe("Node 1 - Input 1");
    });

    it("should handle nodes without input ports", () => {
      const nodes: INode[] = [
        mockNode("node1", "Node 1"),
        mockNode("node2", "Node 2", [mockPort("in2", "Input 2")]),
      ];
      const edges: CompositeEdge[] = [];

      const result = collectUnconnectedInputPorts(nodes, edges);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("node2_in2");
    });

    it("should handle nodes with non-array inputPorts", () => {
      const invalidNode = {
        ...mockNode("node1", "Node 1"),
        inputPorts: "invalid" as unknown as NodePortDefinition[],
      };
      const nodes: INode[] = [
        invalidNode,
        mockNode("node2", "Node 2", [mockPort("in2", "Input 2")]),
      ];
      const edges: CompositeEdge[] = [];

      const result = collectUnconnectedInputPorts(nodes, edges);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("node2_in2");
    });
  });

  describe("collectOutputPorts", () => {
    it("should collect all output ports", () => {
      const nodes: INode[] = [
        mockNode("node1", "Node 1", [], [mockPort("out1", "Output 1")]),
        mockNode("node2", "Node 2", [], [mockPort("out2", "Output 2")]),
      ];

      const result = collectOutputPorts(nodes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("node1_out1");
      expect(result[0].name).toBe("Node 1 - Output 1");
      expect(result[1].id).toBe("node2_out2");
      expect(result[1].name).toBe("Node 2 - Output 2");
    });

    it("should handle nodes without output ports", () => {
      const nodes: INode[] = [
        mockNode("node1", "Node 1"),
        mockNode("node2", "Node 2", [], [mockPort("out2", "Output 2")]),
      ];

      const result = collectOutputPorts(nodes);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("node2_out2");
    });

    it("should handle nodes with non-array outputPorts", () => {
      const invalidNode = {
        ...mockNode("node1", "Node 1"),
        outputPorts: null as unknown as NodePortDefinition[],
      };
      const nodes: INode[] = [
        invalidNode,
        mockNode("node2", "Node 2", [], [mockPort("out2", "Output 2")]),
      ];

      const result = collectOutputPorts(nodes);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("node2_out2");
    });
  });

  describe("buildConnectedPortsMap", () => {
    it("should build maps of connected ports", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: "node1",
          sourceHandle: "out1",
          target: "node2",
          targetHandle: "in2",
        },
        {
          id: "edge2",
          source: "node2",
          sourceHandle: "out2",
          target: "node3",
          targetHandle: "in3",
        },
      ];

      const result = buildConnectedPortsMap(edges);

      expect(result.inputs.size).toBe(2);
      expect(result.inputs.has("node2.in2")).toBe(true);
      expect(result.inputs.has("node3.in3")).toBe(true);

      expect(result.outputs.size).toBe(2);
      expect(result.outputs.has("node1.out1")).toBe(true);
      expect(result.outputs.has("node2.out2")).toBe(true);
    });

    it("should handle empty edges", () => {
      const edges: CompositeEdge[] = [];

      const result = buildConnectedPortsMap(edges);

      expect(result.inputs.size).toBe(0);
      expect(result.outputs.size).toBe(0);
    });
  });

  describe("createCompositeInputPort", () => {
    it("should create a composite input port with formatted ID and name", () => {
      const node = mockNode("node1", "Node 1");
      const port = mockPort("in1", "Input 1");

      const result = createCompositeInputPort(node, port);

      expect(result.id).toBe("node1_in1");
      expect(result.name).toBe("Node 1 - Input 1");
      expect(result.type).toBe(port.type);
    });

    it("should preserve original port properties", () => {
      const node = mockNode("node1", "Node 1");
      const port = mockPort("in1", "Input 1");

      const result = createCompositeInputPort(node, port);

      expect(result.dataType).toBe(port.dataType);
    });
  });

  describe("createCompositeOutputPort", () => {
    it("should create a composite output port with formatted ID and name", () => {
      const node = mockNode("node1", "Node 1");
      const port = mockPort("out1", "Output 1");

      const result = createCompositeOutputPort(node, port);

      expect(result.id).toBe("node1_out1");
      expect(result.name).toBe("Node 1 - Output 1");
      expect(result.type).toBe(port.type);
    });

    it("should preserve all original port properties", () => {
      const node = mockNode("node1", "Node 1");
      const port = mockPort("out1", "Output 1");

      const result = createCompositeOutputPort(node, port);

      expect(result.dataType).toBe(port.dataType);
    });
  });

  describe("formatCompositePortId", () => {
    it("should format port ID correctly", () => {
      expect(formatCompositePortId("node1", "port1")).toBe("node1_port1");
      expect(formatCompositePortId("my-node", "my-port")).toBe(
        "my-node_my-port",
      );
    });
  });

  describe("formatCompositePortName", () => {
    it("should format port name correctly", () => {
      expect(formatCompositePortName("Node 1", "Port 1")).toBe(
        "Node 1 - Port 1",
      );
      expect(formatCompositePortName("My Node", "My Port")).toBe(
        "My Node - My Port",
      );
    });
  });
});
