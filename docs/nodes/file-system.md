# File System Node

## Overview

The File System Node provides comprehensive file and directory operations for
reading, writing, and managing files on the local file system. It supports
multiple operations for working with files and directories.

## Purpose

File System nodes are essential for:

- Reading and writing files
- Managing directories and file structures
- File operations (copy, move, delete)
- Checking file existence
- Listing directory contents
- Data persistence and storage

## Supported Operations

- **read** - Read file contents
- **write** - Write data to file
- **list** - List directory contents
- **exists** - Check if file/directory exists
- **create** - Create directory
- **delete** - Delete file or directory
- **copy** - Copy file or directory
- **move** - Move/rename file or directory

## Parameters

### Core Parameters

| Parameter    | Type   | Default | Description                            |
| ------------ | ------ | ------- | -------------------------------------- |
| `operation`  | enum   | "read"  | **Required**. Operation to perform     |
| `path`       | string | ""      | **Required**. File or directory path   |
| `content`    | string | -       | Content to write (for write operation) |
| `targetPath` | string | -       | Target path (for copy/move operations) |

### Operation Settings

| Parameter           | Type    | Default | Description                                 |
| ------------------- | ------- | ------- | ------------------------------------------- |
| `encoding`          | enum    | "utf8"  | File encoding (utf8, ascii, base64, etc.)   |
| `createDirectories` | boolean | true    | Auto-create parent directories when writing |
| `overwrite`         | boolean | true    | Overwrite existing files                    |
| `recursive`         | boolean | false   | Recursive operation for directories         |
| `fullPaths`         | boolean | false   | Return full paths in list operation         |

### Common Parameters (All Nodes)

| Parameter     | Type    | Default | Description                 |
| ------------- | ------- | ------- | --------------------------- |
| `enabled`     | boolean | true    | Whether node executes       |
| `timeout`     | number  | 30000   | Maximum execution time (ms) |
| `retries`     | number  | 1       | Retry attempts on failure   |
| `label`       | string  | -       | Custom node label           |
| `description` | string  | -       | Custom node description     |

## Input/Output

### Input Ports

| Port         | Type   | Required    | Description                             |
| ------------ | ------ | ----------- | --------------------------------------- |
| `path`       | string | Yes         | File or directory path                  |
| `content`    | string | Conditional | Content to write (write operation only) |
| `targetPath` | string | Conditional | Target path (copy/move only)            |

### Output Ports

Output varies by operation:

#### Read Operation

| Port       | Type   | Description           |
| ---------- | ------ | --------------------- |
| `result`   | string | File contents         |
| `content`  | string | File contents (alias) |
| `path`     | string | File path             |
| `size`     | number | File size in bytes    |
| `encoding` | string | File encoding used    |

#### Write Operation

| Port      | Type    | Description                           |
| --------- | ------- | ------------------------------------- |
| `result`  | object  | Write operation result                |
| `path`    | string  | File path written                     |
| `size`    | number  | Bytes written                         |
| `created` | boolean | Whether file was created (vs updated) |

#### List Operation

| Port     | Type     | Description               |
| -------- | -------- | ------------------------- |
| `result` | string[] | List of files/directories |
| `files`  | string[] | File names                |
| `count`  | number   | Number of items           |
| `path`   | string   | Directory path listed     |

#### Exists Operation

| Port     | Type    | Description                       |
| -------- | ------- | --------------------------------- |
| `result` | boolean | Whether path exists               |
| `exists` | boolean | Whether path exists (alias)       |
| `path`   | string  | Path checked                      |
| `type`   | string  | "file" or "directory" (if exists) |

#### Create Operation

| Port      | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| `result`  | object  | Create operation result       |
| `path`    | string  | Directory path created        |
| `created` | boolean | Whether directory was created |

#### Delete Operation

| Port      | Type    | Description                  |
| --------- | ------- | ---------------------------- |
| `result`  | object  | Delete operation result      |
| `path`    | string  | Path deleted                 |
| `deleted` | boolean | Whether successfully deleted |

#### Copy/Move Operations

| Port      | Type    | Description                 |
| --------- | ------- | --------------------------- |
| `result`  | object  | Operation result            |
| `source`  | string  | Source path                 |
| `target`  | string  | Target path                 |
| `success` | boolean | Whether operation succeeded |

## Operations in Detail

### Read

Read file contents as text:

```javascript
{
  operation: "read",
  path: "/data/input.txt",
  encoding: "utf8"
}
// Output: { content: "file contents...", size: 1024 }
```

**Use cases**: Load configuration files, read data files, import content

### Write

Write data to a file:

```javascript
{
  operation: "write",
  path: "/data/output.json",
  content: JSON.stringify({ result: "data" }),
  encoding: "utf8",
  createDirectories: true
}
// Output: { path: "/data/output.json", size: 42, created: true }
```

**Use cases**: Save results, export data, generate files

### List

List files and directories:

```javascript
{
  operation: "list",
  path: "/data",
  recursive: false,
  fullPaths: true
}
// Output: { files: ["/data/file1.txt", "/data/file2.json"], count: 2 }
```

**Use cases**: Directory scanning, file discovery, batch processing

### Exists

Check if file or directory exists:

```javascript
{
  operation: "exists",
  path: "/data/config.json"
}
// Output: { exists: true, type: "file", path: "/data/config.json" }
```

**Use cases**: Conditional processing, validation, file discovery

### Create

Create a new directory:

```javascript
{
  operation: "create",
  path: "/data/output",
  recursive: true
}
// Output: { path: "/data/output", created: true }
```

**Use cases**: Setup directory structures, organize outputs

### Delete

Delete file or directory:

```javascript
{
  operation: "delete",
  path: "/data/temp.txt",
  recursive: false
}
// Output: { path: "/data/temp.txt", deleted: true }
```

**Use cases**: Cleanup, temporary file management

### Copy

Copy file or directory:

```javascript
{
  operation: "copy",
  path: "/data/source.txt",
  targetPath: "/backup/source.txt",
  overwrite: true
}
// Output: { source: "/data/source.txt", target: "/backup/source.txt" }
```

**Use cases**: Backups, file duplication, archiving

### Move

Move or rename file/directory:

```javascript
{
  operation: "move",
  path: "/data/old-name.txt",
  targetPath: "/data/new-name.txt",
  overwrite: false
}
// Output: { source: "/data/old-name.txt", target: "/data/new-name.txt" }
```

**Use cases**: File organization, renaming, relocating

## Use Cases

### 1. Read Configuration File

```javascript
{
  type: "file-system",
  parameters: {
    operation: "read",
    path: "/config/settings.json",
    encoding: "utf8"
  }
}
```

### 2. Save API Response

```javascript
// Chain: HTTP Request → Transform → File System
{
  type: "file-system",
  parameters: {
    operation: "write",
    path: "/output/api-data.json",
    content: "{{$json.stringify($output)}}",
    createDirectories: true
  }
}
```

### 3. Batch File Processing

```javascript
// Chain: File System (list) → Loop → File System (read) → Transform → File System (write)
{
  type: "file-system",
  parameters: {
    operation: "list",
    path: "/input",
    recursive: true
  }
}
```

### 4. Conditional File Operation

```javascript
// Chain: File System (exists) → Conditional → File System (read/write)
{
  type: "file-system",
  parameters: {
    operation: "exists",
    path: "/data/cache.json"
  }
}
```

### 5. Backup Files

```javascript
{
  type: "file-system",
  parameters: {
    operation: "copy",
    path: "/data/important.db",
    targetPath: "/backups/important-2024-01-15.db",
    overwrite: false
  }
}
```

## Common Patterns

### ETL (Extract, Transform, Load)

```
File System (read) → Transform → File System (write)
```

Read data file, process it, save results.

### Batch Processing

```
File System (list) → Loop → File System (read) → Process → File System (write)
```

Process multiple files in a directory.

### Safe Write Pattern

```
File System (exists) → Conditional → File System (write/error)
```

Check before overwriting files.

### Backup Pattern

```
File System (read) → File System (copy) → Transform → File System (write)
```

Backup original before modifying.

### Directory Setup

```
File System (create) → File System (write) → File System (write)
```

Create directory structure and populate with files.

## Best Practices

### Path Management

- **Use absolute paths** - Avoid relative paths for clarity
- **Validate paths** - Check paths exist before operations
- **Handle path separators** - Use platform-appropriate separators
- **Avoid special characters** - Be cautious with special chars in filenames
- **Use descriptive names** - Make file names self-documenting

### Error Handling

- **Check exists first** - Verify files exist before reading
- **Handle permissions** - Catch permission errors gracefully
- **Validate paths** - Ensure paths are valid before operations
- **Use try-catch patterns** - Wrap operations in error handling
- **Provide meaningful errors** - Include context in error messages

### Performance

- **Minimize file operations** - Batch operations where possible
- **Use appropriate encoding** - Choose encoding based on data
- **Stream large files** - Consider streaming for large files
- **Cache file reads** - Cache frequently accessed files
- **Clean up temp files** - Remove temporary files after use

### Security

- **Validate user input** - Never trust user-provided paths
- **Restrict access** - Limit operations to specific directories
- **Check permissions** - Verify read/write permissions
- **Avoid path traversal** - Prevent ../.. attacks
- **Sanitize file names** - Remove dangerous characters from names

### Data Integrity

- **Use atomic writes** - Write to temp then rename
- **Implement backups** - Backup before destructive operations
- **Verify writes** - Confirm data written successfully
- **Handle encoding** - Be explicit about encoding
- **Use checksums** - Verify file integrity when critical

## Technical Notes

### Encoding Support

Common encodings supported:

- **utf8** - Standard text encoding (default)
- **ascii** - ASCII text
- **base64** - Base64 encoded binary
- **binary** - Raw binary data
- **hex** - Hexadecimal encoding

### Path Resolution

- Absolute paths: `/home/user/file.txt` or `C:\Users\file.txt`
- Relative paths resolved from execution context
- `~` expands to user home directory
- Environment variables supported: `$HOME/file.txt`

### File Size Limits

- No hard limit enforced
- Large files may impact memory
- Consider streaming for files > 100MB
- Monitor memory usage with large operations

### Permissions

Operations require appropriate file system permissions:

- **Read**: Requires read permission on file
- **Write**: Requires write permission on file/directory
- **Delete**: Requires write permission on parent directory
- **Create**: Requires write permission on parent directory

### Recursive Operations

When `recursive: true`:

- **List**: Lists all nested files/directories
- **Delete**: Removes directory and all contents
- **Create**: Creates all parent directories

### Atomic Operations

- Write operations are atomic when possible
- Move operations are atomic on same filesystem
- Copy operations are not atomic
- Consider using temp files for critical writes

## Error Scenarios

### File Not Found

```javascript
{
  error: "File not found",
  code: "ENOENT",
  path: "/data/missing.txt"
}
```

### Permission Denied

```javascript
{
  error: "Permission denied",
  code: "EACCES",
  path: "/protected/file.txt"
}
```

### Directory Not Empty

```javascript
{
  error: "Directory not empty",
  code: "ENOTEMPTY",
  path: "/data/folder"
}
```

### Disk Full

```javascript
{
  error: "No space left on device",
  code: "ENOSPC",
  path: "/data/large-file.dat"
}
```

## Examples

### Example 1: Read and Parse JSON File

```javascript
{
  type: "file-system",
  parameters: {
    operation: "read",
    path: "/config/app-settings.json",
    encoding: "utf8"
  }
}
// Chain with Transform to parse JSON
```

### Example 2: Write Formatted Output

```javascript
{
  type: "file-system",
  parameters: {
    operation: "write",
    path: "/reports/summary-2024-01-15.txt",
    content: "Report generated on {{$now}}\n\nTotal records: {{$count}}",
    createDirectories: true,
    overwrite: true
  }
}
```

### Example 3: Process All CSV Files

```javascript
// Step 1: List files
{
  type: "file-system",
  parameters: {
    operation: "list",
    path: "/data/csv",
    recursive: false,
    fullPaths: true
  }
}
// Step 2: Loop through files
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$output.files}}"
  }
}
// Step 3: Read each file
{
  type: "file-system",
  parameters: {
    operation: "read",
    path: "{{$item}}",
    encoding: "utf8"
  }
}
```

### Example 4: Safe File Update

```javascript
// Step 1: Check if file exists
{
  type: "file-system",
  parameters: {
    operation: "exists",
    path: "/data/state.json"
  }
}
// Step 2: Backup if exists
{
  type: "file-system",
  parameters: {
    operation: "copy",
    path: "/data/state.json",
    targetPath: "/backups/state-{{$timestamp}}.json"
  }
}
// Step 3: Write new data
{
  type: "file-system",
  parameters: {
    operation: "write",
    path: "/data/state.json",
    content: "{{$newState}}"
  }
}
```

### Example 5: Directory Cleanup

```javascript
// Delete old files
{
  type: "file-system",
  parameters: {
    operation: "delete",
    path: "/temp/cache",
    recursive: true
  }
}
// Recreate empty directory
{
  type: "file-system",
  parameters: {
    operation: "create",
    path: "/temp/cache",
    recursive: true
  }
}
```

## Related Nodes

- **Spreadsheet Node** - Read structured data from spreadsheet files
- **Transform Node** - Process file contents
- **Loop Node** - Iterate over multiple files
- **HTTP Request Node** - Download files from URLs
- **Edit Fields Node** - Prepare file paths and content

## Future Enhancements

- Streaming support for large files
- File watching and change detection
- Archive operations (zip/tar)
- File metadata operations (timestamps, permissions)
- Directory synchronization
- Glob pattern matching for file selection
- Checksums and integrity verification
- Extended attribute support
