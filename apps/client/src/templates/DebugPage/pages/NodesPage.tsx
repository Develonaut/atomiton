import { useNodeOperations } from "#templates/DebugPage/hooks/useNodeOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button } from "@atomiton/ui";
import { NodeFieldsForm } from "#templates/DebugPage/components/NodeFieldsForm";

export default function NodesPage() {
  const { addLog } = useDebugLogs();
  const {
    nodeContent,
    setNodeContent,
    isExecuting,
    validateNode,
    executeNode,
    cancelExecution,
    createSampleNode,
    createGroupNode,
    createTestNode,
    testNode,
    // Dynamic node selection
    selectedNodeType,
    setSelectedNodeType,
    availableNodeTypes,
    nodeFieldsConfig,
    nodeFieldValues,
    setNodeFieldValue,
    executeSelectedNode,
  } = useNodeOperations(addLog);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Manual JSON Editor */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Manual JSON Editor</h3>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={createSampleNode}>Create Sample</Button>
            <Button onClick={createGroupNode}>Create Group</Button>
            <Button onClick={createTestNode}>Create Test Node</Button>
            <Button onClick={validateNode}>Validate</Button>
            <Button
              onClick={executeNode}
              disabled={isExecuting}
              variant="default"
            >
              {isExecuting ? "Executing..." : "Execute"}
            </Button>
            <Button
              onClick={testNode}
              disabled={isExecuting}
              variant="default"
              className="font-semibold"
              data-testid="test-node-execution"
            >
              {isExecuting ? "Testing..." : "🧪 Test Node"}
            </Button>
            {isExecuting && (
              <Button onClick={cancelExecution} variant="destructive">
                Cancel
              </Button>
            )}
          </div>

          <textarea
            className="w-full h-96 px-3 py-2 border rounded font-mono text-xs"
            placeholder="Enter node definition JSON..."
            value={nodeContent}
            onChange={(e) => setNodeContent(e.target.value)}
          />
        </div>
      </div>

      {/* Right Column: Dynamic Form Builder */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Dynamic Node Builder</h3>
        <div className="space-y-4">
          {/* Node Type Selector */}
          <div className="space-y-1">
            <label
              htmlFor="node-type-selector"
              className="block text-sm font-medium"
            >
              Node Type
            </label>
            <select
              id="node-type-selector"
              value={selectedNodeType || ""}
              onChange={(e) => setSelectedNodeType(e.target.value || null)}
              className="w-full px-3 py-2 border rounded"
              data-testid="node-type-selector"
            >
              <option value="">Select a node type...</option>
              {availableNodeTypes.map((type: string) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Form */}
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
