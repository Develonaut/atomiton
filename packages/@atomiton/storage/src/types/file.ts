/**
 * Generic file format for Atomiton storage
 * All file types should follow this structure
 */
export type AtomitonFile<T = unknown> = {
  version: string; // File format version
  metadata: {
    name: string;
    description?: string;
    author?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  data: T; // The actual content
};
