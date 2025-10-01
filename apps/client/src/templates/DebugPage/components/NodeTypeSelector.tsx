import Select, { type SelectOption } from "#components/form/Select";

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
  const options: SelectOption[] = availableNodeTypes.map((type, index) => ({
    id: index,
    name: type,
  }));

  const selectedOption = selectedNodeType
    ? (options.find((opt) => opt.name === selectedNodeType) ?? options[0])
    : options[0];

  const handleChange = (option: SelectOption) => {
    onNodeTypeChange(option.name);
  };

  return (
    <div className="flex-1 space-y-1">
      <label className="block text-sm font-medium">Node Type</label>
      <Select value={selectedOption} onChange={handleChange}>
        <Select.Trigger isMedium isWhite data-testid="node-type-selector">
          <Select.Value>{selectedOption.name}</Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Options>
          {options.map((option) => (
            <Select.Option key={option.id} value={option}>
              {option.name}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>
    </div>
  );
}
