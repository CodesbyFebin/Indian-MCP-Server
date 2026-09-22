// packages/database/src/index.ts
// Database package — Prisma client with RLS and connection pooling
// P0 gap fix for database schema

import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var prisma` in development
  var prisma: PrismaClient | undefined;
}

// Lazy singleton pattern to avoid exhausting database connections in dev hot-reload
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Configure connection pooling for PostgreSQL
    // Prisma Client handles connection pooling automatically via the connection string
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// ============================================================
// Tenant Context Management
// ============================================================

/**
 * Set the current tenant context for PostgreSQL RLS.
 * Must be called at the start of every request to enforce row-level security.
 *
 * Usage:
 *   await prisma.$executeRawUnsafe(`
 *     SELECT set_config('app.current_org_id', '${organizationId}', false);
 *   `);
 */
export async function setTenantContext(organizationId: string, workspaceId?: string): Promise<void> {
  await prisma.$executeRawUnsafe(`
    SELECT
      set_config('app.current_org_id', '${organizationId}', false),
      set_config('app.current_workspace_id', '${workspaceId || ''}', false),
      set_config('app.current_env', '${process.env.NODE_ENV || 'development'}', false);
  `);
}

/**
 * Clear the tenant context (for system-level operations).
 */
export async function clearTenantContext(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    RESET app.current_org_id;
    RESET app.current_workspace_id;
    RESET app.current_env;
  `);
}

// ============================================================
// Database Utilities
// ============================================================

/**
 * Run a query with automatic tenant isolation
 */
export async function withTenant<T>(
  organizationId: string,
  workspaceId: string | undefined,
  query: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  await setTenantContext(organizationId, workspaceId);
  try {
    return await query(prisma);
  } finally {
    await clearTenantContext();
  }
}

// ============================================================
// Export types
// ============================================================

export { prisma };
export type { PrismaClient } from '@prisma/client';
