# Client App Architecture

This is the **main React application** that powers Atomiton's UI.

## App Overview

Vite-based React application implementing the Atomiton Blueprint editor and automation platform.

## Desktop-First Design

While this app can run in a browser, it's designed for desktop-first:

- **Full functionality**: Only available in Electron desktop wrapper
- **Web version**: Limited demo/preview functionality  
- **Core features**: Require file system access (desktop only)

## Current Implementation

- ✅ Vite + React 19 implementation
- ✅ Tailwind CSS v4 with Atomiton design system
- ✅ React Flow integrated for node editor
- ✅ Component library from `@atomiton/ui`
- ✅ State management with `@atomiton/store`
- 🚧 Blueprint editor with node inspector in development

## Current Focus

1. **Node Inspector Implementation** - Display and edit node properties in sidebar
2. **Workflow Execution** - Connect and run Blueprint workflows  
3. **File System Integration** - Save/load Blueprint files locally

## Key Architecture Decisions

- Desktop-first, web-limited approach
- Vite for fast development and builds
- Component library integration with `@atomiton/ui`
- Beautiful UI using Atomiton design system

## Tech Stack

- **Framework**: Vite 6 with React 19
- **UI Library**: Component library from `@atomiton/ui`
- **Styling**: Tailwind CSS v4 with Atomiton design system
- **Node Editor**: React Flow
- **State Management**: `@atomiton/store`
- **Desktop Wrapper**: Electron

## Core Components

This application provides:

- Blueprint visual editor (React Flow)
- Node catalog and management
- Node inspector for property editing
- Workflow execution interface
- Settings and configuration
- File system integration for Blueprint files