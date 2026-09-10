import { describe, it, expect } from "vitest";
import {
  getIndexableServers,
  getServerEntry,
  getServerVerificationDecision,
  isServerIndexableEntry,
} from "@/content/server-registry";

describe("server-publication", () => {
  it("isServerIndexable is the authority", () => {
    const servers = getIndexableServers();
    servers.forEach((server) => {
      expect(isServerIndexableEntry(server)).toBe(true);
    });
  });

  it("unverified Postgres entity excluded", () => {
    const indexable = getIndexableServers();
    const postgres = getServerEntry("/servers/mcp-server-postgres");
    expect(postgres).toBeDefined();
    expect(postgres?.isVerified).toBe(false);
    expect(indexable).not.toContain(postgres);
  });

  it("getIndexableServers returns no placeholder entity", () => {
    const indexable = getIndexableServers();
    // Currently there are no indexable servers (Postgres is unverified)
    expect(indexable).toHaveLength(0);
  });

  it("getServerVerificationDecision uses isServerIndexable", () => {
    const postgres = getServerEntry("/servers/mcp-server-postgres");
    expect(postgres).toBeDefined();
    if (postgres) {
      const decision = getServerVerificationDecision(postgres);
      expect(decision.indexable).toBe(false);
      expect(decision.reason).toBeTruthy();
    }
  });

  it("server with verified evidence would be indexable", () => {
    // Create a mock server entry that would pass isServerIndexable
    const mockServer = {
      publicationStatus: "published" as const,
      evidenceRefs: ["ev-1", "ev-2"],
      verificationStatus: "verified" as const,
    };
    expect(isServerIndexableEntry(mockServer)).toBe(true);
  });

  it("server without evidence is not indexable", () => {
    const mockServer = {
      publicationStatus: "published" as const,
      evidenceRefs: [],
      verificationStatus: "verified" as const,
    };
    expect(isServerIndexableEntry(mockServer)).toBe(false);
  });

  it("server with unverified evidence is not indexable", () => {
    const mockServer = {
      publicationStatus: "published" as const,
      evidenceRefs: ["ev-1"],
      verificationStatus: "unverified" as const,
    };
    expect(isServerIndexableEntry(mockServer)).toBe(false);
  });

  it("server with draft status is not indexable", () => {
    const mockServer = {
      publicationStatus: "draft" as const,
      evidenceRefs: ["ev-1"],
      verificationStatus: "verified" as const,
    };
    expect(isServerIndexableEntry(mockServer)).toBe(false);
  });
});