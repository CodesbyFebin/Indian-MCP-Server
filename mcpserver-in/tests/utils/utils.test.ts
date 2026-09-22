// tests/utils/utils.test.ts
// Unit tests for shared utility functions

import {
  cn,
  formatDate,
  formatDateTime,
  slugify,
  truncate,
  generateRequestId,
  formatProofHash,
  sanitizeForOutput,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    test('should merge classes correctly', () => {
      expect(cn('px-2 py-1', 'py-2 bg-red')).toBe('px-2 py-2 bg-red');
    });

    test('should handle falsy values', () => {
      expect(cn('px-2', false && 'py-1', 'bg-blue')).toBe('px-2 bg-blue');
    });

    test('should handle empty strings', () => {
      expect(cn('', 'px-2', '')).toBe('px-2');
    });
  });

  describe('slugify', () => {
    test('should convert spaces to dashes', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    test('should handle special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    test('should lowercase everything', () => {
      expect(slugify('UPPER')).toBe('upper');
    });

    test('should handle complex strings', () => {
      expect(slugify('My Cool Server (v2.0)')).toBe('my-cool-server-v2-0');
    });
  });

  describe('truncate', () => {
    test('should truncate long strings with ellipsis', () => {
      expect(truncate('this is a very long string', 15)).toBe('this is a very...');
    });

    test('should not truncate short strings', () => {
      expect(truncate('short', 10)).toBe('short');
    });

    test('should handle exact length', () => {
      expect(truncate('1234567890', 10)).toBe('1234567890');
    });
  });

  describe('generateRequestId', () => {
    test('should generate valid UUIDs', () => {
      const id = generateRequestId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    test('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('formatProofHash', () => {
    test('should format with truncation', () => {
      expect(formatProofHash('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234', 4)).toBe('abcd…1234');
    });

    test('should handle null', () => {
      expect(formatProofHash(null)).toBe('no-hash');
    });

    test('should handle null with custom length', () => {
      expect(formatProofHash(null, 16)).toBe('no-hash');
    });
  });

  describe('formatDate', () => {
    test('should format dates correctly', () => {
      const date = new Date('2026-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Jan');
    });
  });

  describe('sanitizeForOutput', () => {
    test('should redact PII from strings', () => {
      const input = 'Phone: 9876543210';
      const output = sanitizeForOutput(input) as string;
      expect(output).not.toContain('9876543210');
    });

    test('should handle nested objects', () => {
      const input = { a: 'phone 9876543210', b: { c: 'email test@test.com' } };
      const output = JSON.stringify(sanitizeForOutput(input));
      expect(output).not.toContain('9876543210');
      expect(output).not.toContain('test@test.com');
    });

    test('should handle arrays', () => {
      const input = ['phone 9876543210', 'email test@test.com'];
      const output = JSON.stringify(sanitizeForOutput(input));
      expect(output).not.toContain('9876543210');
      expect(output).not.toContain('test@test.com');
    });

    test('should not modify non-string primitives', () => {
      expect(sanitizeForOutput(42)).toBe(42);
      expect(sanitizeForOutput(true)).toBe(true);
      expect(sanitizeForOutput(null)).toBe(null);
    });

    test('should not modify Date objects', () => {
      const date = new Date();
      expect(sanitizeForOutput(date)).toBe(date);
    });
  });
});
