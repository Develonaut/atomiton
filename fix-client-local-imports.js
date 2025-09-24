#!/usr/bin/env node
/**
 * Script to fix all local component imports in client app to use proper paths
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, basename, relative } from 'path';
import { glob } from 'glob';

// Find all TypeScript/TSX files
const files = glob.sync('apps/client/src/**/*.{ts,tsx}');

console.log(`Checking ${files.length} files for local component imports...`);

let totalFixed = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf-8');

    // Pattern to match imports like: from "#ComponentName"
    // where ComponentName starts with uppercase (indicating a component)
    const importPattern = /from\s+["']#([A-Z][a-zA-Z0-9]*)["']/g;

    // Get all matches
    const matches = [...content.matchAll(importPattern)];

    if (matches.length === 0) {
      continue;
    }

    let updatedContent = content;

    for (const match of matches) {
      const [fullMatch, componentName] = match;

      // Get the directory of the current file
      const fileDir = dirname(file);

      // Check if this is a local component (subdirectory of current file's directory)
      const possiblePaths = [
        `${fileDir}/${componentName}`,
        `${fileDir}/${componentName}/index.tsx`,
        `${fileDir}/${componentName}/index.ts`,
        `${fileDir}/${componentName}.tsx`,
        `${fileDir}/${componentName}.ts`,
      ];

      let foundLocalComponent = false;

      // Check if any of the possible paths exist using glob
      for (const possiblePath of possiblePaths) {
        const matches = glob.sync(possiblePath);
        if (matches.length > 0) {
          foundLocalComponent = true;
          break;
        }
      }

      if (foundLocalComponent) {
        // Calculate the correct import path
        const relativeFromSrc = relative('apps/client/src', fileDir).replace(/\\/g, '/');

        let correctPath;

        // Determine the correct path based on location
        if (relativeFromSrc.includes('templates/')) {
          // For templates, use the full template path
          correctPath = `#${relativeFromSrc}/${componentName}`;
        } else if (relativeFromSrc.includes('components/')) {
          // For components, use the full component path
          correctPath = `#${relativeFromSrc}/${componentName}`;
        } else if (relativeFromSrc === 'router/components') {
          // Special case for router components
          correctPath = `#router/components/${componentName}`;
        } else if (relativeFromSrc === '') {
          // Root src directory
          correctPath = `#${componentName}`;
        } else {
          // Other directories
          correctPath = `#${relativeFromSrc}/${componentName}`;
        }

        // Replace the import
        updatedContent = updatedContent.replace(fullMatch, `from "${correctPath}"`);

        console.log(`  ${componentName}: #${componentName} → ${correctPath}`);
      }
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