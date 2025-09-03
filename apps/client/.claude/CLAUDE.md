# Client App - Claude Instructions

This is the **main React application** that powers Atomiton's UI.

## App Status

Currently a Next.js app that will be migrated to Vite for better performance and simpler configuration.

## Desktop-First Design

While this app can run in a browser, it's designed for desktop-first:

- **Full functionality**: Only available in Electron desktop wrapper
- **Web version**: Limited demo/preview functionality
- **Core features**: Require file system access (desktop only)

## Current State

- Next.js 15.x implementation
- Tailwind CSS (migrating to Mantine)
- React Flow for node editor
- Basic UI structure in place

## Migration Plan

1. **Vite Migration** (Priority 1)
   - Better HMR
   - Simpler config
   - Faster builds

2. **Mantine UI + Brainwave 2.0** (Priority 2)
   - Beautiful Brainwave 2.0 aesthetic
   - Premium visual design
   - Component consolidation

## Key Decisions

- Desktop-first, web-limited approach
- Platform detection for progressive enhancement
- Beautiful UI is the key differentiator

---

For main project instructions: [Root CLAUDE.md](../../../.claude/CLAUDE.md)
