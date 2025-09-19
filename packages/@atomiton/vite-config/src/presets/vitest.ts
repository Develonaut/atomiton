import { defineConfig, mergeConfig } from "vitest/config";
import type { UserConfig } from "vitest/config";

export type VitestPresetOptions = {
  /**
   * Enable coverage collection
   * @default false in normal mode, true in CI
   */
  coverage?: boolean;

  /**
   * Test environment
   * @default "node"
   */
  environment?: "node" | "jsdom" | "happy-dom";

  /**
   * Custom reporters (overrides defaults)
   */
  reporters?: string[];

  /**
   * Slow test threshold in milliseconds
   * Tests taking longer than this will be reported
   * @default 300
   */
  slowTestThreshold?: number;
};

/**
 * Creates a shared Vitest configuration with CI-aware defaults
 *
 * Features:
 * - Automatic CI detection for appropriate reporters
 * - Built-in slow test detection
 * - Coverage configuration
 * - Consistent test output across packages
 */
export function defineVitestConfig(
  options: VitestPresetOptions = {},
  userConfig: UserConfig = {},
): UserConfig {
  const isCI = process.env.CI === "true";
  const {
    coverage = isCI,
    environment = "node",
    reporters,
    slowTestThreshold = 300,
  } = options;

  const baseConfig = defineConfig({
    test: {
      globals: true,
      environment,

      // Use appropriate reporters based on environment
      reporters:
        reporters || (isCI ? ["default", "json", "junit"] : ["default"]),

      // Output files for CI reporting
      outputFile: isCI
        ? {
            json: "./test-results/results.json",
            junit: "./test-results/junit.xml",
          }
        : undefined,

      // Slow test detection
      slowTestThreshold,

      // Coverage configuration
      coverage: coverage
        ? {
            enabled: true,
            reporter: isCI
              ? ["text", "json", "html", "json-summary"]
              : ["text", "html"],
            exclude: [
              "**/node_modules/**",
              "**/dist/**",
              "**/*.config.*",
              "**/test-results/**",
              "**/__tests__/**",
              "**/*.test.*",
              "**/*.spec.*",
            ],
          }
        : undefined,

      // Fail fast in CI
      bail: isCI ? 1 : undefined,

      // Parallel test execution
      pool: "forks",
      poolOptions: {
        forks: {
          singleFork: false,
        },
      },
    },
  });

  return mergeConfig(baseConfig, userConfig);
}

/**
 * Smoke test preset - fast tests that should complete quickly
 */
export function defineSmokeTestConfig(userConfig: UserConfig = {}): UserConfig {
  return defineVitestConfig(
    {
      coverage: false,
      slowTestThreshold: 100, // Stricter for smoke tests
    },
    mergeConfig(
      {
        test: {
          // Smoke test specific settings
          bail: 1, // Stop on first failure
          passWithNoTests: true,
          testTimeout: 5000, // 5 second timeout for smoke tests
          hookTimeout: 10000,
        },
      },
      userConfig,
    ),
  );
}
