# Changelog

All notable changes to the @atomiton/nodes package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Runtime property to INodeMetadata for future multi-language execution
- TypeScript runtime support with future extensibility
- Node versioning system for backward compatibility
- Export transform utilities (fromYaml, toYaml) from composite module
- Export all transform functions from composite/transform directory

### Changed

- NodeMetadata class updated to handle runtime property with TypeScript default

### Fixed

- Added missing type field to transform node metadata

## [0.0.1] - 2025-01-11

### Added

- Initial package creation with node system foundation
- Base node interfaces and metadata system
- Node type definitions and core abstractions
- TypeScript configuration and build setup
