import { NodeActionButtons } from "#templates/DebugPage/components/NodeActionButtons";
import { NodeFieldsForm } from "#templates/DebugPage/components/NodeFieldsForm";
import { NodeTypeSelector } from "#templates/DebugPage/components/NodeTypeSelector";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { useNodeOperations } from "#templates/DebugPage/hooks/useNodeOperations";

export default function NodesPage() {
  const { addLog } = useDebugLogs();
  const {
    isExecuting,
    testNode,
    selectedNodeType,
    setSelectedNodeType,
    availableNodeTypes,
    nodeFieldsConfig,
    nodeFieldValues,
    setNodeFieldValue,
    executeSelectedNode,
  } = useNodeOperations(addLog);

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Node Builder</h3>
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <NodeTypeSelector
              selectedNodeType={selectedNodeType}
              availableNodeTypes={availableNodeTypes}
              onNodeTypeChange={setSelectedNodeType}
            />
            <NodeActionButtons
              isExecuting={isExecuting}
              onRunNode={executeSelectedNode}
              onTestNode={testNode}
            />
          </div>

          <NodeFieldsForm
            nodeType={selectedNodeType}
            fieldsConfig={nodeFieldsConfig}
            fieldValues={nodeFieldValues}
            onFieldChange={setNodeFieldValue}
            onExecute={executeSelectedNode}
            isExecuting={isExecuting}
          />
        </div>
      </div>
    </div>
  );
}
