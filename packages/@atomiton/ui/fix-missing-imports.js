#!/usr/bin/env node
/**
 * Script to fix specific missing import paths in the UI package
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Specific import fixes based on actual component locations
const fixes = [
  // Fix component import paths to match actual file locations
  {
    file: 'src/components/Export/Object3D/index.tsx',
    from: `from "#components/Line/Line"`,
    to: `from "#components/Export/Line"`
  },
  {
    file: 'src/components/Export/Video/index.tsx',
    from: `from "#components/Line/Line"`,
    to: `from "#components/Export/Line"`
  },
  {
    file: 'src/components/HomeSidebar/index.tsx',
    from: `from "#components/Dropdown"`,
    to: `from "#components/HomeSidebar/Dropdown"`
  },
  {
    file: 'src/components/HomeSidebar/index.tsx',
    from: `from "#components/NavLink"`,
    to: `from "#components/HomeSidebar/NavLink"`
  },
  {
    file: 'src/components/PromptInput/index.tsx',
    from: `from "#components/AddFiles"`,
    to: `from "#components/PromptInput/AddFiles"`
  },
];

let totalChanges = 0;

console.log(`Processing ${fixes.length} specific import fixes...`);

for (const fix of fixes) {
  try {
    let content = readFileSync(fix.file, 'utf-8');

    if (content.includes(fix.from)) {
      content = content.replace(fix.from, fix.to);
      writeFileSync(fix.file, content);
      totalChanges++;
      console.log(`✅ Fixed import in ${fix.file}`);
    } else {
      console.log(`ℹ️  No change needed in ${fix.file} (import already correct)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${fix.file}:`, error.message);
  }
}

console.log(`\n🎉 Completed! Fixed imports in ${totalChanges} files.`);
console.log(`\nRunning build to check for remaining issues...`);

try {
  execSync('pnpm build', { stdio: 'inherit' });
  console.log(`\n✅ Build successful!`);
} catch (error) {
  console.log(`\n⚠️  Build completed with some TypeScript errors. Check output above.`);
}