export type OptimizeDepsConfig = {
  workspacePackages?: string[];
  additionalIncludes?: string[];
  additionalExcludes?: string[];
};

export function getOptimizeDepsConfig(config: OptimizeDepsConfig = {}) {
  const {
    workspacePackages = [],
    additionalIncludes = [],
    additionalExcludes = [],
  } = config;

  const defaultIncludes = ["react", "react-dom", "react-router-dom"];

  return {
    include: [...defaultIncludes, ...additionalIncludes],
    exclude: [...workspacePackages, ...additionalExcludes],
  };
}

export function getResolveConditions(isDevelopment: boolean) {
  return isDevelopment
    ? ["development", "import", "module", "browser", "default"]
    : undefined;
}
