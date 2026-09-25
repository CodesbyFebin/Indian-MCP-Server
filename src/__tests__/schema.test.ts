import { describe, it, expect } from "vitest";
import { contentRegistry } from "@/content/content-registry";
import { getIndexableServers } from "@/content/server-registry";

describe("schema", () => {
  it("rejects AggregateRating", () => {
    const allEntries = Object.values(contentRegistry);
    allEntries.forEach((entry) => {
      // Check that no entry has AggregateRating in JSON-LD
      expect(entry).not.toHaveProperty("aggregateRating");
    });
  });

  it("rejects Review", () => {
    const allEntries = Object.values(contentRegistry);
    allEntries.forEach((entry) => {
      expect(entry).not.toHaveProperty("review");
    });
  });

  it("rejects Offer", () => {
    const allEntries = Object.values(contentRegistry);
    allEntries.forEach((entry) => {
      expect(entry).not.toHaveProperty("offers");
    });
  });

  it("rejects PriceSpecification", () => {
    const allEntries = Object.values(contentRegistry);
    allEntries.forEach((entry) => {
      expect(entry).not.toHaveProperty("priceSpecification");
    });
  });

  it("rejects Certification", () => {
    const allEntries = Object.values(contentRegistry);
    allEntries.forEach((entry) => {
      expect(entry).not.toHaveProperty("certification");
    });
  });

  it("server detail page schema does not include unsupported types", () => {
    // The server registry entries should not have these fields
    const servers = getIndexableServers();
    servers.forEach((server) => {
      expect(server).not.toHaveProperty("aggregateRating");
      expect(server).not.toHaveProperty("review");
      expect(server).not.toHaveProperty("offers");
      expect(server).not.toHaveProperty("priceSpecification");
      expect(server).not.toHaveProperty("certification");
    });
  });
});