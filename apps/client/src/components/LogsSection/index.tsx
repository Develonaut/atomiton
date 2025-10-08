import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { useEffect, useRef } from "react";
import { JsonTreeView } from "@atomiton/ui";

/**
 * Shared logs section component
 * Displays event logs from the conductor with test IDs for e2e testing
 * Supports configurable timestamp display: 'full', 'short' (4-5 chars), or 'none'
 */
export function LogsSection({
  timestampFormat = "full",
}: {
  timestampFormat?: "full" | "short" | "none";
}) {
  const { logs } = useDebugLogs();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div data-testid="debug-logs">
      <div
        className="bg-surface-02 text-primary p-4 font-mono text-xs h-48 overflow-auto rounded-lg border border-s-01"
        data-testid="debug-logs-content"
      >
        {logs.length === 0 ? (
          <div className="text-secondary">No logs yet...</div>
        ) : (
          logs.map((logEntry, idx) => {
            // Format timestamp based on prop
            const timestamp =
              timestampFormat === "short"
                ? (() => {
                    const timeMatch =
                      logEntry.timestamp.match(/(\d{2}):(\d{2})/);
                    return timeMatch
                      ? `${timeMatch[1]}:${timeMatch[2]}`
                      : logEntry.timestamp.slice(-5);
                  })()
                : timestampFormat === "full"
                  ? logEntry.timestamp
                  : "";

            // Use metadata from logs for test IDs and data attributes
            const testId = logEntry.metadata?.testId as string | undefined;
            const dataOutput = logEntry.metadata?.output as string | undefined;

            // Check if metadata contains an object to display
            const hasObjectData =
              logEntry.metadata &&
              typeof logEntry.metadata === "object" &&
              Object.keys(logEntry.metadata).some(
                (key) =>
                  key !== "testId" &&
                  key !== "output" &&
                  typeof logEntry.metadata![key] === "object",
              );

            // Try to parse message as JSON for inline objects
            let parsedJson: unknown = null;
            if (
              logEntry.message.trim().startsWith("{") ||
              logEntry.message.trim().startsWith("[")
            ) {
              try {
                parsedJson = JSON.parse(logEntry.message.trim());
              } catch {
                // Not valid JSON, treat as regular message
              }
            }

            // Fallback: Detect JSON results from node execution for backward compatibility
            if (
              !testId &&
              idx > 0 &&
              logs[idx - 1].message.includes("execution complete") &&
              parsedJson
            ) {
              return (
                <div
                  key={idx}
                  className="mb-2"
                  data-testid="execution-result-json"
                  data-output={logEntry.message.trim()}
                >
                  {timestamp && (
                    <span className="text-secondary">{timestamp} </span>
                  )}
                  <JsonTreeView
                    data={parsedJson}
                    rootName="result"
                    defaultExpanded={false}
                    className="!text-xs"
                  />
                </div>
              );
            }

            // If metadata has object data, render it
            if (hasObjectData) {
              const objectKey = Object.keys(logEntry.metadata!).find(
                (key) =>
                  key !== "testId" &&
                  key !== "output" &&
                  typeof logEntry.metadata![key] === "object",
              );
              const objectData = objectKey
                ? logEntry.metadata![objectKey]
                : null;

              return (
                <div
                  key={idx}
                  className="mb-2"
                  data-testid={testId || "log-entry"}
                  data-output={dataOutput}
                >
                  {timestamp && (
                    <span className="text-secondary">{timestamp} </span>
                  )}
                  <span>{logEntry.message}</span>
                  {objectData !== null && (
                    <div className="mt-1">
                      <JsonTreeView
                        data={objectData}
                        rootName={objectKey!}
                        defaultExpanded={false}
                        className="!text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            }

            // If message is valid JSON, render it
            if (parsedJson) {
              return (
                <div
                  key={idx}
                  className="mb-2"
                  data-testid={testId || "log-entry"}
                  data-output={dataOutput}
                >
                  {timestamp && (
                    <span className="text-secondary">{timestamp} </span>
                  )}
                  <JsonTreeView
                    data={parsedJson}
                    rootName="data"
                    defaultExpanded={false}
                    className="!text-xs"
                  />
                </div>
              );
            }

            // Regular text log - one line (container will scroll)
            return (
              <div
                key={idx}
                className="mb-1 whitespace-nowrap"
                data-testid={testId || "log-entry"}
                data-output={dataOutput}
              >
                {timestamp && (
                  <span className="text-secondary">{timestamp} </span>
                )}
                {logEntry.message}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
