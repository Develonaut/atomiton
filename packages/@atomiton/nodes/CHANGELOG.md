# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-09-23

### Added
- **Code Node**: New secure JavaScript execution node using isolated-vm
  - Execute JavaScript expressions in isolated V8 instances
  - Configurable memory limits (8-128MB) and timeouts
  - True security isolation (not pattern-based filtering)
  - Type conversion support (auto, string, number, boolean, object, array)
  - Complete integration with node registry and UI fields

### Changed
- **Security**: Replaced custom safe evaluation with industry-standard isolated-vm
- **Dependencies**: Added isolated-vm for secure code execution

### Security
- **Enhanced**: Code execution now uses proper V8 isolation instead of pattern filtering
- **Memory Safety**: Configurable memory limits prevent resource exhaustion
- **Timeout Protection**: Execution time limits prevent infinite loops

## [0.3.0] - Previous Version
- Existing node implementations (shell-command, transform, file-system, etc.)
- Core node architecture and type system