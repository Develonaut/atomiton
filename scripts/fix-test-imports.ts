#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { glob } from "glob";

async function fixTestImports() {
  console.log("🔄 Fixing test import paths...\n");

  // Find all test files
  const testFiles = await glob("**/*.{test,integration,benchmark}.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.turbo/**", "**/dist/**", "**/out/**"],
  });

  console.log(`Found ${testFiles.length} test files to check\n`);

  let fixedFiles = 0;
  for (const file of testFiles) {
    const content = fs.readFileSync(file, "utf-8");
    let updatedContent = content;

    // Fix relative imports that go up a directory (../) when test is co-located
    // These patterns indicate the test was moved from __tests__ to src
    updatedContent = updatedContent
      // Fix ../index imports
      .replace(/from ['"]\.\.\/index(?:\.js)?['"]/g, 'from "./index"')
      // Fix ../utils imports
      .replace(/from ['"]\.\.\/utils\//g, 'from "./utils/')
      // Fix ../presets imports
      .replace(/from ['"]\.\.\/presets\//g, 'from "./presets/')
      // Fix ../hooks imports
      .replace(/from ['"]\.\.\/hooks\//g, 'from "./hooks/')
      // Fix ../components imports
      .replace(/from ['"]\.\.\/components\//g, 'from "./components/')
      // Fix ../types imports
      .replace(/from ['"]\.\.\/types\//g, 'from "./types/')
      // Fix ../core imports
      .replace(/from ['"]\.\.\/core['"]/g, 'from "./core"')
      // Fix ../src imports
      .replace(/from ['"]\.\.\/src\//g, 'from "./')
      // Fix ../lib imports
      .replace(/from ['"]\.\.\/lib\//g, 'from "./lib/')
      // Fix @/ imports for tests that are now in src
      .replace(/from ['"]@\//g, 'from "../');

    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent);
      console.log(`✅ Fixed imports in: ${path.relative(process.cwd(), file)}`);
      fixedFiles++;
    }
  }

  if (fixedFiles > 0) {
    console.log(`\n✨ Fixed import paths in ${fixedFiles} test files.`);
  } else {
    console.log("✅ All test imports are already correct!");
  }
}

fixTestImports().catch((error) => {
  console.error("❌ Failed to fix test imports:", error);
  process.exit(1);
});