# Shell Command Node

## Overview

The Shell Command Node executes shell commands and scripts securely using a
structured command format. It provides controlled access to system operations
with output capture and error handling.

## Purpose

Shell Command nodes are essential for:

- Running CLI tools and utilities
- Executing system commands
- Running scripts (bash, python, node, etc.)
- System administration tasks
- Build and deployment automation
- Integration with command-line tools

## Security Model

Uses structured command format (program + arguments) to prevent shell injection:

- **program**: Executable name or path
- **args**: Array of arguments

This approach prevents command injection attacks compared to raw shell strings.

## Parameters

### Core Parameters

| Parameter       | Type    | Default | Description                              |
| --------------- | ------- | ------- | ---------------------------------------- |
| `program`       | string  | ""      | **Required**. Program/command to execute |
| `args`          | array   | []      | Array of command arguments               |
| `timeout`       | number  | 30000   | Command timeout in milliseconds          |
| `captureOutput` | boolean | true    | Capture stdout and stderr                |

### Common Parameters

| Parameter     | Type    | Default | Description             |
| ------------- | ------- | ------- | ----------------------- |
| `enabled`     | boolean | true    | Whether node executes   |
| `label`       | string  | -       | Custom node label       |
| `description` | string  | -       | Custom node description |

## Input/Output

### Input Ports

| Port      | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| `program` | string | Yes      | Program to execute |
| `args`    | array  | No       | Command arguments  |

### Output Ports

| Port       | Type    | Description                     |
| ---------- | ------- | ------------------------------- |
| `result`   | object  | Complete execution result       |
| `stdout`   | string  | Standard output                 |
| `stderr`   | string  | Standard error output           |
| `exitCode` | number  | Process exit code (0 = success) |
| `success`  | boolean | Whether command succeeded       |
| `duration` | number  | Execution time in milliseconds  |
| `command`  | string  | Full command that was executed  |

## Use Cases

### 1. Run CLI Tool

```javascript
{
  type: "shell-command",
  parameters: {
    program: "curl",
    args: [
      "-X", "GET",
      "https://api.example.com/data",
      "-H", "Authorization: Bearer token"
    ],
    timeout: 30000
  }
}
```

### 2. Execute Script

```javascript
{
  type: "shell-command",
  parameters: {
    program: "python3",
    args: [
      "/scripts/process-data.py",
      "--input", "/data/input.csv",
      "--output", "/data/output.json"
    ],
    timeout: 60000
  }
}
```

### 3. Git Operations

```javascript
{
  type: "shell-command",
  parameters: {
    program: "git",
    args: ["status", "--porcelain"],
    timeout: 5000
  }
}
```

### 4. File Operations

```javascript
{
  type: "shell-command",
  parameters: {
    program: "tar",
    args: [
      "-czf",
      "/backups/archive.tar.gz",
      "/data/files"
    ],
    timeout: 120000
  }
}
```

### 5. Build Commands

```javascript
{
  type: "shell-command",
  parameters: {
    program: "npm",
    args: ["run", "build"],
    timeout: 300000  // 5 minutes
  }
}
```

## Common Patterns

### Pipeline Pattern

```
Shell Command → Transform stdout → Process results
```

### Conditional Execution

```
Shell Command (check) → Conditional → Shell Command (action)
```

### Error Handling

```
Shell Command → Check exitCode → Success/Failure paths
```

### Chained Commands

```
Shell Command 1 → Shell Command 2 → Shell Command 3
```

## Best Practices

### Security

- **Never trust user input** - Validate all inputs
- **Use argument array** - Don't concatenate into shell string
- **Avoid shell operators** - No pipes, redirects in arguments
- **Validate program paths** - Whitelist allowed programs
- **Run with minimal privileges** - Use least privilege principle
- **Sanitize file paths** - Prevent path traversal attacks

### Error Handling

- **Check exit codes** - 0 = success, non-zero = error
- **Capture stderr** - Read error messages
- **Set timeouts** - Prevent hanging processes
- **Handle failures gracefully** - Provide fallback behavior
- **Log commands** - Track what was executed

### Performance

- **Set appropriate timeouts** - Balance completion time vs hanging
- **Avoid unnecessary captures** - Disable output capture if not needed
- **Use efficient tools** - Choose performant CLI tools
- **Clean up processes** - Ensure processes terminate
- **Monitor resource usage** - Watch CPU and memory

### Command Design

- **Keep commands simple** - One operation per node
- **Use absolute paths** - Avoid relying on PATH
- **Specify full options** - Don't rely on defaults
- **Document dependencies** - List required tools/versions
- **Test thoroughly** - Verify on target platforms

## Technical Notes

### Program Resolution

Programs are resolved in this order:

1. Absolute path: `/usr/bin/node`
2. Relative to working directory: `./script.sh`
3. System PATH: `git`, `npm`, `python3`

### Working Directory

Commands execute in the workflow's working directory or a configured directory.

### Environment Variables

Commands inherit process environment variables. Can be extended with env
parameters (future enhancement).

### Output Handling

- **stdout**: Normal program output
- **stderr**: Error messages and diagnostics
- **Combined**: Both streams captured if captureOutput: true

### Exit Codes

Standard Unix conventions:

- **0**: Success
- **1**: General errors
- **2**: Misuse of shell command
- **126**: Command cannot execute
- **127**: Command not found
- **128+**: Fatal error signal (130 = Ctrl+C)

### Process Management

- Processes spawn in separate process
- Timeout enforced with SIGTERM then SIGKILL
- Zombie processes prevented
- Output buffers have reasonable limits

## Security Considerations

### Safe Pattern (Recommended)

```javascript
{
  program: "git",
  args: ["clone", userProvidedUrl, "/safe/path"]
}
// Arguments are passed safely, no shell interpretation
```

### Unsafe Pattern (Avoid)

```javascript
// DON'T DO THIS
{
  program: "sh",
  args: ["-c", `git clone ${userProvidedUrl} /path`]
}
// Shell interprets string, vulnerable to injection
```

### Command Whitelist

Consider implementing a whitelist:

```javascript
const ALLOWED_PROGRAMS = [
  "git",
  "npm",
  "node",
  "python3",
  "/usr/local/bin/custom-tool",
];

if (!ALLOWED_PROGRAMS.includes(program)) {
  throw new Error("Program not allowed");
}
```

## Error Scenarios

### Command Not Found

```javascript
{
  error: "Command not found",
  exitCode: 127,
  stderr: "sh: nonexistent-command: command not found",
  success: false
}
```

### Permission Denied

```javascript
{
  error: "Permission denied",
  exitCode: 126,
  stderr: "sh: /path/to/script: Permission denied",
  success: false
}
```

### Timeout

```javascript
{
  error: "Command timeout",
  timeout: 30000,
  success: false,
  killed: true
}
```

### Command Failed

```javascript
{
  exitCode: 1,
  stderr: "Error: Something went wrong",
  stdout: "",
  success: false
}
```

## Examples

### Example 1: Run Tests

```javascript
{
  type: "shell-command",
  parameters: {
    program: "npm",
    args: ["test"],
    timeout: 60000,
    captureOutput: true
  }
}
// Check exitCode === 0 for success
// Parse stdout for test results
```

### Example 2: Database Backup

```javascript
{
  type: "shell-command",
  parameters: {
    program: "pg_dump",
    args: [
      "-h", "localhost",
      "-U", "postgres",
      "-d", "mydb",
      "-f", "/backups/dump.sql"
    ],
    timeout: 600000  // 10 minutes
  }
}
```

### Example 3: Image Processing

```javascript
{
  type: "shell-command",
  parameters: {
    program: "convert",  // ImageMagick
    args: [
      "/input/image.jpg",
      "-resize", "800x600",
      "-quality", "85",
      "/output/image.jpg"
    ],
    timeout: 30000
  }
}
```

### Example 4: Check Git Status

```javascript
{
  type: "shell-command",
  parameters: {
    program: "git",
    args: ["status", "--porcelain"],
    timeout: 5000
  }
}
// Parse stdout to check for changes
// Empty stdout = clean working directory
```

### Example 5: Custom Script with Arguments

```javascript
{
  type: "shell-command",
  parameters: {
    program: "python3",
    args: [
      "/scripts/process.py",
      "--input", "{{$inputPath}}",
      "--output", "{{$outputPath}}",
      "--format", "json",
      "--verbose"
    ],
    timeout: 120000
  }
}
```

## Related Nodes

- **File System Node** - Alternative for file operations
- **HTTP Request Node** - Alternative for network requests
- **Transform Node** - Process command output
- **Loop Node** - Run commands repeatedly
- **Group Node** - Chain multiple commands

## Platform Considerations

### Cross-Platform

For cross-platform workflows:

- Use portable commands (node, python, etc.)
- Avoid shell-specific features
- Test on all target platforms
- Consider using Node.js for scripts instead

### Windows

- Use `cmd.exe` or `powershell.exe` as program
- Pass script as arguments
- Handle path separators (backslash)
- Some Unix tools unavailable

### Unix/Linux/macOS

- Rich set of standard tools available
- Bash scripting support
- Case-sensitive file system
- Standard Unix conventions

## Future Enhancements

- Environment variable configuration
- Working directory specification
- Input stream (stdin) support
- Streaming output
- Interactive command support
- Shell selection (bash, zsh, etc.)
- User/group specification
- Resource limits (CPU, memory)
