#!/usr/bin/env node
/**
 * Script to fix all local component imports to use # pattern
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, basename } from 'path';
import { glob } from 'glob';

// Find all TypeScript/TSX files
const files = glob.sync('apps/client/src/**/*.{ts,tsx}');

console.log(`Checking ${files.length} files for local component imports...`);

let totalFixed = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf-8');

    // Pattern to match relative imports like: from "./ComponentName"
    const importPattern = /from\s+["']\.\/([\w\/]+)["']/g;

    // Get all matches
    const matches = [...content.matchAll(importPattern)];

    if (matches.length === 0) {
      continue;
    }

    let updatedContent = content;

    for (const match of matches) {
      const [fullMatch, importPath] = match;

      // Get the directory of the current file
      const fileDir = dirname(file);

      // Calculate the correct import path from src
      const relativeFromSrc = fileDir.replace('apps/client/src/', '').replace(/\\/g, '/');

      // Build the correct # import path
      const correctPath = `#${relativeFromSrc}/${importPath}`;

      // Replace the import
      updatedContent = updatedContent.replace(fullMatch, `from "${correctPath}"`);

      console.log(`  ${file}: ./${importPath} → ${correctPath}`);
    }

    if (updatedContent !== content) {
      writeFileSync(file, updatedContent);
      console.log(`✅ Fixed: ${file}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary: Fixed ${totalFixed} files with local component imports\n`);