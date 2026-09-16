// packages/security/src/secrets/types.ts
// Secret management type definitions

import { z } from 'zod';

/**
 * Context for secret operations - contains authorization and audit information
 */
export const SecretContextSchema = z.object({
  requestId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  resourceType: z.string(),
  resourceId: z.string(),
  action: z.enum(['create', 'read', 'rotate', 'revoke']),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export type SecretContext = z.infer<typeof SecretContextSchema>;

/**
 * Reference to a secret - does not contain the actual secret value
 */
export const SecretReferenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  provider: z.enum(['local-encrypted', 'vault', 'aws-secrets', 'kubernetes']),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().optional(),
  version: z.string(),
});

export type SecretReference = z.infer<typeof SecretReferenceSchema>;

/**
 * Metadata describing a secret's purpose and access policy
 */
export const SecretMetadataSchema = z.object({
  description: z.string(),
  owner: z.string().uuid(),
  accessPattern: z.enum(['read-once', 'continuous', 'on-demand']).default('on-demand'),
  rotationPeriod: z.number().int().positive().optional(),
  lastAccessedAt: z.date().optional(),
  accessCount: z.number().int().default(0),
  // India Evidence Pack
  residencyZone: z.string().optional(), // 'india-only', 'mumbai-only', etc.
  complianceFramework: z.enum(['dpdp', 'rbi', 'iso27001', 'soc2']).optional(),
  controlId: z.string().optional(),
});

export type SecretMetadata = z.infer<typeof SecretMetadataSchema>;

/**
 * Result of a secret verification operation
 */
export interface SecretVerificationResult {
  valid: boolean;
  secretId: string;
  verifiedAt: Date;
  method: string;
  metadata?: Record<string, unknown>;
}