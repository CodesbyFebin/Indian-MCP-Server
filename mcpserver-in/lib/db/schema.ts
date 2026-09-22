// lib/db/schema.ts
// Database Schema — Drizzle ORM + PostgreSQL
// Append-only evidence and audit tables enforced at DB level

import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ============================================================
// Enums
// ============================================================

export const serverStatus = pgEnum('server_status', ['active', 'under_review', 'deprecated', 'deleted']);
export const transportKind = pgEnum('transport_kind', ['stdio', 'streamable_http']);
export const sourceType = pgEnum('source_type', ['registry_query', 'package_listing', 'spec_clause', 'repo_commit']);

// ============================================================
// Servers Table
// ============================================================

export const servers = pgTable('servers', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(), // io.github.org/server-name
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  status: serverStatus('status').notNull().default('under_review'),
  transport: transportKind('transport').notNull(),
  repoUrl: text('repo_url').notNull(),
  packageUrl: text('package_url'),
  versionPin: text('version_pin'),
  region: text('region').notNull().default('asia-south1'),
  verified: boolean('verified').notNull().default(false),
  serverJson: jsonb('server_json').notNull(), // canonical registry metadata
  tools: jsonb('tools').notNull().$type<ToolManifest[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;

// ============================================================
// Evidence Table (APPEND-ONLY — no UPDATE/DELETE grants)
// ============================================================

export const evidence = pgTable(
  'evidence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').notNull().references(() => servers.id),
    claim: text('claim').notNull(),
    sourceType: sourceType('source_type').notNull(),
    sourceUrl: text('source_url').notNull(),
    // sha256 of canonicalized source for integrity
    proofHash: text('proof_hash').notNull(),
    verifiedAt: timestamp('verified_at').defaultNow().notNull(),
    verifiedBy: text('verified_by').notNull(),
  },
  (table) => ({
    serverIdIdx: index('evidence_server_id_idx').on(table.serverId),
    proofHashIdx: uniqueIndex('evidence_proof_hash_idx').on(table.proofHash),
  }),
);

export type Evidence = typeof evidence.$inferSelect;
export type NewEvidence = typeof evidence.$inferInsert;

// ============================================================
// Audit Log Table (APPEND-ONLY — no UPDATE/DELETE grants)
// ============================================================

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    userId: text('user_id').notNull(),
    serverId: uuid('server_id').references(() => servers.id),
    toolName: text('tool_name').notNull(),
    status: text('status').notNull(),
    latencyMs: integer('latency_ms').notNull(),
    requestId: text('request_id').notNull(),
    redacted: boolean('redacted').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantIdIdx: index('audit_log_tenant_id_idx').on(table.tenantId),
    requestIdIdx: index('audit_log_request_id_idx').on(table.requestId),
    createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
  }),
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;

// ============================================================
// API Tokens Table
// ============================================================

export const apiTokens = pgTable(
  'api_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    name: text('name').notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    prefix: text('prefix').notNull(),
    scopes: text('scopes').array().notNull(),
    allowedIps: text('allowed_ips').array(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    revokedAt: timestamp('revoked_at'),
  },
  (table) => ({
    tenantIdIdx: index('api_tokens_tenant_id_idx').on(table.tenantId),
    tokenHashIdx: uniqueIndex('api_tokens_token_hash_idx').on(table.tokenHash),
  }),
);

// ============================================================
// Type Definitions
// ============================================================

export interface ToolManifest {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
}

// ============================================================
// Append-Only Enforcement (applied via migration SQL)
// ============================================================
// After running migrations, execute:
//   REVOKE UPDATE, DELETE ON evidence FROM app_role;
//   REVOKE UPDATE, DELETE ON audit_log FROM app_role;
// This is enforced at the database level, not the application level.
