#!/usr/bin/env tsx

/**
 * Test Speed Checker
 * Ensures smoke tests complete within 5 seconds
 * Usage: tsx scripts/test-speed-check.ts [report-path] [test-type]
 */

import fs from "fs";
import path from "path";

interface TestResult {
  name?: string;
  file?: string;
  duration: number;
  status?: string;
}

interface TestReport {
  totalDuration?: number;
  duration?: number;
  tests?: TestResult[];
  timestamp?: string;
  package?: string;
}

enum TestType {
  Smoke = "smoke",
  Unit = "unit",
  Integration = "integration",
}

const LIMITS: Record<TestType, number> = {
  [TestType.Smoke]: 5000, // 5 seconds for smoke tests
  [TestType.Unit]: 100, // 100ms average per unit test
  [TestType.Integration]: 30000, // 30 seconds for integration tests
};

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function getPerformanceGrade(percentage: number): string {
  if (percentage > 80) return "⚠️ Approaching limit";
  if (percentage > 60) return "👍 Good";
  if (percentage > 40) return "✅ Great";
  return "🏆 Excellent";
}

function checkTestSpeed(
  reportPath: string,
  type: TestType = TestType.Smoke,
): void {
  if (!fs.existsSync(reportPath)) {
    console.error(`❌ Report file not found: ${reportPath}`);
    process.exit(1);
  }

  const report: TestReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  const limit = LIMITS[type];

  if (!limit) {
    console.error(`❌ Unknown test type: ${type}`);
    console.error(`   Valid types: ${Object.values(TestType).join(", ")}`);
    process.exit(1);
  }

  const totalDuration = report.totalDuration ?? report.duration ?? 0;

  if (totalDuration > limit) {
    console.error(`\n❌ ${type.toUpperCase()} tests exceeded time limit!`);
    console.error(`   Limit: ${formatDuration(limit)}`);
    console.error(`   Actual: ${formatDuration(totalDuration)}`);
    console.error(`   Exceeded by: ${formatDuration(totalDuration - limit)}`);

    // Show slowest tests if available
    if (report.tests?.length) {
      const slowTests = report.tests
        .filter((t) => t.duration)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

      if (slowTests.length > 0) {
        console.error("\n🐌 Slowest tests:");
        slowTests.forEach((test) => {
          const name = test.name ?? test.file ?? "Unknown";
          console.error(`   ${name}: ${formatDuration(test.duration)}`);
        });

        console.error("\n💡 Suggestions:");
        console.error("   - Move slow tests to integration suite");
        console.error("   - Optimize test setup/teardown");
        console.error("   - Use test.concurrent() for parallel execution");
        console.error("   - Mock heavy operations");
      }
    }

    process.exit(1);
  }

  // Success - show summary
  const percentage = (totalDuration / limit) * 100;
  const grade = getPerformanceGrade(percentage);

  console.log(`\n✅ ${type.toUpperCase()} tests within time limit`);
  console.log(`   Duration: ${formatDuration(totalDuration)}`);
  console.log(`   Limit: ${formatDuration(limit)}`);
  console.log(`   Margin: ${formatDuration(limit - totalDuration)} remaining`);
  console.log(`   Grade: ${grade} (${percentage.toFixed(0)}% of limit)`);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);
  const reportPath = args[0] || "./test-results/speed-report.json";
  const testType = (args[1] as TestType) || TestType.Smoke;

  // Validate test type
  if (!Object.values(TestType).includes(testType)) {
    console.error(`❌ Invalid test type: ${testType}`);
    console.error(`   Valid types: ${Object.values(TestType).join(", ")}`);
    process.exit(1);
  }

  checkTestSpeed(reportPath, testType);
}

// Run if executed directly
if (require.main === module) {
  main();
}
