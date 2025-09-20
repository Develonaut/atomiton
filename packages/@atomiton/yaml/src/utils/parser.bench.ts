import { bench, describe } from "vitest";
import {
  parseYaml,
  safeParseYaml,
  parseYamlStream,
  isValidYaml,
} from "./parser.js";

const smallYaml = `
name: John Doe
age: 30
active: true
email: john@example.com
`;

const mediumYaml = `
application:
  name: MyApp
  version: 1.0.0
  features:
    - authentication
    - authorization
    - logging
    - monitoring
  database:
    type: postgresql
    host: localhost
    port: 5432
    credentials:
      username: admin
      password: secret
  servers:
    - name: web-1
      ip: 192.168.1.10
      role: primary
    - name: web-2
      ip: 192.168.1.11
      role: secondary
    - name: web-3
      ip: 192.168.1.12
      role: secondary
`;

const largeYaml = Array.from(
  { length: 100 },
  (_, i) => `
item_${i}:
  id: ${i}
  name: Item ${i}
  description: This is a longer description for item ${i} that contains more text
  properties:
    color: ${["red", "blue", "green"][i % 3]}
    size: ${["small", "medium", "large"][i % 3]}
    weight: ${Math.random() * 100}
  tags:
    - tag_${i}_1
    - tag_${i}_2
    - tag_${i}_3
  metadata:
    created: 2024-01-${String((i % 28) + 1).padStart(2, "0")}
    modified: 2024-02-${String((i % 28) + 1).padStart(2, "0")}
    author: author_${i % 10}
`,
).join("\n");

const multiDocYaml = Array.from(
  { length: 50 },
  (_, i) => `
---
document: ${i}
type: test
value: ${Math.random()}
`,
).join("\n");

describe("parseYaml benchmarks", () => {
  bench("parse small YAML (5 fields)", () => {
    parseYaml(smallYaml);
  });

  bench("parse medium YAML (nested structure)", () => {
    parseYaml(mediumYaml);
  });

  bench("parse large YAML (100 items)", () => {
    parseYaml(largeYaml);
  });
});

describe("safeParseYaml benchmarks", () => {
  bench("safe parse small YAML", () => {
    safeParseYaml(smallYaml);
  });

  bench("safe parse medium YAML", () => {
    safeParseYaml(mediumYaml);
  });

  bench("safe parse large YAML", () => {
    safeParseYaml(largeYaml);
  });
});

describe("parseYamlStream benchmarks", () => {
  bench("parse multi-document YAML (50 docs)", async () => {
    await parseYamlStream(multiDocYaml);
  });

  bench("parse multi-document with callbacks", async () => {
    await parseYamlStream(multiDocYaml, {
      onDocument: () => {},
    });
  });
});

describe("isValidYaml benchmarks", () => {
  bench("validate small YAML", () => {
    isValidYaml(smallYaml);
  });

  bench("validate medium YAML", () => {
    isValidYaml(mediumYaml);
  });

  bench("validate large YAML", () => {
    isValidYaml(largeYaml);
  });
});
