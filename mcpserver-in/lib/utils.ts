// lib/utils.ts
// Shared utility functions

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { redactPII } from '@/lib/security/redact';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Deep redact PII in any value before returning to client
 */
export function sanitizeForOutput<T>(value: T): T {
  if (typeof value === 'string') {
    return redactPII(value).content as T;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForOutput);
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeForOutput(v);
    }
    return result as T;
  }
  return value;
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function formatProofHash(hash: string | null, length = 8): string {
  if (!hash || hash.length < 2 * length) return 'no-hash';
  return `${hash.substring(0, length)}…${hash.substring(hash.length - length)}`;
}
