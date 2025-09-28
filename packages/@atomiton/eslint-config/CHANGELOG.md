# Changelog

All notable changes to the @atomiton/eslint-config package will be documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ✅ **Package initialization** - Set up TypeScript build configuration
- ✅ **Base ESLint config** - Core JavaScript/TypeScript linting rules
- ✅ **React configuration** - React and React Hooks specific rules
- ✅ **Export structure** - Multiple configuration variants for different use
  cases
- ✅ **TypeScript compilation** - Working build process with type definitions

- ✅ **Project setup** - Initial package.json and dependencies
- ✅ **ESLint integration** - Core ESLint and TypeScript ESLint setup
- ✅ **Prettier integration** - Code formatting compatibility

- **Multi-config support**: Base and React-specific configurations
- **TypeScript integration**: Full typescript-eslint setup
- **Prettier compatibility**: No conflicts with code formatting
- **Monorepo ready**: Optimized for workspace usage

- **Type safety**: Full TypeScript definitions
- **Performance**: Fast linting for large codebases
- **Flexibility**: Different configs for different package types

---

**Total Items Completed**: 6 major milestones

### Added

- Shared ESLint configuration for all Atomiton packages
- TypeScript-aware linting rules
- Code quality and consistency standards
- Strict TypeScript rules for better type safety:
  - `@typescript-eslint/explicit-function-return-type`: Requires explicit return
    types on functions
  - `@typescript-eslint/consistent-type-assertions`: Prevents type assertions
    (use type guards instead)
  - `@typescript-eslint/typedef`: Requires type annotations for variables and
    properties

## [0.0.1] - 2025-01-11

### Added

- Initial package creation for shared ESLint configuration
- Foundation for consistent code quality across packages
