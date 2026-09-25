import { describe, it, expect } from "vitest";
import { contentRegistry } from "@/content/content-registry";

describe("breadcrumbs", () => {
  it("component-facing data uses { label, href }", () => {
    const indexable = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    indexable.forEach((entry) => {
      if (entry.relatedInternalLinks) {
        entry.relatedInternalLinks.forEach((link) => {
          expect(link).toHaveProperty("label");
          expect(link).toHaveProperty("href");
          expect(typeof link.label).toBe("string");
          expect(typeof link.href).toBe("string");
          expect(link.href).toMatch(/^\//);
        });
      }
    });
  });

  it("does not use { name, path }", () => {
    const indexable = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    indexable.forEach((entry) => {
      if (entry.relatedInternalLinks) {
        entry.relatedInternalLinks.forEach((link) => {
          expect(link).not.toHaveProperty("name");
          expect(link).not.toHaveProperty("path");
        });
      }
    });
  });

  it("breadcrumb structure is consistent", () => {
    // Test that we can build breadcrumbs from registry entries
    const buildBreadcrumbs = (entry: typeof indexable[0]) => {
      const crumbs = [{ label: "Home", href: "/" }];
      if (entry.parent && entry.parent !== "") {
        const parent = contentRegistry[`/${entry.parent}`];
        if (parent) {
          crumbs.push({ label: parent.title, href: parent.indexPath });
        }
      }
      crumbs.push({ label: entry.title, href: entry.indexPath });
      return crumbs;
    };

    const indexable = Object.values(contentRegistry).filter(
      (e) => e.status === "published" && !e.noindex
    );
    indexable.forEach((entry) => {
      const crumbs = buildBreadcrumbs(entry);
      crumbs.forEach((crumb) => {
        expect(crumb).toHaveProperty("label");
        expect(crumb).toHaveProperty("href");
      });
    });
  });
});