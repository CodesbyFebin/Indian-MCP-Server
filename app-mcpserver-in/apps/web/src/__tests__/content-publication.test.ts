import { describe, it, expect } from "vitest";
import {
  contentRegistry,
  getIndexableEntries,
  getEntry,
} from "@/content/content-registry";
import { isServerIndexable } from "@mcp/servers-registry";

describe("content-publication", () => {
  it("isContentIndexable excludes draft", () => {
    const draftEntry = Object.values(contentRegistry).find(
      (e) => e.status === "draft"
    );
    if (draftEntry) {
      const indexable = getIndexableEntries();
      expect(indexable).not.toContain(draftEntry);
    }
  });

  it("isContentIndexable excludes review where policy requires", () => {
    const reviewEntry = Object.values(contentRegistry).find(
      (e) => e.status === "review"
    );
    if (reviewEntry) {
      const indexable = getIndexableEntries();
      // review entries should be filtered out by getIndexableEntries
      expect(indexable).not.toContain(reviewEntry);
    }
  });

  it("isContentIndexable excludes quarantine", () => {
    // No quarantine status in current implementation, but if added, should be excluded
    const indexable = getIndexableEntries();
    indexable.forEach((entry) => {
      expect(entry.status).not.toBe("quarantine");
    });
  });

  it("isContentIndexable excludes noindex", () => {
    const noindexEntry = Object.values(contentRegistry).find(
      (e) => e.noindex === true
    );
    if (noindexEntry) {
      const indexable = getIndexableEntries();
      expect(indexable).not.toContain(noindexEntry);
    }
  });

  it("isContentIndexable excludes retired", () => {
    const retiredEntry = Object.values(contentRegistry).find(
      (e) => e.status === "retired"
    );
    if (retiredEntry) {
      const indexable = getIndexableEntries();
      expect(indexable).not.toContain(retiredEntry);
    }
  });

  it("isServerIndexable is the authority for server registry", () => {
    // Test the authoritative server publication predicate
    expect(isServerIndexable(true, 1, true, "published")).toEqual({
      indexable: true,
      reason: "Published with verified evidence",
      decidedAt: expect.any(String),
    });

    expect(isServerIndexable(false, 1, true, "published").indexable).toBe(false);
    expect(isServerIndexable(true, 0, true, "published").indexable).toBe(false);
    expect(isServerIndexable(true, 1, false, "published").indexable).toBe(false);
    expect(isServerIndexable(true, 1, true, "draft").indexable).toBe(false);
    expect(isServerIndexable(true, 1, true, "unverified").indexable).toBe(false);
    expect(isServerIndexable(true, 1, true, "unknown").indexable).toBe(false);
  });
});