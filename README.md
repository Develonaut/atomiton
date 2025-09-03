# Atomiton

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stage](https://img.shields.io/badge/Stage-Pre--Alpha-red.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of-Conduct-ff69b4.svg)](CODE_OF_CONDUCT.md)

> **⚠️ VERY EARLY STAGE - HOPES & DREAMS PROJECT ⚠️**
>
> This project is so new that nothing works yet. It's literally just hopes and dreams at this point. I'm sharing it publicly because I'm excited about what it could become, not because it's ready to use. Think of this as watching a house being built from the foundation up - right now we're still drawing the blueprints!

## What Atomiton Will Be (Eventually)

A beautiful, desktop-first automation platform that makes visual workflow creation simple and enjoyable. Think n8n meets Notion - powerful automation with an interface you'll actually enjoy using.

## Current Reality Check

- ✅ We have some code structure
- ✅ We have big dreams
- ✅ We have documentation (for things that don't exist yet)
- ❌ Nothing actually works
- ❌ No features are implemented
- ❌ It's not usable at all

## Why Share So Early?

I could have kept this private until it was "ready," but:

- Building in public keeps me accountable
- Early feedback shapes better products
- Open source from day one feels right
- I'm excited and wanted to share that excitement
- Maybe others want to follow the journey

## The Vision

**For Individuals & Small Teams**: Not another enterprise tool, but something you'd actually use for personal projects.

**Beautiful First**: Using Brainwave 2.0 aesthetics because automation tools don't have to be ugly.

**Desktop Native**: Full file system access, no cloud required, your data stays yours.

**Simple Over Complex**: 20-50 excellent nodes instead of 500+ mediocre ones.

## Tech Stack (Planned)

- **Frontend**: React + Vite + Mantine UI
- **Desktop**: Electron (eventually)
- **Theme**: Brainwave 2.0 aesthetic (by [UI8](https://ui8.net))
- **Architecture**: Monorepo with pnpm
- **Language**: TypeScript everywhere

## Project Structure

```
atomiton/
├── apps/           # Applications
│   ├── client/    # React app (Next.js → Vite migration planned)
│   └── desktop/   # Electron wrapper for full desktop experience
├── packages/       # Shared packages
│   ├── core/      # Core logic (exists but not wired)
│   ├── nodes/     # Node library (exists but not wired)
│   └── theme/     # Theme system (empty, waiting for migration)
└── docs/          # Extensive docs for things that don't exist
```

**Note**: The client app will have limited functionality on the web. Desktop app provides full file system access and native features.

## Want to Follow Along?

This is a solo learning project, but if you're interested:

- ⭐ Star the repo to follow progress
- 👀 Watch for updates (might be sporadic - side project)
- 💬 Open issues with ideas or feedback
- 🚫 Don't expect anything to work for months

## Installation (Don't Bother Yet)

Seriously, it doesn't do anything. But if you're curious:

```bash
git clone https://github.com/Develonaut/atomiton.git
cd atomiton
pnpm install
pnpm dev
# You'll see... something. Maybe. Probably errors.
```

## Contributing

While I appreciate the enthusiasm, the project is too early for contributions. For now:

- **Ideas & Feedback**: Yes please! Open an issue
- **Code Contributions**: Not yet - still figuring out the basics
- **Documentation**: Already have too much for features that don't exist 😅

## Roadmap

See [docs/project/ROADMAP.md](docs/project/ROADMAP.md) for the ambitious plan. Timeline: "When it's ready" (aka no idea).

## Why "Atomiton"?

Atomic + Automaton = Atomiton. Small, indivisible units of automation that combine into complex workflows. Also, it sounds cool.

## License

MIT - Because open source should be truly open.

## Credits

See [CREDITS.md](CREDITS.md) for acknowledgments of the amazing projects and people that inspire Atomiton.

## Status

Building in public from commit #1. Follow along as this transforms from hopes and dreams into (hopefully) something useful!

---

**Remember**: This is a journey, not a destination. Nothing works yet, but that's part of the fun.

_Last Updated: January 2025 - Still just dreams_
