import type { NodeFieldsConfig } from "@atomiton/nodes/definitions";
import { NodeFieldRenderer } from "#components/NodeFieldRenderer";
import { Button } from "@atomiton/ui";
import type { JSX } from "react";

export interface NodeFieldsFormProps {
  nodeType: string | null;
  fieldsConfig: NodeFieldsConfig;
  fieldValues: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

/**
 * Dynamic form that renders fields based on node schema configuration
 */
export function NodeFieldsForm({
  nodeType,
  fieldsConfig,
  fieldValues,
  onFieldChange,
  onExecute,
  isExecuting,
}: NodeFieldsFormProps): JSX.Element {
  // Handle empty state
  if (!nodeType) {
    return (
      <div
        className="text-center py-8 text-gray-500"
        data-testid="form-empty-state"
      >
        Select a node type to configure
      </div>
    );
  }

  const fieldEntries = Object.entries(fieldsConfig);

  if (fieldEntries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-500" data-testid="form-no-fields">
          No configurable fields for {nodeType} node
        </div>
        <Button
          onClick={onExecute}
          disabled={isExecuting}
          className="w-full"
          data-testid="execute-node-button"
        >
          {isExecuting ? "Executing..." : `Execute ${nodeType} Node`}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="node-fields-form">
      {fieldEntries.map(([fieldKey, fieldConfig]) => (
        <NodeFieldRenderer
          key={fieldKey}
          fieldKey={fieldKey}
          fieldConfig={fieldConfig}
          value={fieldValues[fieldKey]}
          onChange={(value) => onFieldChange(fieldKey, value)}
          disabled={isExecuting}
        />
      ))}

      <div className="pt-4 border-t">
        <Button
          onClick={onExecute}
          disabled={isExecuting}
          className="w-full"
          data-testid="execute-node-button"
        >
          {isExecuting ? "Executing..." : `Execute ${nodeType} Node`}
        </Button>
      </div>
    </div>
  );
}
