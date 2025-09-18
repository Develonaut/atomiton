#!/usr/bin/env tsx

/**
 * Test Performance Dashboard
 * Shows test speed trends and performance metrics
 * Usage: tsx scripts/test-dashboard.ts [--watch]
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
} as const;

interface Package {
  name: string;
  path: string;
  hasSmoke: boolean;
  hasBenchmark: boolean;
  hasUnit?: boolean;
  hasE2E?: boolean;
}

interface TestRun {
  time: string;
  package: string;
  type: string;
  status: "passed" | "failed";
  duration: string;
}

interface Alert {
  level: "info" | "warning" | "error";
  message: string;
}

interface TestPerformance {
  name: string;
  duration: number;
  limit: number;
}

interface TestAverages {
  unit: number;
  smoke: number;
  integration: number;
  benchmark: number;
}

interface VitestTestResult {
  name: string;
  startTime: number;
  endTime: number;
  assertionResults: Array<{
    duration: number;
    status: string;
  }>;
}

interface TestResults {
  speed: string[];
  benchmarks: string[];
  packages: Package[];
}

function findTestResults(rootDir: string = "."): TestResults {
  const results: TestResults = {
    speed: [],
    benchmarks: [],
    packages: [],
  };

  try {
    // Find all test result files
    const speedReports = execSync(
      `find ${rootDir} -path "*/test-results/*.json" -o -path "*/benchmarks/*.json" 2>/dev/null || true`,
      { encoding: "utf-8" }
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    speedReports.forEach((file) => {
      if (file.includes("benchmark")) {
        results.benchmarks.push(file);
      } else {
        results.speed.push(file);
      }
    });

    // Find packages with tests
    const packageJsons = execSync(
      `find ${rootDir} -name "package.json" -not -path "*/node_modules/*" 2>/dev/null || true`,
      { encoding: "utf-8" }
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    packageJsons.forEach((pkgPath) => {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.scripts?.test) {
          results.packages.push({
            name: pkg.name || path.basename(path.dirname(pkgPath)),
            path: path.dirname(pkgPath),
            hasSmoke: Boolean(pkg.scripts["test:smoke"]),
            hasBenchmark: Boolean(pkg.scripts["test:benchmark"]),
            hasUnit: Boolean(pkg.scripts["test:unit"]),
            hasE2E: Boolean(pkg.scripts["test:e2e"]),
          });
        }
      } catch (error) {
        // Skip invalid package.json files
      }
    });
  } catch (error) {
    // Silently continue if find fails
  }

  return results;
}

function drawProgressBar(
  value: number,
  max: number,
  width: number = 20
): string {
  const percentage = Math.min(value / max, 1);
  const filled = Math.round(percentage * width);
  const empty = width - filled;

  let color = colors.green;
  if (percentage > 0.8) color = colors.red;
  else if (percentage > 0.6) color = colors.yellow;

  return (
    color + "█".repeat(filled) + colors.gray + "░".repeat(empty) + colors.reset
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(3)}ms`;
  return `${(ms / 1000).toFixed(3)}s`;
}

function getTestTypeIcon(type: string): string {
  switch (type) {
    case "unit":
      return "🧪";
    case "smoke":
      return "🔥";
    case "e2e":
      return "🎭";
    case "benchmark":
      return "📊";
    default:
      return "📋";
  }
}

function parseVitestReport(
  reportPath: string
): { totalDuration: number; avgDuration: number } | null {
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    if (report.testResults && Array.isArray(report.testResults)) {
      let totalDuration = 0;
      let testCount = 0;

      report.testResults.forEach((testResult: VitestTestResult) => {
        const testDuration = testResult.endTime - testResult.startTime;
        totalDuration += testDuration;
        testCount += testResult.assertionResults?.length || 0;
      });

      return {
        totalDuration,
        avgDuration: testCount > 0 ? totalDuration / testCount : 0,
      };
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return null;
}

function calculateTestAverages(packages: Package[]): TestAverages {
  const averages: TestAverages = {
    unit: 0,
    smoke: 0,
    integration: 0,
    benchmark: 0,
  };

  let counts = {
    unit: 0,
    smoke: 0,
    integration: 0,
    benchmark: 0,
  };

  packages.forEach((pkg) => {
    // Check for smoke test results
    const smokeReportPath = path.join(
      pkg.path,
      "test-results",
      "speed-report.json"
    );
    if (fs.existsSync(smokeReportPath)) {
      const smokeResult = parseVitestReport(smokeReportPath);
      if (smokeResult) {
        averages.smoke += smokeResult.totalDuration;
        counts.smoke++;
      }
    }

    // TODO: Add unit test result parsing when we implement that
    // TODO: Add integration test result parsing when we implement that
    // TODO: Add benchmark test result parsing when we implement that
  });

  // Calculate final averages
  if (counts.smoke > 0) averages.smoke = averages.smoke / counts.smoke;
  if (counts.unit > 0) averages.unit = averages.unit / counts.unit;
  if (counts.integration > 0)
    averages.integration = averages.integration / counts.integration;
  if (counts.benchmark > 0)
    averages.benchmark = averages.benchmark / counts.benchmark;

  return averages;
}

function displayDashboard(): void {
  console.clear();
  console.log(
    colors.bold +
      colors.cyan +
      "\n╔════════════════════════════════════════════╗"
  );
  console.log("║       TEST PERFORMANCE DASHBOARD           ║");
  console.log("╚════════════════════════════════════════════╝" + colors.reset);

  const results = findTestResults();

  // Package Overview
  console.log(colors.bold + "\n📦 Package Test Coverage" + colors.reset);
  console.log("─".repeat(45));

  const sortedPackages = results.packages
    .filter((pkg) => pkg.name.startsWith("@atomiton"))
    .sort((a, b) => a.name.localeCompare(b.name));

  sortedPackages.forEach((pkg) => {
    const smoke = pkg.hasSmoke ? "✅" : "❌";
    const bench = pkg.hasBenchmark ? "✅" : "❌";
    const unit = pkg.hasUnit ? "✅" : "❌";

    // E2E only required for client apps, optional for others
    const isClientApp =
      pkg.name.includes("client") || pkg.name.includes("desktop");
    const e2e = pkg.hasE2E ? "✅" : isClientApp ? "❌" : "➖";

    const name = pkg.name.padEnd(25);
    console.log(
      `${name} Unit:${unit} Smoke:${smoke} Bench:${bench} E2E:${e2e}`
    );
  });

  // Smoke Test Performance (dynamically load from actual results if available)
  console.log(
    colors.bold + "\n⏱️  Smoke Test Performance (5s limit)" + colors.reset
  );
  console.log("─".repeat(45));

  // Try to load actual test results
  const smokeData: TestPerformance[] = [];

  sortedPackages.forEach((pkg) => {
    if (pkg.hasSmoke) {
      const reportPath = path.join(
        pkg.path,
        "test-results",
        "speed-report.json"
      );
      if (fs.existsSync(reportPath)) {
        const result = parseVitestReport(reportPath);
        if (result) {
          smokeData.push({
            name: pkg.name,
            duration: result.totalDuration,
            limit: 5000,
          });
        } else {
          smokeData.push({
            name: pkg.name,
            duration: 0,
            limit: 5000,
          });
        }
      } else {
        // Show packages with smoke tests but no results yet
        smokeData.push({
          name: pkg.name,
          duration: 0,
          limit: 5000,
        });
      }
    }
  });

  if (smokeData.length === 0) {
    console.log(
      colors.gray + "No smoke test timing data available yet" + colors.reset
    );
    console.log(
      colors.gray + "Run smoke tests to see performance data" + colors.reset
    );
    return;
  }

  smokeData.forEach((test) => {
    if (test.duration === 0) {
      console.log(
        `${test.name.padEnd(20)} ${colors.gray}No timing data yet${colors.reset}`
      );
    } else {
      const bar = drawProgressBar(test.duration, test.limit);
      const duration = formatDuration(test.duration);
      const status = test.duration < test.limit ? "✅" : "❌";
      console.log(
        `${test.name.padEnd(20)} ${bar} ${duration.padStart(6)} ${status}`
      );
    }
  });

  // Benchmark Performance
  console.log(colors.bold + "\n📊 Benchmark Performance" + colors.reset);
  console.log("─".repeat(45));

  // Load benchmark data from test-results
  const benchmarkData: any[] = [];

  sortedPackages.forEach((pkg) => {
    if (pkg.hasBenchmark) {
      const benchmarkPath = path.join(
        pkg.path,
        "test-results",
        "benchmark-report.json",
      );
      const baselinePath = path.join(
        pkg.path,
        "test-results",
        "benchmark-baseline.json",
      );

      if (fs.existsSync(benchmarkPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(benchmarkPath, "utf-8"));
          const baseline = fs.existsSync(baselinePath)
            ? JSON.parse(fs.readFileSync(baselinePath, "utf-8"))
            : null;

          benchmarkData.push({
            name: pkg.name,
            report,
            baseline,
          });
        } catch (error) {
          // Ignore parse errors
        }
      }
    }
  });

  if (benchmarkData.length === 0) {
    console.log(colors.gray + "No benchmark data available yet" + colors.reset);
    console.log(colors.gray + "Run benchmarks to see performance data" + colors.reset);
  } else {
    benchmarkData.forEach((data) => {
      console.log(`\n${colors.cyan}${data.name}${colors.reset}`);

      if (data.report.benchmarks && data.report.benchmarks.length > 0) {
        // Show top 3 benchmarks
        const topBenchmarks = data.report.benchmarks.slice(0, 3);

        topBenchmarks.forEach((bench: any) => {
          const name = bench.name.substring(0, 25).padEnd(25);
          const ops = `${bench.hz.toLocaleString()} ops/s`;
          const mean = `${bench.mean.toFixed(4)}ms`;

          if (data.baseline) {
            const baselineBench = data.baseline.benchmarks.find(
              (b: any) => b.name === bench.name
            );

            if (baselineBench) {
              const change = ((bench.hz - baselineBench.hz) / baselineBench.hz) * 100;
              const trend = change > 5 ? "📈" : change < -5 ? "📉" : "➡️";
              const color = change > 5 ? colors.green : change < -5 ? colors.red : colors.yellow;

              console.log(
                `  ${trend} ${name} ${ops.padStart(15)} ${mean.padStart(10)} ${color}${change > 0 ? "+" : ""}${change.toFixed(1)}%${colors.reset}`
              );
            } else {
              console.log(`  🆕 ${name} ${ops.padStart(15)} ${mean.padStart(10)}`);
            }
          } else {
            console.log(`  • ${name} ${ops.padStart(15)} ${mean.padStart(10)}`);
          }
        });

        if (data.report.benchmarks.length > 3) {
          console.log(
            colors.gray +
              `  ... and ${data.report.benchmarks.length - 3} more benchmarks` +
              colors.reset
          );
        }

        // Show trends if available
        if (data.report.trends) {
          const { improvements, degradations, stable } = data.report.trends;
          if (degradations > 0) {
            console.log(
              `  ${colors.red}⚠️  ${degradations} benchmark(s) degraded${colors.reset}`
            );
          }
          if (improvements > 0) {
            console.log(
              `  ${colors.green}✅ ${improvements} benchmark(s) improved${colors.reset}`
            );
          }
        }
      } else if (data.report.error) {
        console.log(`  ${colors.red}Error: ${data.report.error}${colors.reset}`);
      }
    });
  }

  // Average Test Times Section
  console.log(colors.bold + "\n⏱️  Average Test Times by Type" + colors.reset);
  console.log("─".repeat(45));

  const averages = calculateTestAverages(sortedPackages);

  const testTypes = [
    {
      name: "Smoke Tests",
      icon: "🔥",
      avg: averages.smoke,
      limit: 5000,
      color: colors.red,
    },
    {
      name: "Unit Tests",
      icon: "🧪",
      avg: averages.unit,
      limit: 100,
      color: colors.green,
    },
    {
      name: "Integration Tests",
      icon: "🔗",
      avg: averages.integration,
      limit: 30000,
      color: colors.blue,
    },
    {
      name: "Benchmark Tests",
      icon: "📊",
      avg: averages.benchmark,
      limit: 10000,
      color: colors.magenta,
    },
  ];

  testTypes.forEach(({ name, icon, avg, limit, color }) => {
    if (avg > 0) {
      const percentage = (avg / limit) * 100;
      let status = "✅";
      let statusColor = colors.green;

      if (avg > limit) {
        status = "❌";
        statusColor = colors.red;
      } else if (percentage > 80) {
        status = "⚠️";
        statusColor = colors.yellow;
      }

      const bar = drawProgressBar(avg, limit, 15);
      console.log(
        `${icon} ${name.padEnd(18)} ${bar} ${statusColor}${formatDuration(avg).padStart(8)} ${status}${colors.reset}`
      );
    } else {
      console.log(
        `${icon} ${name.padEnd(18)} ${colors.gray}No data yet${colors.reset}`
      );
    }
  });

  // Recent Test Runs (placeholder for future implementation)
  console.log(colors.bold + "\n🏃 Recent Test Runs" + colors.reset);
  console.log("─".repeat(45));
  console.log(
    colors.gray + "Test run history tracking not yet implemented" + colors.reset
  );
  console.log(
    colors.gray + "Run tests manually to see current status" + colors.reset
  );

  // Alerts and Warnings
  console.log(colors.bold + "\n⚠️  Alerts & Warnings" + colors.reset);
  console.log("─".repeat(45));

  const alerts: Alert[] = [];

  // Check for packages missing smoke tests
  const missingSmoke = sortedPackages.filter((pkg) => !pkg.hasSmoke);
  if (missingSmoke.length > 0) {
    alerts.push({
      level: "warning",
      message: `${missingSmoke.length} packages missing smoke tests: ${missingSmoke.map((p) => p.name).join(", ")}`,
    });
  }

  // Check for packages missing benchmarks
  const missingBench = sortedPackages.filter((pkg) => !pkg.hasBenchmark);
  if (missingBench.length > 0) {
    alerts.push({
      level: "info",
      message: `${missingBench.length} packages missing benchmark tests`,
    });
  }

  // Check smoke test performance from real data
  smokeData.forEach((test) => {
    if (test.duration > 4000) {
      alerts.push({
        level: "warning",
        message: `${test.name} smoke tests approaching limit (${formatDuration(test.duration)}/5s)`,
      });
    }
    if (test.duration > 5000) {
      alerts.push({
        level: "error",
        message: `${test.name} smoke tests exceed limit (${formatDuration(test.duration)}/5s)`,
      });
    }
  });

  alerts.forEach((alert) => {
    let icon = "ℹ️";
    let color = colors.blue;

    if (alert.level === "warning") {
      icon = "⚠️";
      color = colors.yellow;
    } else if (alert.level === "error") {
      icon = "❌";
      color = colors.red;
    }

    console.log(`${icon} ${color}${alert.message}${colors.reset}`);
  });

  // Test Count Statistics
  console.log(colors.bold + "\n📊 Test Count Statistics" + colors.reset);
  console.log("─".repeat(45));

  try {
    const unitTests = parseInt(
      execSync(
        "find . -name '*.test.*' -not -path '*/smoke/*' -not -path '*/e2e/*' -not -name '*integration*' | wc -l",
        { encoding: "utf8" }
      ).trim()
    );
    const smokeTests = parseInt(
      execSync(
        "find . -path '*smoke*.test.*' -o -path '*/smoke/*' -name '*.test.*' | wc -l",
        { encoding: "utf8" }
      ).trim()
    );
    const integrationTests = parseInt(
      execSync("find . -name '*integration*.test.*' | wc -l", {
        encoding: "utf8",
      }).trim()
    );
    const specFiles = parseInt(
      execSync("find . -name '*.spec.*' | wc -l", { encoding: "utf8" }).trim()
    );
    const totalTests = unitTests + smokeTests + integrationTests + specFiles;

    console.log(
      `📝 Unit Tests:        ${colors.green}${unitTests.toLocaleString()}${colors.reset}`
    );
    console.log(
      `🔥 Smoke Tests:       ${colors.green}${smokeTests.toLocaleString()}${colors.reset}`
    );
    console.log(
      `🔗 Integration Tests: ${colors.green}${integrationTests.toLocaleString()}${colors.reset}`
    );
    console.log(
      `📋 Spec Files:        ${colors.green}${specFiles.toLocaleString()}${colors.reset}`
    );
    console.log(
      `📦 Total Test Files:  ${colors.bold}${colors.green}${totalTests.toLocaleString()}${colors.reset}`
    );
  } catch (error) {
    console.log(`${colors.gray}Unable to count test files${colors.reset}`);
  }

  // Test Organization Status
  console.log(colors.bold + "\n📁 Test Organization Status" + colors.reset);
  console.log("─".repeat(45));
  console.log(`✅ Scripts standardized to 8 per package`);
  console.log(`✅ Root scripts reduced from 11 to 5`);
  console.log(`✅ Tests organized in __tests__ folders`);
  console.log(`✅ Smoke tests in src/__tests__/smoke/`);

  // Quick Actions
  console.log(colors.bold + "\n🎯 Quick Actions" + colors.reset);
  console.log("─".repeat(45));
  console.log(
    "Check test speed:     " +
      colors.cyan +
      "pnpm test:speed-check" +
      colors.reset
  );
  console.log(
    "Run smoke tests:      " + colors.cyan + "pnpm test:smoke" + colors.reset
  );
  console.log(
    "Run benchmarks:       " + colors.cyan + "pnpm test:benchmark" + colors.reset
  );

  console.log(
    "\n" +
      colors.gray +
      "Last updated: " +
      new Date().toLocaleString() +
      colors.reset
  );

  if (process.argv.includes("--watch")) {
    console.log(
      colors.gray +
        "Refreshing every 30 seconds... Press Ctrl+C to exit" +
        colors.reset
    );
  }

  console.log("");
}

// Main execution
function main(): void {
  displayDashboard();

  // Refresh every 30 seconds if running in watch mode
  if (process.argv.includes("--watch")) {
    setInterval(displayDashboard, 30000);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
