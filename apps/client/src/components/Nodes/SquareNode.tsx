import { Icon as UIIcon } from "@atomiton/ui";
import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

type SquareNodeProps = {
  data: {
    label?: string;
    nodeType?: string;
    icon?: string;
  };
  selected?: boolean;
};

function SquareNode({ data, selected }: SquareNodeProps) {
  const iconName = data.icon || data.nodeType || "circle";

  return (
    <div
      className={`relative flex items-center justify-center size-20 p-2 bg-surface-03 rounded-2xl cursor-pointer outline-0 transition-all ${
        selected
          ? "shadow-[0_0_0_1.5px_rgba(123,123,123,0.8)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset] scale-105"
          : "hover:shadow-[0_0_0_1.5px_rgba(123,123,123,0.5)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset]"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* Icon */}
      <UIIcon name={iconName} size={32} className="text-secondary" />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
}

export default memo(SquareNode);
