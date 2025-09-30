import { useEnvironment } from "#templates/DebugPage/hooks/useEnvironment";
import { useSystemOperations } from "#templates/DebugPage/hooks/useSystemOperations";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import { Button, JsonTreeView, Icon } from "@atomiton/ui";
import { useEffect, useState } from "react";
import conductor from "#lib/conductor";

type HealthStatus = "checking" | "healthy" | "unhealthy" | "unknown";

export default function EnvironmentPage() {
  const { addLog } = useDebugLogs();
  const environment = useEnvironment(addLog);
  const { checkHealth, restartSystem } = useSystemOperations(addLog);

  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");
  const [conductorStatus, setConductorStatus] = useState<HealthStatus>("checking");

  // Check health on mount
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const result = await conductor.system.health();
        if (result && result.status === "ok") {
          setHealthStatus("healthy");
        } else {
          setHealthStatus("unhealthy");
        }
      } catch (error) {
        setHealthStatus("unhealthy");
      }
    };

    const checkConductorApi = async () => {
      try {
        // Test conductor API by attempting a simple health check
        const result = await conductor.health();
        if (result) {
          setConductorStatus("healthy");
        } else {
          setConductorStatus("unhealthy");
        }
      } catch (error) {
        setConductorStatus("unhealthy");
      }
    };

    checkSystemHealth();
    checkConductorApi();
  }, []);

  const handleHealthCheck = async () => {
    setHealthStatus("checking");
    await checkHealth();

    try {
      const result = await conductor.system.health();
      setHealthStatus(result && result.status === "ok" ? "healthy" : "unhealthy");
    } catch {
      setHealthStatus("unhealthy");
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <Icon name="check" className="w-5 h-5 text-green-500" />;
      case "unhealthy":
        return <Icon name="close" className="w-5 h-5 text-red-500" />;
      case "checking":
        return <Icon name="refresh" className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Icon name="help" className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return "text-green-700 bg-green-50 border-green-200";
      case "unhealthy":
        return "text-red-700 bg-red-50 border-red-200";
      case "checking":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Health Status Indicator */}
          <button
            onClick={handleHealthCheck}
            data-testid="test-health"
            data-output={healthStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${getStatusColor(healthStatus)} hover:opacity-80`}
          >
            {getStatusIcon(healthStatus)}
            <span className="font-medium">Health:</span>
            <span className="capitalize">{healthStatus}</span>
          </button>

          {/* Conductor API Status Indicator */}
          <div
            data-testid="conductor-status"
            data-output={conductorStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(conductorStatus)}`}
          >
            {getStatusIcon(conductorStatus)}
            <span className="font-medium">Conductor API:</span>
            <span className="capitalize">{conductorStatus}</span>
          </div>

          {/* Restart Button */}
          <Button onClick={restartSystem} variant="outline">
            <Icon name="refresh" className="w-4 h-4 mr-2" />
            Restart System
          </Button>
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
