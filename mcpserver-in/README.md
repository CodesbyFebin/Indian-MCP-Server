# mcpserver-in

**India-region MCP (Model Context Protocol) Server directory, evidence ledger, and hosting control plane.**

Built with Next.js 16.3.4, TypeScript, Turbopack, Drizzle ORM, and PostgreSQL. Follows the 2026-07-28 MCP specification (stateless).

## Project Structure

```
mcpserver-in/
├── app/
│   ├── (app)/              # Authenticated control plane
│   ├── (marketing)/        # Static marketing pages
│   ├── .well-known/        # OAuth discovery (RFC 9707, RFC 9728)
│   ├── api/
│   │   ├── mcp/            # Core MCP endpoint
│   │   ├── auth/           # OAuth endpoints
│   │   ├── v1/servers/     # REST API for server management
│   │   ├── v1/search/      # Search endpoint
│   │   └── revalidate/     # Cache revalidation
│   ├── servers/            # Public server directory
│   ├── guides/             # Documentation guides
│   ├── compliance/         # DPDP & RBI compliance pages
│   ├── sitemap.ts          # Auto-generated sitemap
│   ├── robots.ts           # robots.txt
│   ├── manifest.ts         # PWA manifest
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── proxy.ts            # Replaces middleware.ts (Next 16)
│   └── globals.css
├── components/
│   ├── ui/                 # Shadcn-style components
│   ├── hero.tsx
│   ├── server-count.tsx
│   ├── servers-table.tsx
│   ├── evidence-ledger.tsx
│   └── ...
├── lib/
│   ├── db/                 # Drizzle ORM schema
│   ├── auth/               # JWT verification
│   ├── security/           # PII redaction
│   ├── audit/              # Audit logging
│   └── utils.ts            # Shared utilities
├── tests/
│   ├── security/           # PII redaction tests
│   ├── e2e/                # Playwright tests
│   └── setup.ts
├── prisma/                 # Legacy (replaced by Drizzle)
├── next.config.ts
├── drizzle.config.ts
├── package.json
└── ...
```

## Features

- **MCP Server**: Fully compliant 2026-07-28 spec endpoint with tool registration
- **Evidence Ledger**: Append-only evidence records with SHA-256 proof hashes
- **DPDP Compliance**: Automatic PII redaction for logs and API responses
- **RBI Pre-Flight Check**: Server configuration validation against RBI Cyber Framework
- **Multi-tenant**: Row-level security on PostgreSQL for organization isolation
- **Rate Limiting**: Upstash Redis-based rate limiting on all endpoints
- **SEO Optimized**: JSON-LD, sitemaps, OG images, canonical URLs
- **Testing**: Vitest unit tests + Playwright E2E tests

## Getting Started

```bash
# Clone and install
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Set up database
npx drizzle-kit generate
npx drizzle-kit migrate

# Start development server
npm run dev

# Run tests
npm test  # unit tests
npm run test:e2e  # e2e tests
```

## Tech Stack

- **Framework**: Next.js 16.3.4 (App Router)
- **Runtime**: Node.js 20.9+
- **Database**: PostgreSQL via Drizzle ORM
- **State**: Server Components, Cache Components, PPR
- **Styling**: Tailwind CSS
- **Auth**: JWT (ES256) with RFC 9728
- **Rate Limiting**: Upstash Redis
- **Testing**: Vitest + Playwright

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_URL` | Application base URL |
| `AUTH_SECRET` | JWT signing secret |
| `AUTH_SERVER_URL` | OAuth issuer URL |
| `AUTH_JWKS_URL` | JWKS endpoint (production) |
| `UPSTASH_REDIS_URL` | Redis connection for rate limiting |
| `UPSTASH_REDIS_TOKEN` | Redis auth token |

## License

Proprietary — India-region MCP Server directory for mcpserver.in
