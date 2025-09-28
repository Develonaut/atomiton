---
title: "@atomiton/rpc Roadmap"
vision: "Become a robust, extensible RPC transport layer supporting multiple protocols"
current_phase: 1
total_phases: 3
estimated_completion: "Q2 2026"
success_metrics:
  performance: "< 1ms overhead per RPC call"
  reliability: "99.9% message delivery"
  type_coverage: "100%"
---

# Roadmap

## Vision Statement

Transform @atomiton/rpc into a flexible, high-performance RPC transport layer that can support multiple protocols (IPC, WebSocket, HTTP) while maintaining type safety and minimal overhead.

## Current Phase: Phase 1 - Core Transport
**Timeline**: Q4 2025
**Status**: 🟡 In Progress (60% complete)

### Objectives
- ✅ Implement basic IPC transport
- ✅ Integrate tRPC for type safety
- ✅ Create main/preload/renderer modules
- [ ] Add comprehensive error handling
- [ ] Implement retry logic
- [ ] Add request/response logging

### Success Criteria
- All IPC messages properly typed
- Zero business logic in transport layer
- Full test coverage for transport functions

## Phase 2: Protocol Expansion
**Timeline**: Q1 2026
**Status**: 🔵 Planned

### Objectives
- [ ] Add WebSocket transport support
- [ ] Implement HTTP/REST fallback
- [ ] Create protocol negotiation
- [ ] Add connection pooling
- [ ] Implement backpressure handling

### Success Criteria
- Support for 3+ transport protocols
- Automatic protocol selection
- Graceful fallback mechanisms

## Phase 3: Performance & Reliability
**Timeline**: Q2 2026
**Status**: 🔵 Planned

### Objectives
- [ ] Implement message batching
- [ ] Add compression support
- [ ] Create performance monitoring
- [ ] Add circuit breaker pattern
- [ ] Implement message deduplication

### Success Criteria
- < 1ms overhead per call
- Support for 10k+ concurrent connections
- 99.9% message delivery rate

## Not in Scope
- Business logic implementation
- State management
- UI components
- Authentication/authorization (handled by consumer)