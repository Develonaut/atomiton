import { DEFAULT_SLOWMO_MS } from "#lib/conductor";
import { useState } from "react";

/**
 * UI state for debug options
 * Not to be confused with conductor's DebugOptions type
 */
export type DebugUIState = {
  simulateError: boolean;
  errorType: "generic" | "timeout" | "network" | "validation" | "permission";
  errorNode: string | "random";
  errorDelay: number;
  simulateLongRunning: boolean;
  longRunningNode: string | "random";
  longRunningDelay: number;
};

export function useDebugOptions() {
  const [slowMo, setSlowMo] = useState(DEFAULT_SLOWMO_MS);
  const [debugOptions, setDebugOptions] = useState<DebugUIState>({
    simulateError: false,
    errorType: "generic",
    errorNode: "random",
    errorDelay: 0,
    simulateLongRunning: false,
    longRunningNode: "random",
    longRunningDelay: 5000,
  });

  return {
    slowMo,
    setSlowMo,
    debugOptions,
    setDebugOptions,
  };
}
