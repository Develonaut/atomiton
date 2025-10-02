# Spreadsheet Node

## Overview

The Spreadsheet Node reads and parses spreadsheet files in multiple formats
including CSV, XLSX, XLS, XLSB, ODS, and FODS. It converts spreadsheet data into
structured JSON arrays for processing in workflows.

## Purpose

Spreadsheet nodes are essential for:

- Reading Excel and CSV files
- Importing tabular data
- Data migration from spreadsheets
- Processing financial data
- Batch data imports
- Report processing

## Supported Formats

- **CSV** - Comma-separated values
- **XLSX** - Excel 2007+ (XML-based)
- **XLS** - Excel 97-2003 (Binary)
- **XLSB** - Excel Binary Workbook
- **ODS** - OpenDocument Spreadsheet
- **FODS** - Flat OpenDocument Spreadsheet

## Parameters

### Core Parameters

| Parameter        | Type    | Default | Description                       |
| ---------------- | ------- | ------- | --------------------------------- |
| `hasHeaders`     | boolean | true    | First row contains column headers |
| `delimiter`      | string  | ","     | CSV delimiter character           |
| `skipEmptyLines` | boolean | true    | Skip empty rows                   |
| `sheetIndex`     | number  | 0       | Sheet index to read (0-based)     |

### Common Parameters

| Parameter     | Type    | Default | Description                 |
| ------------- | ------- | ------- | --------------------------- |
| `enabled`     | boolean | true    | Whether node executes       |
| `timeout`     | number  | 30000   | Maximum execution time (ms) |
| `label`       | string  | -       | Custom node label           |
| `description` | string  | -       | Custom node description     |

## Input/Output

### Input Ports

| Port       | Type   | Required    | Description                  |
| ---------- | ------ | ----------- | ---------------------------- |
| `filePath` | string | Conditional | Path to spreadsheet file     |
| `data`     | string | Conditional | Raw spreadsheet data content |

Note: Provide either `filePath` or `data`, not both.

### Output Ports

| Port        | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| `records`   | array  | Parsed data as array of objects |
| `headers`   | array  | Column headers                  |
| `rowCount`  | number | Number of data rows             |
| `sheetName` | string | Name of sheet read              |

## Output Format

### With Headers (hasHeaders: true)

```javascript
{
  records: [
    { name: "Alice", age: 30, city: "Portland" },
    { name: "Bob", age: 25, city: "Seattle" },
    { name: "Carol", age: 35, city: "Denver" }
  ],
  headers: ["name", "age", "city"],
  rowCount: 3,
  sheetName: "Sheet1"
}
```

### Without Headers (hasHeaders: false)

```javascript
{
  records: [
    ["Alice", 30, "Portland"],
    ["Bob", 25, "Seattle"],
    ["Carol", 35, "Denver"]
  ],
  headers: [],
  rowCount: 3,
  sheetName: "Sheet1"
}
```

## Use Cases

### 1. Import Customer Data

```javascript
{
  type: "spreadsheet",
  parameters: {
    hasHeaders: true,
    skipEmptyLines: true,
    sheetIndex: 0
  },
  inputs: {
    filePath: "/data/customers.xlsx"
  }
}
// Chain with Loop to process each customer
```

### 2. Process CSV Report

```javascript
{
  type: "spreadsheet",
  parameters: {
    delimiter: ",",
    hasHeaders: true,
    skipEmptyLines: true
  },
  inputs: {
    filePath: "/reports/sales-data.csv"
  }
}
```

### 3. Read Specific Sheet

```javascript
{
  type: "spreadsheet",
  parameters: {
    hasHeaders: true,
    sheetIndex: 2  // Read third sheet
  },
  inputs: {
    filePath: "/workbooks/financial-report.xlsx"
  }
}
```

### 4. Process TSV File

```javascript
{
  type: "spreadsheet",
  parameters: {
    delimiter: "\t",  // Tab-separated
    hasHeaders: true
  },
  inputs: {
    filePath: "/data/export.tsv"
  }
}
```

### 5. Raw Data Import

```javascript
{
  type: "spreadsheet",
  parameters: {
    delimiter: ",",
    hasHeaders: true
  },
  inputs: {
    data: "{{$csvContent}}"  // From HTTP request or other source
  }
}
```

## Common Patterns

### ETL Pipeline

```
Spreadsheet (read) → Transform (clean) → Loop (process) → File System (write)
```

### Data Import

```
Spreadsheet → Transform (validate) → HTTP Request (import to API)
```

### Batch Processing

```
Spreadsheet → Loop (forEach) → Process each record → Collect results
```

### Data Migration

```
Spreadsheet (read) → Transform (map fields) → Database Insert
```

## Best Practices

### File Handling

- **Validate format** - Check file extension matches format
- **Handle large files** - Be aware of memory limits
- **Use absolute paths** - Avoid path resolution issues
- **Check file exists** - Use File System node to verify
- **Close files properly** - Ensure resources are released

### Data Quality

- **Validate headers** - Check expected columns present
- **Handle missing data** - Deal with empty cells
- **Trim whitespace** - Clean string data
- **Validate types** - Check data types match expectations
- **Skip invalid rows** - Filter out bad data

### Performance

- **Read once** - Cache results if reusing data
- **Process in batches** - Use Loop node with batching
- **Filter early** - Remove unnecessary rows early
- **Limit columns** - Only read needed columns (future)
- **Use CSV for speed** - CSV is faster than XLSX

### Memory

- **Stream large files** - Consider streaming for files > 100MB
- **Process in chunks** - Don't load entire dataset at once
- **Clean up** - Release memory after processing
- **Monitor usage** - Watch memory with large files

## Technical Notes

### Format Detection

File format auto-detected from:

1. File extension (.csv, .xlsx, etc.)
2. Content inspection (if extension missing)
3. Defaults to CSV if uncertain

### CSV Parsing

- Handles quoted fields
- Escapes double quotes (RFC 4180)
- Supports custom delimiters
- Handles various line endings (CRLF, LF)

### Excel Parsing

- Reads all cell types (string, number, date, formula)
- Formula results extracted (not formulas themselves)
- Dates converted to ISO strings
- Merged cells handled

### Empty Cells

- Empty cells become `null` in objects
- Empty cells become `""` (empty string) in arrays
- Can skip entire empty rows with `skipEmptyLines`

### Performance Characteristics

| Format | Speed  | Memory Usage |
| ------ | ------ | ------------ |
| CSV    | Fast   | Low          |
| XLSX   | Medium | Medium       |
| XLS    | Slow   | Medium       |
| XLSB   | Fast   | Low          |
| ODS    | Medium | Medium       |

## Error Scenarios

### File Not Found

```javascript
{
  error: "File not found",
  path: "/data/missing.xlsx"
}
```

### Invalid Format

```javascript
{
  error: "Unsupported file format",
  path: "/data/document.pdf"
}
```

### Parse Error

```javascript
{
  error: "Failed to parse spreadsheet",
  reason: "Invalid CSV structure at line 42"
}
```

### Sheet Not Found

```javascript
{
  error: "Sheet index out of bounds",
  sheetIndex: 5,
  availableSheets: 3
}
```

## Examples

### Example 1: Customer Import Pipeline

```javascript
// Step 1: Read spreadsheet
{
  type: "spreadsheet",
  parameters: {
    hasHeaders: true,
    skipEmptyLines: true
  },
  inputs: {
    filePath: "/imports/customers.xlsx"
  }
}

// Step 2: Validate and clean
{
  type: "transform",
  parameters: {
    operation: "filter",
    transformFunction: "item => item.email && item.name"
  }
}

// Step 3: Process each customer
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$output.records}}"
  },
  nodes: [
    {
      type: "http-request",
      parameters: {
        url: "https://api.example.com/customers",
        method: "POST",
        body: "{{$item}}"
      }
    }
  ]
}
```

### Example 2: Financial Report Processing

```javascript
{
  type: "spreadsheet",
  parameters: {
    hasHeaders: true,
    sheetIndex: 0  // Summary sheet
  },
  inputs: {
    filePath: "/reports/Q4-2024.xlsx"
  }
}

// Transform to extract summary
{
  type: "transform",
  parameters: {
    operation: "reduce",
    transformFunction: "({ acc, item }) => acc + item.amount",
    reduceInitial: "0"
  }
}
```

### Example 3: CSV Export Processing

```javascript
// Download CSV from API
{
  type: "http-request",
  parameters: {
    url: "https://api.example.com/export.csv",
    method: "GET"
  }
}

// Parse CSV data
{
  type: "spreadsheet",
  parameters: {
    delimiter: ",",
    hasHeaders: true,
    skipEmptyLines: true
  },
  inputs: {
    data: "{{$output.data}}"
  }
}

// Process records
{
  type: "transform",
  parameters: {
    operation: "map",
    transformFunction: "item => processRecord(item)"
  }
}
```

### Example 4: Multi-Sheet Processing

```javascript
{
  type: "loop",
  parameters: {
    loopType: "times",
    count: 3  // 3 sheets
  },
  nodes: [
    {
      type: "spreadsheet",
      parameters: {
        hasHeaders: true,
        sheetIndex: "{{$index}}"
      },
      inputs: {
        filePath: "/workbook.xlsx"
      }
    },
    {
      type: "file-system",
      parameters: {
        operation: "write",
        path: "/output/sheet-{{$index}}.json"
      }
    }
  ]
}
```

## Related Nodes

- **File System Node** - Read file to pass to Spreadsheet node
- **Transform Node** - Process spreadsheet data
- **Loop Node** - Iterate over records
- **HTTP Request Node** - Download spreadsheets from URLs
- **Edit Fields Node** - Add metadata to records

## Future Enhancements

- Write operations (create spreadsheets)
- Column selection/filtering
- Row range specification
- Formula evaluation
- Style and formatting preservation
- Multiple sheet reading
- Streaming for very large files
- Data type inference and conversion
- Cell address notation support
- Named range support
