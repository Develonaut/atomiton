# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-27

### Added

- Initial implementation of the conductor package
- Core execution engine with `createConductor` factory function
- Support for atomic node execution via NodeExecutable registry
- Support for composite node execution with topological sorting
- Comprehensive execution types (ExecutionContext, ExecutionResult,
  ExecutionError)
- Utility functions for node type detection (isAtomic, isComposite)
- Error handling with detailed context and stack traces
- Integration tests for conductor functionality
- Full TypeScript support with type exports
