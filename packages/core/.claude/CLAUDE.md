# Core Package - Claude Instructions

This is the **@atomiton/core** package containing foundation abstractions and shared utilities.

## Package Status

⚠️ **Package exists but is not wired up yet**

We have existing code from a previous implementation that needs to be integrated after the UI migration is complete.

## What's Here

- Platform detection and abstraction
- Storage clients (FileSystem, IndexedDB, Memory)
- Execution clients (NodeProcess, WebWorker)
- Event system implementation
- Visualization adapters

## Documentation

See [./docs/](../docs/) and [./README.md](../README.md) for:

- Architecture overview
- Existing code analysis
- Integration roadmap
- API documentation

## Current Priority

Not active - waiting for:

1. Vite migration
2. Mantine UI migration with Brainwave 2.0 theme
3. Then we'll wire this up

## Key Decisions

- Keep existing architecture (it's good!)
- Add DI pattern from n8n later
- Platform abstraction is better than n8n's web-only approach

---

For main project instructions: [Root CLAUDE.md](../../../.claude/CLAUDE.md)
