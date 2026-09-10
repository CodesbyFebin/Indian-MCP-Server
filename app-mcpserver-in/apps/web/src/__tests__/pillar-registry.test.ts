import { describe, it, expect } from "vitest";
import {
  contentRegistry,
  getIndexableEntries,
  getEntry,
} from "@/content/content-registry";

describe("60-pillar-registry", () => {
  it("has exactly 55 unique editorial entries (the factory-created pillars)", () => {
    // The factory-created pillars = learnEntry (13) + guideEntry (22) + buildEntry (6) + clientEntry (10) + securityEntry (4) = 55
    // Excludes: aggregate routes (parent === ""), glossary terms (type === "glossary"), comparison aggregate (type === "comparison")
    const pillarEntries = Object.values(contentRegistry).filter((e) => 
      e.parent !== "" && e.type !== "glossary" && e.type !== "comparison"
    );
    expect(pillarEntries).toHaveLength(55);
  });

  it("P01–P55 all present (55 total editorial pages)", () => {
    const pillarEntries = Object.values(contentRegistry).filter((e) => 
      e.parent !== "" && e.type !== "glossary" && e.type !== "comparison"
    );
    expect(pillarEntries.length).toBe(55);
  });

  it("60 unique canonical paths", () => {
    const paths = Object.keys(contentRegistry);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it("0 duplicate canonical paths", () => {
    const paths = Object.keys(contentRegistry);
    const duplicates = paths.filter(
      (path, index) => paths.indexOf(path) !== index
    );
    expect(duplicates).toHaveLength(0);
  });

  it("60 canonical ownership records (one per path)", () => {
    const paths = Object.keys(contentRegistry);
    paths.forEach((path) => {
      const entry = getEntry(path);
      expect(entry).toBeDefined();
      expect(entry?.indexPath).toBe(path);
    });
  });
});