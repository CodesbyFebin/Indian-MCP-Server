// packages/evidence/src/types.ts
// Evidence Ledger TypeScript Schema
// Phase 7 Implementation — CORE PRIORITY

import { z } from 'zod';

// ============================================================
// Core Types
// ============================================================

export const EvidenceType = z.enum([
  'CONFIG',
  'SOURCE',
  'SCAN',
  'RUNTIME',
  'LOG',
  'APPROVAL',
  'ATTESTATION',
  'MANUAL',
]);

export const EvidenceStatus = z.enum([
  'COLLECTED',
  'VERIFIED',
  'PARTIAL',
  'STALE',
  'REJECTED',
  'PENDING_REVIEW',
]);

export const ArtifactSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  resourceType: z.string(),
  resourceId: z.string(),
  evidenceType: EvidenceType,
  status: EvidenceStatus,
  sha256: z.string().length(64), // SHA-256 hex digest
  previousArtifactHash: z.string().nullable(),
  chainRootHash: z.string().length(64),
  sourceRevision: z.string().optional(),
  verifierVersion: z.string().optional(),
  collectedAt: z.date(),
  verifiedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  metadata: z.record(z.unknown()),
});

export type Artifact = z.infer<typeof ArtifactSchema>;
export type EvidenceTypeValue = z.infer<typeof EvidenceType>;
export type EvidenceStatusValue = z.infer<typeof EvidenceStatus>;

// ============================================================
// Hash Chain Implementation
// ============================================================

export interface HashChainConfig {
  chainId: string;
  organizationId: string;
  createdAt: Date;
}

export interface HashChainState {
  currentRootHash: string;
  latestArtifactHash: string | null;
  artifactCount: number;
  lastUpdated: Date;
}

export interface EvidenceCollectionContext {
  requestId: string;
  organizationId: string;
  userId?: string;
  source: string;
  timestamp: Date;
}

export interface EvidenceMetadata {
  // Common metadata fields
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  sourceTool?: string;
  sourceVersion?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  actorType?: 'user' | 'system' | 'agent';
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  sessionId?: string;
  requestId?: string;
  // India Evidence Pack specific
  residencyZone?: string;
  complianceFramework?: 'dpdp' | 'rbi' | 'iso27001' | 'soc2';
  controlId?: string;
  evidenceSource?: string;
  verificationMethod?: string;
  [key: string]: unknown;
}

// ============================================================
// Evidence Ledger Interface
// ============================================================

export interface EvidenceLedger {
  /**
   * Create a new evidence artifact
   */
  create(input: EvidenceCreateInput): Promise<Artifact>;

  /**
   * Retrieve an evidence artifact by ID
   */
  get(id: string, context: EvidenceCollectionContext): Promise<Artifact | null>;

  /**
   * Update an evidence artifact's status
   */
  update(id: string, update: EvidenceUpdateInput): Promise<Artifact>;

  /**
   * List evidence artifacts for a resource
   */
  list(input: EvidenceListInput): Promise<{ artifacts: Artifact[]; count: number }>;

  /**
   * Verify the hash chain integrity for an organization
   */
  verifyChain(organizationId: string): Promise<ChainVerificationResult>;

  /**
   * Generate an evidence package for audit
   */
  generatePackage(input: EvidencePackageInput): Promise<EvidencePackage>;
}

export interface EvidenceCreateInput {
  organizationId: string;
  resourceType: string;
  resourceId: string;
  evidenceType: EvidenceTypeValue;
  sha256: string;
  sourceRevision?: string;
  verifierVersion?: string;
  expiresAt?: Date;
  metadata: EvidenceMetadata;
}

export interface EvidenceUpdateInput {
  status?: EvidenceStatusValue;
  verifiedAt?: Date;
  verifierVersion?: string;
  metadata?: Partial<EvidenceMetadata>;
  chainRootHash?: string;
}

export interface EvidenceListInput {
  organizationId: string;
  resourceType?: string;
  resourceId?: string;
  evidenceType?: EvidenceTypeValue;
  status?: EvidenceStatusValue;
  limit?: number;
  offset?: number;
  sortBy?: 'collectedAt' | 'verifiedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface EvidencePackageInput {
  organizationId: string;
  framework: 'dpdp' | 'rbi' | 'iso27001' | 'soc2';
  controlIds?: string[];
  startDate?: Date;
  endDate?: Date;
  format: 'json' | 'pdf' | 'csv';
}

export interface ChainVerificationResult {
  valid: boolean;
  organizationId: string;
  artifactCount: number;
  brokenAt?: string;
  expectedRootHash: string;
  actualRootHash: string;
  discrepancies: Array<{
    artifactId: string;
    field: string;
    expected: string;
    actual: string;
  }>;
}

export interface EvidencePackage {
  id: string;
  organizationId: string;
  framework: string;
  generatedAt: Date;
  generatedBy: string;
  controlMappings: Array<{
    controlId: string;
    controlName: string;
    status: EvidenceStatusValue;
    evidenceCount: number;
    latestEvidenceId: string;
    verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'STALE';
  }>;
  evidenceArtifacts: Artifact[];
  hashChain: {
    rootHash: string;
    artifactCount: number;
    chainValid: boolean;
  };
  signature: string;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Canonical serialization for hash computation
 * Ensures consistent byte representation for hashing
 */
export function canonicalSerialize(obj: Record<string, unknown>): string {
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    result[key] = obj[key];
  }
  return JSON.stringify(result);
}

/**
 * Compute SHA-256 hash of canonical bytes
 */
export async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify an evidence artifact's hash
 */
export async function verifyArtifactHash(artifact: Artifact): Promise<boolean> {
  // Recompute hash from evidence content (excluding hash fields)
  const content = {
    id: artifact.id,
    organizationId: artifact.organizationId,
    resourceType: artifact.resourceType,
    resourceId: artifact.resourceId,
    evidenceType: artifact.evidenceType,
    status: artifact.status,
    sourceRevision: artifact.sourceRevision,
    verifierVersion: artifact.verifierVersion,
    collectedAt: artifact.collectedAt.toISOString(),
    verifiedAt: artifact.verifiedAt?.toISOString(),
    expiresAt: artifact.expiresAt?.toISOString(),
    metadata: artifact.metadata,
  };

  const canonicalContent = canonicalSerialize(content);
  const computedHash = await computeSHA256(canonicalContent);
  return computedHash === artifact.sha256;
}

/**
 * Build a hash chain link
 */
export interface HashChainLink {
  artifactId: string;
  artifactHash: string;
  previousArtifactHash: string | null;
  chainRootHash: string;
  linkedAt: Date;
}

export async function buildChainLink(
  artifact: Artifact,
  previousHash: string | null,
  chainRootHash: string,
): Promise<HashChainLink> {
  return {
    artifactId: artifact.id,
    artifactHash: artifact.sha256,
    previousArtifactHash: previousHash,
    chainRootHash,
    linkedAt: new Date(),
  };
}

// ============================================================
// RBI Technical Control Profile
// ============================================================

export interface RBICyberFrameworkControl {
  controlId: string;
  frameworkVersion: string;
  domain: 'access' | 'cryptography' | 'audit' | 'incident' | 'business_continuity' | 'vendor_risk' | 'soc' | 'cyber_crisis';
  controlName: string;
  description: string;
  implementation: {
    status: 'implemented' | 'partial' | 'missing';
    evidenceArtifactId?: string;
    notes?: string;
  };
  verificationMethod: string;
  requiresEvidence: boolean;
  evidenceTypeRequired: EvidenceTypeValue[];
}

export const RBI_CONTROLS: RBICyberFrameworkControl[] = [
  {
    controlId: 'RBI-001',
    frameworkVersion: 'v2023-01',
    domain: 'access',
    controlName: 'Access Control',
    description: 'Implement and maintain appropriate access controls for information systems',
    implementation: {
      status: 'partial',
      notes: 'RBAC and JWT auth implemented; RLS for tenant isolation pending',
    },
    verificationMethod: 'Review access logs and RBAC configuration evidence',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'LOG', 'RUNTIME'],
  },
  {
    controlId: 'RBI-002',
    frameworkVersion: 'v2023-01',
    domain: 'cryptography',
    controlName: 'Cryptographic Controls',
    description: 'Use cryptographic controls to protect confidentiality, integrity, and authenticity',
    implementation: {
      status: 'partial',
      notes: 'TLS enforced for external communication; at-rest encryption pending',
    },
    verificationMethod: 'Review TLS certificates and encryption configuration evidence',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'SCAN', 'LOG'],
  },
  {
    controlId: 'RBI-003',
    frameworkVersion: 'v2023-01',
    domain: 'audit',
    controlName: 'Audit Trail',
    description: 'Maintain audit trails for all privileged activities and security-relevant events',
    implementation: {
      status: 'partial',
      notes: 'Logging framework in place; structured audit logs and retention policy pending',
    },
    verificationMethod: 'Review audit log configuration and sample log entries',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'LOG'],
  },
  {
    controlId: 'RBI-004',
    frameworkVersion: 'v2023-01',
    domain: 'incident',
    controlName: 'Incident Response',
    description: 'Establish and maintain an incident response capability',
    implementation: {
      status: 'partial',
      notes: 'Incident tracking in security center pending full implementation',
    },
    verificationMethod: 'Review incident response plan and simulation exercise results',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'LOG', 'MANUAL'],
  },
  {
    controlId: 'RBI-005',
    frameworkVersion: 'v2023-01',
    domain: 'business_continuity',
    controlName: 'Business Continuity',
    description: 'Plan for and implement business continuity measures',
    implementation: {
      status: 'missing',
      notes: 'Disaster recovery and backup procedures need implementation',
    },
    verificationMethod: 'Review BC and DR plans and test results',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'MANUAL'],
  },
  {
    controlId: 'RBI-006',
    frameworkVersion: 'v2023-01',
    domain: 'vendor_risk',
    controlName: 'Third Party Risk Management',
    description: 'Assess and manage cybersecurity risks from third-party vendors',
    implementation: {
      status: 'partial',
      notes: 'UPI sandbox and registry integration pending full third-party risk management',
    },
    verificationMethod: 'Review vendor assessment records and contracts',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'ATTESTATION', 'MANUAL'],
  },
  {
    controlId: 'RBI-007',
    frameworkVersion: 'v2023-01',
    domain: 'soc',
    controlName: 'Security Operations Center',
    description: 'Establish and maintain a security operations center capability',
    implementation: {
      status: 'partial',
      notes: 'Security center with Shadow MCP and vulnerability findings pending',
    },
    verificationMethod: 'Review SOC procedures and monitoring effectiveness',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'RUNTIME', 'LOG'],
  },
  {
    controlId: 'RBI-008',
    frameworkVersion: 'v2023-01',
    domain: 'cyber_crisis',
    controlName: 'Cyber Crisis Management',
    description: 'Plan for and manage cyber crisis situations',
    implementation: {
      status: 'missing',
      notes: 'Cyber crisis management plan needs development',
    },
    verificationMethod: 'Review cyber crisis management plan and procedures',
    requiresEvidence: true,
    evidenceTypeRequired: ['CONFIG', 'MANUAL'],
  },
];

// ============================================================
// Factory Functions
// ============================================================

export function createEvidenceArtifact(
  input: EvidenceCreateInput,
  chainRootHash: string,
  previousArtifactHash: string | null,
): Artifact {
  return {
    id: crypto.randomUUID(),
    ...input,
    status: 'COLLECTED',
    sha256: '', // Will be set by hash computation
    previousArtifactHash,
    chainRootHash,
    collectedAt: new Date(),
    metadata: input.metadata,
  };
}

export function updateEvidenceStatus(
  artifact: Artifact,
  status: EvidenceStatusValue,
  verifierVersion?: string,
): Artifact {
  return {
    ...artifact,
    status,
    verifiedAt: status === 'VERIFIED' ? new Date() : artifact.verifiedAt,
    verifierVersion: verifierVersion || artifact.verifierVersion,
  };
}