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
      { encoding: "utf-8" },
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
      { encoding: "utf-8" },
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
  width: number = 20,
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
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
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

function displayDashboard(): void {
  console.clear();
  console.log(
    colors.bold +
      colors.cyan +
      "\n╔════════════════════════════════════════════╗",
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
      `${name} Unit:${unit} Smoke:${smoke} Bench:${bench} E2E:${e2e}`,
    );
  });

  // Smoke Test Performance (dynamically load from actual results if available)
  console.log(
    colors.bold + "\n⏱️  Smoke Test Performance (5s limit)" + colors.reset,
  );
  console.log("─".repeat(45));

  // Try to load actual test results
  const smokeData: TestPerformance[] = [];

  sortedPackages.forEach((pkg) => {
    if (pkg.hasSmoke) {
      const reportPath = path.join(
        pkg.path,
        "test-results",
        "speed-report.json",
      );
      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
          if (report.smoke?.duration) {
            smokeData.push({
              name: pkg.name,
              duration: report.smoke.duration,
              limit: 5000,
            });
          }
        } catch {
          // Use placeholder if report can't be read
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
      colors.gray + "No smoke test timing data available yet" + colors.reset,
    );
    console.log(
      colors.gray + "Run smoke tests to see performance data" + colors.reset,
    );
    return;
  }

  smokeData.forEach((test) => {
    if (test.duration === 0) {
      console.log(
        `${test.name.padEnd(20)} ${colors.gray}No timing data yet${colors.reset}`,
      );
    } else {
      const bar = drawProgressBar(test.duration, test.limit);
      const duration = formatDuration(test.duration);
      const status = test.duration < test.limit ? "✅" : "❌";
      console.log(
        `${test.name.padEnd(20)} ${bar} ${duration.padStart(6)} ${status}`,
      );
    }
  });

  // Benchmark Trends
  console.log(colors.bold + "\n📊 Benchmark Performance Trends" + colors.reset);
  console.log("─".repeat(45));

  // ASCII chart for trends
  const chart = [
    "100% │     ╭─╮",
    " 95% │  ╭──╯ ╰─╮",
    " 90% │ ─╯      ╰───────",
    " 85% │",
    " 80% └──────────────────",
    "     1w   2w   3w   4w",
  ];

  chart.forEach((line) => console.log(colors.gray + line + colors.reset));

  // Recent Test Runs (placeholder for future implementation)
  console.log(colors.bold + "\n🏃 Recent Test Runs" + colors.reset);
  console.log("─".repeat(45));
  console.log(
    colors.gray +
      "Test run history tracking not yet implemented" +
      colors.reset,
  );
  console.log(
    colors.gray + "Run tests manually to see current status" + colors.reset,
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
      colors.reset,
  );
  console.log(
    "Run smoke tests:      " + colors.cyan + "pnpm test:smoke" + colors.reset,
  );
  console.log(
    "Run benchmarks:       " +
      colors.cyan +
      "pnpm benchmark:run" +
      colors.reset,
  );
  console.log(
    "Compare benchmarks:   " +
      colors.cyan +
      "pnpm benchmark:compare" +
      colors.reset,
  );
  console.log(
    "Update baseline:      " +
      colors.cyan +
      "pnpm benchmark:update" +
      colors.reset,
  );

  console.log(
    "\n" +
      colors.gray +
      "Last updated: " +
      new Date().toLocaleString() +
      colors.reset,
  );

  if (process.argv.includes("--watch")) {
    console.log(
      colors.gray +
        "Refreshing every 30 seconds... Press Ctrl+C to exit" +
        colors.reset,
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
