# @atomiton/web - Client Application Roadmap

## Overview

Main web client for the Atomiton Blueprint automation platform, providing the
visual workflow editor and user interface.

## Current Architecture

- Vite-powered React application
- Tailwind CSS v4 for styling
- React Router for navigation
- Integration with @atomiton/ui component library
- Electron-ready for desktop application

## Upcoming Milestones

### Phase 1: Core Application (Current)

- [ ] Blueprint visual editor integration
- [ ] Node palette and library system
- [ ] Workflow execution dashboard
- [ ] User authentication and session management

### Phase 2: Advanced Features

- [ ] Real-time collaboration features
- [ ] Advanced Blueprint debugging tools
- [ ] Plugin marketplace integration
- [ ] Export/import Blueprint functionality

### Phase 3: Performance & UX

- [ ] Performance optimization for large Blueprints
- [ ] Mobile-responsive design improvements
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Progressive Web App features

### Phase 4: Platform Integration

- [ ] Desktop app distribution via Electron
- [ ] Cloud sync and backup features
- [ ] Multi-tenant workspace support
- [ ] Enterprise authentication (SSO)

## Key Features

### Blueprint Editor

- Visual node-based workflow designer
- Drag-and-drop interface for node creation
- Connection management between nodes
- Real-time execution visualization

### User Interface

- Modern, responsive design using Tailwind CSS
- Component library from @atomiton/ui
- Dark/light theme support via @atomiton/theme
- Intuitive navigation and workspace management

## Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Build**: Vite 7.x with hot module replacement
- **Testing**: Playwright for E2E, component testing TBD
- **State Management**: Zustand for client state
- **Routing**: React Router v7

## Dependencies

- `@atomiton/ui` - Shared component library
- `@atomiton/theme` - Design system and theming
- Core React ecosystem packages
- Playwright for testing

## Future Considerations

- Migration to React 19 concurrent features
- Server-side rendering for better performance
- WebAssembly integration for compute-intensive operations
- Real-time collaboration via WebRTC or WebSockets

---

_Last Updated: 2025-09-05_
