import { useNodes } from "@atomiton/editor";
import { Form } from "@atomiton/form";
import { getNodeByType } from "@atomiton/nodes/browser";
import { Box } from "@atomiton/ui";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Error fallback component for form rendering errors
 */
function FormErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Box className="p-4">
      <div className="text-sm text-red-600">
        <p className="font-semibold mb-2">Error loading form</p>
        <p className="text-xs mb-2">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    </Box>
  );
}

/**
 * NodeInspector Component
 *
 * Displays form controls for the currently selected node based on its configuration.
 * Uses the Form component with automatic field generation from node schemas.
 */
function NodeInspector() {
  const { nodes: flowNodes, selectedId, updateNodeData } = useNodes();
  const [nodeConfig, setNodeConfig] = useState<Record<string, unknown> | null>(
    null,
  );
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );

  // Find the selected node
  const selectedNode = selectedId
    ? flowNodes.find((node) => node.id === selectedId)
    : null;

  // Load node configuration when selection changes
  useEffect(() => {
    if (selectedNode) {
      // Use the nodes API to load node config
      const loadNodeConfig = async () => {
        try {
          if (!selectedNode.type) {
            setNodeConfig(null);
            return;
          }
          const config = getNodeByType(selectedNode.type);

          // Validate that we have a valid node config with schema
          if (config && config.parameters && config.parameters.schema) {
            setNodeConfig(config);
          } else {
            // Node config is missing parameters or schema
            setNodeConfig(null);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          // Silently handle error - node config will be null
          setNodeConfig(null);
        }
      };

      loadNodeConfig();
    } else {
      setNodeConfig(null);
    }

    // Reset status when node changes
    setSubmitStatus(null);
  }, [selectedNode]);

  // Handle form submission - currently not used as we update in real-time
  // const handleSubmit = async (data: Record<string, unknown>) => {
  //   if (!selectedNode) return;

  //   setIsSubmitting(true);
  //   setSubmitStatus(null);

  //   try {
  //     // Update the node data in the store
  //     updateNodeData(selectedNode.id, data);
  //     setSubmitStatus("success");

  //     // Clear success message after 2 seconds
  //     setTimeout(() => setSubmitStatus(null), 2000);
  //   } catch (error) {
  //     console.error("Error updating node:", error);
  //     setSubmitStatus("error");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // Handle real-time form changes (updates store immediately)
  const handleChange = useCallback(
    (data: Record<string, unknown>) => {
      if (!selectedNode) return;

      // Update node data in real-time as user types
      // This ensures the blueprint always has the latest config
      updateNodeData(selectedNode.id, data);
    },
    [selectedNode, updateNodeData],
  );

  if (!selectedNode) {
    return (
      <Box className="p-4">
        <p className="text-sm text-[#7B7B7B]">
          Select a node to configure its properties
        </p>
      </Box>
    );
  }

  // Validate that we have a valid schema before attempting to render the form
  const hasValidSchema = Boolean(
    nodeConfig?.parameters?.schema &&
      typeof nodeConfig.parameters.schema === "object" &&
      nodeConfig.parameters.schema !== null,
  );

  // Extra validation to ensure the schema is a Zod schema
  const isZodSchema =
    hasValidSchema &&
    nodeConfig?.parameters?.schema &&
    ("_def" in nodeConfig.parameters.schema ||
      "parse" in nodeConfig.parameters.schema ||
      "safeParse" in nodeConfig.parameters.schema);

  if (!hasValidSchema || !isZodSchema) {
    // Schema validation failed - node has no configurable properties
    return (
      <Box className="p-4">
        <p className="text-sm text-[#7B7B7B]">
          This node type has no configurable properties
        </p>
      </Box>
    );
  }

  // Additional safety check for the schema object
  const schema = nodeConfig!.parameters.schema;
  const defaultValues =
    selectedNode.data || nodeConfig!.parameters.defaults || {};
  const fields = nodeConfig!.parameters.fields || {};

  return (
    <Box className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#000]">
          {selectedNode.type} Configuration
        </h3>
        <p className="text-xs text-[#7B7B7B] mt-1">
          Node ID: {selectedNode.id}
        </p>
      </div>

      <ErrorBoundary
        FallbackComponent={FormErrorFallback}
        resetKeys={[selectedNode.id, nodeConfig]}
        onReset={() => {
          // Clear state on reset
          setSubmitStatus(null);
        }}
      >
        <Suspense
          fallback={
            <div className="text-sm text-[#7B7B7B]">Loading form...</div>
          }
        >
          <Form
            key={`${selectedNode.id}-${selectedNode.type}`} // Force re-mount when node or type changes
            schema={schema}
            defaultValues={defaultValues}
            fields={fields}
            onChange={handleChange}
          />
        </Suspense>
      </ErrorBoundary>

      {submitStatus === "success" && (
        <p className="text-xs text-green-600 mt-2 text-center">
          Configuration updated successfully
        </p>
      )}

      {submitStatus === "error" && (
        <p className="text-xs text-red-600 mt-2 text-center">
          Failed to update configuration
        </p>
      )}
    </Box>
  );
}

export default NodeInspector;
