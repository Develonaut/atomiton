import { useSystemOperations } from "#templates/DebugPage/hooks/useSystemOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button } from "@atomiton/ui";

export default function SystemPage() {
  const { addLog } = useDebugLogs();
  const { checkHealth, restartSystem, testExecute, testHealthShortcut } =
    useSystemOperations(addLog);

  return (
    <div className="bg-white rounded-lg p-6 shadow mb-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkHealth} data-testid="test-health">
            Check Health
          </Button>
          <Button onClick={restartSystem}>Restart System</Button>
          <Button onClick={testExecute}>Test Execute</Button>
          <Button onClick={testHealthShortcut}>Test Health Shortcut</Button>
        </div>
      </div>
    </div>
  );
}
