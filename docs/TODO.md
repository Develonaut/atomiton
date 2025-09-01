# TODO List

## Project Metadata

- **Created**: September 1, 2025
- **Maintained by**: Barbara (Documentation Specialist)
- **Last Updated**: December 30, 2024
- **Purpose**: Track ongoing tasks and improvements for the Atomiton project

## Task Categories

### 🔄 In Progress

_No tasks currently in progress_

### 📋 Pending Tasks

#### High Priority

- [ ] **Replace Next.js with Vite in web application**
  - _Priority_: High
  - _Category_: Infrastructure
  - _Description_: Migrate the web application from Next.js to Vite for improved development experience and build performance
  - _Assigned_: TBD
  - _Estimated Effort_: 11 days (per migration strategy)
  - _Dependencies_: None identified
  - _Strategy Document_: [`/docs/strategies/nextjs-to-vite-migration.md`](/docs/strategies/nextjs-to-vite-migration.md)
  - _Notes_: Comprehensive migration strategy available with 5-phase approach, risk assessment, and rollback plans

- [ ] **Add packages/core from previous repository**
  - _Priority_: High
  - _Category_: Infrastructure
  - _Description_: Integrate the core package (brain/API for entire application) from previous repository
  - _Assigned_: TBD
  - _Estimated Effort_: Medium
  - _Dependencies_: None
  - _Notes_: Just get it building without errors, no need to wire it up to anything yet

- [ ] **Add packages/nodes from previous repository**
  - _Priority_: High
  - _Category_: Infrastructure
  - _Description_: Integrate the nodes package (node library) from previous repository
  - _Assigned_: TBD
  - _Estimated Effort_: Medium
  - _Dependencies_: packages/core should be added first
  - _Notes_: Just get it building without errors, no need to wire it up to anything yet

- [ ] **Replace Tailwind CSS with Mantine UI**
  - _Priority_: High
  - _Category_: Infrastructure
  - _Description_: Migrate from Tailwind CSS to Mantine UI for better data-heavy components
  - _Assigned_: TBD
  - _Estimated Effort_: 11 days (per migration strategy)
  - _Dependencies_: Vite migration should be complete first
  - _Strategy Document_: [`/docs/strategies/tailwind-to-mantine-migration.md`](/docs/strategies/tailwind-to-mantine-migration.md)
  - _Notes_: Comprehensive migration strategy available with 6-phase approach, visual regression testing, and rollback plans. Will use Compound component pattern, components will move to packages/ui

- [ ] **Move components to packages/ui**
  - _Priority_: High
  - _Category_: Infrastructure
  - _Description_: Extract UI components to shared package using Compound component pattern
  - _Assigned_: TBD
  - _Estimated Effort_: Large
  - _Dependencies_: Mantine UI migration
  - _Notes_: All building blocks should be in packages/ui with Mantine under the hood

#### Medium Priority

- [ ] **Integrate React Flow for visual editor**
  - _Priority_: Medium
  - _Category_: Feature
  - _Description_: Add React Flow library for node-based Blueprint editor
  - _Assigned_: TBD
  - _Estimated Effort_: Large
  - _Dependencies_: packages/core and packages/ui should be ready
  - _Notes_: Core feature for Blueprint visual editing

- [ ] **Implement Blueprint persistence layer**
  - _Priority_: Medium
  - _Category_: Feature
  - _Description_: Create YAML/JSON file storage for Blueprint definitions
  - _Assigned_: TBD
  - _Estimated Effort_: Medium
  - _Dependencies_: Blueprint editor should be functional
  - _Notes_: File-based storage for portability and version control

- [ ] **Build execution engine with vm2**
  - _Priority_: Medium
  - _Category_: Feature
  - _Description_: Implement sandboxed node execution environment
  - _Assigned_: TBD
  - _Estimated Effort_: Large
  - _Dependencies_: Node system should be in place
  - _Notes_: Critical for security and resource management

- [ ] **Create job queue system**
  - _Priority_: Medium
  - _Category_: Feature
  - _Description_: Implement job queuing with p-queue (initially)
  - _Assigned_: TBD
  - _Estimated Effort_: Medium
  - _Dependencies_: Execution engine should be ready
  - _Notes_: Start with p-queue, migrate to BullMQ as complexity grows

- [ ] **Add real-time monitoring with WebSockets**
  - _Priority_: Medium
  - _Category_: Feature
  - _Description_: Implement real-time job progress tracking
  - _Assigned_: TBD
  - _Estimated Effort_: Medium
  - _Dependencies_: Job queue system should be functional
  - _Notes_: Critical for user experience during job execution

#### Low Priority

- [ ] **Add Electron desktop wrapper**
  - _Priority_: Low
  - _Category_: Feature
  - _Description_: Create cross-platform desktop application
  - _Assigned_: TBD
  - _Estimated Effort_: Large
  - _Dependencies_: Core platform should be stable
  - _Notes_: Provides full file system access and native capabilities

- [ ] **Implement collaboration features**
  - _Priority_: Low
  - _Category_: Feature
  - _Description_: Add real-time collaboration for Blueprint editing
  - _Assigned_: TBD
  - _Estimated Effort_: Large
  - _Dependencies_: Blueprint editor should be mature
  - _Notes_: Future enhancement for team workflows

### ✅ Completed Tasks

- [x] **Implement Husky pre-commit hooks** _(Completed: December 30, 2024)_
  - _Priority_: High (FIRST PRIORITY)
  - _Category_: Infrastructure
  - _Description_: Set up Husky to automatically format, lint-fix, then run lint and typecheck on all staged files
  - _Assigned_: Jeeves (CI/CD Specialist)
  - _Estimated Effort_: Small
  - _Implementation Details_:
    - Installed Husky 9.1.7 for pnpm monorepo
    - Configured pre-commit hooks with format, lint, typecheck, and build checks
    - Fixed 7 ESLint warnings (empty object patterns)
    - Standardized lint configuration with `--max-warnings 0`
    - All quality checks now pass with exit code 0
  - _Outcome_: Successfully prevents commits with errors, ensures code quality standards

### 🚫 Cancelled/Deferred Tasks

_No cancelled or deferred tasks_

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
