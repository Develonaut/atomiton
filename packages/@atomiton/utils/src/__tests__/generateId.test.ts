import { describe, expect, it } from "vitest";
import {
  generateExecutionId,
  generateId,
  generateJobId,
  generateNodeId,
  generateWorkerId,
} from "../generateId";

describe("generateId functions", () => {
  describe("generateExecutionId", () => {
    it("should generate a unique execution ID with correct prefix", () => {
      const id = generateExecutionId();
      expect(id).toMatch(
        /^exec_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate different IDs on subsequent calls", () => {
      const id1 = generateExecutionId();
      const id2 = generateExecutionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateJobId", () => {
    it("should generate a unique job ID with correct prefix", () => {
      const id = generateJobId();
      expect(id).toMatch(
        /^job_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate different IDs on subsequent calls", () => {
      const id1 = generateJobId();
      const id2 = generateJobId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateWorkerId", () => {
    it("should generate a unique worker ID with index and correct prefix", () => {
      const id = generateWorkerId(1);
      expect(id).toMatch(
        /^worker_1_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should include the index in the ID", () => {
      const id5 = generateWorkerId(5);
      const id10 = generateWorkerId(10);
      expect(id5).toContain("worker_5_");
      expect(id10).toContain("worker_10_");
    });

    it("should generate different IDs for same index", () => {
      const id1 = generateWorkerId(1);
      const id2 = generateWorkerId(1);
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateNodeId", () => {
    it("should generate a unique node ID with correct prefix", () => {
      const id = generateNodeId();
      expect(id).toMatch(
        /^node_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate different IDs on subsequent calls", () => {
      const id1 = generateNodeId();
      const id2 = generateNodeId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateId", () => {
    it("should generate a valid UUID when no prefix provided", () => {
      const id = generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate ID with custom prefix", () => {
      const id = generateId("custom");
      expect(id).toMatch(
        /^custom_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate different IDs on subsequent calls", () => {
      const id1 = generateId("test");
      const id2 = generateId("test");
      expect(id1).not.toBe(id2);
    });

    it("should handle empty prefix", () => {
      const id = generateId("");
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });
  });
});
