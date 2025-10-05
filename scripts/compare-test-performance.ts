#!/usr/bin/env tsx
/**
 * Compare Test Performance
 *
 * Compares Vitest JSON output to detect performance regressions.
 * Uses Vitest's built-in --reporter=json instead of custom parsing.
 *
 * Usage:
 *   pnpm test:perf:baseline  # Save current as baseline
 *   pnpm test:perf           # Compare with baseline
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Vitest JSON Reporter output structure (compatible with Jest --json format)
 * @see https://vitest.dev/guide/reporters
 */
type VitestAssertionResult = {
  ancestorTitles: string[];
  fullName: string;
  status: "passed" | "failed" | "skipped" | "pending" | "todo";
  title: string;
  duration?: number;
  failureMessages: string[];
  location?: {
    line: number;
    column: number;
  };
}

type VitestTestResult = {
  assertionResults: VitestAssertionResult[];
  startTime: number;
  endTime: number;
  status: "passed" | "failed";
  message: string;
  name: string;
}

type VitestResults = {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numPendingTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  startTime: number;
  success: boolean;
  testResults: VitestTestResult[];
  coverageMap?: unknown; // Added in Vitest 3
}

const METRICS_DIR = path.join(process.cwd(), ".test-metrics");
const BASELINE_FILE = path.join(METRICS_DIR, "baseline.json");
const CURRENT_FILE = path.join(METRICS_DIR, "current.json");
const REGRESSION_THRESHOLD = 0.2; // 20%

function ensureMetricsDir(): void {
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }
}

function loadResults(file: string): VitestResults | null {
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function calculateTotalDuration(results: VitestResults): number {
  return results.testResults.reduce((sum, testResult) => {
    const testDuration = testResult.assertionResults.reduce(
      (testSum, assertion) => testSum + (assertion.duration || 0),
      0,
    );
    return sum + testDuration;
  }, 0);
}

function compareResults(baseline: VitestResults, current: VitestResults): void {
  const baselineDuration = calculateTotalDuration(baseline);
  const currentDuration = calculateTotalDuration(current);
  const change =
    ((currentDuration - baselineDuration) / baselineDuration) * 100;
  const isRegression = change > REGRESSION_THRESHOLD * 100;

  console.log("\n📊 Performance Comparison\n");
  console.log(
    `Total Duration: ${baselineDuration.toFixed(0)}ms → ${currentDuration.toFixed(0)}ms`,
  );
  console.log(`Change: ${change > 0 ? "+" : ""}${change.toFixed(1)}%`);
  console.log(`Tests: ${baseline.numTotalTests} → ${current.numTotalTests}\n`);

  if (isRegression) {
    console.log(`❌ REGRESSION: Tests are ${change.toFixed(1)}% slower!\n`);
    if (process.env.CI) {
      process.exit(1);
    }
  } else if (change < -10) {
    console.log(
      `✨ IMPROVEMENT: Tests are ${Math.abs(change).toFixed(1)}% faster!\n`,
    );
  } else {
    console.log(`✅ Performance is stable\n`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const isBaselineMode = args.includes("--baseline");

  ensureMetricsDir();

  if (isBaselineMode) {
    if (!fs.existsSync(CURRENT_FILE)) {
      console.error(
        "❌ No current results found. Run tests with --reporter=json first.",
      );
      process.exit(1);
    }
    fs.copyFileSync(CURRENT_FILE, BASELINE_FILE);
    console.log("✅ Baseline saved");
  } else {
    const baseline = loadResults(BASELINE_FILE);
    const current = loadResults(CURRENT_FILE);

    if (!baseline) {
      console.log("⚠️  No baseline found. Run with --baseline to create one.");
      process.exit(0);
    }

    if (!current) {
      console.error(
        "❌ No current results. Run tests with --reporter=json first.",
      );
      process.exit(1);
    }

    compareResults(baseline, current);
  }
}

main();
