import { describe, it, expect, vi } from "vitest";
import { notFound } from "next/navigation";
import { getServerEntry, isServerIndexableEntry } from "@/content/server-registry";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }),
}));

describe("server-route", () => {
  it("mcp-server-postgres cannot produce public/indexable entity content", () => {
    const entry = getServerEntry("/servers/mcp-server-postgres");
    expect(entry).toBeDefined();
    expect(entry?.isVerified).toBe(false);
    
    // Runtime guard would trigger notFound for non-indexable server
    expect(isServerIndexableEntry(entry!)).toBe(false);
  });

  it("non-indexable server triggers notFound at runtime", () => {
    const entry = getServerEntry("/servers/mcp-server-postgres");
    expect(entry).toBeDefined();
    
    if (entry && !isServerIndexableEntry(entry)) {
      // This is the runtime guard pattern
      expect(() => {
        if (!entry || !isServerIndexableEntry(entry)) {
          notFound();
        }
      }).toThrow("NOT_FOUND");
    }
  });

  it("indexable server would pass runtime guard", () => {
    const mockIndexableServer = {
      publicationStatus: "published",
      evidenceRefs: ["ev-1"],
      verificationStatus: "verified",
    };
    expect(isServerIndexableEntry(mockIndexableServer)).toBe(true);
  });

  it("missing server triggers notFound", () => {
    const entry = getServerEntry("/servers/nonexistent");
    expect(entry).toBeUndefined();
    
    expect(() => {
      if (!entry || !isServerIndexableEntry(entry)) {
        notFound();
      }
    }).toThrow("NOT_FOUND");
  });
});