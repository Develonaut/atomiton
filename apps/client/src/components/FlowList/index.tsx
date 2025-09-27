import { useFlowList, useLoadFlow } from "#hooks/useFlow";
import { Button, Icon } from "@atomiton/ui";
import { useState } from "react";
import type { Flow, StorageItem } from "#lib/rpcTypes";

type FlowListProps = {
  onSelectFlow?: (flow: Flow) => void;
};

function FlowList({ onSelectFlow }: FlowListProps) {
  const { data: items, isLoading, error } = useFlowList();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Icon name="loader" size={24} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading flows: {error.message}
      </div>
    );
  }

  const flowItems = (items as StorageItem[] | undefined)?.filter(
    (item) => item.type === "flow",
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Available Flows</h2>
      <div className="space-y-2">
        {flowItems?.map((item) => (
          <FlowListItem
            key={item.id}
            flow={item.data}
            isSelected={selectedFlowId === item.id}
            onSelect={() => {
              setSelectedFlowId(item.id);
              onSelectFlow?.(item.data);
            }}
          />
        ))}
        {(!flowItems || flowItems.length === 0) && (
          <p className="text-gray-500">No flows available</p>
        )}
      </div>
    </div>
  );
}

type FlowListItemProps = {
  flow: Flow;
  isSelected: boolean;
  onSelect: () => void;
};

function FlowListItem({ flow, isSelected, onSelect }: FlowListItemProps) {
  const nodeCount = flow.nodes?.length || 0;
  const hasParentNodes = flow.nodes?.some((n: any) => n.parentId) || false;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={onSelect}
      className="w-full justify-start text-left"
    >
      <div className="flex-1">
        <div className="font-medium">{flow.name || flow.id}</div>
        <div className="text-sm text-gray-500">
          {nodeCount} node{nodeCount !== 1 ? "s" : ""}
          {hasParentNodes && " (with hierarchy)"}
        </div>
        {flow.metadata?.description && (
          <div className="text-sm text-gray-600 mt-1">
            {flow.metadata.description}
          </div>
        )}
      </div>
      <Icon name="chevron-right" size={16} />
    </Button>
  );
}

type LoadFlowExampleProps = {
  flowId: string;
};

export function LoadFlowExample({ flowId }: LoadFlowExampleProps) {
  const { data: flow, isLoading, error } = useLoadFlow(flowId);

  if (isLoading) {
    return <div>Loading flow...</div>;
  }

  if (error) {
    return <div>Error loading flow: {error.message}</div>;
  }

  if (!flow) {
    return <div>Flow not found</div>;
  }

  return (
    <div>
      <h3>{flow.name}</h3>
      <p>Nodes: {flow.nodes.length}</p>
      <pre>{JSON.stringify(flow, null, 2)}</pre>
    </div>
  );
}

export default FlowList;
