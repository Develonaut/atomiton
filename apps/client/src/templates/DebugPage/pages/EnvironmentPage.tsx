import { useEnvironment } from "#templates/DebugPage/hooks/useEnvironment";
import { HealthStatusIndicator } from "#templates/DebugPage/components/HealthStatusIndicator";
import { ConductorStatusIndicator } from "#templates/DebugPage/components/ConductorStatusIndicator";
import { RestartSystemButton } from "#templates/DebugPage/components/RestartSystemButton";
import { JsonTreeView } from "@atomiton/ui";
import conductor from "#lib/conductor";
import { useMemo } from "react";

/**
 * Serializes an object by replacing functions with their names
 * This makes the conductor API structure readable without showing function implementations
 */
function serializeApiStructure(obj: unknown, depth = 0, maxDepth = 5): unknown {
  if (depth > maxDepth) return "[Max Depth Reached]";

  if (typeof obj === "function") {
    return `[Function: ${obj.name || "anonymous"}]`;
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeApiStructure(item, depth + 1, maxDepth));
  }

  if (typeof obj === "object") {
    const serialized: Record<string, unknown> = {};
    const objRecord = obj as Record<string, unknown>;

    for (const key in objRecord) {
      if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
        const value = objRecord[key];
        serialized[key] = serializeApiStructure(value, depth + 1, maxDepth);
      }
    }
    return serialized;
  }

  return obj;
}

export default function EnvironmentPage() {
  const environment = useEnvironment();

  const conductorApi = useMemo(
    () => serializeApiStructure(conductor),
    []
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <HealthStatusIndicator />
          <ConductorStatusIndicator />
          <RestartSystemButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Conductor API</h2>
          <JsonTreeView
            data={conductorApi}
            rootName="conductor"
            defaultExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}
