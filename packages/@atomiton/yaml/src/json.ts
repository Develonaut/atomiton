export function fromJson<T>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function toJson(object: unknown, indent?: number): string {
  try {
    return JSON.stringify(object, null, indent);
  } catch (error) {
    throw new Error(
      `Failed to stringify JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}