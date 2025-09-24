#!/usr/bin/env node
/**
 * Script to fix all #content imports in client app to use proper paths
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, relative, sep } from 'path';
import { glob } from 'glob';

// Find all TypeScript/TSX files with #content imports
const files = glob.sync('apps/client/src/**/*.{ts,tsx}');

console.log(`Checking ${files.length} files for #content imports...`);

let totalFixed = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf-8');

    // Check if file has #content import
    if (!content.includes('from "#content"')) {
      continue;
    }

    // Get the directory of the current file
    const fileDir = dirname(file);

    // Calculate the relative path from src/ to this file's directory
    const relativeFromSrc = relative('apps/client/src', fileDir);

    // Build the correct import path
    // If file is in a component or template directory, use that path
    let correctPath;
    if (relativeFromSrc.includes('templates')) {
      // For templates, use the template directory path
      const templatePath = relativeFromSrc.replace(/\\/g, '/');
      correctPath = `#${templatePath}/content`;
    } else if (relativeFromSrc.includes('components')) {
      // For components, use the component directory path
      const componentPath = relativeFromSrc.replace(/\\/g, '/');
      correctPath = `#${componentPath}/content`;
    } else {
      // Fallback to relative path
      correctPath = "./content";
    }

    // Replace all variations of #content imports
    let updatedContent = content
      .replace(/from\s+["']#content["']/g, `from "${correctPath}"`)
      .replace(/from\s+['"]#content['"]}/g, `from "${correctPath}"`);

    if (updatedContent !== content) {
      writeFileSync(file, updatedContent);
      console.log(`✅ Fixed: ${file}`);
      console.log(`   Changed: #content → ${correctPath}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary: Fixed ${totalFixed} files with #content imports\n`);

// Now test the build
console.log('Testing client app build...\n');
import { execSync } from 'child_process';

try {
  execSync('cd apps/client && pnpm build', { stdio: 'inherit' });
  console.log('\n✅ Client app build successful!');
} catch (error) {
  console.log('\n⚠️  Client app build still has issues. Check the output above.');
}