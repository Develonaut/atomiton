import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button } from "@atomiton/ui";
import { useState } from "react";

/**
 * Shared logs section component
 * Displays event logs from the conductor with test IDs for e2e testing
 */
export function LogsSection({ getTrace }: { getTrace?: () => unknown }) {
  const { logs, clearLogs } = useDebugLogs();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyTrace = async () => {
    if (!getTrace) return;

    const trace = getTrace();
    if (!trace) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy trace:", err);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden"
      data-testid="debug-logs"
    >
      <div className="flex justify-between items-center p-6 border-b border-s-01 shrink-0">
        <h2 className="text-xl font-semibold">Event Logs</h2>
        <div className="flex gap-2">
          {getTrace && (
            <Button onClick={handleCopyTrace} size="sm" disabled={!getTrace()}>
              {copySuccess ? "✓ Copied!" : "Copy Trace"}
            </Button>
          )}
          <Button onClick={clearLogs} size="sm">
            Clear Logs
          </Button>
        </div>
      </div>
      <div
        className="bg-gray-900 text-green-400 p-4 font-mono text-xs flex-1 overflow-auto max-h-[360px]"
        data-testid="debug-logs-content"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((logEntry, idx) => {
            const log = `[${logEntry.timestamp}] ${logEntry.message}`;

            // Use metadata from logs for test IDs and data attributes
            const testId = logEntry.metadata?.testId as string | undefined;
            const dataOutput = logEntry.metadata?.output as string | undefined;

            // Fallback: Detect JSON results from node execution for backward compatibility
            if (
              !testId &&
              idx > 0 &&
              logs[idx - 1].message.includes("execution complete") &&
              logEntry.message.trim().startsWith("{")
            ) {
              return (
                <div
                  key={idx}
                  className="mb-1"
                  data-testid="execution-result-json"
                  data-output={logEntry.message.trim()}
                >
                  {log}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="mb-1"
                data-testid={testId || "log-entry"}
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
