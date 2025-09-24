import { parseYaml, safeParseYaml } from "#parser.js";
import { stringifyYaml } from "#stringifier.js";
import type {
  ParseResult,
  YamlDocument,
  YamlParseOptions,
  YamlStringifyOptions,
} from "#types.js";
import { readFile, writeFile } from "node:fs/promises";

export async function readYamlFile<T = YamlDocument>(
  filePath: string,
  options?: YamlParseOptions,
): Promise<T> {
  try {
    const content = await readFile(filePath, "utf-8");
    return parseYaml<T>(content, options);
  } catch (error) {
    throw new Error(
      `Failed to read YAML file "${filePath}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function safeReadYamlFile<T = YamlDocument>(
  filePath: string,
  options?: YamlParseOptions,
): Promise<ParseResult<T>> {
  try {
    const content = await readFile(filePath, "utf-8");
    return safeParseYaml<T>(content, options);
  } catch (error) {
    return {
      data: {} as T,
      errors: [
        {
          message: `Failed to read file "${filePath}": ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

export async function writeYamlFile(
  filePath: string,
  data: unknown,
  options?: YamlStringifyOptions,
): Promise<void> {
  try {
    const content = stringifyYaml(data, options);
    await writeFile(filePath, content, "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to write YAML file "${filePath}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function readYamlFileSync<T = YamlDocument>(
  filePath: string,
  options?: YamlParseOptions,
): Promise<T> {
  return readYamlFile<T>(filePath, options);
}

export async function writeYamlFileSync(
  filePath: string,
  data: unknown,
  options?: YamlStringifyOptions,
): Promise<void> {
  return writeYamlFile(filePath, data, options);
}
