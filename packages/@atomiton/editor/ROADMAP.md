# Roadmap - @atomiton/editor

## Vision

Create a powerful, extensible visual editor that enables users to build complex automation workflows through an intuitive node-based interface. The editor should be domain-agnostic, performant, and provide real-time feedback during workflow execution.

## Long-term Goals

### Phase 1: Foundation (Q1 2025)

**Status**: In Progress

- [x] Basic editor architecture with React Flow
- [x] Canvas with pan/zoom/grid functionality
- [x] Node palette with draggable nodes
- [x] Basic node rendering and selection
- [ ] **Current Focus**: Complete node configuration system
- [ ] Data connection system between nodes
- [ ] Basic workflow persistence

### Phase 2: Core Editor (Q2 2025)

- [ ] Advanced node configuration with nested forms
- [ ] Real-time workflow validation
- [ ] Advanced connection system with type checking
- [ ] Workflow execution with visual feedback
- [ ] Blueprint templates and sharing
- [ ] Undo/redo system
- [ ] Copy/paste and duplication

### Phase 3: Advanced Features (Q3 2025)

- [ ] Workflow debugging and stepping
- [ ] Performance monitoring dashboard
- [ ] Advanced layout algorithms
- [ ] Collaborative editing features
- [ ] Plugin system for custom nodes
- [ ] Advanced theming and customization

### Phase 4: Enterprise Features (Q4 2025)

- [ ] Multi-workspace support
- [ ] Advanced permissions and roles
- [ ] Workflow analytics and reporting
- [ ] Integration marketplace
- [ ] Enterprise deployment options
- [ ] Advanced security features

## Technical Architecture Evolution

### Core Systems

1. **Editor Engine**: React Flow + Zustand for canvas management
2. **Configuration System**: Zod + React Hook Form for dynamic property panels
3. **Execution Runtime**: Integration with @atomiton/core execution engine
4. **State Management**: Centralized store with real-time synchronization
5. **Plugin Architecture**: Extensible system for custom nodes and features

### Performance Targets

- **Canvas Performance**: 60fps with 500+ nodes
- **Memory Usage**: < 100MB for typical workflows
- **Load Time**: < 2s for large blueprints
- **Real-time Updates**: < 100ms latency for property changes

## Key Milestones

### M1: Node Configuration (January 2025)

Complete the node inspector system with full property editing capabilities.

### M2: Data Flow (February 2025)

Implement connection system with type validation and data flow visualization.

### M3: Execution Engine (March 2025)

Integration with core execution engine for running workflows in the editor.

### M4: Persistence & Templates (April 2025)

Save/load functionality with blueprint templates and sharing.

### M5: Advanced UI (May 2025)

Polished user experience with advanced features like undo/redo and debugging.

## Dependencies & Integrations

### Core Dependencies

- **@atomiton/core**: Execution engine and node definitions
- **@atomiton/nodes**: Standard node library
- **@atomiton/ui**: Component library and design system
- **@atomiton/store**: Global state management

### External Dependencies

- **@xyflow/react**: Canvas and flow visualization
- **React Hook Form**: Dynamic form generation
- **Zod**: Schema validation and type inference

## Success Metrics

### User Experience

- Time to create first working workflow: < 5 minutes
- User retention after first week: > 80%
- Support ticket volume: < 5% of active users

### Technical Performance

- Canvas responsiveness: 60fps sustained
- Memory efficiency: Linear growth with complexity
- Build performance: < 30s for full rebuild

### Platform Adoption

- Monthly active workflows created: 1000+
- Community contributions: 10+ custom nodes/month
- Enterprise deployments: 5+ organizations

---

**Maintained by**: Atomiton Core Team
**Last Updated**: January 2025
**Next Review**: February 2025
