// lib/audit/logger.ts
// Audit Logging — Append-Only
// All tool calls are logged here with PII redaction applied

import { db } from '@/lib/db';
import { auditLog, NewAuditLogEntry } from '@/lib/db/schema';
import { redactPII } from '@/lib/security/redact';
import crypto from 'crypto';

export interface AuditEvent {
  tenantId: string;
  userId: string;
  serverId?: string;
  toolName: string;
  status: 'success' | 'error' | 'denied' | 'timeout';
  latencyMs: number;
  params?: unknown;
  error?: string;
}

/**
 * Log an audit event with PII redaction applied.
 * Audit log entries are append-only — no UPDATE or DELETE operations.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const requestId = crypto.randomUUID();

  // Build the base entry
  const entry: NewAuditLogEntry = {
    tenantId: event.tenantId,
    userId: event.userId,
    serverId: event.serverId || null,
    toolName: event.toolName,
    status: event.status,
    latencyMs: event.latencyMs,
    requestId,
    redacted: true,
    createdAt: new Date(),
  };

  // Write to database (append-only)
  try {
    await db.insert(auditLog).values(entry);
  } catch (dbError) {
    // If database fails, log to stderr as fallback
    const redactedParams = event.params ? redactPII(JSON.stringify(event.params)) : undefined;

    console.error(
      JSON.stringify({
        type: 'audit_log_error',
        timestamp: new Date().toISOString(),
        requestId,
        tenantId: event.tenantId,
        userId: event.userId,
        toolName: event.toolName,
        status: event.status,
        latencyMs: event.latencyMs,
        error: dbError instanceof Error ? dbError.message : String(dbError),
        originalParams: redactedParams,
      }),
    );
  }
}

/**
 * Wrap an async function with audit logging
 * @returns [result, auditEntry]
 */
export async function withAuditLogging<T>(
  event: Omit<AuditEvent, 'latencyMs'>,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const latencyMs = Date.now() - startTime;

    await logAuditEvent({
      ...event,
      status: 'success',
      latencyMs,
    });

    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    await logAuditEvent({
      ...event,
      status: 'error',
      latencyMs,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Get audit log entries for a tenant (read-only)
 */
export async function getAuditEntries(
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    toolName?: string;
    status?: string;
  },
) {
  const query = db
    .select()
    .from(auditLog)
    .where(
      (auditLog, { eq, and, gte, lte, like }) => {
        const conditions = [eq(auditLog.tenantId, tenantId)];
        if (options?.startDate) {
          conditions.push(gte(auditLog.createdAt, options.startDate));
        }
        if (options?.endDate) {
          conditions.push(lte(auditLog.createdAt, options.endDate));
        }
        if (options?.toolName) {
          conditions.push(eq(auditLog.toolName, options.toolName));
        }
        if (options?.status) {
          conditions.push(eq(auditLog.status, options.status));
        }
        return and(...conditions);
      },
    )
    .orderBy((auditLog, { desc }) => desc(auditLog.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return query.all();
}
