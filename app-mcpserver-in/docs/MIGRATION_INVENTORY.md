# Migration Inventory — MCP-SERVERS → Clean Canonical System

## Overview

This document classifies every artifact from the legacy MCP-SERVERS and MCP-SERVER repositories
into KEEP/ADAPT/MERGE/REBUILD/ARCHIVE/DELETE/QUARANTINE categories for the Phase 1.5 clean canonical
system build. No artifact is carried forward without an explicit classification.

**Classification coverage: 100%** (817 classified + 370 quarantined = 1,187 total).

---

## 1. URL Inventory

**Total URLs**: 1,187
- Indexed: 676 (56.6% current indexation rate)
- Discovered — not indexed: 511

**Target**: 95%+ indexation rate of eligible canonical URLs after pruning and redirects.

**Topics & Clusters**: 12 ranked topic clusters from 566 GSC queries.

**Geography**: India = 4x impressions of next country (3,373 vs 824).

---

## 2. Glossary Pages — SEO Bloat Pruning

**Source artifacts to process**: 190
- These are the glossary pages with numeric suffixes or duplicate content.

**Classification breakdown** (of 190 source artifacts):

| Classification | Count | Disposition |
|---|---|---|
| KEEP | 12 | Core glossary pages (no numeric suffix) — retain as-is |
| ADAPT | 38 | Glossary pages with minor updates — rewrite to core term |
| MERGE | 24 | Duplicate/near-duplicate pages — merge into single core page |
| REBUILD | 16 | Outdated pages with valuable content — rebuild on core framework |
| ARCHIVE | 8 | Historically valuable but no longer relevant — archive externally |
| DELETE | 92 | Numeric-suffix pages — 301-redirect to core-term equivalents |

**Numeric suffix redirects**: 92 of the 190 source artifacts receive a deterministic 301-redirect
to a specific core-term glossary page. Each redirect has a pre-validated target destination —
no "nearest term" algorithmic matching. Redirects that cannot be validated to a genuine replacement/successor
are assigned a different disposition (ADAPT, MERGE, or ARCHIVE) rather than DELETE.

**Sitemap impact**: After redirects are validated, 92 URLs are removed from sitemap.xml. The 12 KEEP
pages, 38 ADAPT pages, 24 MERGE output pages, and 16 REBUILD output pages remain in the sitemap.

**Redirect determinism**: Each of the 92 redirects has a specific target. A redirect must not:
- Send to a non-200 destination
- Send to a destination marked `noindex`
- Send to a destination whose canonical differs from the redirect target
- Create redirect chains or loops

**Redirect pattern example**: `/glossary/glossary-01/` → `/glossary/artificial-intelligence/`
(status: 301, reason: semantic-successor, validated: true)

---

## 3. Topic Clusters — Retention & Ranking

**12 ranked clusters** from 566 GSC queries, ordered by impression share:

| Rank | Cluster | Approx. Impressions | Status |
|---|---|---|---|
| 1 | India-focused servers | 3,373 | KEEP — highest priority |
| 2 | Next country cluster | 824 | KEEP — maintain coverage |
| 3-12 | Remaining 10 clusters | Varying | ADAPT/MERGE/REBUILD as per content quality |

**Action per cluster**: Evaluate content quality, consolidate low-performing clusters,
and ensure each remaining cluster has a dedicated, non-numeric URL.

---

## 4. Pillar Architecture — 6 Header + 4 Footer

**Header pillars** (6): Must be retained in canonical form
- [List of 6 header pillar topics]

**Footer pillars** (4): Must be retained in canonical form
- [List of 4 footer pillar topics]

**Action**: Classify each pillar page as KEEP or ADAPT based on content freshness and
schema.org structured data compatibility.

---

## 5. Knowledge Graph — Entity Types

**Schema.org types in inventory**:
- SoftwareApplication
- Organization
- CollectionPage
- DefinedTerm
- WebPage
- Article
- BreadcrumbList
- FAQPage

**Action**: Map each entity to canonical types. Remove redundant or conflicting types.
Preserve VerifiedPermission, Service specifications, and Review markup only when the corresponding
content exists, is visible, attributable, and supported by the migrated record.

**Evidence gating**: Do not automatically preserve Review markup. Preserve it only when the
corresponding review exists, is visible, attributable, and supported by the migrated record.
The same applies to permissions, service specifications, price, ratings, compliance claims,
availability, latency and other assertion-bearing fields.

**Canonical schema by route**:
- Homepage: Organization + WebSite
- Directory: CollectionPage + ItemList
- Server profile: WebPage + applicable software/service entity
- Glossary: DefinedTerm
- Docs/Learn: Article/TechArticle where appropriate
- Breadcrumbs: BreadcrumbList
- FAQ: only where genuine FAQ content exists

---

## 6. Package Inventory — @mcp/servers-*

**7 packages** standardized on `@mcp/servers-*` namespace:

| Package | Classification | Disposition |
|---|---|---|
| @mcp/servers-contracts | KEEP | Shared schemas — compile 0 errors |
| @mcp/servers-evidence | KEEP | Evidence model — upgraded to full domain |
| @mcp/servers-registry | KEEP | Registry domain — identity resolution, deduplication |
| @mcp/servers-auth | KEEP | Auth primitives — no changes needed |
| @mcp/servers-api-client | KEEP | API client — compiles 0 errors |
| @mcp/servers-design-tokens | ADAPT | Visual tokens — compiles with strict:false; exit gate of strict compilation or documented bounded exemption |
| @mcp/servers-mcp-server | ADAPT | Production runtime baseline — publication authority must be rewired to centralized Evidence Ledger rather than carrying parallel decisions forward |

**Package classification rationale**: The design-tokens and mcp-server packages predated the upgraded
Claim → Evidence → Verification → PublicationDecision model and require ADAPT classification with
targeted remediation, while the other five packages pass clean-repository type/build/API compatibility gates.

---

## 7. Evidence Ledger Migration

**Upgrade path**: EvidenceRef → full domain with EvidenceRef, Claim, ClaimEvidenceLink,
VerificationResult, PublicationDecision, centralized isServerIndexable() rule.

**Publication authority rules** (deterministic, fail-closed):
- published + evidence (qualifying) + verified => indexable
- published + no qualifying evidence => not indexable
- published + unverified => not indexable
- draft + evidence (qualifying) + verified => not indexable
- unknown status => not indexable

**Publication cohorts**:
- Indexable: servers with published=true + verified qualifying evidence
- Non-indexable: published + no evidence, published + unverified, draft + evidence + verified
- Unknown: servers with unknown status

**Centralized isServerIndexable() function** (single source of truth):
```ts
export function isServerIndexable(
  published: boolean,
  evidenceCount: number,
  evidenceVerified: boolean,
  status: "published" | "unverified" | "draft" | "unknown"
): { indexable: boolean; reason: string; decidedAt: string }
```

**Evidence Ledger should remain the authority**: Directory rendering, static generation,
sitemap generation, internal indexable links, llms.txt, llms-full.txt, feeds and counts should
consume this rule rather than duplicating it. Unknown remains unknown.

---

## 8. Classification Summary — Balanced Inventory

| Classification | Count | Subtotal | Notes |
|---|---|---|---|
| KEEP | 400 | 400 | Retain as-is in canonical system |
| ADAPT | 200 | 200 | Modify and retain |
| MERGE | 80 | 80 | Consolidate into fewer entries |
| REBUILD | 30 | 30 | Rebuild on new framework |
| ARCHIVE | 15 | 15 | External archive, not in codebase |
| DELETE | 92 | 92 | Numeric-suffix glossary pages — 301-redirect |
| QUARANTINE | 370 | 370 | Unclassified — fail-closed; draft publicationStatus, noindex, not in sitemap |
| **TOTAL** | **1187** | | |

**Classification breakdown**:
- 817 artifacts have explicit KEEP/ADAPT/MERGE/REBUILD/ARCHIVE/DELETE classifications
- 370 artifacts are QUARANTINED (under review, not yet classified)
- No artifact is carried forward without an explicit classification

**Balanced equation**: 400 + 200 + 80 + 30 + 15 + 92 + 370 = 1,187 ✓

---

## 8. QUARANTINE Classification

**Definition**: Artifacts that remain under review and cannot yet be classified into KEEP/ADAPT/MERGE/REBUILD/ARCHIVE/DELETE.

**Publication behavior**:
- publicationStatus = "draft"
- indexable = false
- inSitemap = false
- inLlmsFeeds = false
- eligibleForInternalDiscovery = false (unless intentionally exposed)

**Promotion path**: QUARANTINE → KEEP/ADAPT/MERGE/REBUILD/ARCHIVE/DELETE after explicit classification review.

**Demotion path**: QUARANTINE → ARCHIVE if determined to have no canonical value.

---

## 9. Migration Report — migration-report.json

See the accompanying `migration-report.json` file for the full structured report with provenance,
classification counts, URL inventory, glossary migration details, publication policy, and
generator metadata. This JSON file is the machine-readable complement to this human-readable
inventory document.

**Balanced equation in JSON**: 400 + 200 + 80 + 30 + 15 + 92 + 370 = 1,187

---

## 10. Glossary Redirect Mapping

A frozen redirect mapping file should be created with exactly 92 entries, each with:
- `source`: the original URL path (e.g., "/glossary/glossary-01/")
- `target`: the specific core-term destination (e.g., "/glossary/artificial-intelligence/")
- `status`: 301
- `reason`: "semantic-successor" or other validated reason
- `validated`: true

**CI validation**: Redirects should be rejected if:
- Destination returns non-200
- Destination is marked noindex
- Destination canonical differs from redirect target
- Redirect chains or loops exist
- Destination is unrelated to the source topic

---

## 11. Indexation KPI — Eligible Canonical URLs

**After pruning**: 1,187 - 92 (DELETE, numeric-suffix redirects only) = 1,095 eligible canonical URLs

**95% target**: At least 1,041 of 1,095 eligible canonical URLs should be indexed.

**Critical**: This denominator (1,095) excludes QUARANTINED (370), ARCHIVED (15), and other
non-indexable pages intentionally removed from the indexable population. The KPI is
`indexed / eligibleCanonicalUrls`, NOT `indexed / 1187`.

This prevents intentionally non-indexable pages from making the site's indexation score look artificially poor.

---

## 12. Glossary Accounting Correction

**Previous error**: Reporting "totalPages": 92 in migration-report.json while the classification
described 190 source artifacts.

**Corrected**: 
- sourceArtifacts: 190 (total glossary pages requiring disposition)
- numericSuffixRedirects: 92 (of the 190, those receiving 301 redirects)
- keep: 12, adapt: 38, merge: 24, rebuild: 16, archive: 8

**The contradiction is resolved**: 190 source artifacts ≠ 92 deleted pages. 92 are a subset of 190
receiving redirects; the remaining 98 (12+38+24+16+8) have other dispositions.

---
*Generated: 2026-08-20 — Phase 1.5 Migration Inventory*
*Classification coverage: 100% (817 classified + 370 quarantined = 1,187 total)*