// lib/security/redact.ts
// PII Redaction Utility for DPDP compliance
// Automatically detects and redacts sensitive data before storage in audit logs

import { detectPII, PIIMatch, PII_COMBINED_PATTERN, PII_PATTERN_LABELS } from './pii-patterns';
import { AuditLogEntry } from '@/lib/db/schema';

export interface RedactOptions {
  replacement?: string;
  preserveLength?: boolean;
  redactEmails?: boolean;
  redactPhones?: boolean;
  redactAadhaar?: boolean;
  redactPan?: boolean;
  redactVPA?: boolean;
  redactIPs?: boolean;
}

export interface RedactedContent {
  content: string;
  redactedFields: RedactedField[];
  originalLength: number;
}

export interface RedactedField {
  patternType: string;
  originalValue: string;
  redactedValue: string;
  position: { start: number; end: number };
}

const DEFAULT_OPTIONS: Required<Omit<RedactOptions, 'replacement'>> & Pick<RedactOptions, 'replacement'> = {
  replacement: '[REDACTED]',
  preserveLength: false,
  redactEmails: true,
  redactPhones: true,
  redactAadhaar: true,
  redactPan: true,
  redactVPA: true,
  redactIPs: true,
};

/**
 * Redact all PII from a string
 * @returns Object containing redacted content, field details, and original length
 */
export function redactPII(
  content: string,
  options?: RedactOptions,
): RedactedContent {
  if (typeof content !== 'string') {
    return {
      content: String(content),
      redactedFields: [],
      originalLength: typeof content === 'string' ? content.length : 0,
    };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const matches = detectPII(content);
  const filtered = matches.filter((m) => isPatternEnabled(m.type, opts));

  if (filtered.length === 0) {
    return {
      content,
      redactedFields: [],
      originalLength: content.length,
    };
  }

  // Sort matches by position to process redaction correctly
  const sorted = [...filtered].sort((a, b) => a.startIndex - b.startIndex);

  let result = '';
  let lastEnd = 0;
  const redactedFields: RedactedField[] = [];

  for (const match of sorted) {
    // Append text before the match
    result += content.substring(lastEnd, match.startIndex);

    // Generate replacement
    const replacement = opts.preserveLength
      ? '*'.repeat(match.value.length)
      : opts.replacement || '[REDACTED]';

    result += replacement;
    lastEnd = match.endIndex;

    redactedFields.push({
      patternType: match.type,
      originalValue: match.value,
      redactedValue: replacement,
      position: { start: match.startIndex, end: match.endIndex },
    });
  }

  // Append remaining text
  result += content.substring(lastEnd);

  return {
    content: result,
    redactedFields,
    originalLength: content.length,
  };
}

/**
 * Check if a PII pattern type is enabled in the given options
 */
function isPatternEnabled(type: string, options: Required<NonNullable<RedactOptions>>): boolean {
  switch (type) {
    case 'email':
      return options.redactEmails;
    case 'phone':
      return options.redactPhones;
    case 'aadhaar':
      return options.redactAadhaar;
    case 'pan':
      return options.redactPan;
    case 'vpa':
      return options.redactVPA;
    case 'ipv4':
    case 'private_ip':
      return options.redactIPs;
    default:
      return true;
  }
}

/**
 * Deep redact object — recursively applies PII redaction to all string values
 */
export function redactObject(obj: unknown, options?: RedactOptions): unknown {
  if (typeof obj === 'string') {
    const result = redactPII(obj, options);
    return result.content;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, options));
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = redactObject(value, options);
    }
    return result;
  }

  return obj;
}

/**
 * Create an audit log entry with PII redaction applied
 */
export function createRedactedAuditEntry(
  entry: Omit<AuditLogEntry, 'id' | 'redacted'>,
): AuditLogEntry {
  // In a real implementation, the audit entry would already have redacted fields
  // This is a utility for testing and manual audit entry creation
  return {
    id: entry.id || crypto.randomUUID(),
    tenantId: entry.tenantId,
    userId: entry.userId,
    serverId: entry.serverId,
    toolName: entry.toolName,
    status: entry.status,
    latencyMs: entry.latencyMs,
    requestId: entry.requestId,
    redacted: true,
    createdAt: entry.createdAt || new Date(),
  };
}

/**
 * PII Detection Summary for audit purposes
 */
export interface PIISummary {
  detected: boolean;
  patterns: string[];
  totalCount: number;
  byType: Record<string, number>;
}

/**
 * Get a summary of PII detected in content
 */
export function getPIISummary(content: string): PIISummary {
  const matches = detectPII(content);
  const byType: Record<string, number> = {};

  for (const match of matches) {
    byType[match.type] = (byType[match.type] || 0) + 1;
  }

  return {
    detected: matches.length > 0,
    patterns: matches.map((m) => m.type),
    totalCount: matches.length,
    byType,
  };
}
