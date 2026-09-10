import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("glossary-migration", () => {
  const file = path.join(
    process.cwd(),
    "../../data/migration/source/glossary-numeric-suffix-reconciliation-103.csv"
  );
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.trim().split("\n").slice(1); // skip header

  it("numeric-ending = 103", () => {
    expect(lines.length).toBe(103);
  });

  it("semantic numeric = 2", () => {
    const semantic = lines.filter((line) => line.includes("SEMANTIC_NUMERIC_TERM"));
    expect(semantic.length).toBe(2);
  });

  it("generated numeric suffix = 101", () => {
    const generated = lines.filter((line) => line.includes("GENERATED_NUMERIC_SUFFIX"));
    expect(generated.length).toBe(101);
  });

  it("generated base concepts = 96", () => {
    const basePaths = new Set<string>();
    lines.forEach((line) => {
      const cols = line.split(",");
      const proposedBasePath = cols[25]?.trim();
      if (proposedBasePath) {
        basePaths.add(proposedBasePath);
      }
    });
    expect(basePaths.size).toBe(96);
  });

  it("explicitly protects mcp-soc-2 from numeric stripping", () => {
    const soc2 = lines.find((line) => line.includes("/glossary/mcp-soc-2"));
    expect(soc2).toBeDefined();
    expect(soc2).toContain("SEMANTIC_NUMERIC_TERM");
  });

  it("explicitly protects mcp-iso-27001 from numeric stripping", () => {
    const iso = lines.find((line) => line.includes("/glossary/mcp-iso-27001"));
    expect(iso).toBeDefined();
    expect(iso).toContain("SEMANTIC_NUMERIC_TERM");
  });

  it("base concepts with multiple indexed variants = 7", () => {
    const basePaths: Record<string, number> = {};
    lines.forEach((line) => {
      const cols = line.split(",");
      const proposedBasePath = cols[25]?.trim();
      const baseFamilyIndexedCount = parseInt(cols[26]) || 0;
      if (proposedBasePath && baseFamilyIndexedCount > 1) {
        basePaths[proposedBasePath] = baseFamilyIndexedCount;
      }
    });
    const multiVariant = Object.keys(basePaths).length;
    expect(multiVariant).toBe(7);
  });
});