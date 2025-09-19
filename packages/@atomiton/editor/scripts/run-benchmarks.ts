#!/usr/bin/env tsx

/**
 * Run benchmarks and capture output to test-results/benchmark-report.json
 * This follows the same pattern as smoke tests writing to speed-report.json
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testResultsDir = path.join(__dirname, "..", "test-results");

// Ensure test-results directory exists
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

type BenchmarkResult = {
  name: string;
  hz: number;
  mean: number;
  min: number;
  max: number;
  p75: number;
  p99: number;
  rme: number;
  samples: number;
};

type BenchmarkReport = {
  package: string;
  timestamp: string;
  duration: number;
  benchmarks: BenchmarkResult[];
  summary?: {
    total: number;
    fastest: BenchmarkResult;
    slowest: BenchmarkResult;
  };
  trends?: {
    improvements: number;
    degradations: number;
    stable: number;
  };
  error?: string;
};

function parseBenchmarkOutput(output: string): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  const lines = output.split("\n");

  for (const line of lines) {
    // Parse benchmark result lines
    const match = line.match(
      /^\s*·\s*(.+?)\s+([\d,]+\.\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+±([\d.]+)%\s+(\d+)/,
    );

    if (match) {
      const [, name, hz, min, max, mean, p75, p99] = match;
      results.push({
        name: name.trim(),
        hz: parseFloat(hz.replace(/,/g, "")),
        mean: parseFloat(mean),
        min: parseFloat(min),
        max: parseFloat(max),
        p75: parseFloat(p75),
        p99: parseFloat(p99),
        rme: parseFloat(match[10]),
        samples: parseInt(match[11]),
      });
    }
  }

  return results;
}

async function main() {
  try {
    console.log("Running benchmarks...\n");

    // Run vitest bench and capture output
    const output = execSync("npx vitest bench --run", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Always run performance contract tests as part of benchmarks
    console.log("\n🔒 Validating performance contracts...");
    try {
      execSync(
        "npx vitest run src/__tests__/benchmark/performance/performance-contract-*.test.tsx",
        {
          encoding: "utf-8",
          stdio: "inherit", // Show output directly
        },
      );
      console.log("✅ Performance contracts PASSED");
    } catch (contractError) {
      console.error("\n❌ Performance contracts FAILED!");
      console.error(
        "\n⚠️  Performance has degraded below acceptable thresholds:",
      );
      console.error("   • Max re-renders during drag exceeded");
      console.error("   • Component isolation broken");
      console.error("   • Memory usage threshold exceeded");
      console.error(
        "\n   Review the failing tests above and fix the performance issues.",
      );
      throw contractError;
    }

    // Parse benchmark results
    const benchmarkResults = parseBenchmarkOutput(output);

    // Create report in same format as test results
    const report: BenchmarkReport = {
      package: "@atomiton/editor",
      timestamp: new Date().toISOString(),
      duration: benchmarkResults.reduce((sum, r) => sum + r.mean, 0),
      benchmarks: benchmarkResults,
      summary: {
        total: benchmarkResults.length,
        fastest: benchmarkResults.reduce(
          (fast, r) => (r.hz > fast.hz ? r : fast),
          benchmarkResults[0],
        ),
        slowest: benchmarkResults.reduce(
          (slow, r) => (r.hz < slow.hz ? r : slow),
          benchmarkResults[0],
        ),
      },
    };

    // Write to test-results/benchmark-report.json
    const reportPath = path.join(testResultsDir, "benchmark-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Also check for baseline and calculate trends
    const baselinePath = path.join(testResultsDir, "benchmark-baseline.json");
    if (fs.existsSync(baselinePath)) {
      const baseline: BenchmarkReport = JSON.parse(
        fs.readFileSync(baselinePath, "utf-8"),
      );

      // Calculate trends
      let improvements = 0;
      let degradations = 0;

      for (const result of benchmarkResults) {
        const baselineResult = baseline.benchmarks?.find(
          (b) => b.name === result.name,
        );
        if (baselineResult) {
          const change =
            ((result.hz - baselineResult.hz) / baselineResult.hz) * 100;
          if (change > 5) improvements++;
          else if (change < -5) degradations++;
        }
      }

      report.trends = {
        improvements,
        degradations,
        stable: benchmarkResults.length - improvements - degradations,
      };
    } else {
      // First run, save as baseline
      fs.writeFileSync(baselinePath, JSON.stringify(report, null, 2));
      console.log("✅ Saved benchmark baseline");
    }

    // Output results to console
    console.log(output);
    console.log(`\n✅ Benchmark report saved to ${reportPath}`);

    // Check for performance degradations
    if (report.trends?.degradations && report.trends.degradations > 0) {
      console.warn(
        `\n⚠️ Warning: ${report.trends.degradations} benchmark(s) showed performance degradation`,
      );
      // Don't fail the build for minor degradations, but warn
    }

    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error running benchmarks:", errorMessage);

    // Write empty report on error
    const emptyReport: BenchmarkReport = {
      package: "@atomiton/editor",
      timestamp: new Date().toISOString(),
      duration: 0,
      error: error.message,
      benchmarks: [],
    };

    const reportPath = path.join(testResultsDir, "benchmark-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(emptyReport, null, 2));

    process.exit(1);
  }
}

main();
