import { useEditorNodes } from "@atomiton/editor";
// Form package removed - temporarily disabled
// import { Form, type ZodSchema, type FieldsMetadata } from "@atomiton/form";
import {
  getNodeDefinition,
  getNodeSchema,
  type NodeSchemaEntry,
} from "@atomiton/nodes/definitions";
import { Box } from "@atomiton/ui";
import { useCallback, useEffect, useState } from "react";

function NodeInspector() {
  const { setNodes, nodes } = useEditorNodes();
  const [selectedId] = useState<string | null>(null);
  const [nodeConfig, setNodeConfig] = useState<ReturnType<
    typeof getNodeDefinition
  > | null>(null);
  const [nodeSchema, setNodeSchema] = useState<NodeSchemaEntry | null>(null);

  const selectedNode = selectedId
    ? nodes.find((node) => node.id === selectedId)
    : null;

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node,
        ),
      );
    },
    [setNodes],
  );

  useEffect(() => {
    if (selectedNode?.type) {
      try {
        const config = getNodeDefinition(selectedNode.type);
        const schema = getNodeSchema(selectedNode.type);
        setNodeConfig(config || null);
        setNodeSchema(schema || null);
      } catch {
        setNodeConfig(null);
        setNodeSchema(null);
      }
    } else {
      setNodeConfig(null);
      setNodeSchema(null);
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <Box className="p-4">
        <p className="text-sm text-[#7B7B7B]">
          Select a node to configure its properties
        </p>
      </Box>
    );
  }

  if (!nodeSchema?.schema) {
    return (
      <Box className="p-4">
        <p className="text-sm text-[#7B7B7B]">
          This node type has no configurable properties
        </p>
      </Box>
    );
  }

  return (
    <Box className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">
          {selectedNode.type} Configuration
        </h3>
        <p className="text-xs text-[#7B7B7B] mt-1">
          Node ID: {selectedNode.id}
        </p>
      </div>

      {/* Form component temporarily disabled - will be reimplemented */}
      <div className="text-sm text-[#7B7B7B]">
        <p>Node configuration form coming soon</p>
        <p className="text-xs mt-2">
          Schema: {nodeSchema ? "Available" : "Not available"}
        </p>
      </div>
    </Box>
  );
}

export default NodeInspector;
