# Atomiton Desktop

Electron wrapper for the Atomiton Blueprint automation platform, providing
native desktop capabilities.

## 📊 Progress Tracking

- **[Current Work](./CURRENT.md)** - Active development tasks
- **[Upcoming Features](./NEXT.md)** - Planned features
- **[Release History](./COMPLETED.md)** - Completed work

## Status

🔴 **On Hold** - Waiting for client app to be feature-complete

## Overview

This Electron application wraps the Atomiton web client to provide a native
desktop experience with additional capabilities:

- **Full file system access** - Read/write files without restrictions
- **Native OS integration** - System tray, notifications, file associations
- **Local execution** - Run workflows entirely offline
- **Auto-updates** - Seamless updates via GitHub releases
- **Platform-specific features** - Touch Bar (macOS), Jump Lists (Windows)

## Architecture

```
apps/desktop/
├── src/
│   ├── main/           # Main process code
│   │   ├── index.ts    # Entry point
│   │   ├── window.ts   # Window management
│   │   └── ipc.ts      # IPC handlers
│   ├── preload/        # Preload scripts
│   └── common/         # Shared types/utils
├── scripts/            # Build scripts
└── resources/          # Icons, assets
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Package for distribution
pnpm package
```

## Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication
- CSP headers configured
- Preload scripts for safe API exposure

## Platform Builds

### macOS

- DMG installer with code signing
- Mac App Store distribution (future)
- Universal binary (Intel + Apple Silicon)

### Windows

- NSIS installer
- Microsoft Store distribution (future)
- Auto-update support

### Linux

- AppImage (universal)
- Snap package
- Flatpak support
- Debian/RPM packages

## Key Differentiators

Unlike n8n which is primarily web-based:

- **Desktop-first** - Full access to local resources
- **No server required** - Everything runs locally
- **Better performance** - Direct system access
- **Privacy focused** - Your data never leaves your machine
- **Offline capable** - No internet connection needed

## Contributing

This app is currently on hold until the client application is feature-complete.
Once active development begins, we'll need help with:

- Platform-specific features
- Native module integration
- Performance optimization
- Security hardening
- Accessibility improvements

## License

MIT - See [LICENSE](../../LICENSE) for details

---

**Package Status**: 🔴 On Hold **Depends On**: apps/client **Platform**:
Electron 28+
