#!/usr/bin/env node
/**
 * Script to fix remaining import path issues in the UI package
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}');

// Import fixes to apply
const fixes = [
  // Local subdirectory components (these should use proper component paths)
  { from: /from ["']#General["']/g, to: `from "#components/Settings/General"` },
  { from: /from ["']#Notifications["']/g, to: `from "#components/Settings/Notifications"` },
  { from: /from ["']#Profile["']/g, to: `from "#components/Settings/Profile"` },
  { from: /from ["']#Security["']/g, to: `from "#components/Settings/Security"` },
  { from: /from ["']#Subscription["']/g, to: `from "#components/Settings/Subscription"` },
  { from: /from ["']#Settings["']/g, to: `from "#components/Export/Images/Settings"` },
  { from: /from ["']#Compression["']/g, to: `from "#components/Export/Images/Compression"` },
  { from: /from ["']#Item["']/g, to: `from "#components/Export/Images/Settings/Item"` },
  { from: /from ["']#Images["']/g, to: `from "#components/Export/Images"` },
  { from: /from ["']#Menu["']/g, to: `from "#components/Export/Menu"` },
  { from: /from ["']#Object3D["']/g, to: `from "#components/Export/Object3D"` },
  { from: /from ["']#Preview["']/g, to: `from "#components/Export/Preview"` },
  { from: /from ["']#Video["']/g, to: `from "#components/Export/Video"` },
  { from: /from ["']#Search["']/g, to: `from "#components/Folders/Search"` },
  { from: /from ["']#Comment["']/g, to: `from "#components/Comment"` },
  { from: /from ["']#ImagePreview["']/g, to: `from "#components/NewComment/ImagePreview"` },
  { from: /from ["']#Foot["']/g, to: `from "#components/ShareFile/Foot"` },
  { from: /from ["']#GeneralAccess["']/g, to: `from "#components/ShareFile/GeneralAccess"` },
  { from: /from ["']#Person["']/g, to: `from "#components/ShareFile/Person"` },

  // Local data files (these should remain as relative paths for local data)
  { from: /from ["']#content["']/g, to: `from "./content"` },
  { from: /from ["']#options["']/g, to: `from "./options"` },
  { from: /from ["']#items["']/g, to: `from "./items"` },
  { from: /from ["']#menu["']/g, to: `from "./menu"` },
  { from: /from ["']#navigation["']/g, to: `from "./navigation"` },
  { from: /from ["']#folders["']/g, to: `from "./folders"` },
  { from: /from ["']#people["']/g, to: `from "./people"` },

  // Primitive file corrections
  { from: /from ["']#box["']/g, to: `from "#primitives/box"` },
  { from: /from ["']#button["']/g, to: `from "#primitives/button"` },

  // System and utility path corrections
  { from: /from ["']#styled["']/g, to: `from "#system/styled"` },
  { from: /from ["']#types["']/g, to: `from "#types"` },
  { from: /from ["']#common["']/g, to: `from "#types/common"` },
  { from: /from ["']#mocks["']/g, to: `from "#test-utils/mocks"` },
  { from: /from ["']#cn["']/g, to: `from "#utils/cn"` },
  { from: /from ["']#useScrollbarWidth["']/g, to: `from "#hooks/useScrollbarWidth"` },
  { from: /from ["']#createPropResolver["']/g, to: `from "#system/utils/createPropResolver"` },

  // System path corrections
  { from: /from ["']#components\/types["']/g, to: `from "#system/types"` },
  { from: /from ["']#components\/constants\/systemPropsMap["']/g, to: `from "#system/constants/systemPropsMap"` },
  { from: /from ["']#components\/utils\/extractStyleProps["']/g, to: `from "#utils/extractStyleProps"` },

  // Component corrections for missing components (need to investigate these)
  { from: /from ["']#components\/Line["']/g, to: `from "#components/Line/Line"` },
  { from: /from ["']#components\/Dropdown\/Dropdown["']/g, to: `from "#components/Dropdown"` },
  { from: /from ["']#components\/NavLink\/NavLink["']/g, to: `from "#components/NavLink"` },
  { from: /from ["']#components\/AddFiles\/AddFiles["']/g, to: `from "#components/AddFiles"` },
  { from: /from ["']#components\/PremadePrompt\/PremadePrompt["']/g, to: `from "#components/PremadePrompt"` },
  { from: /from ["']#components\/SelectAi\/SelectAi["']/g, to: `from "#components/SelectAi"` },
  { from: /from ["']#components\/Accordion\/Accordion["']/g, to: `from "#components/Accordion"` },
  { from: /from ["']#components\/Title["']/g, to: `from "#components/Title"` },
  { from: /from ["']#components\/Option["']/g, to: `from "#components/Option"` },

  // Fix case sensitivity issue
  { from: /from ["']#components\/Folders\/Folders["']/g, to: `from "#components/Folders"` },
];

let totalChanges = 0;

console.log(`Processing ${files.length} files...`);

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    let changed = false;

    for (const fix of fixes) {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        changed = true;
      }
    }

    if (changed) {
      writeFileSync(file, content);
      totalChanges++;
      console.log(`✅ Fixed imports in ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n🎉 Completed! Fixed imports in ${totalChanges} files.`);
console.log(`\nRunning build to check for remaining issues...`);

try {
  execSync('pnpm build', { stdio: 'inherit' });
  console.log(`\n✅ Build successful!`);
} catch (error) {
  console.log(`\n⚠️  Build completed with TypeScript errors. Check output above.`);
}