#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { glob } from "glob";

async function coLocateTests() {
  console.log("🔄 Starting test co-location migration...\n");

  // Find all test files in __tests__ directories
  const testFiles = await glob("**/__tests__/**/*.{test,smoke.test,integration.test,bench}.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.turbo/**", "**/dist/**", "**/out/**"],
  });

  console.log(`Found ${testFiles.length} test files in __tests__ directories\n`);

  const migrations: Array<{ from: string; to: string }> = [];

  for (const testFile of testFiles) {
    const testPath = path.resolve(testFile);
    const testDir = path.dirname(testPath);
    const testName = path.basename(testPath);

    // Extract the test type and base name
    let baseNameWithoutTest = testName;
    let testType = "test";

    if (testName.includes(".integration.test.")) {
      baseNameWithoutTest = testName.replace(".integration.test.", ".");
      testType = "integration";
    } else if (testName.includes(".test.")) {
      baseNameWithoutTest = testName.replace(".test.", ".");
      testType = "smoke.test";
    } else if (testName.includes(".bench.")) {
      baseNameWithoutTest = testName.replace(".bench.", ".");
      testType = "benchmark";
    } else if (testName.includes(".test.")) {
      baseNameWithoutTest = testName.replace(".test.", ".");
      testType = "test";
    }

    // Handle different __tests__ directory structures
    let targetDir: string;
    let targetFileName: string;

    if (testDir.includes("/__tests__/unit/")) {
      // e.g., src/router/__tests__/unit/navigation.unit.test.ts -> src/router/navigation.test.ts
      const basePath = testDir.replace("/__tests__/unit", "");
      targetDir = basePath;
      targetFileName = testName.replace(".unit.test.", ".test.");
    } else if (testDir.includes("/__tests__/integration/")) {
      // e.g., src/router/__tests__/integration/routing.integration.test.ts -> src/router/routing.integration.ts
      const basePath = testDir.replace("/__tests__/integration", "");
      targetDir = basePath;
      targetFileName = testName.replace(".integration.test.", ".integration.");
    } else if (testDir.includes("/__tests__/smoke/")) {
      // e.g., src/__tests__/smoke/api.test.ts -> src/api.test.ts
      const basePath = testDir.replace("/__tests__/smoke", "");
      targetDir = basePath;
      targetFileName = testName.replace(".test.", ".test.");
    } else if (testDir.includes("/__tests__/e2e/")) {
      // Skip e2e tests - they can stay in their own directory
      continue;
    } else if (testDir.endsWith("/__tests__")) {
      // Simple __tests__ directory
      const basePath = testDir.replace("/__tests__", "");
      targetDir = basePath;

      // Try to match test file with source file
      const possibleSourceFile = baseNameWithoutTest;
      const sourcePath = path.join(basePath, possibleSourceFile);

      // Check if source file exists
      if (fs.existsSync(sourcePath) || fs.existsSync(sourcePath.replace(/\.[^.]+$/, ".ts")) || fs.existsSync(sourcePath.replace(/\.[^.]+$/, ".tsx"))) {
        targetFileName = testName;
      } else {
        // If no matching source file, use the test file name as is
        targetFileName = testName;
      }

      // Special handling for certain patterns
      if (testName.includes("integration")) {
        targetFileName = testName.replace(".test.", ".integration.");
      } else if (testName.includes("benchmark") || testName.includes("bench")) {
        targetFileName = testName.replace(".test.", ".benchmark.").replace(".bench.", ".benchmark.");
      }
    } else {
      // Nested __tests__ structure - move up one level
      const parentTestsIdx = testDir.lastIndexOf("/__tests__");
      const beforeTests = testDir.substring(0, parentTestsIdx);
      const afterTests = testDir.substring(parentTestsIdx + "/__tests__".length);
      targetDir = beforeTests + afterTests;
      targetFileName = testName;
    }

    const targetPath = path.join(targetDir, targetFileName);

    if (testPath !== targetPath) {
      migrations.push({ from: testPath, to: targetPath });
    }
  }

  if (migrations.length === 0) {
    console.log("✅ No migrations needed - all tests are already co-located!");
    return;
  }

  console.log(`📋 Planned migrations:\n`);
  migrations.forEach(({ from, to }) => {
    const fromRel = path.relative(process.cwd(), from);
    const toRel = path.relative(process.cwd(), to);
    console.log(`  ${fromRel}`);
    console.log(`    → ${toRel}\n`);
  });

  console.log(`\n🚀 Migrating ${migrations.length} test files...\n`);

  // Perform migrations
  for (const { from, to } of migrations) {
    const targetDir = path.dirname(to);

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Move the file
    fs.renameSync(from, to);
    console.log(`✅ Moved ${path.basename(from)}`);
  }

  console.log(`\n🧹 Cleaning up empty __tests__ directories...\n`);

  // Find and remove empty __tests__ directories
  const testDirs = await glob("**/__tests__", {
    ignore: ["**/node_modules/**", "**/.turbo/**", "**/dist/**", "**/out/**"],
  });

  for (const dir of testDirs) {
    const fullPath = path.resolve(dir);
    const contents = fs.readdirSync(fullPath);

    if (contents.length === 0 || (contents.length === 1 && contents[0] === ".DS_Store")) {
      fs.rmSync(fullPath, { recursive: true });
      console.log(`🗑️  Removed empty directory: ${path.relative(process.cwd(), fullPath)}`);
    }
  }

  console.log(`\n✨ Migration complete! Co-located ${migrations.length} test files.`);
}

coLocateTests().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});