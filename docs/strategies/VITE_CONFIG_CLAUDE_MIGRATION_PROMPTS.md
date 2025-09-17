# Claude Code Migration Prompts

Use these prompts with Claude Code to perform package migrations to @atomiton/vite-config.

## Phase 1: Simple Library Migration

Use this prompt for packages like `@atomiton/utils`, `@atomiton/events`, `@atomiton/yaml`, `@atomiton/storage`, `@atomiton/store`, `@atomiton/hooks`:

```
Please migrate the following packages `@atomiton/utils`, `@atomiton/events`, `@atomiton/yaml`, `@atomiton/storage`, `@atomiton/store`, `@atomiton/hooks` to use the shared @atomiton/vite-config package.

Steps to follow:
0. Make a new worktree for this migration.
1. Review the current vite.config.ts file and document the line count
2. Add "@atomiton/vite-config": "workspace:*" to devDependencies in package.json
3. Replace the entire vite.config.ts with a simplified version using defineLibraryConfig from @atomiton/vite-config
4. Map the configuration:
   - Set the name property to "Atomiton[PackageName]" (e.g., "AtomitonUtils")
   - Extract all external dependencies from the current config
   - Preserve any custom chunk mappings
   - Move any custom plugins to additionalConfig
5. Test the build by running: pnpm build
6. Verify the output in the dist folder
7. Document the new line count and calculate the reduction percentage
8. Please review the VITE_CONFIG_MIGRATION_CHECKLIST.md for detailed steps and ensure all checklist items are completed for each package.
9. Please ensure Vorhees and Karen review the migration changes for accuracy and completeness.

Expected outcome: 70%+ reduction in config lines while maintaining all functionality.

If you encounter any special configurations that don't fit the preset, preserve them in additionalConfig.
```

## Phase 2: React Library Migration

Use this prompt for packages like `@atomiton/ui`, `@atomiton/form`, `@atomiton/router`:

```
Please migrate the @atomiton/editor package to use the shared @atomiton/vite-config package.

This is a React library package, so use defineReactLibraryConfig.

Steps to follow:
1. Review the current vite.config.ts file and document the line count
2. Add "@atomiton/vite-config": "workspace:*" to devDependencies in package.json
3. Replace vite.config.ts using defineReactLibraryConfig from @atomiton/vite-config
4. Map the configuration:
   - Set the name property to "Atomiton[PackageName]"
   - Set enableTailwind based on current config (check for tailwindcss plugin)
   - Set enableTsconfigPaths based on current config (check for tsconfigPaths plugin)
   - Extract external dependencies (should include react, react-dom by default)
   - Map any custom chunking strategies
   - Preserve server config in additionalConfig if present
5. Handle special React library needs:
   - Check if optimizeDeps is configured
   - Preserve any CSS configuration
   - Keep asset handling if customized
6. Test the build: pnpm build
7. Verify output includes CSS if applicable
8. Document the reduction percentage

Expected outcome: 60-70% reduction in config lines.

Note: React externals are handled automatically, but add any additional external packages.
```

## Phase 3: Application Migration

Use this prompt for `apps/client`:

```
Please migrate the apps/client application to use the shared @atomiton/vite-config package.

This is an application, so use defineAppConfig.

Steps to follow:
1. Review the current vite.config.ts and document complexity
2. Add "@atomiton/vite-config": "workspace:*" to devDependencies
3. Replace vite.config.ts using defineAppConfig from @atomiton/vite-config
4. Map the configuration:
   - Extract port from server config (or use env variable)
   - List all workspace packages for workspacePackages option
   - Map all path aliases
   - Set enableTailwind (usually true for apps)
   - Set assetsInlineLimit if customized
   - Set chunkSizeWarningLimit if customized
5. Preserve in additionalConfig:
   - Any custom resolve conditions for development
   - Custom define configurations
   - Special server configurations
   - Custom rollup output configurations
6. Test the development server: pnpm dev
7. Test the production build: pnpm build
8. Verify the app runs correctly
9. Document the reduction percentage

Expected outcome: 70-80% reduction while maintaining all app functionality.

Important: Apps often have environment-specific config, preserve these in additionalConfig.
```

## Special Case: Dual Build Package

Use this for packages that need both Node.js and browser builds:

```
Please set up a dual build configuration for @atomiton/[PACKAGE_NAME] using @atomiton/vite-config.

This package needs both Node.js and browser builds.

Steps:
1. Create a browser.ts file in src/ that exports only browser-safe types and utilities
2. Keep the main vite.config.ts for Node.js build using defineLibraryConfig
3. Create vite.config.browser.ts for browser build:
   - Use defineLibraryConfig
   - Set entry to "./src/browser.ts"
   - Set appropriate externals (no Node.js modules)
   - Consider disabling minification for better debugging
4. Update package.json:
   - Add browser export to exports field
   - Update build script to run both configs
5. Test both builds work correctly
6. Verify browser build has no Node.js dependencies

Example packages with dual builds: @atomiton/nodes
```

## Fix TypeScript Resolution Issues

Use this if you encounter module resolution errors:

```
Please fix TypeScript module resolution issues in @atomiton/[PACKAGE_NAME] after vite-config migration.

The package is showing errors like "Relative import paths need explicit file extensions".

Steps:
1. Check the tsconfig.json file
2. If moduleResolution is "nodenext" or "node16", override it to "bundler"
3. Also set module to "esnext" if needed
4. Run pnpm typecheck to verify the fix
5. Document the changes made

This is a known issue when migrating to the shared config and is the standard fix.
```

## Verification Prompt

After any migration:

```
Please verify the vite config migration to @atomiton/vite-config is complete and successful for every package and app

Verification checklist:
1. Run pnpm build and confirm it succeeds
2. Check dist folder contains expected outputs:
   - index.js (ES module)
   - index.cjs (CommonJS, if applicable)
   - index.d.ts (TypeScript declarations)
   - Source maps
3. Compare bundle sizes before and after
4. Run pnpm typecheck and fix any issues
5. If package has tests, run pnpm test
6. Document the final line count reduction
7. Note any issues or special configurations needed

Report:
- Original config lines: ____
- New config lines: ____
- Reduction: ____%
- Build time comparison
- Bundle size comparison
- Any issues encountered
```

## Rollback Prompt

If a migration causes issues:

```
Please rollback the @atomiton/[PACKAGE_NAME] vite-config migration.

Steps:
1. Revert the vite.config.ts file to its original state
2. Remove "@atomiton/vite-config" from package.json devDependencies
3. Run pnpm install to update lockfile
4. Verify pnpm build works with the original config
5. Document what issue caused the rollback for future reference
```

---

## Tips for Using These Prompts

1. **One package at a time** - Don't try to migrate multiple packages in one session
2. **Test thoroughly** - Always verify builds work before moving on
3. **Document issues** - Keep track of any special cases or problems
4. **Use the checklist** - Reference MIGRATION_CHECKLIST.md for detailed steps
5. **Check examples** - Look at already migrated packages for patterns

## Order of Migration (Recommended)

1. Start with simplest packages (utils, events, yaml)
2. Move to slightly complex (storage, store, hooks)
3. Then React libraries (ui, form, router)
4. Finally applications (client, desktop)
5. Save packages with special needs for last

---

_These prompts are designed to work with Claude Code's capabilities and the @atomiton/vite-config package structure._
