import { createConductor } from "@atomiton/conductor";
import type { IStorageEngine } from "@atomiton/storage";

export function initializeConductor(storage: IStorageEngine) {
  const conductor = createConductor({ storage });
  console.log("Conductor initialized with storage successfully");
  return conductor;
}
