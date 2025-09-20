#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { glob } from "glob";

async function fixAllTestImports() {
  console.log("🔄 Fixing ALL test import paths comprehensively...\n");

  // Find all test files
  const testFiles = await glob("**/*.{test,integration,benchmark}.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.turbo/**", "**/dist/**", "**/out/**", "**/coverage/**"],
  });

  console.log(`Found ${testFiles.length} test files to check\n`);

  let fixedFiles = 0;
  const errors: string[] = [];

  for (const file of testFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      let updatedContent = content;

      // Get the directory of the test file
      const testDir = path.dirname(file);
      const testFileName = path.basename(file);

      // Fix various import patterns
      updatedContent = updatedContent
        // Fix imports that go up too many directories (../../)
        .replace(/from ['"]\.\.\/\.\.\//g, 'from "../')
        // Fix imports from parent when co-located (../)
        .replace(/from ['"]\.\.\/([^.\/])/g, 'from "./$1')
        // Fix dynamic imports from parent
        .replace(/import\(['"]\.\.\/([^.\/][^'"]*)['"]\)/g, 'import("./$1")')
        // Fix dynamic imports from grandparent
        .replace(/import\(['"]\.\.\/\.\.\//g, 'import("../')
        // Fix @/ imports for tests that are now in src
        .replace(/from ['"]@\//g, 'from "../')
        // Fix specific patterns for hooks/utils/components/etc
        .replace(/from ['"]\.\.\/index(?:\.js)?['"]/g, 'from "./index"')
        .replace(/from ['"]\.\.\/utils\//g, 'from "./utils/')
        .replace(/from ['"]\.\.\/hooks\//g, 'from "./hooks/')
        .replace(/from ['"]\.\.\/components\//g, 'from "./components/')
        .replace(/from ['"]\.\.\/types\//g, 'from "./types/')
        .replace(/from ['"]\.\.\/presets\//g, 'from "./presets/')
        .replace(/from ['"]\.\.\/core['"]/g, 'from "./core"')
        .replace(/from ['"]\.\.\/lib\//g, 'from "./lib/')
        .replace(/from ['"]\.\.\/factories\//g, 'from "./factories/')
        .replace(/from ['"]\.\.\/exports\//g, 'from "./exports/')
        .replace(/from ['"]\.\.\/desktop['"]/g, 'from "./desktop"')
        .replace(/from ['"]\.\.\/ipc['"]/g, 'from "./ipc"')
        .replace(/from ['"]\.\.\/styled['"]/g, 'from "./styled"')
        .replace(/from ['"]\.\.\/system/g, 'from "./system')
        // Fix specific file imports
        .replace(/from ['"]\.\.\/([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z]+)?)['"]/g, 'from "./$1"')
        // Fix await import patterns
        .replace(/await import\(['"]\.\.\/\.\.\//g, 'await import("../')
        .replace(/await import\(['"]\.\.\/([^.\/][^'"]*)['"]\)/g, 'await import("./$1")');

      // Special handling for test files in subdirectories
      if (testDir.includes("/system/") || testDir.includes("/utils/") || testDir.includes("/hooks/")) {
        // These might need to go up one directory to reach the parent
        updatedContent = updatedContent
          .replace(/from ['"]\.\.\/\.\.\//g, 'from "../../')
          .replace(/import\(['"]\.\.\/\.\.\//g, 'import("../../');
      }

      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent);
        console.log(`✅ Fixed imports in: ${path.relative(process.cwd(), file)}`);
        fixedFiles++;
      }
    } catch (error) {
      errors.push(`Failed to process ${file}: ${error}`);
    }
  }

  if (errors.length > 0) {
    console.log("\n⚠️  Errors encountered:");
    errors.forEach(err => console.log(`  - ${err}`));
  }

  if (fixedFiles > 0) {
    console.log(`\n✨ Fixed import paths in ${fixedFiles} test files.`);
  } else {
    console.log("✅ All test imports are already correct!");
  }

  // Now check for any remaining bad patterns
  console.log("\n🔍 Checking for any remaining import issues...");

  const remainingIssues: string[] = [];
  for (const file of testFiles) {
    const content = fs.readFileSync(file, "utf-8");

    // Check for patterns that might still be wrong
    if (content.includes('from "../') && !content.includes('from "../../')) {
      // This might be okay for some cases, but let's flag it
      const matches = content.match(/from ["']\.\.\/[^"']*/g);
      if (matches) {
        remainingIssues.push(`${file}: Has parent imports: ${matches.join(", ")}`);
      }
    }
  }

  if (remainingIssues.length > 0) {
    console.log("\n⚠️  Potential remaining issues to review:");
    remainingIssues.forEach(issue => console.log(`  - ${issue}`));
  }
}

fixAllTestImports().catch((error) => {
  console.error("❌ Failed to fix test imports:", error);
  process.exit(1);
});