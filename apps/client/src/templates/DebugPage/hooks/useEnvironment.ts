import conductor from "#lib/conductor";
import { useDebugLogs } from "#templates/DebugPage/hooks/useDebugLogs";
import type { AtomitonBridge } from "@atomiton/rpc/shared";
import { useEffect, useState } from "react";

export type EnvironmentInfo = {
  isElectron: boolean;
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

export function useEnvironment() {
  const { addLog } = useDebugLogs();
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    const initializeEnvironment = () => {
      const envInfo = conductor.getEnvironment();
      const isElectron = envInfo.isDesktop;

      const windowWithElectron = window as Window & {
        atomiton?: {
          __bridge__: AtomitonBridge;
        };
        process?: {
          versions?: {
            node?: string;
            electron?: string;
            chrome?: string;
          };
        };
      };

      const environmentInfo: EnvironmentInfo = {
        isElectron,
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
      addLog(`Atomiton Bridge Available: ${!!windowWithElectron.atomiton?.__bridge__}`);
    };

    initializeEnvironment();
  }, [addLog]);

  return environment;
}
