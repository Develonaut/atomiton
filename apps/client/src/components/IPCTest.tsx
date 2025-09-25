import { ipc, type NodeProgress } from "#lib/ipc";
import { useEffect, useState } from "react";

export function IPCTest() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [pingResult, setPingResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<NodeProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setIsAvailable(ipc.isAvailable());
  }, []);

  const testPing = async () => {
    try {
      setError("");
      setPingResult("");
      const result = await ipc.ping();
      setPingResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ping failed");
    }
  };

  const testNodeExecution = async () => {
    setLoading(true);
    setError("");
    setProgress(null);
    setResult(null);

    // Set up listeners
    const unsubProgress = ipc.onProgress((p) => {
      setProgress(p);
      console.log("Progress:", p);
    });

    const unsubComplete = ipc.onComplete((response) => {
      console.log("Complete:", response);
      setResult(response);
      setLoading(false);
    });

    const unsubError = ipc.onError((response) => {
      console.log("Error:", response);
      setError(response.error || "Unknown error");
      setLoading(false);
    });

    try {
      const response = await ipc.executeNode("test-node", {
        input: "test data",
        timestamp: Date.now(),
      });
      console.log("Final response:", response);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setLoading(false);
      // Cleanup listeners
      unsubProgress();
      unsubComplete();
      unsubError();
    }
  };

  if (!isAvailable) {
    return (
      <div
        data-testid="ipc-not-available"
        className="p-4 bg-yellow-50 border border-yellow-200 rounded"
      >
        <p className="text-yellow-800">
          IPC not available - App is not running in Electron desktop mode
        </p>
      </div>
    );
  }

  return (
    <div data-testid="ipc-test-container" className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">IPC Communication Test</h2>

      {/* Ping Test */}
      <div className="border rounded p-4 space-y-2">
        <h3 className="font-semibold">Connection Test</h3>
        <button
          data-testid="ping-button"
          onClick={testPing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Ping
        </button>
        {pingResult && (
          <p data-testid="ping-result" className="text-green-600">
            ✓ Response: {pingResult}
          </p>
        )}
      </div>

      {/* Node Execution Test */}
      <div className="border rounded p-4 space-y-2">
        <h3 className="font-semibold">Node Execution Test</h3>
        <button
          data-testid="execute-button"
          onClick={testNodeExecution}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Executing..." : "Execute Test Node"}
        </button>

        {progress && (
          <div
            data-testid="progress-indicator"
            className="bg-gray-100 rounded p-2"
          >
            <p className="text-sm text-gray-600">
              Progress: {progress.progress}%
            </p>
            <p className="text-xs text-gray-500">{progress.message}</p>
          </div>
        )}

        {result && (
          <div
            data-testid="execution-result"
            className="bg-green-50 rounded p-2"
          >
            <p className="text-sm font-semibold">Result:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          data-testid="error-display"
          className="bg-red-50 border border-red-200 rounded p-4"
        >
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
