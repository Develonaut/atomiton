import { Button } from "@atomiton/ui";

type NodeActionButtonsProps = {
  isExecuting: boolean;
  selectedNodeType: string | null;
  onRunNode: () => void;
  onRunSmokeTests: () => void;
};

export function NodeActionButtons({
  isExecuting,
  selectedNodeType,
  onRunNode,
  onRunSmokeTests,
}: NodeActionButtonsProps) {
  return (
    <>
      <Button
        onClick={onRunNode}
        disabled={isExecuting}
        size="icon"
        title="Run Node"
      >
        ▶
      </Button>
      <Button
        onClick={onRunSmokeTests}
        disabled={isExecuting || !selectedNodeType}
        size="icon"
        title="Run Smoke Tests"
        data-testid="run-smoke-tests"
      >
        🧪
      </Button>
    </>
  );
}
