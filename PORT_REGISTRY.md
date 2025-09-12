# Port Registry

This document maintains the official port allocation registry for the Atomiton monorepo to prevent conflicts and ensure consistent development environment setup.

## Current Port Allocations

### Frontend Applications (5170-5179 Range)

| Port | Service        | Package            | Environment Variable         | Description                      |
| ---- | -------------- | ------------------ | ---------------------------- | -------------------------------- |
| 5173 | Client App     | `@atomiton/client` | `VITE_CLIENT_PORT`           | Main React application           |
| 5174 | UI Package     | `@atomiton/ui`     | `VITE_UI_PORT`               | UI component development server  |
| 5175 | Editor Package | `@atomiton/editor` | `VITE_DESKTOP_RENDERER_PORT` | Visual editor development server |

### API Services (3000-3099 Range)

| Port | Service    | Package | Environment Variable | Description          |
| ---- | ---------- | ------- | -------------------- | -------------------- |
| 3000 | API Server | TBD     | `API_PORT`           | Main REST API server |

### Real-time Services (8080-8089 Range)

| Port | Service          | Package | Environment Variable | Description             |
| ---- | ---------------- | ------- | -------------------- | ----------------------- |
| 8080 | WebSocket Server | TBD     | `WEBSOCKET_PORT`     | Real-time communication |

## Reserved Port Ranges

### Development Ranges

- **5170-5179**: Frontend applications and dev servers
- **3000-3099**: API and backend services
- **8080-8089**: WebSocket and real-time services
- **9000-9099**: Testing and utilities (Playwright, etc.)

### Avoid These Ranges

- **5000-5010**: Commonly used by other dev tools
- **8000-8010**: Often used by Python/Django
- **3001-3010**: Create React App and Next.js defaults
- **4000-4010**: Angular CLI defaults

## Port Allocation Guidelines

### Adding New Services

1. **Check this registry** before choosing a port
2. **Use environment variables** for all port definitions
3. **Update this document** when adding new services
4. **Follow the range conventions** listed above

### Environment Variable Naming Convention

```bash
# Frontend services (Vite-based)
VITE_{PACKAGE_NAME}_PORT=5xxx

# Backend services
{SERVICE_NAME}_PORT=3xxx

# Real-time services
{SERVICE_NAME}_PORT=8xxx
```

### Configuration Pattern

Each service should read its port from environment variables with sensible fallbacks:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PACKAGE_PORT || "5xxx"),
    strictPort: true, // Fail if port is in use
  },
});
```

## Development Scripts

### Port Management Commands

```bash
# Kill all development ports
pnpm kill

# Kill specific port ranges
pnpm kill:ports

# Check what's running on ports
lsof -ti:5173,5174,5175,3000,8080
```

### Environment Setup

All port configurations are centralized in the root `.env` file:

```bash
# Application Ports
VITE_CLIENT_PORT=5173
VITE_UI_PORT=5174
VITE_DESKTOP_RENDERER_PORT=5175

# API Ports
API_PORT=3000
WEBSOCKET_PORT=8080

# Electron Configuration
ELECTRON_RENDERER_URL=http://localhost:5173
```

## Port Conflict Resolution

### Common Issues

- **Port in use**: Another service is running on the same port
- **Permission denied**: Port requires elevated privileges (ports < 1024)
- **Firewall blocking**: OS firewall blocking the port

### Solutions

1. Run the kill scripts: `pnpm kill`
2. Check for zombie processes: `lsof -ti:PORT`
3. Use `strictPort: true` in Vite config to fail fast
4. Ensure environment variables are properly loaded

## Testing Integration

### Playwright Configuration

- UI Tests: Port 5174 (`@atomiton/ui`)
- E2E Tests: Port 5173 (`@atomiton/client`)

### Test Servers

Test servers should use dedicated ports in the 9000+ range to avoid conflicts with development servers.

## Future Considerations

### Scaling Recommendations

- **Docker Compose**: When containerizing, use the same port mapping
- **Kubernetes**: Maintain consistency between local and cluster ports
- **CI/CD**: Use dynamic port allocation for parallel test runs

### Monitoring

Consider adding port health checks to development scripts:

```bash
# Check all services are running
curl -f http://localhost:5173 && \
curl -f http://localhost:5174 && \
curl -f http://localhost:5175
```

---

**Last Updated**: December 2024  
**Maintainer**: Development Team  
**Next Review**: Quarterly or when adding new services
