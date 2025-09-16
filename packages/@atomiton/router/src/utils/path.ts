import { compile, parse, match as pathMatch, type Token } from "path-to-regexp";

/**
 * Build a path from a pattern and parameters using path-to-regexp
 * Supports standard path patterns like /user/:id, /posts/{/:id}
 * Note: In v8, optional params use braces: {/:param}
 */
export function buildPath(
  pattern: string,
  params: Record<string, string | number | boolean> = {},
): string {
  // First validate that all required parameters are provided
  const validation = validateParams(pattern, params);
  if (!validation.valid) {
    throw new Error(
      `Missing required parameter: ${validation.missing.join(", ")}`,
    );
  }

  try {
    // Convert $ to : for path-to-regexp compatibility
    // Convert old optional syntax $param? to new syntax {:param?}
    const normalizedPattern = pattern
      .replace(/\$([^/?]+)\?/g, "{:$1}") // Optional params without slash
      .replace(/\$([^/?]+)/g, ":$1"); // Required params

    const toPath = compile(normalizedPattern, { encode: encodeURIComponent });
    // Convert params to string values
    const stringParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        stringParams[key] = String(value);
      }
    }

    const builtPath = toPath(stringParams);
    return normalizePath(builtPath);
  } catch (error) {
    // Fallback for invalid patterns
    console.error(`Invalid path pattern: ${pattern}`, error);
    return pattern;
  }
}

/**
 * Extract parameter names from a path pattern
 * Returns both required and optional parameters
 * Detects optional by checking if param is inside braces {}
 */
export function extractParams(pattern: string): {
  required: string[];
  optional: string[];
} {
  // Convert $ to : for path-to-regexp compatibility
  const normalizedPattern = pattern
    .replace(/\$([^/?]+)\?/g, "{:$1}") // Optional params
    .replace(/\$([^/?]+)/g, ":$1"); // Required params

  try {
    const { tokens } = parse(normalizedPattern);
    const required: string[] = [];
    const optional: string[] = [];

    // Track if we're inside a group (braces)
    const processTokens = (tokenList: Token[], isInGroup = false) => {
      for (const token of tokenList) {
        if (token.type === "param") {
          const param = token as Parameter;
          if (isInGroup) {
            optional.push(String(param.name));
          } else {
            required.push(String(param.name));
          }
        } else if (token.type === "wildcard") {
          const wildcard = token as Wildcard;
          // Wildcards are generally optional in nature
          optional.push(String(wildcard.name));
        } else if (token.type === "group") {
          const group = token as Group;
          // Items in groups are optional
          processTokens(group.tokens, true);
        }
      }
    };

    processTokens(tokens);

    return { required, optional };
  } catch (error) {
    console.error(`Failed to parse pattern: ${pattern}`, error);
    return { required: [], optional: [] };
  }
}

// Import the specific types we need
type Parameter = {
  type: "param";
  name: string;
};

type Wildcard = {
  type: "wildcard";
  name: string;
};

type Group = {
  type: "group";
  tokens: Token[];
};

/**
 * Validate that all required parameters are provided
 */
export function validateParams(
  pattern: string,
  params: Record<string, unknown>,
): { valid: boolean; missing: string[] } {
  const { required } = extractParams(pattern);
  const missing = required.filter((param) => params[param] === undefined);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Normalize a path to ensure consistent formatting
 */
export function normalizePath(path: string): string {
  // Ensure path starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Remove duplicate slashes
  path = path.replace(/\/+/g, "/");

  // Remove trailing slash unless it's the root
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * Join multiple path segments together
 */
export function joinPaths(...paths: string[]): string {
  const joined = paths.filter(Boolean).join("/").replace(/\/+/g, "/");
  return normalizePath(joined);
}

/**
 * Parse a path and extract parameters based on a pattern
 * Returns matched parameters or null if no match
 */
export function matchPath(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  // Convert $ to : for path-to-regexp compatibility
  const normalizedPattern = pattern
    .replace(/\$([^/?]+)\?/g, "{:$1}") // Optional params
    .replace(/\$([^/?]+)/g, ":$1"); // Required params

  try {
    const matchFn = pathMatch(normalizedPattern, {
      decode: decodeURIComponent,
    });
    const result = matchFn(pathname);

    if (!result) {
      return null;
    }

    return result.params as Record<string, string>;
  } catch (error) {
    console.error(
      `Failed to match path: ${pattern} against ${pathname}`,
      error,
    );
    return null;
  }
}
