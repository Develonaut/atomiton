import Layout from "#components/Layout";
import { ipc, type NodeExecuteResponse, type NodeProgress } from "#lib/ipc";
import { Button, Icon } from "@atomiton/ui";
import { useEffect, useState } from "react";

type EnvironmentInfo = {
  isElectron: boolean;
  ipcAvailable: boolean;
  userAgent: string;
  platform: string;
  nodeVersion?: string;
  electronVersion?: string;
  chromeVersion?: string;
  apiMethods: string[];
  env: "development" | "production";
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
  const [pingResult, setPingResult] = useState<string>("");
  const [nodeProgress, setNodeProgress] = useState<NodeProgress | null>(null);
  const [nodeResult, setNodeResult] = useState<NodeExecuteResponse | null>(
    null,
  );
  const [storageTestResult, setStorageTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Detect environment on mount
    const detectEnvironment = () => {
      const isElectron =
        !!(window as any).electron || !!(window as any).atomitonIPC;
      const ipcAvailable = ipc.isAvailable();
      const apiMethods: string[] = [];

      if ((window as any).atomitonIPC) {
        apiMethods.push(
          ...Object.keys((window as any).atomitonIPC).filter(
            (key) => typeof (window as any).atomitonIPC[key] === "function",
          ),
        );
      }

      // Try to get version information from process if available
      let nodeVersion, electronVersion, chromeVersion;
      if ((window as any).process?.versions) {
        nodeVersion = (window as any).process.versions.node;
        electronVersion = (window as any).process.versions.electron;
        chromeVersion = (window as any).process.versions.chrome;
      }

      const info: EnvironmentInfo = {
        isElectron,
        ipcAvailable,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        nodeVersion,
        electronVersion,
        chromeVersion,
        apiMethods,
        env: import.meta.env.MODE as "development" | "production",
        buildInfo: {
          mode: import.meta.env.MODE,
          timestamp: new Date().toISOString(),
        },
      };

      setEnvironment(info);
      addLog(`Environment detected: ${isElectron ? "Electron" : "Browser"}`);
      addLog(`IPC Available: ${ipcAvailable}`);
    };

    detectEnvironment();
  }, []);

  const testPing = async () => {
    const startTime = Date.now();
    addLog("Starting ping test...");

    try {
      const result = await ipc.ping();
      const duration = Date.now() - startTime;
      setPingResult(result);

      const testResult: TestResult = {
        name: "Ping Test",
        success: true,
        message: `Response: ${result}`,
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(`✅ Ping successful: ${result} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "Ping Test",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(`❌ Ping failed: ${testResult.message}`);
    }
  };

  const testNodeExecution = async () => {
    const startTime = Date.now();
    addLog("Starting node execution test...");
    setNodeProgress(null);
    setNodeResult(null);

    // Set up listeners
    const unsubProgress = ipc.onProgress((progress) => {
      setNodeProgress(progress);
      addLog(`Node progress: ${progress.progress}% - ${progress.message}`);
    });

    const unsubComplete = ipc.onComplete((response) => {
      setNodeResult(response);
      addLog(`✅ Node execution completed: ${JSON.stringify(response)}`);
    });

    const unsubError = ipc.onError((response) => {
      setNodeResult(response);
      addLog(`❌ Node execution error: ${response.error}`);
    });

    try {
      const response = await ipc.executeNode("test-node", {
        testData: "Debug test input",
        timestamp: Date.now(),
      });

      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "Node Execution Test",
        success: response.success,
        message: response.success
          ? "Node executed successfully"
          : response.error || "Failed",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      setNodeResult(response);
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "Node Execution Test",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(`❌ Node execution failed: ${testResult.message}`);
    } finally {
      // Cleanup listeners
      unsubProgress();
      unsubComplete();
      unsubError();
    }
  };

  const testStorage = async () => {
    const startTime = Date.now();
    addLog("Starting storage test...");

    if (!(window as any).atomitonIPC) {
      addLog("❌ Storage API not available");
      return;
    }

    try {
      const testKey = "debug-test-key";
      const testValue = {
        message: "Debug test value",
        timestamp: Date.now(),
        random: Math.random(),
      };

      // Test set
      addLog(`Setting storage: ${testKey}`);
      await (window as any).atomitonIPC.storageSet({
        key: testKey,
        value: testValue,
      });

      // Test get
      addLog(`Getting storage: ${testKey}`);
      const retrieved = await (window as any).atomitonIPC.storageGet({
        key: testKey,
      });

      const duration = Date.now() - startTime;
      const success = JSON.stringify(retrieved) === JSON.stringify(testValue);

      const testResult: TestResult = {
        name: "Storage Test",
        success,
        message: success
          ? "Storage operations work correctly"
          : "Storage values don't match",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      setStorageTestResult({ set: testValue, get: retrieved });
      addLog(`✅ Storage test completed (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name: "Storage Test",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
        duration,
      };

      setTestResults((prev) => [...prev, testResult]);
      addLog(`❌ Storage test failed: ${testResult.message}`);
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    addLog("🚀 Starting all tests...");

    await testPing();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testNodeExecution();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testStorage();

    setIsRunningTests(false);
    addLog("✨ All tests completed");
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
    setPingResult("");
    setNodeProgress(null);
    setNodeResult(null);
    setStorageTestResult(null);
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
                {environment.ipcAvailable && (
                  <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-lg">
                    IPC Ready
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
                    <p className="text-secondary mb-2">Available IPC Methods</p>
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
              IPC Tests
            </h2>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={runAllTests}
                disabled={isRunningTests || !environment?.ipcAvailable}
                variant="default"
              >
                <Icon name="play" size={16} className="text-white mr-2" />
                {isRunningTests ? "Running Tests..." : "Run All Tests"}
              </Button>

              <Button
                onClick={testPing}
                disabled={isRunningTests || !environment?.ipcAvailable}
                variant="outline"
              >
                Test Ping
              </Button>

              <Button
                onClick={testNodeExecution}
                disabled={isRunningTests || !environment?.ipcAvailable}
                variant="outline"
              >
                Test Node
              </Button>

              <Button
                onClick={testStorage}
                disabled={isRunningTests || !environment?.ipcAvailable}
                variant="outline"
              >
                Test Storage
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
            {(pingResult || nodeResult || storageTestResult) && (
              <div className="space-y-3">
                {pingResult && (
                  <div className="p-3 bg-surface-01 rounded-xl">
                    <p className="text-sm font-medium text-primary mb-1">
                      Ping Result
                    </p>
                    <p className="font-mono text-xs text-secondary">
                      {pingResult}
                    </p>
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

                {storageTestResult && (
                  <div className="p-3 bg-surface-01 rounded-xl">
                    <p className="text-sm font-medium text-primary mb-1">
                      Storage Result
                    </p>
                    <pre className="font-mono text-xs text-secondary overflow-auto">
                      {JSON.stringify(storageTestResult, null, 2)}
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

          {/* Warning for non-Electron environments */}
          {environment && !environment.isElectron && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6">
              <h3 className="text-warning font-semibold mb-2 flex items-center gap-2">
                <Icon
                  name="alert-triangle"
                  size={20}
                  className="text-warning"
                />
                Running in Browser Mode
              </h3>
              <p className="text-secondary text-sm">
                IPC features are not available when running in a browser. To
                test IPC functionality, run the application through the Electron
                desktop wrapper.
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
