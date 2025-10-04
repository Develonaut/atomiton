type FlowProgressBarProps = {
  currentNode: number;
  totalNodes: number;
  currentNodeName?: string;
  isExecuting: boolean;
};

export function FlowProgressBar({
  currentNode,
  totalNodes,
  currentNodeName,
  isExecuting,
}: FlowProgressBarProps) {
  const percentage =
    totalNodes > 0 ? Math.round((currentNode / totalNodes) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{isExecuting ? "Execution Progress" : "Last Execution"}</span>
        <span data-testid="progress-text">
          {currentNode} / {totalNodes} nodes ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isExecuting ? "bg-blue-500" : "bg-green-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {currentNodeName && (
        <div className="text-sm text-gray-600">
          {isExecuting ? "Current" : "Last"}:{" "}
          <span className="font-medium">{currentNodeName}</span>
        </div>
      )}
    </div>
  );
}
