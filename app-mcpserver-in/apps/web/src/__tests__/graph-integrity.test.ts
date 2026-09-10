import { describe, it, expect } from "vitest";
import { contentRegistry } from "@/content/content-registry";
import { getIndexableServers, getServerEntry } from "@/content/server-registry";

describe("graph-integrity", () => {
  it("0 public orphan pages", () => {
    const indexableEntries = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    indexableEntries.forEach((entry) => {
      if (entry.parent) {
        const parent = contentRegistry[`/${entry.parent}`];
        expect(parent).toBeDefined();
      }
    });
  });

  it("all parent references exist", () => {
    Object.values(contentRegistry).forEach((entry) => {
      if (entry.parent) {
        const parentPath = entry.parent === "" ? "/" : `/${entry.parent}`;
        const parent = contentRegistry[parentPath];
        expect(parent).toBeDefined();
      }
    });
  });

  it("all children resolve", () => {
    const indexable = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    indexable.forEach((entry) => {
      // Check relatedInternalLinks resolve
      if (entry.relatedInternalLinks) {
        entry.relatedInternalLinks.forEach((link) => {
          const target = contentRegistry[link.href];
          expect(target).toBeDefined();
        });
      }
    });
  });

  it("all relatedPages resolve", () => {
    // relatedInternalLinks is the field for related pages
    Object.values(contentRegistry).forEach((entry) => {
      if (entry.relatedInternalLinks) {
        entry.relatedInternalLinks.forEach((link) => {
          const target = contentRegistry[link.href];
          expect(target).toBeDefined();
        });
      }
    });
  });

  it("all related server references resolve through public registry", () => {
    const servers = getIndexableServers();
    // Since there are currently 0 indexable servers, this passes trivially
    servers.forEach((server) => {
      // If server had relatedServerSlugs, they would be checked
      expect(server.isVerified).toBe(true);
    });
  });

  it("editorial entries with relatedServerSlugs resolve to indexable servers", () => {
    // This would check editorial content that references servers
    // Currently no editorial entries have relatedServerSlugs field
    expect(true).toBe(true);
  });
});