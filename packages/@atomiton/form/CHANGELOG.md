# Changelog

All notable changes to the @atomiton/form package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Complete rewrite from over-engineered custom store to minimal React Hook Form + Zod wrapper
- API changed from `uiMetadata` to `fields` parameter to match node interface
- Reduced from 1,200+ lines to ~150 lines (87% reduction)

### Added

- React Hook Form integration for optimal performance
- Zod schema-first approach with automatic field generation
- Direct compatibility with Atomiton node field configurations
- Support for all node control types (text, textarea, number, boolean, select, etc.)
- TypeScript support with full type inference
- Comprehensive documentation and examples

### Removed

- Custom Zustand-based form store (over-engineered)
- Multi-schema validation support (yup/joi - unnecessary complexity)
- Custom form components (let consumers build their own)
- Complex validation abstraction layers

### Fixed

- All TypeScript compilation errors
- Package build and dependency issues
- Test suite covering core functionality

## [0.1.0] - 2025-01-11

### Added

- Minimal, focused form library built on React Hook Form + Zod
- `useForm` hook with automatic field generation from schemas
- `generateFieldsFromSchema` and `getDefaultValues` utilities
- Full compatibility with Atomiton node interface
- Comprehensive README with usage examples
- Test suite covering utilities and hooks
