# Navigation Structure - Living Document

## Overview

This document defines the navigation structure for the Atomiton Blueprint Platform. Each main section follows a consistent pattern: an Overview page for high-level summary and quick actions, with sub-pages for drilling down into specific functionality.

---

## 📘 Blueprints

**Purpose**: Design, create, and manage automation workflows

### Overview `/blueprints`

High-level summary page providing:

- **Quick Stats**
  - Total blueprints created
  - Recently edited blueprints
  - Most used blueprints
  - Template usage statistics

- **Quick Actions**
  - Create new blueprint button
  - Quick access to recent blueprints (cards/list)
  - Import blueprint option
  - Featured templates carousel

- **At-a-Glance Information**
  - Blueprint health status (any with errors)
  - Version control status
  - Shared/collaborative blueprints
  - Blueprint categories breakdown

### Templates `/blueprints/templates`

Pre-built blueprint templates for common workflows:

- **Categories**
  - Data Processing
  - File Management
  - Image Processing
  - 3D Rendering
  - Integration Patterns
  - Custom/User Templates

- **Features**
  - Template preview
  - One-click deployment
  - Customization wizard
  - Rating/popularity metrics
  - Author information

### Nodes `/blueprints/nodes`

Node library and documentation:

- **Node Categories**
  - Input/Output nodes
  - Processing nodes
  - Transform nodes
  - Integration nodes
  - Utility nodes
  - Custom nodes

- **Features**
  - Node documentation
  - Usage examples
  - Input/output specifications
  - Configuration options
  - Version compatibility

### Browse `/blueprints/browse`

Community and marketplace exploration:

- **Discovery Features**
  - Featured blueprints
  - Popular this week/month
  - New additions
  - Categories and tags
  - Search and filter

- **Community Features**
  - User ratings and reviews
  - Download counts
  - Author profiles
  - Comments/discussions
  - Fork and customize options

---

## ⚡ Workflows

**Purpose**: Monitor, manage, and analyze running workflow instances

### Overview `/workflows`

High-level summary of workflow execution:

- **Quick Stats**
  - Active workflows
  - Queue length
  - Success/failure rates
  - Performance metrics

- **Quick Actions**
  - Create new job from blueprint
  - Pause/resume all workflows
  - Clear completed jobs
  - View recent failures

- **At-a-Glance Information**
  - System health indicators
  - Resource utilization
  - Recent job status feed
  - Performance trends mini-chart

### Analytics `/workflows/analytics`

Detailed performance and usage analytics:

- **Metrics Categories**
  - Execution metrics (time, success rate)
  - Resource usage (CPU, memory)
  - Node-level performance
  - Error analysis
  - Cost analysis (if applicable)

- **Visualization Features**
  - Time-series charts
  - Heatmaps
  - Comparison views
  - Export capabilities
  - Custom date ranges

### Queue `/workflows/queue`

Real-time queue management:

- **Queue Views**
  - Pending jobs
  - Active/running jobs
  - Completed jobs
  - Failed jobs
  - Scheduled jobs

- **Management Features**
  - Priority adjustment
  - Batch operations
  - Retry failed jobs
  - Cancel/pause jobs
  - Queue policies

---

## ⚙️ Settings

**Purpose**: Configure application, user preferences, and system settings

### Overview `/settings`

High-level settings summary and quick access:

- **Quick Settings**
  - Theme selection (Dracula variants)
  - Notification preferences
  - Default blueprint settings
  - Language/locale

- **System Status**
  - Version information
  - License status
  - Storage usage
  - API limits/quotas

- **Quick Links**
  - Most used settings
  - Recent changes
  - Recommended configurations

### Account `/settings/account`

User account and profile management:

- **Profile Settings**
  - User information
  - Avatar/profile picture
  - Bio/description
  - Public profile visibility

- **Authentication**
  - Password management
  - Two-factor authentication
  - Session management
  - API keys/tokens

### Integrations `/settings/integrations`

External service connections:

- **Available Integrations**
  - Cloud storage (S3, Google Cloud, Azure)
  - Version control (GitHub, GitLab, Bitbucket)
  - Communication (Slack, Discord, Email)
  - Databases
  - Third-party APIs

- **Integration Management**
  - Add new connections
  - Test connections
  - Manage credentials
  - Webhook configuration

### Preferences `/settings/preferences`

Application behavior and appearance:

- **UI Preferences**
  - Theme customization
  - Editor settings
  - Keyboard shortcuts
  - Notification settings

- **Workflow Preferences**
  - Default node settings
  - Auto-save intervals
  - Execution preferences
  - Debug options

### System `/settings/system`

System-level configuration (admin only):

- **System Configuration**
  - Performance tuning
  - Resource limits
  - Cache settings
  - Log levels

- **Backup & Recovery**
  - Backup schedules
  - Export/import data
  - Recovery options
  - Version management

### Security `/settings/security`

Security and compliance settings:

- **Security Features**
  - Access control
  - Audit logs
  - Compliance settings
  - Data encryption

- **Team Management** (if applicable)
  - User roles
  - Permissions
  - Team settings
  - Access logs

---

## Navigation Principles

### Consistent Patterns

1. **Overview First**: Every main section starts with an Overview page
2. **Progressive Disclosure**: Start high-level, allow drilling down
3. **Quick Actions**: Common tasks accessible from Overview pages
4. **Visual Hierarchy**: Clear parent-child relationships

### User Experience Guidelines

- **Breadcrumbs**: Show current location in hierarchy
- **Persistent State**: Remember expanded/collapsed states
- **Search**: Global search across all sections
- **Responsive**: Adapt to mobile/tablet/desktop
- **Keyboard Navigation**: Full keyboard accessibility

### Visual Design

- **Icons**: Consistent icon usage for each section
- **Active States**: Clear indication of current page
- **Hover States**: Interactive feedback
- **Transitions**: Smooth expand/collapse animations

---

## Implementation Notes

### Route Structure

```
/blueprints
  /blueprints/overview (redirects to /blueprints)
  /blueprints/templates
  /blueprints/nodes
  /blueprints/browse

/workflows
  /workflows/overview (redirects to /workflows)
  /workflows/analytics
  /workflows/queue

/settings
  /settings/overview (redirects to /settings)
  /settings/account
  /settings/integrations
  /settings/preferences
  /settings/system
  /settings/security
```

### Mobile Considerations

- Collapsible navigation drawer
- Bottom navigation for main sections
- Swipe gestures for navigation
- Simplified overview pages for mobile

### Desktop Navigation Features

- **Resizable Sidebar**: Drag the edge to resize (60px min, 500px max)
- **Collapsible State**: Toggle button to collapse/expand navigation
- **Persistent Preferences**: Navigation width and state saved in localStorage
- **Auto-collapse**: Automatically collapses when dragged below minimum width
- **Smooth Transitions**: Animated expand/collapse with visual feedback
- **Resize Handle**: Interactive resize handle with hover state

### Future Expansions

- **Marketplace**: Full marketplace for buying/selling blueprints
- **Collaboration**: Team workspaces and sharing
- **Monitoring**: Advanced monitoring and alerting
- **Documentation**: Integrated help and tutorials

---

## Changelog

### 2025-08-30

- Added resizable navigation sidebar with drag-to-resize functionality
- Implemented collapsible navigation with toggle buttons
- Added persistent state management using localStorage
- Created comprehensive Playwright tests for navigation features
- Added auto-collapse behavior when dragged below minimum width

### 2025-01-29

- Initial navigation structure defined
- Added Blueprints section with Overview, Templates, Nodes, Browse
- Added Workflows section with Overview, Analytics, Queue
- Added Settings section with Overview, Account, Integrations, Preferences, System, Security
- Established navigation principles and patterns

---

_This is a living document and will be updated as the application evolves._
