#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { glob } from "glob";

async function flattenTestDirectories() {
  console.log("🔄 Moving test files from subdirectories to be co-located...\n");

  // Find all test subdirectories
  const testDirs = await glob("**/*(smoke|integration|unit|benchmark)", {
    ignore: [
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/dist/**",
      "**/__tests__/**",
      "tests/**",
    ],
  });

  console.log(`Found ${testDirs.length} test subdirectories\n`);

  let movedFiles = 0;
  for (const dir of testDirs) {
    const fullDir = path.resolve(dir);
    const parent = path.dirname(fullDir);

    // Find all test files in this directory
    const testFiles = fs.readdirSync(fullDir).filter(f =>
      f.endsWith('.ts') || f.endsWith('.tsx')
    );

    if (testFiles.length > 0) {
      console.log(`📁 Processing ${dir}:`);
      for (const file of testFiles) {
        const from = path.join(fullDir, file);
        const to = path.join(parent, file);
        fs.renameSync(from, to);
        console.log(`  ✅ ${file}`);
        movedFiles++;
      }
    }

    // Remove directory if empty
    const remaining = fs.readdirSync(fullDir);
    if (remaining.length === 0 || (remaining.length === 1 && remaining[0] === '.DS_Store')) {
      fs.rmSync(fullDir, { recursive: true });
      console.log(`  🗑️  Removed empty directory\n`);
    }
  }

  console.log(`\n✨ Moved ${movedFiles} test files to be co-located with their source files.`);
}

flattenTestDirectories().catch((error) => {
  console.error("❌ Failed to flatten test directories:", error);
  process.exit(1);
});