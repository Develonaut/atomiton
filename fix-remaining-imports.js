#!/usr/bin/env node
/**
 * Script to fix all remaining import path issues in client app
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Find all TypeScript/TSX files
const files = glob.sync('apps/client/src/**/*.{ts,tsx}');

console.log(`Checking ${files.length} files for incorrect imports...`);

let totalFixed = 0;

const replacements = [
  // Store imports
  { pattern: /from ["']#composites["']/g, replacement: 'from "#store/composites"' },
  { pattern: /from ["']#templates["']/g, replacement: 'from "#store/templates"' },

  // Navigation/Router data
  { pattern: /from ["']#navigation["']/g, replacement: 'from "#data/navigation"' },
  { pattern: /from ["']#folders["']/g, replacement: 'from "#data/folders"' },
  { pattern: /from ["']#people["']/g, replacement: 'from "#data/people"' },
  { pattern: /from ["']#items["']/g, replacement: 'from "#data/items"' },
  { pattern: /from ["']#menu["']/g, replacement: 'from "#data/menu"' },
  { pattern: /from ["']#options["']/g, replacement: 'from "#data/options"' },

  // Utils
  { pattern: /from ["']#errorReporting["']/g, replacement: 'from "#utils/errorReporting"' },
  { pattern: /from ["']#useScrollbarWidth["']/g, replacement: 'from "#hooks/useScrollbarWidth"' },
];

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    let hasChanges = false;

    for (const { pattern, replacement } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
        console.log(`  Fixed in ${file}: ${pattern.source} → ${replacement}`);
      }
    }

    if (hasChanges) {
      writeFileSync(file, content);
      totalFixed++;
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary: Fixed ${totalFixed} files\n`);