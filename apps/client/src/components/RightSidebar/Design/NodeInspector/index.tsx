import { useEditorNodes } from "@atomiton/editor";
import { Form, type ZodSchema, type FieldsMetadata } from "@atomiton/form";
import { getNodeDefinition } from "@atomiton/nodes/definitions";
import { Box } from "@atomiton/ui";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

function NodeInspector() {
  const { setNodes, nodes } = useEditorNodes();
  const [selectedId] = useState<string | null>(null);
  const [nodeConfig, setNodeConfig] = useState<ReturnType<
    typeof getNodeDefinition
  > | null>(null);

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
        setNodeConfig(config?.parameters?.schema ? config : null);
      } catch {
        setNodeConfig(null);
      }
    } else {
      setNodeConfig(null);
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

  if (!nodeConfig?.parameters?.schema) {
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

      <ErrorBoundary
        fallback={
          <div className="text-sm text-red-600">
            <p className="font-semibold mb-2">Error loading form</p>
          </div>
        }
        resetKeys={[selectedNode.id]}
      >
        <Suspense
          fallback={
            <div className="text-sm text-[#7B7B7B]">Loading form...</div>
          }
        >
          <Form
            key={`${selectedNode.id}-${selectedNode.type}`}
            schema={nodeConfig.parameters.schema as ZodSchema}
            defaultValues={
              selectedNode.data || nodeConfig.parameters.defaults || {}
            }
            fields={(nodeConfig.parameters.fields || {}) as FieldsMetadata}
            onChange={(data) => updateNodeData(selectedNode.id, data)}
          />
        </Suspense>
      </ErrorBoundary>
    </Box>
  );
}

export default NodeInspector;
