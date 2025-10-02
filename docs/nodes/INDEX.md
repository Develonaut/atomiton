# Atomiton Nodes Index

Complete reference of all available nodes in Atomiton.

## Node Categories

### Control Flow

#### [Group Node](./group.md)

Container node that groups multiple nodes together into reusable workflows.

**Use for**: Organizing workflows, creating reusable patterns, nested
hierarchies

#### [Loop Node](./loop.md)

Iterate over data collections with forEach, times, and while strategies.

**Use for**: Array processing, repeated execution, batch operations, polling

#### [Parallel Node](./parallel.md)

Execute multiple operations simultaneously with advanced concurrency control.

**Use for**: Concurrent operations, race conditions, batch processing with
limits

### Network & I/O

#### [HTTP Request Node](./http-request.md)

Make HTTP/HTTPS requests to APIs and web services.

**Use for**: REST API calls, webhooks, data fetching, external integrations

#### [File System Node](./file-system.md)

Comprehensive file and directory operations.

**Use for**: Reading/writing files, directory management, file operations

#### [Spreadsheet Node](./spreadsheet.md)

Read and parse spreadsheet files (CSV, XLSX, XLS, ODS, etc.).

**Use for**: Importing tabular data, processing Excel files, CSV parsing

### Data Processing

#### [Transform Node](./transform.md)

Powerful data transformation with 11 operations (map, filter, reduce, sort,
etc.).

**Use for**: Array manipulation, data reshaping, filtering, aggregation

#### [Edit Fields Node](./edit-fields.md)

Create or modify data fields with simple key-value pairs.

**Use for**: Setting values, adding metadata, preparing data structures

### System

#### [Shell Command Node](./shell-command.md)

Execute shell commands and scripts securely.

**Use for**: CLI tools, system commands, build automation, scripts

### Media

#### [Image Composite Node](./image-composite.md)

Combine, overlay, and manipulate images.

**Use for**: Watermarks, thumbnails, image processing, format conversion

## Node Quick Reference

| Node            | Category | Input   | Output  | Key Feature                     |
| --------------- | -------- | ------- | ------- | ------------------------------- |
| Group           | Control  | any     | any     | Container for nodes             |
| Loop            | Control  | array   | array   | Iteration (forEach/times/while) |
| Parallel        | Control  | array   | array   | Concurrent execution            |
| HTTP Request    | Network  | url     | data    | API calls                       |
| File System     | I/O      | path    | content | File operations                 |
| Spreadsheet     | I/O      | file    | records | Parse spreadsheets              |
| Transform       | Data     | array   | array   | 11 operations                   |
| Edit Fields     | Data     | object  | object  | Set field values                |
| Shell Command   | System   | program | stdout  | Run commands                    |
| Image Composite | Media    | image   | image   | Image manipulation              |

## Getting Started

### For Beginners

Start with these nodes to learn the basics:

1. **Edit Fields** - Create simple data
2. **HTTP Request** - Fetch data from APIs
3. **Transform** - Process arrays
4. **File System** - Save results

### Common Workflows

#### API to File

```
HTTP Request → Transform → File System
```

#### Batch Processing

```
File System (list) → Loop → Transform → File System (write)
```

#### Multi-Source Aggregation

```
Parallel (HTTP Requests) → Transform (merge) → File System
```

## Node Development

See [Node Development Guide](./README.md) for information on creating custom
nodes.

## Architecture

Atomiton uses a unified node architecture where:

- Everything is a `NodeDefinition`
- Nodes can contain other nodes (via `nodes` array)
- Simple execution API: `execute(node)`
- No distinction between "flows" and "nodes"

See [Architecture Documentation](../../.claude/ARCHITECTURE.md) for details.

## Terminology

**Important**: We no longer use "Atomic" or "Composite" terminology:

- **Task Nodes**: Nodes that perform operations
- **Group Nodes**: Nodes that contain other nodes

A node with a `nodes` array is a group node. That's it!

## Contributing

To add new node documentation:

1. Create a new markdown file in `docs/nodes/`
2. Follow the structure used in existing docs
3. Add entry to this index
4. Update quick reference table

## Node Documentation Template

Each node doc should include:

- **Overview** - What the node does
- **Purpose** - Why you'd use it
- **Parameters** - Configuration options
- **Input/Output** - Ports and data types
- **Use Cases** - Practical examples
- **Best Practices** - Tips and recommendations
- **Technical Notes** - Implementation details
- **Examples** - Complete code examples
- **Related Nodes** - Similar or complementary nodes

---

**Last Updated**: 2025-01-02

**Node Count**: 10 nodes

**Status**: All nodes documented ✅
