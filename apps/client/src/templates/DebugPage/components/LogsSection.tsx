import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button } from "@atomiton/ui";

/**
 * Shared logs section component
 * Displays event logs from the conductor with test IDs for e2e testing
 */
export function LogsSection() {
  const { logs, clearLogs } = useDebugLogs();

  return (
    <div
      className="bg-white rounded-lg p-6 shadow mt-6"
      data-testid="debug-logs"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Event Logs</h2>
        <Button onClick={clearLogs} size="sm">
          Clear Logs
        </Button>
      </div>
      <div
        className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs h-64 overflow-auto"
        data-testid="debug-logs-content"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((logEntry, idx) => {
            const log = `[${logEntry.timestamp}] ${logEntry.message}`;

            // Add test IDs and data attributes for E2E test assertions
            let testId = undefined;
            let dataOutput = undefined;

            if (logEntry.message.includes("✅ File write test completed:")) {
              testId = "file-write-success";
              const filePathMatch = log.match(
                /✅ File write test completed: (.+)/,
              );
              if (filePathMatch) {
                dataOutput = filePathMatch[1];
              }
            } else if (logEntry.message.includes("❌ File write test error:")) {
              testId = "file-write-error";
              const errorMatch = logEntry.message.match(
                /❌ File write test error: (.+)/,
              );
              if (errorMatch) {
                dataOutput = errorMatch[1];
              }
            } else if (logEntry.message.includes("System health:")) {
              testId = "health-status";
              const healthMatch = logEntry.message.match(/System health: (.+)/);
              if (healthMatch) {
                dataOutput = healthMatch[1];
              }
            } else if (
              logEntry.message.includes("🏓 Sending health check ping")
            ) {
              testId = "health-ping";
              dataOutput = "ping";
            } else if (
              logEntry.message.includes("Health check pong received")
            ) {
              testId = "health-pong";
              if (logEntry.message.includes("✅")) {
                dataOutput = "success";
              } else if (logEntry.message.includes("❌")) {
                dataOutput = "error";
              } else {
                dataOutput = "pong";
              }
            } else if (logEntry.message.includes("IPC connection")) {
              testId = "health-message";
              const messageMatch = logEntry.message.match(/Status: (.+)/);
              if (messageMatch) {
                dataOutput = messageMatch[1];
              } else {
                dataOutput = logEntry.message;
              }
            } else if (logEntry.message.includes("Response time:")) {
              testId = "health-timestamp";
              const timeMatch = logEntry.message.match(/Response time: (.+)/);
              if (timeMatch) {
                dataOutput = timeMatch[1];
              }
            } else if (
              logEntry.message.includes("✅") &&
              logEntry.message.includes("file-system execution complete")
            ) {
              testId = "file-write-success";
              dataOutput = "file-system execution complete";
            } else if (
              logEntry.message.includes("❌") &&
              logEntry.message.includes("file-system")
            ) {
              testId = "file-write-error";
              const errorMatch = logEntry.message.match(/❌ (.+)/);
              if (errorMatch) {
                dataOutput = errorMatch[1];
              }
            } else if (logEntry.message.includes("Test execution result:")) {
              testId = "test-execution-result";
            } else if (
              testId === undefined &&
              idx > 0 &&
              logs[idx - 1].message.includes("Test execution result:")
            ) {
              testId = "test-execution-data";
              dataOutput = log;
            } else if (
              idx > 0 &&
              logs[idx - 1].message.includes("execution complete") &&
              logEntry.message.trim().startsWith("{")
            ) {
              // JSON result from node execution
              testId = "execution-result-json";
              dataOutput = logEntry.message.trim();
            }

            return (
              <div
                key={idx}
                className="mb-1"
                data-testid={testId}
                data-output={dataOutput}
              >
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
