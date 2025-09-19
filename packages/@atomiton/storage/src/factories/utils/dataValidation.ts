export type CompositeData = {
  id: string;
  name: string;
  version: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export function isCompositeData(data: unknown): data is CompositeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "version" in data &&
    typeof (data as Record<string, unknown>).id === "string" &&
    typeof (data as Record<string, unknown>).name === "string" &&
    typeof (data as Record<string, unknown>).version === "string"
  );
}

export function addTimestampMetadata(
  data: CompositeData,
  additionalMetadata?: Record<string, unknown>,
): CompositeData {
  const now = new Date().toISOString();
  return {
    ...data,
    metadata: {
      ...data.metadata,
      updated: now,
      created: data.metadata?.created || now,
      ...additionalMetadata,
    },
  };
}
