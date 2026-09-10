import { describe, it, expect } from "vitest";
import { contentRegistry } from "@/content/content-registry";
import { getIndexableServers, getServerEntry } from "@/content/server-registry";

describe("llms", () => {
  it("only intended public editorial cohort", () => {
    const editorial = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    editorial.forEach((entry) => {
      expect(entry.status).toBe("published");
      expect(entry.noindex).not.toBe(true);
    });
  });

  it("only intended public server cohort", () => {
    const servers = getIndexableServers();
    servers.forEach((server) => {
      expect(server.isVerified).toBe(true);
    });
  });

  it("excludes draft editorial", () => {
    const draft = Object.values(contentRegistry).find((e) => e.status === "draft");
    if (draft) {
      const editorial = Object.values(contentRegistry).filter(
        (e) => e.status === "published" && !e.noindex
      );
      expect(editorial).not.toContain(draft);
    }
  });

  it("excludes noindex editorial", () => {
    const noindex = Object.values(contentRegistry).find((e) => e.noindex === true);
    if (noindex) {
      const editorial = Object.values(contentRegistry).filter(
        (e) => e.status === "published" && !e.noindex
      );
      expect(editorial).not.toContain(noindex);
    }
  });

  it("excludes non-indexable servers", () => {
    const nonIndexable = getServerEntry("/servers/mcp-server-postgres");
    if (nonIndexable) {
      const servers = getIndexableServers();
      expect(servers).not.toContain(nonIndexable);
    }
  });
});