# @atomiton/editor

Blueprint visual editor for the Atomiton platform.

## Overview

This package provides the React-based visual editor for creating and editing
Blueprint workflows. It includes a node-based interface for designing automation
workflows with drag-and-drop functionality.

## Features

- Visual node-based Blueprint editor
- Drag-and-drop interface for workflow creation
- Real-time Blueprint validation
- Canvas-based editing with zoom and pan
- Component library for editor UI elements

## Installation

```bash
pnpm add @atomiton/editor
```

## Usage

```typescript
import { Editor } from '@atomiton/editor';

// Basic editor component
<Editor />
```

## Development

```bash
# Start development server
pnpm dev:serve

# Build package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## Architecture

The editor is built using:

- React for the component framework
- Canvas-based rendering for the node editor
- Vite for build tooling and development server
- TypeScript for type safety
