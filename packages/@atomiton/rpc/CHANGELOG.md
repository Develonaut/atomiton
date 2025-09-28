---
format: "keep-a-changelog"
conventional_commits: true
automation: "release-please"
last_generated: "2025-09-28"
---

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial RPC transport layer implementation
- tRPC integration for type-safe RPC
- Main, preload, and renderer process support
- IPC channel constants and security
- TypeScript type definitions

### Changed
- Refactored to be pure transport layer (no business logic)
- Simplified API to focus on message passing only

## [0.1.0] - 2025-09-28

### Added
- Initial package setup
- Basic IPC transport functionality
- tRPC server and client setup