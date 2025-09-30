import { useEnvironment } from "#templates/DebugPage/hooks/useEnvironment";
import { useSystemOperations } from "#templates/DebugPage/hooks/useSystemOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button, JsonTreeView } from "@atomiton/ui";

export default function EnvironmentPage() {
  const { addLog } = useDebugLogs();
  const environment = useEnvironment(addLog);
  const { checkHealth, restartSystem, testExecute, testHealthShortcut } =
    useSystemOperations(addLog);

  return (
    <div className="space-y-6">
      {/* System Operations Section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">System Operations</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkHealth} data-testid="test-health">
            Check Health
          </Button>
          <Button onClick={restartSystem}>Restart System</Button>
          <Button onClick={testExecute}>Test Execute</Button>
          <Button onClick={testHealthShortcut}>Test Health Shortcut</Button>
        </div>
      </div>

      {/* Environment Information Section */}
      {environment && (
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            Environment Information
          </h2>
          <JsonTreeView
            data={environment}
            rootName="environment"
            defaultExpanded={true}
          />
        </div>
      )}
    </div>
  );
}
