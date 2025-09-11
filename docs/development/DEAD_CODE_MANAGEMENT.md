# Dead Code Management with Knip

## Overview

We use Knip for dead code detection and ESLint rules for unreachable code detection.

## Quick Commands

```bash
# Find all dead code
pnpm knip

# Auto-fix by removing unused exports
pnpm knip:fix

# Check production code only (stricter rules)
pnpm knip:production

# Check for unused dependencies
pnpm knip:dependencies

# Check for unused exports only
pnpm knip:unused-exports

# Check for unused types only
pnpm knip:unused-types
```

## Configuration

### Main Configuration (`knip.json`)

- Configured for all workspaces with specific entry points
- Templates and demo files are ignored to reduce false positives
- Rules are set to warn/error levels based on severity
- Type exports are treated more leniently

### Production Configuration (`knip.production.json`)

- Stricter rules for production builds
- Ignores all test/demo/template files
- All issues are treated as errors

### Ignore Patterns (`.knipignore`)

- Contains patterns for files intentionally kept
- Template pages, demo components, future features

## Reducing False Positives

Our configuration handles common monorepo patterns:

1. **Entry Points**: Each package has specific entry points defined
2. **Template Files**: UI templates marked as entry points
3. **Type Exports**: Types used only in declarations are ignored
4. **Workspace Dependencies**: Internal @atomiton/\* packages ignored
5. **Dynamic Imports**: Comments folder kept as it may be conditionally imported

## Best Practices

### Before Removing Code

1. Run `pnpm knip` to see all issues
2. Check if the file is imported dynamically
3. Verify it's not used in tests or stories
4. Consider if it's kept for future use

### Regular Maintenance

1. Run `pnpm knip` before commits
2. Use `pnpm knip:fix` to clean exports
3. Run `pnpm knip:production` before releases
4. Review and update `.knipignore` as needed

## ESLint Dead Code Rules

The following ESLint rules help catch dead code:

- `no-unreachable`: Unreachable code after return/throw
- `no-unreachable-loop`: Loops that only run once
- `no-useless-return`: Unnecessary return statements
- `no-lone-blocks`: Unnecessary nested blocks
- `no-empty`: Empty block statements
- `no-useless-catch`: Catch that only rethrows
- `no-constant-condition`: Always true/false conditions

## Workflow Integration

1. **Development**: Use `pnpm knip` to check for issues
2. **Pre-commit**: ESLint will catch unreachable code
3. **CI/CD**: Consider adding `pnpm knip:production` to CI
4. **Code Review**: Check Knip output for new dead code

## Troubleshooting

### Too Many False Positives?

- Add patterns to `ignore` in `knip.json`
- Mark files as entry points if they're app roots
- Use `.knipignore` for temporary exclusions

### Missing Real Issues?

- Check if templates are properly configured
- Ensure entry points are correctly specified
- Try `pnpm knip:production` for stricter checking

### Dependency Issues?

- Use `pnpm knip:dependencies` to check deps
- Add build tools to `ignoreDependencies`
- Check for duplicate dependencies with Knip
