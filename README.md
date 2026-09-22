# mcpserver.in — Marketing & Content Site

Public authority website for MCP server discovery, comparisons, guides, and
glossary content — the SEO/AEO/GEO surface for the MCP ecosystem in India.

This repository is the **marketing/content product**. The separate control-plane
application (deploy, govern, observe MCP workloads) lives in
[`CodesbyFebin/mcp-server-app`](https://github.com/CodesbyFebin/mcp-server-app),
served from `app.mcpserver.in`.

## Structure

- `app/` — Next.js App Router pages (servers directory, guides, glossary, learn,
  compliance/security pages, comparisons, evidence, sitemap, `llms.txt`, `registry.json`)
- `src/content/` — content and server registry data feeding the site
- `src/seo/` — metadata, breadcrumbs, and schema.org structured data helpers
- `packages/registry/` — `@mcp/servers-registry`, the publication-authority
  logic (`isServerIndexable`) shared build-time dependency of this site
- `data/migration/` — source data from the legacy content migration (redirects,
  glossary reconciliation, GSC performance snapshots)
- `docs/` — migration inventory and report from the legacy → canonical content move

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```
