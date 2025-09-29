import { useEffect, useState } from "react";
import conductor from "#lib/conductor";

export type EnvironmentInfo = {
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

export function useEnvironment(addLog: (message: string) => void) {
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    const initializeEnvironment = () => {
      const envInfo = conductor.getEnvironment();
      const isElectron = envInfo.isDesktop;

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

      const conductorAvailable = true;
      const apiMethods: string[] = [];

      // Add Conductor API methods
      apiMethods.push("conductor.node.run", "conductor.system.health");
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
  }, [addLog]);

  return environment;
}
