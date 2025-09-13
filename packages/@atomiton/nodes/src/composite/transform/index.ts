/**
 * Composite Transformation Utilities
 *
 * Handles conversion between YAML storage format and JSON runtime format
 * using the @atomiton/yaml package for all YAML operations.
 */

// YAML to JSON Transformations
export { fromYaml } from "./fromYaml";
export { safeFromYaml } from "./safeFromYaml";

// JSON to YAML Transformations
export { toYaml } from "./toYaml";
export { safeToYaml } from "./safeToYaml";

// Round-trip Validation
export { validateRoundTrip } from "./validateRoundTrip";

// Utility Functions
export { normalizeComposite } from "./normalizeComposite";
export { isValidCompositeYaml } from "./isValidCompositeYaml";
export { extractCompositeMetadata } from "./extractCompositeMetadata";
export { migrateCompositeVersion } from "./migrateCompositeVersion";
