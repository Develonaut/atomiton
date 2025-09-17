import { describe, it, expect } from "vitest";

describe("Editor Domain Smoke Tests", () => {
  it("editor package can be imported without errors", async () => {
    const editorModule = await import("@atomiton/editor");
    expect(editorModule).toBeDefined();
  });

  it("nodes package can be imported without errors", async () => {
    const nodesModule = await import("@atomiton/nodes/browser");
    expect(nodesModule).toBeDefined();
  });

  it("editor page template can be imported without errors", async () => {
    const editorPage = await import("../../templates/EditorPage");
    expect(editorPage).toBeDefined();
  });
});
