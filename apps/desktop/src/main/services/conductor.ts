import { createConductor } from "@atomiton/conductor/desktop";
import type { IStorageEngine } from "@atomiton/storage/desktop";

export function initializeConductor(storage: IStorageEngine) {
  const conductor = createConductor({ storage });
  return conductor;
}
