import { Button } from "@atomiton/ui";

type NodeActionButtonsProps = {
  isExecuting: boolean;
  onRunNode: () => void;
  onTestNode: () => void;
};

export function NodeActionButtons({
  isExecuting,
  onRunNode,
  onTestNode,
}: NodeActionButtonsProps) {
  return (
    <>
      <Button onClick={onRunNode} disabled={isExecuting} variant="default">
        {isExecuting ? "Running..." : "▶ Run Node"}
      </Button>
      <Button
        onClick={onTestNode}
        disabled={isExecuting}
        variant="default"
        className="font-semibold"
        data-testid="test-node-execution"
      >
        {isExecuting ? "Testing..." : "🧪 Test Node"}
      </Button>
    </>
  );
}
