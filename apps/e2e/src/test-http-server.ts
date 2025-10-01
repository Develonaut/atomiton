/**
 * Simple HTTP test server for E2E tests
 * Provides reliable endpoints for testing http-request nodes
 */
import type { Server } from "node:http";
import { createServer } from "node:http";

export function startTestHttpServer(port: number = 8888): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      // Enable CORS for all requests
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.setHeader("Access-Control-Allow-Headers", "*");

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      // Parse URL and method
      const url = new URL(req.url || "/", `http://localhost:${port}`);
      const method = req.method || "GET";

      // Collect request body
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        // Common response structure
        const response = {
          url: `http://localhost:${port}${url.pathname}`,
          method,
          headers: req.headers,
          args: Object.fromEntries(url.searchParams),
          ...(body && { json: tryParseJSON(body), data: body }),
        };

        // Route handling
        if (url.pathname === "/get" && method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } else if (url.pathname === "/post" && method === "POST") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } else if (url.pathname === "/put" && method === "PUT") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } else if (url.pathname === "/delete" && method === "DELETE") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } else if (url.pathname === "/headers") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ headers: req.headers }));
        } else if (url.pathname.startsWith("/status/")) {
          const statusCode = parseInt(url.pathname.split("/")[2] || "200", 10);
          res.writeHead(statusCode, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: statusCode }));
        } else if (url.pathname.startsWith("/delay/")) {
          const seconds = parseInt(url.pathname.split("/")[2] || "0", 10);
          setTimeout(() => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ...response, delay: seconds }));
          }, seconds * 1000);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not Found", path: url.pathname }));
        }
      });
    });

    server.on("error", (err) => {
      // If port is already in use, that's fine (another test is using it)
      if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
        console.log(`Test HTTP server already running on port ${port}`);
        resolve(server);
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      console.log(`Test HTTP server listening on port ${port}`);
      resolve(server);
    });
  });
}

function tryParseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// CLI usage for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  startTestHttpServer(8888).catch(console.error);
}
