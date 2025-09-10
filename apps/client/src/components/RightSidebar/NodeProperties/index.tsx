import { useNodes, useStore } from "@atomiton/editor";
import core from "@atomiton/core";
import { Box } from "@atomiton/ui";
import { useEffect, useState } from "react";

function NodeProperties() {
  const { selectedId } = useNodes();
  const nodes = useStore((state) => state.flowSnapshot.nodes);
  const [nodeConfig, setNodeConfig] = useState<any>(null);
  const [nodeType, setNodeType] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setNodeConfig(null);
      setNodeType(null);
      setNodeName(null);
      return;
    }

    // Find the selected node
    const selectedNode = nodes.find((n) => n.id === selectedId);
    if (!selectedNode) {
      setNodeConfig(null);
      setNodeType(null);
      setNodeName(null);
      return;
    }

    // Get the node type from the selected node
    const type = selectedNode.type;
    setNodeType(type);

    // Get the node package which contains the full node definition
    const nodePackage = core.nodes.getNodePackage(type as any);
    if (nodePackage) {
      // Get metadata for display name
      const metadata = nodePackage.metadata;
      setNodeName(metadata.name);

      // Get the config if it exists
      // Check if config exists and has the necessary methods
      if (
        nodePackage.config &&
        typeof nodePackage.config.getSchema === "function" &&
        typeof nodePackage.config.getDefaults === "function"
      ) {
        try {
          const configSchema = nodePackage.config.getSchema();
          const currentData = selectedNode.data || {};
          const defaults = nodePackage.config.getDefaults();

          setNodeConfig({
            schema: configSchema,
            data: currentData,
            defaults: defaults,
          });
        } catch (error) {
          console.warn(`Error getting config for node type ${type}:`, error);
          setNodeConfig(null);
        }
      } else {
        // Node doesn't have configurable properties
        setNodeConfig(null);
      }
    } else {
      // Node package not found
      console.warn(`Node package not found for type: ${type}`);
      setNodeConfig(null);
      setNodeName(null);
    }
  }, [selectedId, nodes]);

  if (!selectedId) {
    return (
      <Box className="p-4">
        <div className="text-secondary text-body-sm">
          Select a node to view its properties
        </div>
      </Box>
    );
  }

  // Show node info even if there's no config
  if (!nodeConfig && nodeName) {
    return (
      <Box className="p-4">
        <div className="mb-4">
          <h3 className="text-body-md-str text-primary mb-1">
            {nodeName} Properties
          </h3>
          <div className="text-body-sm text-secondary">Type: {nodeType}</div>
        </div>
        <div className="text-body-sm text-secondary">
          This node has no configurable properties
        </div>
      </Box>
    );
  }

  if (!nodeConfig) {
    return null;
  }

  // Extract the field information from the schema
  const fields = nodeConfig.schema?.shape
    ? Object.entries(nodeConfig.schema.shape)
    : [];

  return (
    <Box className="p-4">
      <div className="mb-4">
        <h3 className="text-body-md-str text-primary mb-1">
          {nodeName || "Node"} Properties
        </h3>
        <div className="text-body-sm text-secondary">Type: {nodeType}</div>
      </div>

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-body-sm text-secondary">
            No configurable properties
          </div>
        ) : (
          fields.map(([fieldName, fieldSchema]: [string, any]) => {
            const value =
              nodeConfig.data[fieldName] ?? nodeConfig.defaults[fieldName];
            const description = fieldSchema._def?.description || "";
            const fieldType = fieldSchema._def?.typeName || "unknown";

            return (
              <div
                key={fieldName}
                className="p-3 bg-surface-03 rounded-xl border border-s-01"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="text-body-sm-str text-primary">
                    {fieldName}
                  </div>
                  <div className="text-body-xs text-secondary/50">
                    {fieldType}
                  </div>
                </div>
                {description && (
                  <div className="text-body-xs text-secondary mb-2">
                    {description}
                  </div>
                )}
                <div className="text-body-sm text-primary/80 font-mono bg-surface-01 px-2 py-1 rounded">
                  {value !== undefined && value !== null
                    ? typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)
                    : "Not set"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Box>
  );
}

export default NodeProperties;
