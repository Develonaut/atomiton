import { Icon } from "@atomiton/ui";
import { useDidMount } from "@atomiton/hooks";
import { useState } from "react";
import conductor from "#lib/conductor";

type ConductorStatus = "checking" | "healthy" | "unhealthy" | "unknown";

/**
 * Self-contained Conductor API Status Indicator component
 * - Checks conductor API health automatically on mount
 * - Displays colored status badge with icon
 * - Non-interactive (read-only status display)
 */
export function ConductorStatusIndicator() {
  const [conductorStatus, setConductorStatus] =
    useState<ConductorStatus>("checking");

  // Check conductor API health on mount
  useDidMount(() => {
    const checkConductorApi = async () => {
      try {
        const result = await conductor.system.health();
        if (result && result.status === "ok") {
          setConductorStatus("healthy");
        } else {
          setConductorStatus("unhealthy");
        }
      } catch {
        setConductorStatus("unhealthy");
      }
    };

    checkConductorApi();
  });

  const getStatusIcon = (status: ConductorStatus) => {
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

  const getStatusColor = (status: ConductorStatus) => {
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
    <div
      data-testid="conductor-status"
      data-output={conductorStatus}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(conductorStatus)}`}
    >
      {getStatusIcon(conductorStatus)}
      <span className="font-medium">Conductor API:</span>
      <span className="capitalize">{conductorStatus}</span>
    </div>
  );
}
