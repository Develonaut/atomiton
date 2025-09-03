/**
 * Base Node Package Exports
 *
 * Provides the foundational types and classes for creating node packages
 * that maintain clean separation between logic and UI.
 */

// Core interfaces and types
export type {
  NodeLogic,
  NodeUIComponent,
  NodeUIProps,
  NodeTestSuite,
  NodePackage,
  NodePackageRegistryEntry,
} from "./NodePackage";

// Base implementation classes
export { BaseNodePackage } from "./NodePackage";
export { BaseNodeLogic } from "./BaseNodeLogic";

// UI components and utilities
export {
  createBaseNodeComponent,
  useNodeUIState,
  renderNodeHandles,
  renderStatusBadge,
  renderRunningAnimation,
  DRACULA_COLORS,
  CATEGORY_COLORS,
} from "./BaseNodeUI";

export type { BaseNodeUIProps, BaseNodeUIConfig } from "./BaseNodeUI";
