import { describe, it, expect } from "vitest";
import {
  buildPath,
  extractParams,
  validateParams,
  normalizePath,
  joinPaths,
} from "../utils/path";

describe("Path Utils", () => {
  describe("buildPath", () => {
    it("should build path without parameters", () => {
      expect(buildPath("/home")).toBe("/home");
      expect(buildPath("/about/us")).toBe("/about/us");
    });

    it("should build path with required parameters", () => {
      expect(buildPath("/user/$id", { id: "123" })).toBe("/user/123");
      expect(
        buildPath("/posts/$category/$id", { category: "tech", id: "456" }),
      ).toBe("/posts/tech/456");
    });

    it("should build path with optional parameters", () => {
      expect(buildPath("/search/$query?", { query: "test" })).toBe(
        "/search/test",
      );
      expect(buildPath("/search/$query?", {})).toBe("/search");
    });

    it("should throw error for missing required parameters", () => {
      expect(() => buildPath("/user/$id", {})).toThrow(
        "Missing required parameter: id",
      );
    });

    it("should encode special characters", () => {
      expect(buildPath("/search/$query", { query: "hello world" })).toBe(
        "/search/hello%20world",
      );
    });
  });

  describe("extractParams", () => {
    it("should extract no parameters from plain path", () => {
      const result = extractParams("/home");
      expect(result.required).toEqual([]);
      expect(result.optional).toEqual([]);
    });

    it("should extract required parameters", () => {
      const result = extractParams("/user/$id/posts/$postId");
      expect(result.required).toEqual(["id", "postId"]);
      expect(result.optional).toEqual([]);
    });

    it("should extract optional parameters", () => {
      const result = extractParams("/search/$query?/$page?");
      expect(result.required).toEqual([]);
      expect(result.optional).toEqual(["query", "page"]);
    });

    it("should extract mixed parameters", () => {
      const result = extractParams("/user/$id/posts/$postId?");
      expect(result.required).toEqual(["id"]);
      expect(result.optional).toEqual(["postId"]);
    });
  });

  describe("validateParams", () => {
    it("should validate params for plain path", () => {
      const result = validateParams("/home", {});
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it("should validate required params", () => {
      const result1 = validateParams("/user/$id", { id: "123" });
      expect(result1.valid).toBe(true);
      expect(result1.missing).toEqual([]);

      const result2 = validateParams("/user/$id", {});
      expect(result2.valid).toBe(false);
      expect(result2.missing).toEqual(["id"]);
    });

    it("should validate optional params", () => {
      const result1 = validateParams("/search/$query?", { query: "test" });
      expect(result1.valid).toBe(true);

      const result2 = validateParams("/search/$query?", {});
      expect(result2.valid).toBe(true);
    });
  });

  describe("normalizePath", () => {
    it("should add leading slash", () => {
      expect(normalizePath("home")).toBe("/home");
    });

    it("should remove duplicate slashes", () => {
      expect(normalizePath("//home//about//")).toBe("/home/about");
    });

    it("should remove trailing slash except for root", () => {
      expect(normalizePath("/home/")).toBe("/home");
      expect(normalizePath("/")).toBe("/");
    });
  });

  describe("joinPaths", () => {
    it("should join multiple paths", () => {
      expect(joinPaths("/api", "users", "123")).toBe("/api/users/123");
      expect(joinPaths("api/", "/users/", "/123")).toBe("/api/users/123");
    });

    it("should handle empty strings", () => {
      expect(joinPaths("/api", "", "users")).toBe("/api/users");
    });
  });
});
