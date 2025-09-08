/**
 * @atomiton/nodes - Main Package Exports
 *
 * This is the unified node library that solves the split logic problem
 * by co-locating each node's logic and UI while maintaining clean separation.
 */

export * from "./types";

export type {
  NodeLogic,
  NodePackage,
  NodePackageRegistryEntry,
  NodeTestSuite,
  NodeUIComponent,
  NodeUIProps,
} from "./base/NodePackage";

export type { BaseNodeUIProps } from "./base/BaseNodeUI";
export type { DiscoveryConfig, RegistryConfig } from "./registry";

export { BaseNodeLogic } from "./base/BaseNodeLogic";
export { BaseNodePackage } from "./base/NodePackage";

export {
  CATEGORY_COLORS,
  createBaseNodeComponent,
  DRACULA_COLORS,
  renderNodeHandles,
  renderRunningAnimation,
  renderStatusBadge,
  STATUS_COLORS,
  useNodeUIState,
} from "./base/BaseNodeUI";

export {
  autoDiscoverNodes,
  getGlobalRegistry,
  NodePackageDiscovery,
  NodePackageRegistry,
  resetGlobalRegistry,
} from "./registry";

export * from "./adapters";

export { default, nodes } from "./core";
export type { NodeCategory, NodeItem, NodesCore } from "./core";

export const packageInfo = {
  name: "@atomiton/nodes",
  version: "1.0.0",
  description:
    "Unified node library for Atomiton Blueprint platform - combining logic and UI components",
} as const;
