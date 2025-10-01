import { Icon } from "@atomiton/ui";
import { useDidMount } from "@atomiton/hooks";
import { useState } from "react";
import conductor from "#lib/conductor";
import { useSystemOperations } from "#templates/DebugPage/hooks/useSystemOperations";

type HealthStatus = "checking" | "healthy" | "unhealthy" | "unknown";

/**
 * Self-contained Health Status Indicator component
 * - Checks health automatically on mount
 * - Displays colored status badge with icon
 * - Clickable to manually refresh health check
 * - Logs health check results for e2e testing
 */
export function HealthStatusIndicator() {
  const { checkHealth } = useSystemOperations();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("checking");

  // Check health on mount
  useDidMount(() => {
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

    checkSystemHealth();
  });

  const handleHealthCheck = async () => {
    setHealthStatus("checking");
    await checkHealth();

    try {
      const result = await conductor.system.health();
      setHealthStatus(
        result && result.status === "ok" ? "healthy" : "unhealthy",
      );
    } catch {
      setHealthStatus("unhealthy");
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <Icon name="check" className="w-5 h-5 text-green-500" />;
      case "unhealthy":
        return <Icon name="x" className="w-5 h-5 text-red-500" />;
      case "checking":
        return (
          <Icon
            name="loader-2"
            className="w-5 h-5 text-blue-500 animate-spin"
          />
        );
      default:
        return <Icon name="help-circle" className="w-5 h-5 text-gray-400" />;
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
  );
}
