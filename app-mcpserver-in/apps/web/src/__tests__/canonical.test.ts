import { describe, it, expect } from "vitest";
import { contentRegistry } from "@/content/content-registry";
import { getIndexableServers } from "@/content/server-registry";

describe("canonical", () => {
  it("all public URLs use https://www.mcpserver.in", () => {
    const editorial = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    editorial.forEach((entry) => {
      const url = `https://www.mcpserver.in${entry.indexPath}`;
      expect(url).toMatch(/^https:\/\/www\.mcpserver\.in\//);
    });
  });

  it("server URLs use https://www.mcpserver.in", () => {
    const servers = getIndexableServers();
    servers.forEach((server) => {
      const url = `https://www.mcpserver.in${server.indexPath}`;
      expect(url).toMatch(/^https:\/\/www\.mcpserver\.in\//);
    });
  });

  it("no relative URLs in indexPath", () => {
    Object.values(contentRegistry).forEach((entry) => {
      expect(entry.indexPath).toMatch(/^\//);
      expect(entry.indexPath).not.toMatch(/^https?:\/\//);
    });
  });

  it("canonical origin is consistent", () => {
    const allUrls = Object.values(contentRegistry)
      .filter((e) => e.status === "published" && !e.noindex)
      .map((e) => `https://www.mcpserver.in${e.indexPath}`);
    const servers = getIndexableServers().map((s) => `https://www.mcpserver.in${s.indexPath}`);
    const all = [...allUrls, ...servers];
    all.forEach((url) => {
      expect(new URL(url).origin).toBe("https://www.mcpserver.in");
    });
  });
});