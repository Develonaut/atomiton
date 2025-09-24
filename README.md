# Atomiton

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stage](https://img.shields.io/badge/Stage-Pre--Alpha-red.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of-Conduct-ff69b4.svg)](CODE_OF_CONDUCT.md)

> **⚠️ EARLY STAGE - ACTIVE DEVELOPMENT ⚠️**
>
> This project is in active development. While the core architecture is in place
> and the build system works, we're still implementing features and refining the
> user experience. Think of this as watching a house being built - the
> foundation and framework are solid, and we're now working on the rooms!

## What Atomiton Will Be (Eventually)

A beautiful, desktop-first automation platform that makes visual workflow
creation simple and enjoyable. Think n8n meets Notion - powerful automation with
an interface you'll actually enjoy using.

## Current Reality Check

- ✅ Monorepo structure with 8 working packages
- ✅ Build system fully operational (TypeScript, Vite, Turbo)
- ✅ Core architecture implemented
- ✅ UI components library with Mantine v7
- 🚧 Blueprint editor in development
- 🚧 Node system being integrated
- ⏳ Desktop app wrapper ready for integration

## Why Share So Early?

I could have kept this private until it was "ready," but:

- Building in public keeps me accountable
- Early feedback shapes better products
- Open source from day one feels right
- I'm excited and wanted to share that excitement
- Maybe others want to follow the journey

## The Vision

**For Individuals & Small Teams**: Not another enterprise tool, but something
you'd actually use for personal projects.

**Beautiful First**: Using Brainwave 2.0 aesthetics because automation tools
don't have to be ugly.

**Desktop Native**: Full file system access, no cloud required, your data stays
yours.

**Simple Over Complex**: 20-50 excellent nodes instead of 500+ mediocre ones.

## Tech Stack

- **Frontend**: React + Vite + Mantine v7
- **Desktop**: Electron (wrapper ready)
- **UI Design**: Brainwave 2.0 aesthetic (by [UI8](https://ui8.net))
- **Architecture**: Monorepo with pnpm + Turbo
- **Language**: TypeScript everywhere

## 📊 Project Progress

Track our development progress:

- **[Current Work](./CURRENT.md)** - What we're building right now
- **[Upcoming Work](./NEXT.md)** - What's coming next
- **[Completed Work](./COMPLETED.md)** - What we've shipped

## Project Structure

```
atomiton/
├── apps/              # Applications
│   ├── client/       # React + Vite web application
│   └── desktop/      # Electron wrapper for desktop experience
├── packages/
│   └── @atomiton/    # Scoped packages
│       ├── core/     # Core Blueprint engine
│       ├── nodes/    # Node implementations
│       ├── ui/       # UI components & design system
│       ├── store/    # State management
│       ├── events/   # Event system
│       ├── di/       # Dependency injection
│       └── ...       # Config packages
├── playwright/       # E2E testing suite
└── docs/            # Project documentation
```

**Note**: The client app will have limited functionality on the web. Desktop app
provides full file system access and native features.

## Want to Follow Along?

This is a solo learning project, but if you're interested:

- ⭐ Star the repo to follow progress
- 👀 Watch for updates (might be sporadic - side project)
- 💬 Open issues with ideas or feedback
- 🚫 Don't expect anything to work for months

## Installation

```bash
git clone https://github.com/Develonaut/atomiton.git
cd atomiton
pnpm install
pnpm build  # All packages build successfully
pnpm dev    # Start development servers
```

## Contributing

While I appreciate the enthusiasm, the project is too early for contributions.
For now:

- **Ideas & Feedback**: Yes please! Open an issue
- **Code Contributions**: Not yet - still figuring out the basics
- **Documentation**: Already have too much for features that don't exist 😅

## Roadmap

See [docs/project/ROADMAP.md](docs/project/ROADMAP.md) for the ambitious plan.
Timeline: "When it's ready" (aka no idea).

## Why "Atomiton"?

Atomic + Automaton = Atomiton. Small, indivisible units of automation that
combine into complex workflows. Also, it sounds cool.

## License

MIT - Because open source should be truly open.

## Credits

See [CREDITS.md](CREDITS.md) for acknowledgments of the amazing projects and
people that inspire Atomiton.

## Status

Building in public from commit #1. Follow along as this transforms from hopes
and dreams into (hopefully) something useful!

---

**Remember**: This is a journey, not a destination. Nothing works yet, but
that's part of the fun.

_Last Updated: September 2025 - Foundation complete, building features_
