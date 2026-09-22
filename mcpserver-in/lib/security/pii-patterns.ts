// lib/security/pii-patterns.ts
// PII Detection Patterns for DPDP compliance
// Used for automatic redaction of sensitive data in logs and evidence

// Indian PII patterns based on DPDP Act 2023 and RBI guidelines
export const PII_PATTERNS: RegExp[] = [
  // Aadhaar Number: 12 digits (grouped as XXXX-XXXX-XXXX)
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,

  // PAN Number: 5 letters + 4 digits + 1 letter
  /\b[A-Z]{5}\d{4}[A-Z]\b/,

  // Indian Phone Number: +91 followed by 10 digits, or 10 digits starting with 6-9
  /(?:\+91[-\s]?)?[6-9]\d{9}\b/,

  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,

  // VPA (UPI ID): name@bank
  /\b[A-Za-z0-9.-]+@[a-zA-Z]{3,63}\b/,

  // Indian Bank Account Numbers: typically 10-16 digits
  // Used with caution to avoid false positives
  // Disabled by default — can be selectively enabled
  // /\b\d{10,16}\b/,

  // IFSC Code: 11 characters (4 letters + 0 + 6 alphanumeric)
  /\b[A-Z]{4}0[A-Z0-9]{6}\b/,

  // Passport Number: 1 letter + 7 digits (Indian format)
  /\b[A-Z]\d{7}\b/,

  // Driving License: 2-3 letters + 2-3 digits + year (varies by state)
  /\b[A-Z]{2,3}\s?\d{2,3}[A-Z]?\s?\d{4}\b/,

  // Credit Card Numbers: 13-19 digits grouped by dashes or spaces
  /\b(?:\d[ -]*?){13,19}\b/,

  // IPv4 addresses (internal/external)
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,

  // IP addresses that look like private IPs but could be sensitive
  /\b(?:10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)\d{1,3}\.\d{1,3}\b/,
];

// Pattern labels for audit logging
export const PII_PATTERN_LABELS: Record<number, string> = {
  0: 'aadhaar',
  1: 'pan',
  2: 'phone',
  3: 'email',
  4: 'vpa',
  6: 'ifsc',
  7: 'passport',
  8: 'driving_license',
  9: 'credit_card',
  10: 'ipv4',
  11: 'private_ip',
};

// Combined regex for performance
export const PII_COMBINED_PATTERN = new RegExp(PII_PATTERNS.map((p) => p.source).join('|'), 'gi');

/**
 * Detect all PII patterns in a string
 * @returns Array of detected PII matches with positions
 */
export function detectPII(content: string): PIIMatch[] {
  const matches: PIIMatch[] = [];
  const combined = new RegExp(PII_COMBINED_PATTERN.source, 'g');

  let match: RegExpExecArray | null;
  while ((match = combined.exec(content)) !== null) {
    matches.push({
      type: detectPIIType(match[0]),
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.9,
    });

    if (match.index === combined.lastIndex) {
      combined.lastIndex++;
    }
  }

  return matches;
}

/**
 * Determine the PII type from a matched value
 */
function detectPIIType(value: string): string {
  // Check patterns in order
  for (let i = 0; i < PII_PATTERNS.length; i++) {
    if (PII_PATTERNS[i].test(value)) {
      return PII_PATTERN_LABELS[i] || 'unknown';
    }
  }
  return 'unknown';
}

export interface PIIMatch {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}
