# Atomiton Client

The main desktop application for Atomiton Blueprint automation platform.

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - Active development tasks
- **[Upcoming Features](./NEXT.md)** - Planned features
- **[Release History](./COMPLETED.md)** - Completed work

## Status

✅ **Successfully migrated to Vite** - Waiting for UI framework integration

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The application will be available at http://localhost:3000

## Architecture

This is the main client application that will be wrapped by Electron for desktop
distribution. It provides:

- Blueprint visual editor (React Flow)
- Node catalog and management
- Workflow execution interface
- Settings and configuration

## Tech Stack

- **Current**: Next.js 15 with App Router
- **Migrating to**: Vite 6 with React 19
- **UI Library**: Migrating from Tailwind CSS to Mantine
- **Theme**: Brainwave 2.0 aesthetic

## Development

See the main [development documentation](../../docs/development/README.md) for:

- Code quality requirements
- Testing strategy
- Build process

## Documentation

- [Architecture Overview](../../docs/architecture/README.md)
- [UI Components](../../packages/ui/docs/README.md)
- [Migration Strategy](../../packages/ui/ROADMAP.md)
