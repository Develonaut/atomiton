import Layout from "#components/Layout";
import conductor from "#lib/conductor";
import { useAuthOperations } from "#templates/DebugPage/hooks/useAuthOperations";
import { useEnvironment } from "#templates/DebugPage/hooks/useEnvironment";
import { useFlowOperations } from "#templates/DebugPage/hooks/useFlowOperations";
import { useNodeOperations } from "#templates/DebugPage/hooks/useNodeOperations";
import { useSystemOperations } from "#templates/DebugPage/hooks/useSystemOperations";
import type {
  FlowSavedEvent,
  NodeCompleteEvent,
  NodeErrorEvent,
  NodeProgressEvent,
} from "@atomiton/conductor/browser";
import { Button, Icon } from "@atomiton/ui";
import { useCallback, useEffect, useState } from "react";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("environment");

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const environment = useEnvironment(addLog);

  const {
    availableFlows,
    flowContent,
    loadFlows,
    saveFlow,
    deleteFlow,
    loadSelectedFlow,
  } = useFlowOperations(addLog, selectedFlow, setSelectedFlow);

  const {
    nodeContent,
    setNodeContent,
    isExecuting,
    validateNode,
    executeNode,
    cancelExecution,
    createSampleNode,
    createGroupNode,
    createTestNode,
    testNode,
  } = useNodeOperations(addLog);

  const {
    currentUser,
    authToken,
    login,
    logout,
    getCurrentUserInfo,
    refreshAuthToken,
  } = useAuthOperations(addLog);

  const { checkHealth, restartSystem, testExecute, testHealthShortcut } =
    useSystemOperations(addLog);

  // Setup event subscriptions
  useEffect(() => {
    const subscriptions: (() => void)[] = [];

    const unsubProgress = conductor.events?.onNodeProgress?.(
      (event: NodeProgressEvent) => {
        addLog(`📊 Node progress: ${event.progress}% - ${event.message || ""}`);
      },
    );
    if (unsubProgress) subscriptions.push(unsubProgress);

    const unsubComplete = conductor.events?.onNodeComplete?.(
      (event: NodeCompleteEvent) => {
        addLog(`✅ Node complete: ${event.nodeId}`);
      },
    );
    if (unsubComplete) subscriptions.push(unsubComplete);

    const unsubError = conductor.events?.onNodeError?.(
      (event: NodeErrorEvent) => {
        addLog(`❌ Node error: ${event.error}`);
      },
    );
    if (unsubError) subscriptions.push(unsubError);

    const unsubFlowSaved = conductor.events?.onFlowSaved?.(
      (event: FlowSavedEvent) => {
        addLog(`💾 Flow saved: ${event.flowId}`);
      },
    );
    if (unsubFlowSaved) subscriptions.push(unsubFlowSaved);

    const unsubAuthExpired = conductor.events?.onAuthExpired?.(() => {
      addLog("🔒 Auth token expired");
    });
    if (unsubAuthExpired) subscriptions.push(unsubAuthExpired);

    return () => {
      subscriptions.forEach((unsub) => unsub());
    };
  }, [addLog]);

  // Load initial data
  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog("Logs cleared");
  }, [addLog]);

  const renderSectionButtons = () => (
    <div className="flex gap-2 mb-4 flex-wrap">
      <Button
        variant={activeSection === "environment" ? "default" : "ghost"}
        onClick={() => setActiveSection("environment")}
        data-testid="tab-environment"
      >
        Environment
      </Button>
      <Button
        variant={activeSection === "flows" ? "default" : "ghost"}
        onClick={() => setActiveSection("flows")}
        data-testid="tab-flows"
      >
        Flows
      </Button>
      <Button
        variant={activeSection === "nodes" ? "default" : "ghost"}
        onClick={() => setActiveSection("nodes")}
        data-testid="tab-nodes"
      >
        Nodes
      </Button>
      <Button
        variant={activeSection === "auth" ? "default" : "ghost"}
        onClick={() => setActiveSection("auth")}
        data-testid="tab-auth"
      >
        Auth
      </Button>
      <Button
        variant={activeSection === "system" ? "default" : "ghost"}
        onClick={() => setActiveSection("system")}
        data-testid="tab-system"
      >
        System
      </Button>
    </div>
  );

  const renderEnvironmentSection = () =>
    environment && (
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Runtime:</strong>{" "}
            {environment.isElectron ? "Electron" : "Browser"}
          </div>
          <div>
            <strong>Conductor:</strong>{" "}
            {environment.conductorAvailable ? "✓ Available" : "✗ Not Available"}
          </div>
          <div>
            <strong>Environment:</strong> {environment.env}
          </div>
          <div>
            <strong>Platform:</strong> {environment.platform}
          </div>
          {environment.electronVersion && (
            <div>
              <strong>Electron:</strong> {environment.electronVersion}
            </div>
          )}
          {environment.nodeVersion && (
            <div>
              <strong>Node:</strong> {environment.nodeVersion}
            </div>
          )}
          <div>
            <strong>Available APIs:</strong>
            <ul className="ml-4 mt-1">
              {environment.apiMethods.map((method, idx) => (
                <li key={idx}>• {method}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );

  const renderFlowsSection = () => (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Flow Operations</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadFlows}>
            <Icon name="refresh" className="w-4 h-4 mr-2" />
            Refresh Flows
          </Button>
          <Button onClick={saveFlow}>
            <Icon name="save" className="w-4 h-4 mr-2" />
            Save Flow
          </Button>
          <Button onClick={deleteFlow} variant="destructive">
            <Icon name="trash" className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Available Flows:</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={selectedFlow || ""}
            onChange={(e) => setSelectedFlow(e.target.value || null)}
          >
            <option value="">Select a flow...</option>
            {availableFlows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.id}
              </option>
            ))}
          </select>
        </div>

        {selectedFlow && (
          <div className="space-y-2">
            <Button onClick={loadSelectedFlow}>
              <Icon name="download" className="w-4 h-4 mr-2" />
              Load Flow Content
            </Button>
            {flowContent && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                {flowContent}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderNodesSection = () => (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Node Operations</h2>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={createSampleNode}>Create Sample</Button>
          <Button onClick={createGroupNode}>Create Group</Button>
          <Button onClick={createTestNode}>Create Test Node</Button>
          <Button onClick={validateNode}>Validate</Button>
          <Button
            onClick={executeNode}
            disabled={isExecuting}
            variant="default"
          >
            {isExecuting ? "Executing..." : "Execute"}
          </Button>
          <Button
            onClick={testNode}
            disabled={isExecuting}
            variant="default"
            className="font-semibold"
            data-testid="test-node-execution"
          >
            {isExecuting ? "Testing..." : "🧪 Test Node"}
          </Button>
          {isExecuting && (
            <Button onClick={cancelExecution} variant="destructive">
              Cancel
            </Button>
          )}
        </div>

        <textarea
          className="w-full h-48 px-3 py-2 border rounded font-mono text-xs"
          placeholder="Enter node definition JSON..."
          value={nodeContent}
          onChange={(e) => setNodeContent(e.target.value)}
        />
      </div>
    </div>
  );

  const renderAuthSection = () => (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Authentication</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={login}>Login</Button>
          <Button onClick={logout}>Logout</Button>
          <Button onClick={getCurrentUserInfo}>Get Current User</Button>
          <Button onClick={refreshAuthToken}>Refresh Token</Button>
        </div>

        {currentUser && (
          <div className="bg-gray-100 p-3 rounded">
            <p>
              <strong>User:</strong> {currentUser.username}
            </p>
            {currentUser.email && (
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
            )}
            {currentUser.roles && (
              <p>
                <strong>Roles:</strong> {currentUser.roles.join(", ")}
              </p>
            )}
          </div>
        )}

        {authToken && (
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-xs font-mono break-all">
              <strong>Token:</strong> {authToken.substring(0, 50)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">System Operations</h2>
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

  const renderActiveSection = () => {
    switch (activeSection) {
      case "environment":
        return renderEnvironmentSection();
      case "flows":
        return renderFlowsSection();
      case "nodes":
        return renderNodesSection();
      case "auth":
        return renderAuthSection();
      case "system":
        return renderSystemSection();
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            data-testid="debug-page-title"
          >
            Conductor Debug Page
          </h1>
          <p className="text-gray-600">
            Test and debug the Conductor API integration
          </p>
        </div>

        {renderSectionButtons()}
        {renderActiveSection()}

        {/* Logs Section */}
        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Event Logs</h2>
            <Button onClick={clearLogs} size="sm">
              Clear Logs
            </Button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs h-64 overflow-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, idx) => {
                // Add test IDs and data attributes for E2E test assertions
                let testId = undefined;
                let dataOutput = undefined;

                if (log.includes("✅ File write test completed:")) {
                  testId = "file-write-success";
                  // Extract the file path from the log message
                  const filePathMatch = log.match(
                    /✅ File write test completed: (.+)/,
                  );
                  if (filePathMatch) {
                    dataOutput = filePathMatch[1];
                  }
                } else if (log.includes("❌ File write test error:")) {
                  testId = "file-write-error";
                  // Extract the error message
                  const errorMatch = log.match(
                    /❌ File write test error: (.+)/,
                  );
                  if (errorMatch) {
                    dataOutput = errorMatch[1];
                  }
                } else if (log.includes("System health:")) {
                  testId = "health-status";
                  // Extract the health status
                  const healthMatch = log.match(/System health: (.+)/);
                  if (healthMatch) {
                    dataOutput = healthMatch[1];
                  }
                } else if (log.includes("🏓 Sending health check ping")) {
                  testId = "health-ping";
                  dataOutput = "ping";
                } else if (log.includes("Health check pong received")) {
                  testId = "health-pong";
                  // Check for success/error emoji anywhere in the log
                  if (log.includes("✅")) {
                    dataOutput = "success";
                  } else if (log.includes("❌")) {
                    dataOutput = "error";
                  } else {
                    dataOutput = "pong";
                  }
                } else if (log.includes("IPC connection")) {
                  testId = "health-message";
                  const messageMatch = log.match(/Status: (.+)/);
                  if (messageMatch) {
                    dataOutput = messageMatch[1];
                  } else {
                    dataOutput = log;
                  }
                } else if (log.includes("Response time:")) {
                  testId = "health-timestamp";
                  const timeMatch = log.match(/Response time: (.+)/);
                  if (timeMatch) {
                    dataOutput = timeMatch[1];
                  }
                } else if (log.includes("Test execution result:")) {
                  testId = "test-execution-result";
                  // The next log entry might contain JSON data
                } else if (
                  testId === undefined &&
                  idx > 0 &&
                  logs[idx - 1].includes("Test execution result:")
                ) {
                  // This is the JSON result after "Test execution result:"
                  testId = "test-execution-data";
                  dataOutput = log;
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
      </div>
    </Layout>
  );
}
