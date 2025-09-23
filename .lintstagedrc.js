module.exports = {
  // Format all code files
  "*.{ts,tsx,js,jsx}": ["prettier --write"],

  // Format markdown files with prettier, then prettify tables
  "*.md": ["prettier --write", "npx markdown-table-prettify"],

  // Run ESLint on TypeScript/JavaScript files
  // Turbo will automatically detect which packages have changes and run in parallel
  "*.{ts,tsx,js,jsx}": () => [
    // Use Turbo's filter to only lint packages affected by staged files
    // The --filter flag with [HEAD^] targets packages with changes since last commit
    // Return as a function to prevent lint-staged from appending filenames
    "pnpm turbo run lint:fix --filter=[HEAD^]",
  ],
};
