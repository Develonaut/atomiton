// Re-export Zod directly - no wrapping needed
export * from 'zod';
export { z as default, z } from 'zod';

// Essential validators only
import { z } from 'zod';

export const validators = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  semver: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      'Invalid semantic version'
    ),
} as const;
