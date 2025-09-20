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
        : {
            enabled: false,
          },

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
 * Unit test configuration for co-located tests
 * Finds test files next to their source files
 */
export function defineTestConfig(userConfig: UserConfig = {}): UserConfig {
  return defineVitestConfig(
    {
      environment: "node",
      slowTestThreshold: 300,
    },
    mergeConfig(
      {
        test: {
          include: [
            "src/**/*.{test,spec}.{ts,tsx,js,jsx}",
            "!src/**/*.int.{test,spec}.{ts,tsx,js,jsx}",
            "!src/**/*.integration.{test,spec}.{ts,tsx,js,jsx}",
            "!src/**/*.bench.{ts,tsx,js,jsx}",
            "!src/**/*.e2e.{test,spec}.{ts,tsx,js,jsx}",
          ],
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/*.int.*",
            "**/*.integration.*",
            "**/*.benchmark.*",
            "**/*.e2e.*",
            "**/e2e/**",
            "**/integration/**",
            "**/benchmark/**",
          ],
          testTimeout: 10000,
          hookTimeout: 10000,
          passWithNoTests: true,
        },
      },
      userConfig,
    ),
  );
}

/**
 * Integration test configuration for co-located tests
 */
export function defineIntegrationTestConfig(
  userConfig: UserConfig = {},
): UserConfig {
  return defineVitestConfig(
    {
      environment: "node",
      slowTestThreshold: 5000,
    },
    mergeConfig(
      {
        test: {
          include: ["src/**/*.int.test.{ts,tsx,js,jsx}"],
          exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
          testTimeout: 30000,
          hookTimeout: 30000,
          passWithNoTests: true,
          pool: "forks",
          poolOptions: {
            forks: {
              singleFork: true,
            },
          },
        },
      },
      userConfig,
    ),
  );
}

/**
 * Benchmark test configuration for co-located tests
 */
export function defineBenchmarkTestConfig(
  userConfig: UserConfig = {},
): UserConfig {
  return mergeConfig(
    defineConfig({
      test: {
        includeSource: [],
        include: ["src/**/*.bench.{ts,tsx,js,jsx}"],
        exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
        passWithNoTests: true,
      },
    }),
    userConfig,
  );
}

/**
 * Aliases for backwards compatibility
 */
export const defineUnitTestConfig = defineTestConfig;
export const defineSmokeTestConfig = defineTestConfig;
