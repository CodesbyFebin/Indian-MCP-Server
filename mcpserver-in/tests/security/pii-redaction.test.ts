// tests/security/pii-redaction.test.ts
// Unit tests for PII redaction pipeline

import { redactPII, getPIISummary, redactObject } from '@/lib/security/redact';
import { detectPII } from '@/lib/security/pii-patterns';

describe('PII Redaction', () => {
  describe('Aadhaar numbers', () => {
    test('should detect and redact 12-digit Aadhaar numbers', () => {
      const content = 'User Aadhaar: 1234 5678 9012';
      const result = redactPII(content);

      expect(result.content).not.toContain('1234 5678 9012');
      expect(result.content).toContain('[REDACTED]');
      expect(result.redactedFields).toHaveLength(1);
      expect(result.redactedFields[0].patternType).toBe('aadhaar');
    });

    test('should handle formatted Aadhaar with dashes', () => {
      const content = 'Aadhaar: 1234-5678-9012';
      const result = redactPII(content);

      expect(result.content).not.toContain('1234-5678-9012');
    });

    test('should preserve content length when preserveLength is true', () => {
      const content = 'Aadhaar: 1234 5678 9012';
      const result = redactPII(content, { preserveLength: true });

      expect(result.content.length).toBe(content.length);
      expect(result.content).toContain('*');
    });
  });

  describe('PAN numbers', () => {
    test('should detect and redact PAN numbers', () => {
      const content = 'PAN: ABCDE1234F';
      const result = redactPII(content);

      expect(result.content).not.toContain('ABCDE1234F');
      expect(result.redactedFields.some((f) => f.patternType === 'pan')).toBe(true);
    });
  });

  describe('Phone numbers', () => {
    test('should detect and redact Indian phone numbers', () => {
      const content = 'Call me at +91-9876543210';
      const result = redactPII(content);

      expect(result.content).not.toContain('9876543210');
      expect(result.redactedFields.some((f) => f.patternType === 'phone')).toBe(true);
    });

    test('should detect 10-digit phone numbers starting with 6-9', () => {
      const content = 'Phone: 9876543210';
      const result = redactPII(content);

      expect(result.content).not.toContain('9876543210');
    });
  });

  describe('Email addresses', () => {
    test('should detect and redact email addresses', () => {
      const content = 'Email: user@example.com';
      const result = redactPII(content);

      expect(result.content).not.toContain('user@example.com');
      expect(result.redactedFields.some((f) => f.patternType === 'email')).toBe(true);
    });
  });

  describe('IFSC codes', () => {
    test('should detect and redact IFSC codes', () => {
      const content = 'IFSC: SBIN0002499';
      const result = redactPII(content);

      expect(result.content).not.toContain('SBIN0002499');
    });
  });

  describe('detectPII function', () => {
    test('should return matches with positions', () => {
      const content = 'User: 9876543210, email: test@example.com';
      const matches = detectPII(content);

      expect(matches.length).toBe(2);
      expect(matches[0].startIndex).toBe(content.indexOf('9876543210'));
    });

    test('should return empty for no PII', () => {
      const content = 'This is a clean string with no PII';
      const matches = detectPII(content);

      expect(matches).toHaveLength(0);
    });
  });

  describe('getPIISummary', () => {
    test('should summarize detected PII', () => {
      const content = 'Phone: 9876543210, Email: test@example.com';
      const summary = getPIISummary(content);

      expect(summary.detected).toBe(true);
      expect(summary.totalCount).toBe(2);
      expect(summary.byType).toHaveProperty('phone');
      expect(summary.byType).toHaveProperty('email');
    });
  });

  describe('redactObject', () => {
    test('should redact PII in object string values', () => {
      const obj = {
        user: 'John Doe',
        phone: '9876543210',
        email: 'john@example.com',
        nested: {
          data: 'PAN: ABCDE1234F',
        },
      };

      const result = redactObject(obj);

      expect(JSON.stringify(result)).not.toContain('9876543210');
      expect(JSON.stringify(result)).not.toContain('john@example.com');
      expect(JSON.stringify(result)).not.toContain('ABCDE1234F');
      expect(result.nested.data).toContain('[REDACTED]');
    });

    test('should handle arrays in objects', () => {
      const obj = {
        items: ['phone 9876543210', 'email test@example.com'],
      };

      const result = redactObject(obj);

      expect(JSON.stringify(result)).not.toContain('9876543210');
      expect(JSON.stringify(result)).not.toContain('test@example.com');
    });
  });
});
