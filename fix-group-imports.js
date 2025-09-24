#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const files = [
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Design/Background/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Design/Materials/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Design/Camera/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Design/Artboard/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Design/Styles/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Animation/Lens/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Animation/Effects/index.tsx',
  '/Users/Ryan/Code/atomiton/apps/client/src/components/RightSidebar/Animation/Loop/index.tsx',
];

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const updated = content.replace(
    /from ["']\.\.?\/Group["']/g,
    'from "#components/RightSidebar/Group"'
  );
  if (content !== updated) {
    writeFileSync(file, updated);
    console.log(`Fixed: ${file}`);
  }
}

console.log('Done!');