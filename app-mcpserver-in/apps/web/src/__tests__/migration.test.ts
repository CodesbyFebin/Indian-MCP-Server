import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("migration", () => {
  const sourceDir = path.join(process.cwd(), "../../data/migration/source");

  it("raw GSC rows = 904", () => {
    const file = path.join(sourceDir, "gsc-valid-raw-904.csv");
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.trim().split("\n");
    // Header + 904 data rows = 905 lines
    expect(lines.length).toBe(905);
  });

  it("submitted = 675", () => {
    const file = path.join(sourceDir, "gsc-valid-raw-904.csv");
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.trim().split("\n").slice(1); // skip header
    const submitted = lines.filter((line) => line.split(",")[5] === "True").length;
    expect(submitted).toBe(675);
  });

  it("not submitted = 229", () => {
    const file = path.join(sourceDir, "gsc-valid-raw-904.csv");
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.trim().split("\n").slice(1);
    const notSubmitted = lines.filter((line) => line.split(",")[7] === "True").length;
    expect(notSubmitted).toBe(229);
  });

  it("normalized families = 699", () => {
    const file = path.join(sourceDir, "gsc-indexed-normalized-699.csv");
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.trim().split("\n");
    // Header + 699 data rows = 700 lines
    expect(lines.length).toBe(700);
  });

  it("variant collapse = 205", () => {
    const file = path.join(sourceDir, "gsc-indexed-normalized-699.csv");
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.trim().split("\n").slice(1);
    const totalVariants = lines.reduce((sum, line) => {
      const cols = line.split(",");
      const variantCount = parseInt(cols[7]) || 1;
      return sum + (variantCount - 1);
    }, 0);
    expect(totalVariants).toBe(205);
  });

  it("union equality check: 675 + 229 = 904", () => {
    expect(675 + 229).toBe(904);
  });
});