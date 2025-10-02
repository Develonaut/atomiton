import { LogsSection } from "#templates/DebugPage/components/LogsSection";
import { NodeActionButtons } from "#templates/DebugPage/components/NodeActionButtons";
import { NodeFieldsForm } from "#templates/DebugPage/components/NodeFieldsForm";
import { NodeTypeSelector } from "#templates/DebugPage/components/NodeTypeSelector";
import { useNodeOperations } from "#templates/DebugPage/hooks/useNodeOperations";
import { useNodeSmokeTests } from "#templates/DebugPage/hooks/useNodeSmokeTests";

export default function NodesPage() {
  const {
    isExecuting,
    selectedNodeType,
    setSelectedNodeType,
    availableNodeTypes,
    nodeFieldsConfig,
    nodeFieldValues,
    setNodeFieldValue,
    executeSelectedNode,
  } = useNodeOperations();

  const { runSmokeTests, isExecuting: isSmokeTestExecuting } =
    useNodeSmokeTests(selectedNodeType);

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-s-01 shrink-0">
          <h3 className="text-lg font-semibold mb-4">Node Builder</h3>
          <div className="flex gap-2 items-end">
            <NodeTypeSelector
              selectedNodeType={selectedNodeType}
              availableNodeTypes={availableNodeTypes}
              onNodeTypeChange={setSelectedNodeType}
            />
            <NodeActionButtons
              isExecuting={isExecuting || isSmokeTestExecuting}
              selectedNodeType={selectedNodeType}
              onRunNode={executeSelectedNode}
              onRunSmokeTests={runSmokeTests}
            />
          </div>
        </div>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto p-6">
          <NodeFieldsForm
            nodeType={selectedNodeType}
            fieldsConfig={nodeFieldsConfig}
            fieldValues={nodeFieldValues}
            onFieldChange={setNodeFieldValue}
            isExecuting={isExecuting}
          />
        </div>
      </div>

      {/* Right Column: Event Logs */}
      <div className="h-full">
        <LogsSection />
      </div>
    </div>
  );
}
