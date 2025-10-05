import { defineConfig } from "vitest/config";

/**
 * Root Vitest Configuration using Projects
 *
 * Leverages Vitest's native project capabilities for:
 * - Project-based test organization
 * - Parallel test execution across packages
 * - Proper test isolation and sharding
 *
 * This replaces manual sharding scripts with framework-native features.
 *
 * Usage:
 *   pnpm test:unit                      # Run all unit tests
 *   pnpm test:int                       # Run all integration tests
 *   pnpm test:unit:shard SHARD=1/3      # Shard unit tests
 */
export default defineConfig({
  test: {
    // Use Turborepo for test execution instead of Vitest projects
    // Turborepo already handles parallelization and caching optimally
    // This config is mainly for IDE support
    globals: true,
    environment: "node",
  },
});
