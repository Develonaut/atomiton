import { useNodes } from "@atomiton/editor";
import { Form } from "@atomiton/form";
import { nodes } from "@atomiton/nodes";
import { Box } from "@atomiton/ui";
import { useCallback, useEffect, useState } from "react";

/**
 * NodeInspector Component
 *
 * Displays form controls for the currently selected node based on its configuration.
 * Uses the Form component with automatic field generation from node schemas.
 */
function NodeInspector() {
  const { nodes: flowNodes, selectedId, updateNodeData } = useNodes();
  const [nodeConfig, setNodeConfig] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      try {
        const nodePackage = nodes.getNodePackage(selectedNode.type as never);
        if (nodePackage?.config) {
          setNodeConfig(nodePackage.config);
        } else {
          setNodeConfig(null);
        }
      } catch (error) {
        console.error("Error loading node configuration:", error);
        setNodeConfig(null);
      }
    } else {
      setNodeConfig(null);
    }

    // Reset status when node changes
    setSubmitStatus(null);
  }, [selectedNode]);

  // Handle form submission
  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!selectedNode) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Update the node data in the store
      updateNodeData(selectedNode.id, data);
      setSubmitStatus("success");

      // Clear success message after 2 seconds
      setTimeout(() => setSubmitStatus(null), 2000);
    } catch (error) {
      console.error("Error updating node:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!nodeConfig?.schema) {
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
        <h3 className="text-sm font-semibold text-[#000]">
          {selectedNode.type} Configuration
        </h3>
        <p className="text-xs text-[#7B7B7B] mt-1">
          Node ID: {selectedNode.id}
        </p>
      </div>

      <Form
        schema={nodeConfig.schema}
        defaultValues={selectedNode.data || nodeConfig.defaults || {}}
        fields={nodeConfig.fields || {}}
        onSubmit={handleSubmit}
        onChange={handleChange}
        submitButtonText="Apply Changes"
        showSubmitButton={false} // Since we're updating in real-time
      />

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
