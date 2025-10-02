# HTTP Request Node

## Overview

The HTTP Request Node makes HTTP/HTTPS requests to external APIs and web
services. It supports all standard HTTP methods and provides comprehensive
control over headers, authentication, request body, and response handling.

## Purpose

HTTP Request nodes are essential for:

- Calling REST APIs and web services
- Fetching data from external sources
- Sending data to remote servers
- Integrating with third-party services
- Webhooks and API automation

## Supported Methods

- **GET** - Retrieve data
- **POST** - Create/submit data
- **PUT** - Update data
- **DELETE** - Remove data

## Parameters

### Request Configuration

| Parameter | Type          | Default | Description                              |
| --------- | ------------- | ------- | ---------------------------------------- |
| `url`     | string        | -       | **Required**. Target URL for the request |
| `method`  | enum          | "GET"   | HTTP method (GET, POST, PUT, DELETE)     |
| `headers` | object        | {}      | Custom HTTP headers as key-value pairs   |
| `body`    | string/object | -       | Request body (for POST/PUT methods)      |
| `params`  | object        | -       | URL query parameters as key-value pairs  |

### Authentication

| Parameter       | Type   | Default | Description                         |
| --------------- | ------ | ------- | ----------------------------------- |
| `auth.type`     | enum   | -       | Authentication type (basic, bearer) |
| `auth.username` | string | -       | Username (for basic auth)           |
| `auth.password` | string | -       | Password (for basic auth)           |
| `auth.token`    | string | -       | Bearer token (for bearer auth)      |

### Advanced Settings (MVP Defaults)

| Parameter         | Type    | Default | Description                           |
| ----------------- | ------- | ------- | ------------------------------------- |
| `followRedirects` | boolean | true    | Follow HTTP redirects automatically   |
| `validateSSL`     | boolean | true    | Validate SSL certificates             |
| `timeout`         | number  | 30000   | Request timeout in milliseconds       |
| `retries`         | number  | 0       | Number of retry attempts on failure   |
| `retryDelay`      | number  | 1000    | Delay between retries in milliseconds |

### Common Parameters (All Nodes)

| Parameter     | Type    | Default | Description             |
| ------------- | ------- | ------- | ----------------------- |
| `enabled`     | boolean | true    | Whether node executes   |
| `label`       | string  | -       | Custom node label       |
| `description` | string  | -       | Custom node description |

## Input/Output

### Input Ports

| Port      | Type          | Required | Description           |
| --------- | ------------- | -------- | --------------------- |
| `url`     | string        | Yes      | URL to request        |
| `method`  | string        | No       | HTTP method           |
| `headers` | object        | No       | Request headers       |
| `body`    | string/object | No       | Request body          |
| `params`  | object        | No       | Query parameters      |
| `auth`    | object        | No       | Authentication config |

### Output Ports

| Port         | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| `result`     | any     | Parsed response data                       |
| `data`       | any     | Same as result (alias)                     |
| `status`     | number  | HTTP status code (200, 404, etc.)          |
| `statusText` | string  | HTTP status text ("OK", "Not Found", etc.) |
| `headers`    | object  | Response headers                           |
| `success`    | boolean | Whether request succeeded (status 2xx)     |
| `ok`         | boolean | Same as success (alias)                    |
| `duration`   | number  | Request duration in milliseconds           |
| `url`        | string  | Final URL (after redirects)                |

## Authentication Methods

### Basic Authentication

Sends username and password via HTTP Basic Auth header:

```javascript
{
  auth: {
    type: "basic",
    username: "user@example.com",
    password: "secret123"
  }
}
```

Generates header: `Authorization: Basic <base64(username:password)>`

### Bearer Token

Sends a bearer token in the Authorization header:

```javascript
{
  auth: {
    type: "bearer",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Generates header: `Authorization: Bearer <token>`

### Custom Headers

For other authentication schemes, use custom headers:

```javascript
{
  headers: {
    "X-API-Key": "your-api-key",
    "X-Custom-Auth": "custom-value"
  }
}
```

## Request Body Handling

### JSON Body (Automatic)

Objects are automatically serialized to JSON:

```javascript
{
  method: "POST",
  body: {
    name: "John Doe",
    email: "john@example.com"
  }
}
// Automatically adds: Content-Type: application/json
```

### String Body

Send raw string data:

```javascript
{
  method: "POST",
  body: '{"raw": "json string"}',
  headers: {
    "Content-Type": "application/json"
  }
}
```

### Form Data

Send form-encoded data:

```javascript
{
  method: "POST",
  body: "key1=value1&key2=value2",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
}
```

## Response Handling

The node automatically parses responses based on Content-Type:

### JSON Responses

```javascript
// Response with Content-Type: application/json
{
  result: { id: 123, name: "Product" },
  status: 200,
  success: true
}
```

### Text Responses

```javascript
// Response with Content-Type: text/plain
{
  result: "Plain text response",
  status: 200,
  success: true
}
```

### Error Responses

```javascript
// Failed request
{
  result: null,
  status: 404,
  statusText: "Not Found",
  success: false,
  ok: false
}
```

## Use Cases

### 1. Fetch Data from API

Simple GET request to retrieve data:

```javascript
{
  type: "http-request",
  parameters: {
    method: "GET",
    url: "https://api.example.com/users",
    headers: {
      "Accept": "application/json"
    }
  }
}
```

### 2. Submit Form Data

POST request to create a resource:

```javascript
{
  type: "http-request",
  parameters: {
    method: "POST",
    url: "https://api.example.com/users",
    body: {
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin"
    },
    auth: {
      type: "bearer",
      token: "your-api-token"
    }
  }
}
```

### 3. Query Parameters

GET request with query parameters:

```javascript
{
  type: "http-request",
  parameters: {
    method: "GET",
    url: "https://api.example.com/search",
    params: {
      q: "atomiton",
      limit: "10",
      offset: "0"
    }
  }
}
// Results in: https://api.example.com/search?q=atomiton&limit=10&offset=0
```

### 4. Update Resource

PUT request to update existing data:

```javascript
{
  type: "http-request",
  parameters: {
    method: "PUT",
    url: "https://api.example.com/users/123",
    body: {
      name: "Updated Name",
      email: "updated@example.com"
    },
    headers: {
      "X-API-Key": "your-api-key"
    }
  }
}
```

### 5. Delete Resource

DELETE request to remove data:

```javascript
{
  type: "http-request",
  parameters: {
    method: "DELETE",
    url: "https://api.example.com/users/123",
    auth: {
      type: "bearer",
      token: "your-api-token"
    }
  }
}
```

## Common Patterns

### API Pipeline

```
HTTP Request → Transform → Edit Fields → HTTP Request
```

Fetch data, transform it, prepare payload, send to another API.

### Retry Logic

```javascript
{
  type: "http-request",
  parameters: {
    url: "https://unreliable-api.com/data",
    retries: 3,
    retryDelay: 2000,
    timeout: 10000
  }
}
```

Handle flaky APIs with automatic retries.

### Multiple API Calls

```
Group (parallel: true)
├── HTTP Request - API 1
├── HTTP Request - API 2
└── HTTP Request - API 3
    └── Transform - Merge results
```

Fetch from multiple sources in parallel.

### Error Handling

```
HTTP Request
├── Success → Process data
└── Error → Fallback action
```

Handle different response scenarios.

## Best Practices

### Security

- **Never hardcode secrets** - Use environment variables or secure storage
- **Use HTTPS** - Always use secure connections for sensitive data
- **Validate SSL** - Keep SSL validation enabled in production
- **Rotate tokens** - Regularly rotate API keys and tokens
- **Limit permissions** - Use least-privilege API tokens

### Performance

- **Set appropriate timeouts** - Balance between reliability and responsiveness
- **Use connection pooling** - Reuse connections when making multiple requests
- **Enable retries cautiously** - Only retry idempotent operations
- **Cache responses** - Cache GET responses when appropriate
- **Use parallel execution** - Make independent requests in parallel

### Error Handling

- **Check status codes** - Always validate response status
- **Handle timeouts** - Implement proper timeout handling
- **Log failures** - Log request failures with context
- **Implement fallbacks** - Provide fallback data sources
- **Validate responses** - Verify response structure matches expectations

### Request Design

- **Use appropriate methods** - Follow REST conventions (GET for read, POST for
  create, etc.)
- **Include proper headers** - Set Content-Type, Accept, and custom headers
- **Structure URLs cleanly** - Use path parameters and query strings
  appropriately
- **Version APIs** - Include API version in URL or headers
- **Document dependencies** - Document which external APIs your workflow uses

## Technical Notes

### URL Validation

All URLs are validated before execution:

- Must be valid HTTP/HTTPS URLs
- Protocol is required (http:// or https://)
- Hostname must be valid

### Query Parameter Encoding

Query parameters are automatically URL-encoded:

- Special characters are escaped
- Spaces become %20
- Existing query strings in URL are preserved

### Header Management

Headers are merged in this order (later overrides earlier):

1. Default headers (User-Agent, Accept)
2. Config headers
3. Input headers
4. Authentication headers

### Response Size Limits

- No hard limit enforced
- Large responses may impact memory
- Consider streaming for large files (future enhancement)

### Timeout Behavior

- Default: 30 seconds
- Aborts request when timeout reached
- Throws timeout error
- Retries (if configured) will restart the timer

### SSL/TLS

- Validates certificates by default
- Uses system certificate store
- Can disable validation (not recommended for production)

## Error Scenarios

### Network Errors

```javascript
// DNS resolution failed, connection refused, etc.
{
  error: "Network request failed",
  code: "NETWORK_ERROR"
}
```

### Timeout Errors

```javascript
// Request exceeded timeout
{
  error: "Request timeout",
  code: "TIMEOUT",
  duration: 30000
}
```

### HTTP Errors

```javascript
// 4xx or 5xx status codes
{
  status: 404,
  statusText: "Not Found",
  success: false,
  data: { error: "Resource not found" }
}
```

### SSL Errors

```javascript
// Invalid certificate
{
  error: "SSL certificate validation failed",
  code: "SSL_ERROR"
}
```

## Examples

### Example 1: REST API Call with Authentication

```javascript
{
  type: "http-request",
  parameters: {
    method: "GET",
    url: "https://api.github.com/user/repos",
    headers: {
      "Accept": "application/vnd.github.v3+json"
    },
    auth: {
      type: "bearer",
      token: "ghp_your_github_token"
    },
    params: {
      sort: "updated",
      per_page: "10"
    }
  }
}
```

### Example 2: POST with JSON Body

```javascript
{
  type: "http-request",
  parameters: {
    method: "POST",
    url: "https://api.example.com/orders",
    body: {
      customer_id: 12345,
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 5, quantity: 1 }
      ],
      shipping_address: {
        street: "123 Main St",
        city: "Portland",
        state: "OR",
        zip: "97201"
      }
    },
    headers: {
      "X-API-Key": "your-api-key",
      "Idempotency-Key": "unique-request-id"
    }
  }
}
```

### Example 3: Retry Configuration

```javascript
{
  type: "http-request",
  parameters: {
    method: "GET",
    url: "https://flaky-api.example.com/data",
    timeout: 15000,
    retries: 3,
    retryDelay: 2000,
    headers: {
      "User-Agent": "Atomiton/1.0"
    }
  }
}
```

## Related Nodes

- **Transform Node** - Process API responses
- **Loop Node** - Make repeated API calls
- **Parallel Node** - Call multiple APIs simultaneously
- **Edit Fields Node** - Prepare request data
- **File System Node** - Save API responses to files

## Future Enhancements

- Support for more HTTP methods (PATCH, HEAD, OPTIONS)
- Streaming support for large responses
- Certificate pinning
- Custom retry strategies
- Response caching
- Request/response interceptors
- GraphQL support
- Websocket support
