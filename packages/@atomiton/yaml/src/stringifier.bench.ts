import {
    formatYaml,
    minifyYaml,
    prettifyYaml,
    stringifyYaml,
} from "#stringifier.js";
import { bench, describe } from "vitest";

const smallObject = {
  name: "Test",
  value: 42,
  active: true,
};

const mediumObject = {
  application: {
    name: "MyApp",
    version: "1.0.0",
    features: ["auth", "logging", "monitoring"],
    config: {
      database: {
        host: "localhost",
        port: 5432,
        ssl: true,
      },
      cache: {
        type: "redis",
        ttl: 3600,
      },
    },
  },
  environments: ["dev", "staging", "production"],
};

const largeObject = {
  items: Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i} with additional text content`,
    properties: {
      color: ["red", "blue", "green"][i % 3],
      size: ["small", "medium", "large"][i % 3],
      weight: Math.random() * 100,
      enabled: i % 2 === 0,
    },
    tags: [`tag_${i}_1`, `tag_${i}_2`, `tag_${i}_3`],
    metadata: {
      created: new Date(2024, 0, (i % 28) + 1).toISOString(),
      modified: new Date(2024, 1, (i % 28) + 1).toISOString(),
      author: `author_${i % 10}`,
    },
  })),
};

const deeplyNestedObject = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            level6: {
              level7: {
                level8: {
                  level9: {
                    level10: {
                      value: "deeply nested value",
                      array: [1, 2, 3, 4, 5],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const yamlString = `
application:
  name: MyApp
  version: 1.0.0
  features:
    - authentication
    - authorization
database:
  host: localhost
  port: 5432
`;

describe("stringifyYaml benchmarks", () => {
  bench("stringify small object", () => {
    stringifyYaml(smallObject);
  });

  bench("stringify medium object", () => {
    stringifyYaml(mediumObject);
  });

  bench("stringify large object (100 items)", () => {
    stringifyYaml(largeObject);
  });

  bench("stringify deeply nested object", () => {
    stringifyYaml(deeplyNestedObject);
  });
});

describe("formatYaml benchmarks", () => {
  bench("format YAML string", () => {
    formatYaml(yamlString);
  });

  bench("format with custom options", () => {
    formatYaml(yamlString, { lineWidth: 120, indent: 4 });
  });
});

describe("minifyYaml benchmarks", () => {
  bench("minify YAML string", () => {
    minifyYaml(yamlString);
  });
});

describe("prettifyYaml benchmarks", () => {
  bench("prettify YAML with default indent", () => {
    prettifyYaml(yamlString);
  });

  bench("prettify YAML with custom indent", () => {
    prettifyYaml(yamlString, 4);
  });
});
