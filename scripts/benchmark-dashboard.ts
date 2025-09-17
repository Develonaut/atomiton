#!/usr/bin/env tsx

/**
 * Benchmark Performance Dashboard
 * Displays benchmark trends and comparisons across packages
 */

import fs from "fs";
import path from "path";

interface BenchmarkReport {
  timestamp: string;
  package: string;
  suites: Array<{
    name: string;
    results: Array<{
      name: string;
      hz?: number;
      mean?: number;
    }>;
  }>;
  summary: {
    totalBenchmarks: number;
    totalSuites: number;
    executionTime: number;
  };
}

interface BenchmarkHistory {
  package: string;
  history: BenchmarkReport[];
  baseline?: BenchmarkReport;
  latest?: BenchmarkReport;
}

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toFixed(0);
}

function formatPercentage(value: number): string {
  const percentage = (value * 100).toFixed(1);
  return value > 0 ? `+${percentage}%` : `${percentage}%`;
}

function drawSparkline(values: number[], width: number = 20): string {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

  const sparkline = values
    .slice(-width)
    .map((v) => {
      const normalized = (v - min) / range;
      const index = Math.floor(normalized * (chars.length - 1));
      return chars[index];
    })
    .join("");

  return sparkline;
}

function loadPackageHistory(packagePath: string): BenchmarkHistory | null {
  const historyFile = path.join(
    packagePath,
    "benchmark-results",
    "history.json",
  );

  if (!fs.existsSync(historyFile)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(historyFile, "utf-8"));
}

function displayPackageSummary(
  packageName: string,
  history: BenchmarkHistory,
): void {
  const latest = history.latest;
  const baseline = history.baseline;

  if (!latest) return;

  // Calculate trends
  const recentHistory = history.history.slice(-10);
  const avgHz = recentHistory.map(
    (r) =>
      r.suites.reduce(
        (acc, s) =>
          acc +
          s.results.reduce((a, r) => a + (r.hz || 0), 0) / s.results.length,
        0,
      ) / r.suites.length,
  );

  const trend = drawSparkline(avgHz);

  // Calculate change from baseline
  let changeFromBaseline = "N/A";
  if (baseline && latest) {
    const latestAvg =
      latest.suites.reduce(
        (acc, s) =>
          acc +
          s.results.reduce((a, r) => a + (r.hz || 0), 0) / s.results.length,
        0,
      ) / latest.suites.length;

    const baselineAvg =
      baseline.suites.reduce(
        (acc, s) =>
          acc +
          s.results.reduce((a, r) => a + (r.hz || 0), 0) / s.results.length,
        0,
      ) / baseline.suites.length;

    const change = (latestAvg - baselineAvg) / baselineAvg;
    const color =
      change > 0.05 ? colors.green : change < -0.05 ? colors.red : colors.gray;
    changeFromBaseline = `${color}${formatPercentage(change)}${colors.reset}`;
  }

  console.log(
    `${packageName.padEnd(20)} ${trend.padEnd(20)} ${changeFromBaseline.padEnd(15)} ` +
      `${latest.summary.totalBenchmarks} benchmarks`,
  );
}

function displayDetailedMetrics(history: BenchmarkHistory): void {
  const latest = history.latest;
  if (!latest) return;

  console.log(`\n📊 ${colors.bold}${history.package}${colors.reset}`);
  console.log("─".repeat(50));

  for (const suite of latest.suites) {
    console.log(`\n  ${colors.cyan}${suite.name}${colors.reset}`);

    for (const result of suite.results.slice(0, 5)) {
      const ops = formatNumber(result.hz || 0);

      // Find historical data for this benchmark
      const historicalOps = history.history.slice(-10).map((h) => {
        const s = h.suites.find((s) => s.name === suite.name);
        const r = s?.results.find((r) => r.name === result.name);
        return r?.hz || 0;
      });

      const sparkline = drawSparkline(historicalOps, 10);

      console.log(
        `    ${result.name.padEnd(30)} ${sparkline.padEnd(12)} ${ops.padStart(8)} ops/s`,
      );
    }
  }
}

async function displayDashboard(): Promise<void> {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║       BENCHMARK PERFORMANCE DASHBOARD         ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log(colors.reset);

  const packagesDir = path.join(process.cwd(), "packages", "@atomiton");
  const packages = fs
    .readdirSync(packagesDir)
    .filter((dir) => fs.statSync(path.join(packagesDir, dir)).isDirectory());

  const historiesWithData: Array<{ name: string; history: BenchmarkHistory }> =
    [];

  console.log(`${colors.bold}\n📦 Package Performance Overview${colors.reset}`);
  console.log("─".repeat(70));
  console.log(
    "Package              Trend (10 runs)      vs Baseline    Metrics",
  );
  console.log("─".repeat(70));

  for (const packageName of packages.sort()) {
    const packagePath = path.join(packagesDir, packageName);
    const history = loadPackageHistory(packagePath);

    if (history && history.latest) {
      displayPackageSummary(packageName, history);
      historiesWithData.push({ name: packageName, history });
    }
  }

  // Display top performers
  console.log(
    `\n${colors.bold}🏆 Top Performers (Highest Throughput)${colors.reset}`,
  );
  console.log("─".repeat(50));

  const allBenchmarks: Array<{ pkg: string; name: string; ops: number }> = [];

  for (const { name, history } of historiesWithData) {
    if (!history.latest) continue;

    for (const suite of history.latest.suites) {
      for (const result of suite.results) {
        allBenchmarks.push({
          pkg: name,
          name: result.name,
          ops: result.hz || 0,
        });
      }
    }
  }

  allBenchmarks
    .sort((a, b) => b.ops - a.ops)
    .slice(0, 5)
    .forEach((bench, i) => {
      const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
      console.log(
        `${icon} ${bench.name.padEnd(30)} ${colors.gray}(${bench.pkg})${colors.reset} ` +
          `${colors.bold}${formatNumber(bench.ops)}${colors.reset} ops/s`,
      );
    });

  // Display biggest improvements
  console.log(
    `\n${colors.bold}📈 Biggest Improvements (vs Baseline)${colors.reset}`,
  );
  console.log("─".repeat(50));

  const improvements: Array<{ pkg: string; name: string; change: number }> = [];

  for (const { name, history } of historiesWithData) {
    if (!history.latest || !history.baseline) continue;

    for (const suite of history.latest.suites) {
      const baselineSuite = history.baseline.suites.find(
        (s) => s.name === suite.name,
      );
      if (!baselineSuite) continue;

      for (const result of suite.results) {
        const baselineResult = baselineSuite.results.find(
          (r) => r.name === result.name,
        );
        if (!baselineResult) continue;

        const change =
          ((result.hz || 0) - (baselineResult.hz || 0)) /
          (baselineResult.hz || 1);
        improvements.push({ pkg: name, name: result.name, change });
      }
    }
  }

  improvements
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)
    .forEach((imp) => {
      if (imp.change > 0) {
        console.log(
          `${colors.green}↑${colors.reset} ${imp.name.padEnd(30)} ` +
            `${colors.gray}(${imp.pkg})${colors.reset} ` +
            `${colors.green}${formatPercentage(imp.change)}${colors.reset}`,
        );
      }
    });

  // Display regressions
  const regressions = improvements
    .filter((i) => i.change < -0.05)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5);

  if (regressions.length > 0) {
    console.log(`\n${colors.bold}⚠️  Performance Regressions${colors.reset}`);
    console.log("─".repeat(50));

    regressions.forEach((reg) => {
      console.log(
        `${colors.red}↓${colors.reset} ${reg.name.padEnd(30)} ` +
          `${colors.gray}(${reg.pkg})${colors.reset} ` +
          `${colors.red}${formatPercentage(reg.change)}${colors.reset}`,
      );
    });
  }

  // Display detailed metrics for packages with significant activity
  console.log(`\n${colors.bold}📊 Detailed Package Metrics${colors.reset}`);
  console.log("─".repeat(50));

  const activePackages = historiesWithData
    .filter((h) => h.history.history.length >= 3)
    .slice(0, 3);

  for (const { history } of activePackages) {
    displayDetailedMetrics(history);
  }

  // Summary stats
  console.log(`\n${colors.bold}📈 Overall Statistics${colors.reset}`);
  console.log("─".repeat(50));

  const totalBenchmarks = historiesWithData.reduce(
    (acc, h) => acc + (h.history.latest?.summary.totalBenchmarks || 0),
    0,
  );
  const totalPackages = historiesWithData.length;
  const totalRuns = historiesWithData.reduce(
    (acc, h) => acc + h.history.history.length,
    0,
  );

  console.log(
    `Total packages with benchmarks: ${colors.bold}${totalPackages}${colors.reset}`,
  );
  console.log(
    `Total benchmarks tracked: ${colors.bold}${totalBenchmarks}${colors.reset}`,
  );
  console.log(
    `Total benchmark runs: ${colors.bold}${totalRuns}${colors.reset}`,
  );

  console.log(
    `\n${colors.gray}Last updated: ${new Date().toLocaleString()}${colors.reset}`,
  );
}

// Main execution
async function main(): Promise<void> {
  await displayDashboard();
}

if (require.main === module) {
  main().catch(console.error);
}
