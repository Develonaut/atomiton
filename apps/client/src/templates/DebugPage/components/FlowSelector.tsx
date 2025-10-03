type FlowTemplate = {
  id: string;
  name: string;
  description?: string;
  nodeCount?: number;
}

type FlowSelectorProps = {
  flows: FlowTemplate[];
  selectedFlowId: string | null;
  onSelectFlow: (id: string) => void;
  disabled?: boolean;
}

export function FlowSelector({
  flows,
  selectedFlowId,
  onSelectFlow,
  disabled = false,
}: FlowSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Available Flows ({flows.length})
      </label>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {flows.map((flow) => (
          <label
            key={flow.id}
            className={`
              flex items-start p-3 rounded-lg border cursor-pointer
              transition-colors
              ${
                selectedFlowId === flow.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input
              type="radio"
              name="flow"
              value={flow.id}
              checked={selectedFlowId === flow.id}
              onChange={() => onSelectFlow(flow.id)}
              disabled={disabled}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{flow.name}</div>
              {flow.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {flow.description}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {flow.nodeCount || 0} nodes
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
