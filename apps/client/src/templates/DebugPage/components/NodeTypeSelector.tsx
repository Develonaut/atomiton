type NodeTypeSelectorProps = {
  selectedNodeType: string | null;
  availableNodeTypes: string[];
  onNodeTypeChange: (nodeType: string | null) => void;
};

export function NodeTypeSelector({
  selectedNodeType,
  availableNodeTypes,
  onNodeTypeChange,
}: NodeTypeSelectorProps) {
  return (
    <div className="flex-1 space-y-1">
      <label htmlFor="node-type-selector" className="block text-sm font-medium">
        Node Type
      </label>
      <select
        id="node-type-selector"
        value={selectedNodeType || ""}
        onChange={(e) => onNodeTypeChange(e.target.value || null)}
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
  );
}
