import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createInMemoryStorage } from "#factories/createInMemoryStorage";
import { createFileSystemStorage } from "#factories/createFileSystemStorage";
import { StorageError } from "#types";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

describe("Storage Factory", () => {
  describe("Desktop createStorage", () => {
    it("creates memory storage when using createMemoryEngine", async () => {
      const { createStorage, createMemoryEngine } = await import(
        "#exports/desktop"
      );
      const storage = createStorage({ engine: createMemoryEngine() });
      expect(storage.getInfo().type).toBe("memory");
    });

    it("creates filesystem storage when using createFileSystemEngine", async () => {
      const { createStorage, createFileSystemEngine } = await import(
        "#exports/desktop"
      );
      const storage = createStorage({
        engine: createFileSystemEngine({ baseDir: os.tmpdir() }),
      });
      expect(storage.getInfo().type).toBe("filesystem");
    });

    it("creates default filesystem storage when no engine provided", async () => {
      const { createStorage } = await import("#exports/desktop");
      const storage = createStorage();
      expect(storage.getInfo().type).toBe("filesystem");
    });
  });

  describe("Browser createStorage", () => {
    it("creates memory storage when using createMemoryEngine", async () => {
      const { createStorage, createMemoryEngine } = await import(
        "#exports/browser"
      );
      const storage = createStorage({ engine: createMemoryEngine() });
      expect(storage.getInfo().type).toBe("memory");
    });

    it("creates default memory storage when no engine provided", async () => {
      const { createStorage } = await import("#exports/browser");
      const storage = createStorage();
      expect(storage.getInfo().type).toBe("memory");
    });
  });

  describe("InMemoryStorage", () => {
    let storage: ReturnType<typeof createInMemoryStorage>;

    beforeEach(() => {
      storage = createInMemoryStorage();
    });

    it("saves and loads data", async () => {
      const testData = { id: "test", name: "Test Data" };
      await storage.save("test-key", testData);

      const loaded = await storage.load("test-key");
      expect(loaded).toEqual(testData);
    });

    it("checks if data exists", async () => {
      await storage.save("test-key", { data: "test" });

      expect(await storage.exists("test-key")).toBe(true);
      expect(await storage.exists("nonexistent")).toBe(false);
    });

    it("lists stored items", async () => {
      await storage.save("item1", { name: "Item 1" });
      await storage.save("item2", { name: "Item 2" });

      const items = await storage.list();
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.key)).toContain("item1");
      expect(items.map((item) => item.key)).toContain("item2");
    });

    it("lists items with prefix filter", async () => {
      await storage.save("user/1", { name: "User 1" });
      await storage.save("user/2", { name: "User 2" });
      await storage.save("admin/1", { name: "Admin 1" });

      const userItems = await storage.list("user/");
      expect(userItems).toHaveLength(2);
      expect(userItems.every((item) => item.key.startsWith("user/"))).toBe(
        true,
      );
    });

    it("deletes data", async () => {
      await storage.save("test-key", { data: "test" });
      await storage.delete("test-key");

      expect(await storage.exists("test-key")).toBe(false);
    });

    it("throws error when loading non-existent data", async () => {
      await expect(storage.load("nonexistent")).rejects.toThrow(StorageError);
    });

    it("throws error when deleting non-existent data", async () => {
      await expect(storage.delete("nonexistent")).rejects.toThrow(StorageError);
    });

    it("returns correct storage info", () => {
      const info = storage.getInfo();
      expect(info.type).toBe("memory");
      expect(info.platform).toBe("desktop");
      expect(info.connected).toBe(true);
    });
  });

  describe("FileSystemStorage", () => {
    let storage: ReturnType<typeof createFileSystemStorage>;
    let testDir: string;

    beforeEach(async () => {
      testDir = path.join(os.tmpdir(), `storage-test-${Date.now()}`);
      storage = createFileSystemStorage({ baseDir: testDir });
    });

    afterEach(async () => {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it("saves and loads data", async () => {
      const testData = { id: "test", name: "Test Data" };
      await storage.save("test-key", testData);

      const loaded = await storage.load("test-key");
      expect(loaded).toEqual(testData);
    });

    it("creates directories as needed", async () => {
      const testData = { id: "test", name: "Test Data" };
      await storage.save("nested/path/test-key", testData);

      const loaded = await storage.load("nested/path/test-key");
      expect(loaded).toEqual(testData);
    });

    it("handles composite metadata", async () => {
      const composite = {
        id: "test-composite",
        name: "Test Composite",
        version: "1.0.0",
        description: "A test composite",
      };

      await storage.save("composite-key", composite);
      const loaded = (await storage.load("composite-key")) as {
        metadata: { created: string; updated: string };
      };

      expect(loaded.metadata.created).toBeDefined();
      expect(loaded.metadata.updated).toBeDefined();
    });

    it("checks if data exists", async () => {
      await storage.save("test-key", { data: "test" });

      expect(await storage.exists("test-key")).toBe(true);
      expect(await storage.exists("nonexistent")).toBe(false);
    });

    it("deletes data", async () => {
      await storage.save("test-key", { data: "test" });
      await storage.delete("test-key");

      expect(await storage.exists("test-key")).toBe(false);
    });

    it("lists stored items", async () => {
      await storage.save("item1", { name: "Item 1" });
      await storage.save("item2", { name: "Item 2" });

      const items = await storage.list();
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.key)).toContain("item1");
      expect(items.map((item) => item.key)).toContain("item2");
    });

    it("throws error when loading non-existent data", async () => {
      await expect(storage.load("nonexistent")).rejects.toThrow(StorageError);
    });

    it("throws error when deleting non-existent data", async () => {
      await expect(storage.delete("nonexistent")).rejects.toThrow(StorageError);
    });

    it("returns correct storage info", () => {
      const info = storage.getInfo();
      expect(info.type).toBe("filesystem");
      expect(info.platform).toBe("desktop");
      expect(info.connected).toBe(true);
    });
  });
});
