#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { glob } from "glob";

async function renameSmokeTests() {
  console.log("🔄 Renaming .test files to .test files...\n");

  // Find all smoke test files
  const smokeTestFiles = await glob("**/*.test.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.turbo/**", "**/dist/**", "**/out/**"],
  });

  console.log(`Found ${smokeTestFiles.length} smoke test files to rename\n`);

  const renames: Array<{ from: string; to: string }> = [];

  for (const file of smokeTestFiles) {
    const filePath = path.resolve(file);
    const newPath = filePath.replace(".test.", ".test.");

    renames.push({ from: filePath, to: newPath });
  }

  if (renames.length === 0) {
    console.log("✅ No smoke test files to rename!");
    return;
  }

  console.log(`📋 Renaming files:\n`);

  for (const { from, to } of renames) {
    const fromRel = path.relative(process.cwd(), from);
    const toRel = path.relative(process.cwd(), to);
    console.log(`  ${fromRel}`);
    console.log(`    → ${toRel}\n`);
  }

  // Perform renames
  for (const { from, to } of renames) {
    fs.renameSync(from, to);
  }

  console.log(`✨ Renamed ${renames.length} smoke test files to regular test files.`);

  // Also update any imports that reference these files
  console.log("\n🔍 Checking for imports to update...");

  const allSourceFiles = await glob("**/*.{ts,tsx,js,jsx}", {
    ignore: ["**/node_modules/**", "**/.turbo/**", "**/dist/**", "**/out/**"],
  });

  let updatedImports = 0;
  for (const file of allSourceFiles) {
    const content = fs.readFileSync(file, "utf-8");
    let updatedContent = content;

    // Replace imports of .test files
    updatedContent = updatedContent.replace(/\.smoke\.test/g, ".test");

    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent);
      updatedImports++;
    }
  }

  if (updatedImports > 0) {
    console.log(`✅ Updated imports in ${updatedImports} files`);
  }
}

renameSmokeTests().catch((error) => {
  console.error("❌ Failed to rename smoke tests:", error);
  process.exit(1);
});