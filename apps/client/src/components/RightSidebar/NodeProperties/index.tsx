import { useNodes, useStore } from "@atomiton/editor";
import core from "@atomiton/core";
import { Box } from "@atomiton/ui";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Import UI metadata types from nodes package
import type { UIFieldMetadata } from "@atomiton/nodes";

/**
 * Render a form control based on the field metadata and schema
 */
function renderFormControl(
  fieldName: string,
  fieldSchema: any,
  fieldMetadata: UIFieldMetadata | undefined,
  register: any,
  currentValue: any,
) {
  const fieldType = fieldSchema._def?.typeName || "unknown";
  const controlType =
    fieldMetadata?.controlType || inferControlType(fieldType, fieldSchema);
  const placeholder = fieldMetadata?.placeholder || "";
  const helpText =
    fieldMetadata?.helpText || fieldSchema._def?.description || "";
  const label = fieldMetadata?.label || fieldName;

  const commonProps = {
    id: fieldName,
    name: fieldName,
    className:
      "w-full px-3 py-2 bg-surface-01 border border-s-01 rounded-lg text-primary focus:outline-none focus:border-accent-primary",
    placeholder,
    disabled: fieldMetadata?.disabled,
    readOnly: fieldMetadata?.readOnly,
    ...register(fieldName),
  };

  switch (controlType) {
    case "boolean":
      return (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            {...commonProps}
            className="w-4 h-4 text-accent-primary bg-surface-01 border border-s-01 rounded focus:ring-accent-primary focus:ring-2"
            defaultChecked={currentValue}
          />
          <span className="text-primary">{label}</span>
        </label>
      );

    case "number":
      return (
        <input
          type="number"
          {...commonProps}
          min={fieldMetadata?.min}
          max={fieldMetadata?.max}
          step={fieldMetadata?.step}
          defaultValue={currentValue}
        />
      );

    case "textarea":
      return (
        <textarea
          {...commonProps}
          rows={fieldMetadata?.rows || 3}
          defaultValue={currentValue}
          className="w-full px-3 py-2 bg-surface-01 border border-s-01 rounded-lg text-primary focus:outline-none focus:border-accent-primary resize-vertical"
        />
      );

    case "select":
      return (
        <select
          {...commonProps}
          defaultValue={currentValue}
          className="w-full px-3 py-2 bg-surface-01 border border-s-01 rounded-lg text-primary focus:outline-none focus:border-accent-primary"
        >
          {fieldMetadata?.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "text":
    default:
      return <input type="text" {...commonProps} defaultValue={currentValue} />;
  }
}

/**
 * Infer control type from Zod schema if not explicitly specified
 */
function inferControlType(fieldType: string, fieldSchema: any): string {
  switch (fieldType) {
    case "ZodBoolean":
      return "boolean";
    case "ZodNumber":
      return "number";
    case "ZodString":
      // Check for specific string formats
      if (fieldSchema._def?.checks) {
        const checks = fieldSchema._def.checks;
        if (checks.some((c: any) => c.kind === "email")) return "email";
        if (checks.some((c: any) => c.kind === "url")) return "url";
      }
      return "text";
    default:
      return "text";
  }
}

function NodeProperties() {
  const { selectedId } = useNodes();
  const nodes = useStore((state) => state.flowSnapshot.nodes);
  const flowInstance = useStore((state) => state.flowInstance);
  const [nodeConfig, setNodeConfig] = useState<any>(null);
  const [nodeType, setNodeType] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Form submission handler
  const onSubmit = (formData: any) => {
    if (!selectedId || !flowInstance) return;

    // Update the node data using React Flow instance
    const updatedNodes = flowInstance
      .getNodes()
      .map((node) =>
        node.id === selectedId
          ? { ...node, data: { ...node.data, ...formData } }
          : node,
      );

    flowInstance.setNodes(updatedNodes);
  };

  // Reset form when node configuration changes
  useEffect(() => {
    if (nodeConfig) {
      reset(nodeConfig.data);
    }
  }, [nodeConfig, reset]);

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
    setNodeType(type || null);

    // Get the node package which contains the full node definition
    const nodePackage = core.nodes.getNodePackage(type as any);
    if (nodePackage) {
      // Get metadata for display name
      const metadata = nodePackage.metadata;
      setNodeName(metadata.name);

      // Get the config if it exists
      // Check if config exists and has the necessary properties
      if (
        nodePackage.config &&
        nodePackage.config.schema &&
        nodePackage.config.defaults
      ) {
        try {
          const configSchema = nodePackage.config.schema;
          const currentData = selectedNode.data || {};
          const defaults = nodePackage.config.defaults;

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

      {fields.length === 0 ? (
        <div className="text-body-sm text-secondary">
          No configurable properties
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(([fieldName, fieldSchema]: [string, any]) => {
            const value =
              nodeConfig.data[fieldName] ?? nodeConfig.defaults[fieldName];
            const description = fieldSchema._def?.description || "";
            const fieldType = fieldSchema._def?.typeName || "unknown";
            const fieldMetadata = nodeConfig.uiMetadata.fields?.[fieldName];
            const label = fieldMetadata?.label || fieldName;

            return (
              <div
                key={fieldName}
                className="p-3 bg-surface-03 rounded-xl border border-s-01"
              >
                <div className="flex justify-between items-start mb-2">
                  <label
                    htmlFor={fieldName}
                    className="text-body-sm-str text-primary"
                  >
                    {label}
                  </label>
                  <div className="text-body-xs text-secondary/50">
                    {fieldType}
                  </div>
                </div>

                {description && (
                  <div className="text-body-xs text-secondary mb-2">
                    {description}
                  </div>
                )}

                <div className="mb-2">
                  {renderFormControl(
                    fieldName,
                    fieldSchema,
                    fieldMetadata,
                    register,
                    value,
                  )}
                </div>

                {errors[fieldName] && (
                  <div className="text-body-xs text-red-400">
                    {String(errors[fieldName]?.message || "Invalid value")}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end pt-4 border-t border-s-01">
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-surface-01 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </Box>
  );
}

export default NodeProperties;
