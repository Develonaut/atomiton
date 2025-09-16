#!/usr/bin/env tsx

/**
 * Benchmark Comparison Tool
 * Compares current benchmark results against baseline
 * Fails if performance degrades by more than configured threshold
 * Usage: tsx scripts/benchmark-compare.ts [baseline] [latest]
 */

import fs from "fs";
import path from "path";

interface BenchmarkResult {
  name: string;
  mean?: number;
  duration?: number;
  median?: number;
  ops?: number;
  margin?: number;
  samples?: number;
}

interface BenchmarkReport {
  timestamp?: string;
  environment?: {
    node?: string;
    cpu?: string;
    memory?: string;
  };
  benchmarks?: BenchmarkResult[];
  results?: BenchmarkResult[];
}

interface ComparisonResult {
  name: string;
  baseline: string;
  current: string;
  change: string;
  status: string;
}

interface ComparisonReport {
  timestamp: string;
  baseline: string;
  latest: string;
  results: ComparisonResult[];
  summary: {
    total: number;
    regressions: number;
    improvements: number;
    new: number;
  };
  hasRegression: boolean;
  hasImprovement: boolean;
}

// Configuration
const DEGRADATION_THRESHOLD = 0.1; // 10% regression threshold
const IMPROVEMENT_THRESHOLD = 0.05; // 5% improvement threshold

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function formatPercentage(value: number): string {
  const percentage = (value * 100).toFixed(1);
  return value > 0 ? `+${percentage}%` : `${percentage}%`;
}

function formatDuration(ms: number): string {
  if (ms < 0.001) return `${(ms * 1000000).toFixed(2)}ns`;
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getStatusIcon(change: number, isNew: boolean = false): string {
  if (isNew) return "🆕";
  if (change > DEGRADATION_THRESHOLD) return "❌";
  if (change < -IMPROVEMENT_THRESHOLD) return "✅";
  if (Math.abs(change) > 0.02) return change > 0 ? "⚠️" : "👍";
  return "➖";
}

function loadBenchmarkReport(filePath: string): BenchmarkReport | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function getBenchmarkTime(bench: BenchmarkResult): number {
  return bench.mean ?? bench.duration ?? 0;
}

function compareBenchmarks(baselinePath: string, latestPath: string): void {
  const baseline = loadBenchmarkReport(baselinePath);
  const latest = loadBenchmarkReport(latestPath);

  if (!baseline) {
    console.warn(`⚠️ No baseline found at ${baselinePath}`);
    console.warn('   Run "pnpm benchmark:update" to create baseline');
    return;
  }

  if (!latest) {
    console.error(`❌ No benchmark results found at ${latestPath}`);
    console.error('   Run "pnpm benchmark:run" first');
    process.exit(1);
  }

  console.log("\n📊 Benchmark Comparison Report");
  console.log("================================\n");

  // Display environment info if available
  if (latest.environment) {
    console.log("Environment:");
    console.log(`  Node: ${latest.environment.node || "N/A"}`);
    console.log(`  CPU: ${latest.environment.cpu || "N/A"}`);
    console.log(`  Memory: ${latest.environment.memory || "N/A"}`);
    console.log("");
  }

  const results: ComparisonResult[] = [];
  let hasRegression = false;
  let hasImprovement = false;

  const latestBenchmarks = latest.benchmarks ?? latest.results ?? [];
  const baselineBenchmarks = baseline.benchmarks ?? baseline.results ?? [];

  // Compare each benchmark
  latestBenchmarks.forEach((bench) => {
    const baselineBench = baselineBenchmarks.find((b) => b.name === bench.name);

    if (!baselineBench) {
      results.push({
        name: bench.name,
        baseline: "N/A",
        current: formatDuration(getBenchmarkTime(bench)),
        change: "NEW",
        status: getStatusIcon(0, true),
      });
      return;
    }

    const baselineTime = getBenchmarkTime(baselineBench);
    const currentTime = getBenchmarkTime(bench);
    const change = (currentTime - baselineTime) / baselineTime;

    const status = getStatusIcon(change);
    if (status === "❌") hasRegression = true;
    if (status === "✅") hasImprovement = true;

    results.push({
      name: bench.name,
      baseline: formatDuration(baselineTime),
      current: formatDuration(currentTime),
      change: formatPercentage(change),
      status,
    });
  });

  // Check for removed benchmarks
  baselineBenchmarks
    .filter((b) => !latestBenchmarks.find((l) => l.name === b.name))
    .forEach((bench) => {
      results.push({
        name: bench.name,
        baseline: formatDuration(getBenchmarkTime(bench)),
        current: "REMOVED",
        change: "N/A",
        status: "🗑️",
      });
    });

  // Display results table
  console.table(results);

  // Summary statistics
  const summary = {
    total: results.length,
    regressions: results.filter((r) => r.status === "❌").length,
    improvements: results.filter((r) => r.status === "✅").length,
    new: results.filter((r) => r.status === "🆕").length,
  };

  console.log("\n📈 Summary");
  console.log("─────────");
  console.log(`Total benchmarks: ${summary.total}`);
  if (summary.regressions > 0) {
    console.log(
      `${colors.red}❌ Regressions: ${summary.regressions}${colors.reset}`,
    );
  }
  if (summary.improvements > 0) {
    console.log(
      `${colors.green}✅ Improvements: ${summary.improvements}${colors.reset}`,
    );
  }
  if (summary.new > 0) {
    console.log(`🆕 New: ${summary.new}`);
  }

  // Save comparison report for CI
  const report: ComparisonReport = {
    timestamp: new Date().toISOString(),
    baseline: baselinePath,
    latest: latestPath,
    results,
    summary,
    hasRegression,
    hasImprovement,
  };

  const reportPath = path.join(
    path.dirname(latestPath),
    "comparison-report.json",
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to ${reportPath}`);

  // Exit with error if regressions detected
  if (hasRegression) {
    console.error("\n❌ Performance regressions detected!");
    console.error("   Fix regressions or update baseline with justification");
    process.exit(1);
  }

  if (hasImprovement) {
    console.log("\n✅ Performance improvements detected!");
    console.log("   Consider updating baseline to lock in improvements");
  } else {
    console.log("\n✅ No performance regressions detected");
  }
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);
  const baselinePath = args[0] || "./benchmarks/baseline.json";
  const latestPath = args[1] || "./benchmarks/latest.json";

  compareBenchmarks(baselinePath, latestPath);
}

// Run if executed directly
if (require.main === module) {
  main();
}
