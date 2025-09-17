/**
 * Shell Command Node Metadata
 *
 * Static metadata definition for the Shell Command node
 */

import { createAtomicMetadata } from "../../createAtomicMetadata";

export const shellCommandMetadata = createAtomicMetadata({
  id: "shell-command",
  name: "Shell Command",
  description: "Execute shell commands and capture output",
  category: "system",
  icon: "terminal",
  keywords: [
    "shell",
    "command",
    "terminal",
    "bash",
    "execute",
    "process",
    "system",
  ],
  tags: ["shell", "command", "terminal", "system"],
});
