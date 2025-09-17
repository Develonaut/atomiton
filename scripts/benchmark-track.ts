#!/usr/bin/env tsx

/**
 * Benchmark Tracking System
 * Runs benchmarks and stores results with history tracking
 * Usage: tsx scripts/benchmark-track.ts [package-name]
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

interface BenchmarkResult {
  name: string;
  hz?: number;
  min?: number;
  max?: number;
  mean?: number;
  p75?: number;
  p99?: number;
  rme?: string;
  samples?: number;
}

interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
}

interface BenchmarkReport {
  timestamp: string;
  package: string;
  environment: {
    node: string;
    platform: string;
    arch: string;
    cpus: number;
  };
  suites: BenchmarkSuite[];
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

const BENCHMARK_DIR = "benchmark-results";
const MAX_HISTORY_ENTRIES = 30; // Keep last 30 runs

async function ensureBenchmarkDir(packagePath: string): Promise<string> {
  const benchDir = path.join(packagePath, BENCHMARK_DIR);
  if (!fs.existsSync(benchDir)) {
    fs.mkdirSync(benchDir, { recursive: true });
  }
  return benchDir;
}

async function runPackageBenchmarks(packagePath: string): Promise<string> {
  console.log(`🚀 Running benchmarks for ${path.basename(packagePath)}...`);

  try {
    const { stdout, stderr } = await execAsync("pnpm test:benchmark", {
      cwd: packagePath,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stderr && !stderr.includes("Benchmarking is an experimental feature")) {
      console.warn(`⚠️ Warnings: ${stderr}`);
    }

    return stdout;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "stdout" in error) {
      // Some packages exit with error even when benchmarks run
      return (error as { stdout: string }).stdout;
    }
    throw error;
  }
}

function parseBenchmarkOutput(
  output: string,
  packageName: string,
): BenchmarkReport {
  const lines = output.split("\n");
  const suites: BenchmarkSuite[] = [];
  let currentSuite: BenchmarkSuite | null = null;

  for (const line of lines) {
    // Parse suite names (lines with ✓)
    if (line.includes("✓") && line.includes(">")) {
      const match = line.match(/✓\s+.*?>\s+(.+?)\s+\d+ms/);
      if (match) {
        if (currentSuite) {
          suites.push(currentSuite);
        }
        currentSuite = {
          name: match[1],
          results: [],
        };
      }
    }

    // Parse benchmark results (lines starting with ·)
    if (line.trim().startsWith("·") && currentSuite) {
      const parts = line.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const name = parts
          .slice(
            1,
            parts.findIndex((p) => !isNaN(parseFloat(p.replace(",", "")))),
          )
          .join(" ");
        const hz = parseFloat(
          parts.find((p) => p.includes(","))?.replace(/,/g, "") || "0",
        );
        const mean = parseFloat(
          parts.find((p) => p.match(/^\d+\.\d+$/)) || "0",
        );

        currentSuite.results.push({
          name,
          hz,
          mean,
        });
      }
    }
  }

  if (currentSuite) {
    suites.push(currentSuite);
  }

  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    package: packageName,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require("os").cpus().length,
    },
    suites,
    summary: {
      totalBenchmarks: suites.reduce((acc, s) => acc + s.results.length, 0),
      totalSuites: suites.length,
      executionTime: Date.now(),
    },
  };

  return report;
}

async function loadHistory(
  benchDir: string,
  packageName: string,
): Promise<BenchmarkHistory> {
  const historyFile = path.join(benchDir, "history.json");

  if (fs.existsSync(historyFile)) {
    return JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  }

  return {
    package: packageName,
    history: [],
  };
}

async function saveHistory(
  benchDir: string,
  history: BenchmarkHistory,
): Promise<void> {
  const historyFile = path.join(benchDir, "history.json");

  // Limit history size
  if (history.history.length > MAX_HISTORY_ENTRIES) {
    history.history = history.history.slice(-MAX_HISTORY_ENTRIES);
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  // Also save latest and baseline separately for easy access
  if (history.latest) {
    fs.writeFileSync(
      path.join(benchDir, "latest.json"),
      JSON.stringify(history.latest, null, 2),
    );
  }

  if (history.baseline) {
    fs.writeFileSync(
      path.join(benchDir, "baseline.json"),
      JSON.stringify(history.baseline, null, 2),
    );
  }
}

function compareWithPrevious(
  current: BenchmarkReport,
  previous?: BenchmarkReport,
): void {
  if (!previous) {
    console.log("📊 No previous results to compare");
    return;
  }

  console.log("\n📈 Comparison with previous run:");
  console.log(`Previous: ${new Date(previous.timestamp).toLocaleString()}`);
  console.log(`Current:  ${new Date(current.timestamp).toLocaleString()}\n`);

  for (const suite of current.suites) {
    const prevSuite = previous.suites.find((s) => s.name === suite.name);
    if (!prevSuite) continue;

    console.log(`  ${suite.name}:`);

    for (const result of suite.results) {
      const prevResult = prevSuite.results.find((r) => r.name === result.name);
      if (!prevResult) continue;

      const currentHz = result.hz || 0;
      const prevHz = prevResult.hz || 0;
      const change = ((currentHz - prevHz) / prevHz) * 100;

      let icon = "➖";
      let color = "";

      if (change > 5) {
        icon = "✅";
        color = "\x1b[32m"; // green
      } else if (change < -5) {
        icon = "❌";
        color = "\x1b[31m"; // red
      }

      console.log(
        `    ${icon} ${result.name}: ${color}${change > 0 ? "+" : ""}${change.toFixed(1)}%\x1b[0m`,
      );
    }
  }
}

async function runBenchmarkTracking(packageName?: string): Promise<void> {
  const packagesDir = path.join(process.cwd(), "packages", "@atomiton");

  // Get list of packages to benchmark
  const packages = packageName
    ? [path.join(packagesDir, packageName)]
    : fs
        .readdirSync(packagesDir)
        .filter((dir) => fs.statSync(path.join(packagesDir, dir)).isDirectory())
        .map((dir) => path.join(packagesDir, dir));

  for (const packagePath of packages) {
    const pkgName = path.basename(packagePath);

    // Check if package has benchmarks
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packagePath, "package.json"), "utf-8"),
    );

    if (!packageJson.scripts?.["test:benchmark"]) {
      console.log(`⏭️  Skipping ${pkgName} (no benchmarks)`);
      continue;
    }

    console.log(`\n📦 Processing ${pkgName}`);
    console.log("─".repeat(40));

    try {
      // Run benchmarks
      const output = await runPackageBenchmarks(packagePath);

      // Parse results
      const report = parseBenchmarkOutput(output, pkgName);
      report.summary.executionTime = Date.now() - report.summary.executionTime;

      if (report.suites.length === 0) {
        console.log(`⚠️ No benchmark results found for ${pkgName}`);
        continue;
      }

      // Load history
      const benchDir = await ensureBenchmarkDir(packagePath);
      const history = await loadHistory(benchDir, pkgName);

      // Update history
      const previousLatest = history.latest;
      history.history.push(report);
      history.latest = report;

      // Set baseline if not exists
      if (!history.baseline) {
        history.baseline = report;
        console.log("📍 Setting initial baseline");
      }

      // Save updated history
      await saveHistory(benchDir, history);

      // Compare with previous
      compareWithPrevious(report, previousLatest);

      // Summary
      console.log(`\n✅ Benchmark results saved to ${benchDir}`);
      console.log(`   Total benchmarks: ${report.summary.totalBenchmarks}`);
      console.log(`   Total suites: ${report.summary.totalSuites}`);
      console.log(
        `   Execution time: ${(report.summary.executionTime / 1000).toFixed(2)}s`,
      );
    } catch (error) {
      console.error(`❌ Failed to benchmark ${pkgName}:`, error);
    }
  }

  console.log("\n🎉 Benchmark tracking complete!");
  console.log("📊 Use 'pnpm benchmark:compare' to compare with baseline");
  console.log("📈 Use 'pnpm benchmark:dashboard' to view trends");
}

// Main execution
async function main(): Promise<void> {
  const packageName = process.argv[2];
  await runBenchmarkTracking(packageName);
}

if (require.main === module) {
  main().catch(console.error);
}
