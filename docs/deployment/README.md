# Deployment Guide - Atomiton Platform

## Overview

This guide covers the current deployment strategy for Atomiton. The platform is
currently in development, so this document reflects our planned deployment
approach rather than a fully implemented system.

## Current Deployment Status

**🚧 In Development** - Atomiton is currently being built and deployment
infrastructure is being planned.

### Planned Deployment Models

1. **Desktop Application** (Electron)
   - Cross-platform support (Windows, macOS, Linux)
   - Local file system storage
   - Offline-first operation

2. **Web Application** (React SPA)
   - Browser-based editor
   - Cloudflare CDN for static asset delivery

## Confirmed Deployment Strategy

### Client (Web App) Deployment

**Cloudflare CDN:**

- Static React SPA build will be served via Cloudflare CDN
- Fast global content delivery
- Automatic caching and optimization
- SSL/TLS termination handled by Cloudflare

### Desktop App Deployment

**GitHub Releases & Auto-Updates:**

- Electron builds hosted on GitHub Releases
- Auto-update mechanism for seamless updates
- Cross-platform distribution (Windows, macOS, Linux)
- Signed packages for security

## Development Environment

### Local Development Setup

**Prerequisites:**

- Node.js 18+
- pnpm package manager
- Git

**Quick Start:**

```bash
# Clone repository
git clone https://github.com/your-org/atomiton.git
cd atomiton

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build Process

**Web Client Build:**

```bash
# Build for production
pnpm build:client

# Preview production build
pnpm preview:client
```

**Desktop App Build:**

```bash
# Build Electron app
pnpm build:desktop

# Build for all platforms
pnpm build:desktop:all
```

## Future Deployment Considerations

The following are areas we're still planning and haven't fully determined:

### Backend/API Deployment

- Server hosting strategy (TBD)
- Database solution (TBD)
- API architecture and deployment (TBD)

### Infrastructure

- Cloud provider selection (TBD)
- Container orchestration (TBD)
- Monitoring and logging (TBD)

### Security

- Authentication implementation (TBD)
- SSL certificate management (TBD)
- Security scanning and compliance (TBD)

## Project Structure

```
atomiton/
├── apps/
│   ├── client/          # React web application
│   └── desktop/         # Electron desktop app
├── packages/
│   └── @atomiton/       # Shared packages
└── docs/               # Documentation
```

## Environment Configuration

### Development Environment Variables

**Client App (.env.local):**

```bash
VITE_APP_NAME=Atomiton
VITE_API_URL=http://localhost:3001  # When API is implemented
```

**Desktop App (.env):**

```bash
ELECTRON_IS_DEV=true
```

## CI/CD Pipeline (Planned)

### GitHub Actions Workflow (Draft)

```yaml
# .github/workflows/deploy.yml (placeholder)
name: Deploy
on:
  push:
    branches: [main]
    tags: ["v*"]

jobs:
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm build:client
      # TODO: Deploy to Cloudflare

  build-desktop:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm build:desktop
      # TODO: Create GitHub release
```

## Monitoring and Health Checks

### Health Check Endpoints (Future)

```typescript
// Future API health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
  });
});
```

## Troubleshooting

### Common Development Issues

**Build Failures:**

```bash
# Clean and reinstall dependencies
pnpm clean
pnpm install

# Check Node.js version
node --version  # Should be 18+
```

**Development Server Issues:**

```bash
# Check if ports are available
lsof -i :3000  # React dev server
lsof -i :3001  # Future API server
```

---

**Last Updated**: 2025-09-17 **Status**: Development Phase - Deployment Strategy
Planning **Next Review**: When backend architecture is defined
