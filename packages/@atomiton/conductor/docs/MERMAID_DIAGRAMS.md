# Conductor Architecture - Mermaid Diagrams

Visual documentation of the Conductor package architecture using Mermaid
diagrams that render natively on GitHub.

## Table of Contents

- [Conductor Architecture - Mermaid Diagrams](#conductor-architecture---mermaid-diagrams)
  - [Table of Contents](#table-of-contents)
  - [Unified API Flow](#unified-api-flow)
  - [Transport Layer Architecture](#transport-layer-architecture)
  - [Electron IPC Communication](#electron-ipc-communication)
  - [Execution Pipeline](#execution-pipeline)
  - [State Management Flow](#state-management-flow)
  - [Factory Pattern Creation](#factory-pattern-creation)
  - [Blueprint Execution Flow](#blueprint-execution-flow)
  - [Error Handling Flow](#error-handling-flow)
  - [Module Dependencies](#module-dependencies)
  - [Usage in Documentation](#usage-in-documentation)
    - [Example Usage in README:](#example-usage-in-readme)
    - [Benefits of Mermaid on GitHub:](#benefits-of-mermaid-on-github)

## Unified API Flow

How the conductor provides a single API across all environments:

```mermaid
graph TD
    Start([User Code]) --> API[conductor.execute]
    API --> Detect{Environment<br/>Detection}

    Detect -->|window.electron exists| IPC[IPC Transport]
    Detect -->|window exists| HTTP[HTTP Transport]
    Detect -->|Node.js| Local[Local Transport]

    IPC --> IPCMsg[Send IPC Message]
    IPCMsg --> Main[Electron Main Process]
    Main --> LocalExec[Local Execution Engine]

    HTTP --> Fetch[Fetch API]
    Fetch --> Server[API Server]
    Server --> ServerExec[Server Execution Engine]

    Local --> DirectExec[Direct Execution Engine]

    LocalExec --> Result1[Execution Result]
    ServerExec --> Result2[Execution Result]
    DirectExec --> Result3[Execution Result]

    Result1 --> Return[Return to User]
    Result2 --> Return
    Result3 --> Return

    style API fill:#f9f,stroke:#333,stroke-width:4px
    style Detect fill:#bbf,stroke:#333,stroke-width:2px
    style Return fill:#9f9,stroke:#333,stroke-width:2px
```

## Transport Layer Architecture

Detailed transport layer showing how different environments are abstracted:

```mermaid
flowchart TB
    subgraph "Client Layer"
        UC[User Code]
        CF[createConductor Factory]
        Router[Execution Router]
    end

    subgraph "Transport Abstraction"
        ITrans[IExecutionTransport Interface]
        IPC[IPCTransport]
        HTTP[HTTPTransport]
        Local[LocalTransport]
    end

    subgraph "Execution Layer"
        Engine[Execution Engine]
        Queue[Queue System]
        Store[State Store]
        Runner[Composite Runner]
    end

    UC --> CF
    CF --> Router
    Router --> ITrans

    ITrans -.->|implements| IPC
    ITrans -.->|implements| HTTP
    ITrans -.->|implements| Local

    IPC -->|via IPC| Engine
    HTTP -->|via API| Engine
    Local -->|direct| Engine

    Engine --> Queue
    Engine --> Store
    Engine --> Runner

    style ITrans fill:#ffd,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style Router fill:#f9f,stroke:#333,stroke-width:4px
```

## Electron IPC Communication

Detailed flow of IPC communication in Electron environment:

```mermaid
sequenceDiagram
    participant UI as Renderer Process<br/>(UI)
    participant IPC as IPC Transport
    participant Chan as IPC Channel
    participant Main as Main Process
    participant Handler as Main Handler
    participant Engine as Execution Engine
    participant Node as Node.js APIs

    UI->>IPC: conductor.execute(request)
    IPC->>IPC: Generate UUID
    IPC->>Chan: Send 'conductor:execute'

    Chan->>Main: IPC Message
    Main->>Handler: Handle Message
    Handler->>Engine: Execute Blueprint

    Engine->>Node: Access File System
    Node-->>Engine: File Data
    Engine->>Node: Network Requests
    Node-->>Engine: Response

    Engine-->>Handler: Execution Result
    Handler->>Chan: Send 'conductor:result'
    Chan->>IPC: IPC Response
    IPC-->>UI: Promise Resolves

    Note over UI,Node: Renderer never directly accesses Node.js APIs
```

## Execution Pipeline

The complete execution pipeline from blueprint to result:

```mermaid
graph LR
    subgraph "Input Stage"
        Blueprint[Blueprint Definition]
        Inputs[Input Data]
        Config[Execution Config]
    end

    subgraph "Validation Stage"
        Validate[Validate Blueprint]
        BuildGraph[Build Execution Graph]
        DetectCycles[Detect Circular Deps]
    end

    subgraph "Execution Stage"
        Queue[Queue Manager]
        NodeExec[Node Executor]
        Runtime[Runtime Router]
        TSRuntime[TypeScript Runtime]
        RustRuntime[Rust Runtime]
    end

    subgraph "State Management"
        Store[(Execution Store)]
        Progress[Progress Tracking]
        Checkpoint[Checkpoints]
    end

    subgraph "Output Stage"
        Results[Execution Results]
        Metrics[Performance Metrics]
        Logs[Execution Logs]
    end

    Blueprint --> Validate
    Inputs --> Validate
    Config --> Validate

    Validate --> BuildGraph
    BuildGraph --> DetectCycles
    DetectCycles --> Queue

    Queue --> NodeExec
    NodeExec --> Runtime
    Runtime --> TSRuntime
    Runtime --> RustRuntime

    NodeExec <--> Store
    Store --> Progress
    Store --> Checkpoint

    TSRuntime --> Results
    RustRuntime --> Results
    Results --> Metrics
    Results --> Logs

    style Validate fill:#fbb,stroke:#333,stroke-width:2px
    style NodeExec fill:#bbf,stroke:#333,stroke-width:2px
    style Store fill:#ffd,stroke:#333,stroke-width:2px
```

## State Management Flow

How execution state is managed throughout the lifecycle:

```mermaid
stateDiagram-v2
    [*] --> Pending: Initialize Execution

    Pending --> Running: Start Execution
    Pending --> Cancelled: Cancel Before Start

    Running --> Paused: Pause Execution
    Running --> Completed: All Nodes Complete
    Running --> Failed: Node Failure
    Running --> Cancelled: Cancel During Run

    Paused --> Running: Resume Execution
    Paused --> Cancelled: Cancel While Paused

    Failed --> [*]: Error Handled
    Completed --> [*]: Success
    Cancelled --> [*]: Cleanup Done

    note right of Running
        Actively processing nodes
        Emitting progress events
        Updating node states
    end note

    note left of Paused
        State preserved
        Can resume from checkpoint
    end note

    note right of Failed
        Error captured
        Partial results available
        Retry possible
    end note
```

## Factory Pattern Creation

How `createConductor()` sets up the entire system:

```mermaid
flowchart TD
    Start([createConductor]) --> Config{Config<br/>Provided?}

    Config -->|Yes| UseConfig[Use Provided Config]
    Config -->|No| AutoDetect[Auto-Detect Environment]

    UseConfig --> CreateRouter[Create Execution Router]
    AutoDetect --> DetectEnv{Detect<br/>Environment}

    DetectEnv -->|Electron Renderer| CreateIPC[Create IPC Transport]
    DetectEnv -->|Browser| CreateHTTP[Create HTTP Transport]
    DetectEnv -->|Node.js| CreateLocal[Create Local Transport]

    CreateIPC --> InitIPC[Initialize IPC Listeners]
    CreateHTTP --> ConfigAPI[Configure API Endpoint]
    CreateLocal --> CreateEngine[Create Execution Engine]

    InitIPC --> Register1[Register Transport]
    ConfigAPI --> Register2[Register Transport]
    CreateEngine --> Register3[Register Transport]

    CreateRouter --> RouterReady[Router Ready]
    Register1 --> RouterReady
    Register2 --> RouterReady
    Register3 --> RouterReady

    RouterReady --> Instance[Return Conductor Instance]
    Instance --> API1[execute method]
    Instance --> API2[configureTransport method]
    Instance --> API3[shutdown method]

    style Start fill:#9f9,stroke:#333,stroke-width:4px
    style Instance fill:#f9f,stroke:#333,stroke-width:4px
    style DetectEnv fill:#bbf,stroke:#333,stroke-width:2px
```

## Blueprint Execution Flow

Detailed flow of how a blueprint is executed:

```mermaid
graph TB
    subgraph "Blueprint Processing"
        BP[Blueprint] --> Parse[Parse Definition]
        Parse --> Nodes[Extract Nodes]
        Parse --> Edges[Extract Edges]
        Parse --> Meta[Extract Metadata]
    end

    subgraph "Graph Construction"
        Nodes --> Graph[Build DAG]
        Edges --> Graph
        Graph --> Topo[Topological Sort]
        Topo --> Validate[Validate Dependencies]
    end

    subgraph "Execution Planning"
        Validate --> Plan[Create Execution Plan]
        Plan --> Parallel[Identify Parallel Groups]
        Plan --> Sequential[Identify Sequential Chains]
    end

    subgraph "Node Execution"
        Parallel --> PQueue[Parallel Queue]
        Sequential --> SQueue[Sequential Queue]
        PQueue --> Execute[Execute Node]
        SQueue --> Execute
        Execute --> Transform[Transform Data]
        Transform --> Output[Node Output]
    end

    subgraph "Data Flow"
        Output --> Next{More Nodes?}
        Next -->|Yes| Router[Route to Next Node]
        Next -->|No| Complete[Execution Complete]
        Router --> Execute
    end

    style BP fill:#f9f,stroke:#333,stroke-width:4px
    style Graph fill:#bbf,stroke:#333,stroke-width:2px
    style Execute fill:#9f9,stroke:#333,stroke-width:2px
    style Complete fill:#ffd,stroke:#333,stroke-width:4px
```

## Error Handling Flow

How errors are handled throughout the execution:

```mermaid
flowchart LR
    subgraph "Error Detection"
        Node[Node Execution] --> Try{Try Block}
        Try -->|Success| Continue[Continue Execution]
        Try -->|Error| Catch[Catch Error]
    end

    subgraph "Error Classification"
        Catch --> Type{Error Type}
        Type -->|Validation| ValErr[Validation Error]
        Type -->|Runtime| RunErr[Runtime Error]
        Type -->|Timeout| TimeErr[Timeout Error]
        Type -->|Network| NetErr[Network Error]
    end

    subgraph "Error Response"
        ValErr --> Retry{Retryable?}
        RunErr --> Retry
        TimeErr --> Retry
        NetErr --> Retry

        Retry -->|Yes| RetryLogic[Retry with Backoff]
        Retry -->|No| Fail[Mark as Failed]

        RetryLogic --> Attempt{Max<br/>Attempts?}
        Attempt -->|No| Node
        Attempt -->|Yes| Fail
    end

    subgraph "Error Reporting"
        Fail --> Log[Log Error]
        Log --> Store[Store Error State]
        Store --> Emit[Emit Error Event]
        Emit --> Return[Return Error Result]
    end

    style Catch fill:#fbb,stroke:#333,stroke-width:2px
    style Retry fill:#ffd,stroke:#333,stroke-width:2px
    style Fail fill:#f99,stroke:#333,stroke-width:4px
```

## Module Dependencies

How the conductor modules depend on each other:

```mermaid
graph BT
    subgraph "External Packages"
        Events[@atomiton/events]
        Store[@atomiton/store]
        Utils[@atomiton/utils]
        Nodes[@atomiton/nodes]
    end

    subgraph "Core Modules"
        Conductor[conductor.ts]
        Transport[transport/]
        Engine[engine/]
        Execution[execution/]
        Queue[queue/]
        StoreModule[store/]
    end

    subgraph "Runtime Modules"
        Runtime[runtime/]
        Workers[workers/]
        Electron[electron/]
    end

    Engine --> Events
    Engine --> Store
    Engine --> Execution

    Execution --> Nodes
    Execution --> Utils

    Queue --> Events
    Queue --> Utils

    StoreModule --> Store
    StoreModule --> Events

    Transport --> Engine
    Transport --> Events

    Conductor --> Transport
    Conductor --> Engine

    Runtime --> Workers
    Electron --> Transport

    style Conductor fill:#f9f,stroke:#333,stroke-width:4px
    style Events fill:#bbf,stroke:#333,stroke-width:2px
    style Store fill:#bbf,stroke:#333,stroke-width:2px
```

---

## Usage in Documentation

These Mermaid diagrams will render automatically when viewed on GitHub. You can
reference them in other documentation files or include them in README files
throughout the project.

### Example Usage in README:

```markdown
See the [Conductor Architecture Diagrams](./CONDUCTOR_MERMAID_DIAGRAMS.md) for
visual representations of how the system works.
```

### Benefits of Mermaid on GitHub:

- 🎨 **Native Rendering**: No external tools needed
- 🔄 **Version Controlled**: Diagrams update with code
- 🎯 **Interactive**: Click and zoom on GitHub
- 📱 **Responsive**: Works on all devices
- 🔗 **Linkable**: Can link to specific diagrams

These diagrams provide a clear visual understanding of the conductor's
architecture and make it easy for new developers to understand the system!
