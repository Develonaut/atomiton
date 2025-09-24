# Changelog

All notable changes to the @atomiton/eslint-config package will be documented in
this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
