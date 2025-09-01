# TODO List

## Project Metadata
- **Created**: September 1, 2025
- **Maintained by**: Barbara (Documentation Specialist)
- **Last Updated**: September 1, 2025
- **Purpose**: Track ongoing tasks and improvements for the Atomiton project

## Task Categories

### 🔄 In Progress
*No tasks currently in progress*

### 📋 Pending Tasks

#### High Priority
- [ ] **Implement Husky pre-commit hooks**
  - *Priority*: High (FIRST PRIORITY)
  - *Category*: Infrastructure
  - *Description*: Set up Husky to automatically format, lint-fix, then run lint and typecheck on all staged files
  - *Assigned*: TBD
  - *Estimated Effort*: Small
  - *Dependencies*: None
  - *Notes*: 
    - Step 1: Run formatter on staged files
    - Step 2: Run lint autofix on staged files  
    - Step 3: Run lint check (must pass)
    - Step 4: Run typecheck (must pass)
    - Prevents any commits with errors

- [ ] **Replace Next.js with Vite in web application**
  - *Priority*: High
  - *Category*: Infrastructure
  - *Description*: Migrate the web application from Next.js to Vite for improved development experience and build performance
  - *Assigned*: TBD
  - *Estimated Effort*: TBD
  - *Dependencies*: None identified
  - *Notes*: Consider impact on existing routing, SSR requirements, and build processes

- [ ] **Add packages/core from previous repository**
  - *Priority*: High
  - *Category*: Infrastructure
  - *Description*: Integrate the core package (brain/API for entire application) from previous repository
  - *Assigned*: TBD
  - *Estimated Effort*: Medium
  - *Dependencies*: None
  - *Notes*: Just get it building without errors, no need to wire it up to anything yet

- [ ] **Add packages/nodes from previous repository**
  - *Priority*: High
  - *Category*: Infrastructure
  - *Description*: Integrate the nodes package (node library) from previous repository
  - *Assigned*: TBD
  - *Estimated Effort*: Medium
  - *Dependencies*: packages/core should be added first
  - *Notes*: Just get it building without errors, no need to wire it up to anything yet

- [ ] **Replace Tailwind CSS with Mantine UI**
  - *Priority*: High
  - *Category*: Infrastructure
  - *Description*: Migrate from Tailwind CSS to Mantine UI for better data-heavy components
  - *Assigned*: TBD
  - *Estimated Effort*: Large
  - *Dependencies*: Vite migration should be complete first
  - *Notes*: Will use Compound component pattern, components will move to packages/ui

- [ ] **Move components to packages/ui**
  - *Priority*: High
  - *Category*: Infrastructure
  - *Description*: Extract UI components to shared package using Compound component pattern
  - *Assigned*: TBD
  - *Estimated Effort*: Large
  - *Dependencies*: Mantine UI migration
  - *Notes*: All building blocks should be in packages/ui with Mantine under the hood

#### Medium Priority
- [ ] **Integrate React Flow for visual editor**
  - *Priority*: Medium
  - *Category*: Feature
  - *Description*: Add React Flow library for node-based Blueprint editor
  - *Assigned*: TBD
  - *Estimated Effort*: Large
  - *Dependencies*: packages/core and packages/ui should be ready
  - *Notes*: Core feature for Blueprint visual editing

- [ ] **Implement Blueprint persistence layer**
  - *Priority*: Medium
  - *Category*: Feature
  - *Description*: Create YAML/JSON file storage for Blueprint definitions
  - *Assigned*: TBD
  - *Estimated Effort*: Medium
  - *Dependencies*: Blueprint editor should be functional
  - *Notes*: File-based storage for portability and version control

- [ ] **Build execution engine with vm2**
  - *Priority*: Medium
  - *Category*: Feature
  - *Description*: Implement sandboxed node execution environment
  - *Assigned*: TBD
  - *Estimated Effort*: Large
  - *Dependencies*: Node system should be in place
  - *Notes*: Critical for security and resource management

- [ ] **Create job queue system**
  - *Priority*: Medium
  - *Category*: Feature
  - *Description*: Implement job queuing with p-queue (initially)
  - *Assigned*: TBD
  - *Estimated Effort*: Medium
  - *Dependencies*: Execution engine should be ready
  - *Notes*: Start with p-queue, migrate to BullMQ as complexity grows

- [ ] **Add real-time monitoring with WebSockets**
  - *Priority*: Medium
  - *Category*: Feature
  - *Description*: Implement real-time job progress tracking
  - *Assigned*: TBD
  - *Estimated Effort*: Medium
  - *Dependencies*: Job queue system should be functional
  - *Notes*: Critical for user experience during job execution

#### Low Priority
- [ ] **Add Electron desktop wrapper**
  - *Priority*: Low
  - *Category*: Feature
  - *Description*: Create cross-platform desktop application
  - *Assigned*: TBD
  - *Estimated Effort*: Large
  - *Dependencies*: Core platform should be stable
  - *Notes*: Provides full file system access and native capabilities

- [ ] **Implement collaboration features**
  - *Priority*: Low
  - *Category*: Feature
  - *Description*: Add real-time collaboration for Blueprint editing
  - *Assigned*: TBD
  - *Estimated Effort*: Large
  - *Dependencies*: Blueprint editor should be mature
  - *Notes*: Future enhancement for team workflows

### ✅ Completed Tasks
*No completed tasks yet*

### 🚫 Cancelled/Deferred Tasks
*No cancelled or deferred tasks*

## How to Use This Document

### Adding New Tasks
1. Add tasks under the appropriate priority section in "Pending Tasks"
2. Include all relevant metadata (Priority, Category, Description, etc.)
3. Update the "Last Updated" date in the metadata section
4. Move tasks between sections as status changes

### Task Status Guidelines
- **Pending**: Task is identified but not yet started
- **In Progress**: Task is actively being worked on
- **Completed**: Task has been finished and verified
- **Cancelled/Deferred**: Task has been postponed or cancelled

### Priority Levels
- **High**: Critical tasks that impact core functionality or user experience
- **Medium**: Important tasks that should be completed soon
- **Low**: Nice-to-have improvements or optimizations

### Categories
- **Infrastructure**: Build tools, deployment, architecture changes
- **Feature**: New functionality or capabilities
- **Bug Fix**: Resolving existing issues
- **Documentation**: Updates to project documentation
- **Performance**: Optimizations and performance improvements
- **Security**: Security-related improvements or fixes

## Notes
- This document is maintained by the documentation team
- All team members are encouraged to add tasks and update status
- For urgent issues, create GitHub issues in addition to adding them here
- Review and update this list during sprint planning sessions