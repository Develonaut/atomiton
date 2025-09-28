import Layout from "#components/Layout";
import conductor from "#lib/conductor";
import type {
  ExecutionResult,
  HealthResult,
} from "@atomiton/conductor/browser";
import {
  createNodeDefinition,
  type NodeDefinition,
} from "@atomiton/nodes/definitions";
import { Button, Icon } from "@atomiton/ui";
import { isElectronEnvironment } from "@atomiton/utils";
import { useEffect, useState } from "react";

type EnvironmentInfo = {
  isElectron: boolean;
  conductorAvailable: boolean;
  apiMethods: string[];
  env: "development" | "production";
  platform?: string;
  userAgent?: string;
  electronVersion?: string;
  nodeVersion?: string;
  chromeVersion?: string;
  buildInfo?: {
    mode?: string;
    timestamp?: string;
  };
};

type TestResult = {
  name: string;
  success: boolean;
  message: string;
  timestamp: number;
  duration?: number;
};

export default function DebugPage() {
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pingResult, setPingResult] = useState<string>("");
  const [healthResult, setHealthResult] = useState<HealthResult | null>(null);
  const [nodeProgress, setNodeProgress] = useState<{
    progress: number;
    message: string;
  } | null>(null);
  const [nodeResult, setNodeResult] = useState<
    (ExecutionResult & { filePath?: string }) | null
  >(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Detect environment on mount using simplified detection
    const initializeEnvironment = () => {
      const isElectron = isElectronEnvironment();

      // Get basic info from window if available
      const windowWithElectron = window as Window & {
        atomitonRPC?: Record<string, unknown>;
        process?: {
          versions?: {
            node?: string;
            electron?: string;
            chrome?: string;
          };
        };
      };

      const conductorAvailable = true; // Conductor is always available
      const apiMethods: string[] = [];

      // Add Conductor API methods (new structure)
      apiMethods.push("conductor.node.run", "conductor.system.health");

      // Add legacy methods for backward compatibility
      apiMethods.push("conductor.execute", "conductor.health");

      // Add atomitonRPC methods if available
      if (windowWithElectron.atomitonRPC) {
        apiMethods.push(
          ...Object.keys(windowWithElectron.atomitonRPC)
            .filter(
              (key) =>
                typeof windowWithElectron.atomitonRPC![key] === "function" ||
                typeof windowWithElectron.atomitonRPC![key] === "object",
            )
            .map((key) => `atomitonRPC.${key}`),
        );
      }

      const environmentInfo: EnvironmentInfo = {
        isElectron,
        conductorAvailable,
        apiMethods,
        env: import.meta.env.MODE as "development" | "production",
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        electronVersion: windowWithElectron.process?.versions?.electron,
        nodeVersion: windowWithElectron.process?.versions?.node,
        chromeVersion: windowWithElectron.process?.versions?.chrome,
        buildInfo: {
          mode: import.meta.env.MODE,
          timestamp: new Date().toISOString(),
        },
      };

      setEnvironment(environmentInfo);
      addLog(`Environment detected: ${isElectron ? "Electron" : "Browser"}`);
      addLog(`atomitonRPC Available: ${!!windowWithElectron.atomitonRPC}`);
      addLog(`Conductor Available: ${conductorAvailable}`);
    };

    initializeEnvironment();
  }, []);

  const testHealth = async () => {
    const startTime = Date.now();
    addLog("Starting conductor health check...");

    try {
      const result = await conductor.system.health();
      const duration = Date.now() - startTime;
      setHealthResult(result);

      const testResult: TestResult = {
        name: "Conductor Health Check",
        success: result.status === "ok",
        message: `Status: ${result.status}${result.message ? ` - ${result.message}` : ""}`,
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(
        `✅ Conductor health check successful: ${result.status} (${duration}ms)`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "Conductor Health Check",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(`❌ Conductor health check failed: ${testResult.message}`);
    }
  };

  const testNodeExecution = async () => {
    const startTime = Date.now();
    addLog("Starting node execution test...");
    setNodeProgress(null);
    setNodeResult(null);

    try {
      // Use file-write node for a more realistic test
      const timestamp = new Date().toISOString();
      const outputPath = import.meta.env.VITE_OUTPUT_PATH || ".tmp";
      const filePath = `${outputPath}/atomiton-debug-test-${Date.now()}.txt`;

      // Start with a minimal node definition (like from a template/library)
      // This will use the default parameters from the file-system node type
      const nodeDefinition = createNodeDefinition({
        id: "write-file-test",
        type: "file-system",
        name: "File Write Test",
      });

      // Simulate user filling out the form and modifying parameters
      // For runtime execution, we replace the parameters object with actual values
      // We use 'as unknown as NodeDefinition' because we're intentionally
      // replacing the structured parameters with runtime values
      const runtimeNode = {
        ...nodeDefinition,
        parameters: {
          operation: "write",
          path: filePath,
          content: `Debug test executed at ${timestamp}\nTest data: Hello from Debug Page!\n\nThis file was written by the Conductor via IPC.`,
          createDirectories: true,
          encoding: "utf8",
        } as unknown as NodeDefinition["parameters"],
      };

      addLog(`Executing file-write node to: ${filePath}`);
      const response = await conductor.node.run(runtimeNode);

      console.log("[DEBUG] Conductor response:", response);
      console.log(`[DEBUG] File should be written to: ${filePath}`);

      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "File Write Node Test",
        success: response.success,
        message: response.success
          ? `File written to ${filePath}`
          : (typeof response.error === "string"
              ? response.error
              : JSON.stringify(response.error)) || "File write failed",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);

      // Store the conductor result with file path info
      const enrichedResult: ExecutionResult & { filePath?: string } = {
        ...response,
        filePath, // Add file path to result for display
      };
      setNodeResult(enrichedResult);

      if (response.success) {
        addLog(`✅ File write test completed: ${filePath}`);
      } else {
        addLog(`❌ File write test failed: ${JSON.stringify(response.error)}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "File Write Node Test",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(`❌ File write test failed: ${testResult.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    addLog("🚀 Starting all tests...");

    // Always run health test - conductor works in both browser and Electron
    await testHealth();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Always run node execution test (works in browser and Electron)
    await testNodeExecution();

    setIsRunningTests(false);
    addLog("✨ All tests completed");
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
    setHealthResult(null);
    setNodeResult(null);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] bg-surface-01 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-surface-02 rounded-2xl p-6 border border-s-01">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-xl bg-accent-02/10 flex items-center justify-center">
                <Icon name="settings" size={20} className="text-accent-02" />
              </div>
              <h1 className="text-2xl font-semibold text-primary">
                Debug Console
              </h1>
            </div>
            <p className="text-secondary">
              Environment diagnostics and IPC testing for development
            </p>
            {import.meta.env.MODE !== "development" && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                <p className="text-warning text-sm flex items-center gap-2">
                  <Icon
                    name="alert-circle"
                    size={16}
                    className="text-warning"
                  />
                  This page is only intended for development mode
                </p>
              </div>
            )}
          </div>

          {/* Environment Info */}
          {environment && (
            <div className="bg-surface-02 rounded-2xl p-6 border border-s-01">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Icon name="globe" size={20} className="text-secondary" />
                Environment Information
                {environment.isElectron && (
                  <span className="text-xs px-2 py-1 bg-accent-01/10 text-accent-01 rounded-lg">
                    Electron
                  </span>
                )}
                {environment.conductorAvailable && (
                  <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-lg">
                    Conductor Ready
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary mb-1">Platform</p>
                  <p className="text-primary font-mono bg-surface-01 px-3 py-2 rounded-lg">
                    {environment.platform}
                  </p>
                </div>

                <div>
                  <p className="text-secondary mb-1">Environment</p>
                  <p className="text-primary font-mono bg-surface-01 px-3 py-2 rounded-lg">
                    {environment.env}
                  </p>
                </div>

                {environment.electronVersion && (
                  <div>
                    <p className="text-secondary mb-1">Electron Version</p>
                    <p className="text-primary font-mono bg-surface-01 px-3 py-2 rounded-lg">
                      {environment.electronVersion}
                    </p>
                  </div>
                )}

                {environment.nodeVersion && (
                  <div>
                    <p className="text-secondary mb-1">Node Version</p>
                    <p className="text-primary font-mono bg-surface-01 px-3 py-2 rounded-lg">
                      {environment.nodeVersion}
                    </p>
                  </div>
                )}

                {environment.chromeVersion && (
                  <div>
                    <p className="text-secondary mb-1">Chrome Version</p>
                    <p className="text-primary font-mono bg-surface-01 px-3 py-2 rounded-lg">
                      {environment.chromeVersion}
                    </p>
                  </div>
                )}

                {environment.apiMethods.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-secondary mb-2">Available API Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {environment.apiMethods.map((method) => (
                        <span
                          key={method}
                          className="px-3 py-1 bg-surface-01 text-primary rounded-lg text-xs font-mono"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Controls */}
          <div className="bg-surface-02 rounded-2xl p-6 border border-s-01">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon name="flask" size={20} className="text-secondary" />
              Conductor Tests
            </h2>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={runAllTests}
                disabled={isRunningTests}
                variant="default"
                title="Run all available tests (Conductor health and node execution)"
              >
                <Icon name="play" size={16} className="text-white mr-2" />
                {isRunningTests ? "Running Tests..." : "Run All Tests"}
              </Button>

              <Button
                onClick={testHealth}
                disabled={isRunningTests}
                variant="outline"
                title="Test conductor health check (works in browser and Electron)"
              >
                Test Health
                <span className="ml-2 text-xs opacity-60">
                  (Browser & Electron)
                </span>
              </Button>

              <Button
                onClick={testNodeExecution}
                data-testid="test-node-execution"
                disabled={isRunningTests}
                variant="outline"
                title="Test node execution using Conductor API"
              >
                Test Node
                <span className="ml-2 text-xs opacity-60">
                  (Browser & Electron)
                </span>
              </Button>

              <Button onClick={clearLogs} variant="ghost">
                Clear Logs
              </Button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-secondary">
                  Test Results
                </h3>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl flex items-center justify-between border ${
                      result.success
                        ? "bg-success/5 border-success/20"
                        : "bg-error/5 border-error/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={result.success ? "check" : "x"}
                        size={20}
                        className={
                          result.success ? "text-success" : "text-error"
                        }
                      />
                      <span className="font-medium text-primary">
                        {result.name}
                      </span>
                      <span className="text-sm text-secondary">
                        {result.message}
                      </span>
                    </div>
                    {result.duration && (
                      <span className="text-xs text-secondary font-mono">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Progress Display */}
            {nodeProgress && (
              <div className="mb-4 p-3 bg-accent-01/5 border border-accent-01/20 rounded-xl">
                <p className="text-sm font-medium text-primary mb-2">
                  Node Execution Progress
                </p>
                <div className="w-full bg-surface-01 rounded-full h-2 mb-2">
                  <div
                    className="bg-accent-01 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${nodeProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-secondary">{nodeProgress.message}</p>
              </div>
            )}

            {/* Result Display */}
            {(healthResult || nodeResult) && (
              <div className="space-y-3">
                {healthResult && (
                  <div className="p-3 bg-surface-01 rounded-xl">
                    <p className="text-sm font-medium text-primary mb-1">
                      Health Check Result
                    </p>
                    <pre className="font-mono text-xs text-secondary overflow-auto">
                      {JSON.stringify(healthResult, null, 2)}
                    </pre>
                  </div>
                )}

                {nodeResult && (
                  <div className="p-3 bg-surface-01 rounded-xl">
                    <p className="text-sm font-medium text-primary mb-1">
                      Node Result
                    </p>
                    <pre className="font-mono text-xs text-secondary overflow-auto">
                      {JSON.stringify(nodeResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-surface-02 rounded-2xl p-6 border border-s-01">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Icon name="file-text" size={20} className="text-secondary" />
              Activity Log
            </h2>
            <div className="bg-surface-01 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-secondary">No activity yet...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-primary mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info for browser environments */}
          {environment && !environment.isElectron && (
            <div className="bg-info/10 border border-info/20 rounded-2xl p-6">
              <h3 className="text-info font-semibold mb-2 flex items-center gap-2">
                <Icon name="info" size={20} className="text-info" />
                Running in Browser Mode
              </h3>
              <p className="text-secondary text-sm">
                Conductor is running in browser mode. Node execution will show
                transport unavailable errors, which is expected behavior. To
                test full execution capabilities, run the application through
                the Electron desktop wrapper.
              </p>
              <p className="text-secondary text-sm mt-2">
                Use{" "}
                <code className="bg-surface-02 px-2 py-1 rounded text-primary">
                  pnpm dev:desktop
                </code>{" "}
                in the desktop package to launch with Electron.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
