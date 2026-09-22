// packages/evidence/src/ledger.ts
// Phase 7 - Evidence Ledger Implementation (E-03/E-04)
// Full storage, review, and verification logic

import { Artifact, EvidenceCreateInput, EvidenceUpdateInput, EvidenceListInput, EvidencePackageInput, EvidencePackage, ChainVerificationResult, EvidenceMetadata, computeSHA256, canonicalSerialize, buildChainLink, HashChainState, HashChainLink } from './types';
import { randomUUID } from 'crypto';

/**
 * EvidenceLedger implementation with in-memory storage.
 * In production, this would use PostgreSQL with append-only tables.
 */
export class InMemoryEvidenceLedger {
  private artifacts: Map<string, Artifact> = new Map();
  private chainStates: Map<string, HashChainState> = new Map();
  private chainLinks: Map<string, HashChainLink[]> = new Map();

  /**
   * Initialize the ledger for an organization.
   * Creates an empty chain if one doesn't exist.
   */
  initialize(organizationId: string): void {
    if (!this.chainStates.has(organizationId)) {
      this.chainStates.set(organizationId, {
        currentRootHash: '',
        latestArtifactHash: null,
        artifactCount: 0,
        lastUpdated: new Date(),
      });
      this.chainLinks.set(organizationId, []);
    }
  }

  /**
   * E-03: Create a new evidence artifact with hash chain linkage
   */
  async create(input: EvidenceCreateInput): Promise<Artifact> {
    this.initialize(input.organizationId);

    const chainState = this.chainStates.get(input.organizationId)!;

    // Build the artifact content for hashing (excluding chain fields)
    const content = {
      organizationId: input.organizationId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      evidenceType: input.evidenceType,
      status: 'COLLECTED' as const,
      sourceRevision: input.sourceRevision,
      verifierVersion: input.verifierVersion,
      collectedAt: new Date().toISOString(),
      expiresAt: input.expiresAt?.toISOString(),
      metadata: input.metadata,
    };

    const sha256 = await computeSHA256(canonicalSerialize(content));

    // Compute chain root hash
    let chainRootHash: string;
    if (chainState.latestArtifactHash === null) {
      // First artifact — root is hash of the first hash
      chainRootHash = sha256;
    } else {
      // Subsequent: root = sha256(root || newHash)
      chainRootHash = await computeSHA256(chainState.currentRootHash + sha256);
    }

    const artifact: Artifact = {
      id: randomUUID(),
      organizationId: input.organizationId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      evidenceType: input.evidenceType,
      status: 'COLLECTED',
      sha256,
      previousArtifactHash: chainState.latestArtifactHash,
      chainRootHash,
      sourceRevision: input.sourceRevision,
      verifierVersion: input.verifierVersion,
      collectedAt: new Date(),
      metadata: input.metadata,
    };

    this.artifacts.set(artifact.id, artifact);
    chainState.currentRootHash = chainRootHash;
    chainState.latestArtifactHash = sha256;
    chainState.artifactCount += 1;
    chainState.lastUpdated = new Date();

    // Record chain link
    const link = await buildChainLink(artifact, artifact.previousArtifactHash, chainRootHash);
    this.chainLinks.get(input.organizationId)!.push(link);

    return artifact;
  }

  /**
   * Retrieve an evidence artifact by ID
   */
  async get(id: string, organizationId: string): Promise<Artifact | null> {
    const artifact = this.artifacts.get(id);
    if (!artifact || artifact.organizationId !== organizationId) {
      return null;
    }
    return artifact;
  }

  /**
   * E-04: Update an evidence artifact's status with review context
   */
  async update(artifact: Artifact, update: EvidenceUpdateInput): Promise<Artifact> {
    const updated: Artifact = {
      ...artifact,
      status: update.status ?? artifact.status,
      verifiedAt: update.verifiedAt ?? artifact.verifiedAt,
      verifierVersion: update.verifierVersion ?? artifact.verifierVersion,
      metadata: { ...artifact.metadata, ...update.metadata },
      ...(update.chainRootHash ? { chainRootHash: update.chainRootHash } : {}),
    };
    this.artifacts.set(updated.id, updated);
    return updated;
  }

  /**
   * List evidence artifacts with optional filtering and pagination
   */
  async list(input: EvidenceListInput): Promise<{ artifacts: Artifact[]; count: number }> {
    let results = Array.from(this.artifacts.values()).filter((a) => {
      if (a.organizationId !== input.organizationId) return false;
      if (input.resourceType && a.resourceType !== input.resourceType) return false;
      if (input.resourceId && a.resourceId !== input.resourceId) return false;
      if (input.evidenceType && a.evidenceType !== input.evidenceType) return false;
      if (input.status && a.status !== input.status) return false;
      return true;
    });

    // Sort
    const sortBy = input.sortBy || 'collectedAt';
    const sortOrder = input.sortOrder || 'desc';
    results.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
      if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });

    const limit = input.limit || 100;
    const offset = input.offset || 0;
    const paginated = results.slice(offset, offset + limit);

    return { artifacts: paginated, count: results.length };
  }

  /**
   * Verify the hash chain integrity for an organization
   */
  async verifyChain(organizationId: string): Promise<ChainVerificationResult> {
    const artifacts = Array.from(this.artifacts.values())
      .filter((a) => a.organizationId === organizationId)
      .sort((a, b) => (a.collectedAt < b.collectedAt ? -1 : 1));

    let valid = true;
    let brokenAt: string | undefined;
    let previousHash: string | null = null;

    for (const artifact of artifacts) {
      // Verify hash
      const content = {
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

      const expectedHash = await computeSHA256(canonicalSerialize(content));
      if (artifact.sha256 !== expectedHash) {
        valid = false;
        brokenAt = artifact.id;
        break;
      }

      // Verify chain link
      if (artifact.previousArtifactHash !== previousHash) {
        valid = false;
        brokenAt = artifact.id;
        break;
      }

      previousHash = artifact.sha256;
    }

    const chainState = this.chainStates.get(organizationId);
    return {
      valid,
      organizationId,
      artifactCount: artifacts.length,
      brokenAt,
      expectedRootHash: chainState?.currentRootHash || '',
      actualRootHash: artifacts.length > 0
        ? artifacts[artifacts.length - 1].chainRootHash
        : '',
      discrepancies: valid ? [] : [
        {
          artifactId: brokenAt || '',
          field: 'chain_integrity',
          expected: chainState?.currentRootHash || '',
          actual: artifacts.length > 0
            ? artifacts[artifacts.length - 1].chainRootHash
            : '',
        },
      ],
    };
  }

  /**
   * E-06: Generate an evidence package for audit purposes
   * Produces a signed report of evidence for a specific framework
   */
  async generatePackage(input: EvidencePackageInput): Promise<EvidencePackage> {
    const artifacts = await this.list({
      organizationId: input.organizationId,
      limit: 10000,
      sortBy: 'collectedAt',
      sortOrder: 'desc',
    });

    // Filter by control IDs if specified
    let filtered = artifacts.artifacts;
    if (input.controlIds && input.controlIds.length > 0) {
      filtered = artifacts.artifacts.filter(
        (a) => a.metadata.controlId && input.controlIds!.includes(a.metadata.controlId)
      );
    }

    // Build control mappings
    const controlMappings = input.controlIds?.map((controlId) => {
      const controlArtifacts = filtered.filter(
        (a) => a.metadata.controlId === controlId
      );

      const status = controlArtifacts.length > 0
        ? (controlArtifacts.every((a) => a.status === 'VERIFIED')
            ? 'VERIFIED'
            : controlArtifacts.some((a) => a.status === 'VERIFIED')
            ? 'PARTIAL'
            : 'STALE')
        : 'UNVERIFIED';

      return {
        controlId,
        controlName: `Control ${controlId}`,
        status,
        evidenceCount: controlArtifacts.length,
        latestEvidenceId: controlArtifacts[0]?.id || '',
        verificationStatus: status as 'VERIFIED' | 'UNVERIFIED' | 'STALE',
      };
    }) || [];

    const chainResult = await this.verifyChain(input.organizationId);

    return {
      id: randomUUID(),
      organizationId: input.organizationId,
      framework: input.framework,
      generatedAt: new Date(),
      generatedBy: 'system',
      controlMappings,
      evidenceArtifacts: filtered,
      hashChain: {
        rootHash: chainResult.actualRootHash,
        artifactCount: filtered.length,
        chainValid: chainResult.valid,
      },
      signature: '' // Would be signed in production
    };
  }
}

/**
 * Factory function to create the appropriate ledger implementation
 * based on the runtime environment.
 */
export function createEvidenceLedger(): InMemoryEvidenceLedger {
  return new InMemoryEvidenceLedger();
}

/**
 * Export a singleton for convenience in serverless environments
 */
export const evidenceLedger = new InMemoryEvidenceLedger();

/**
 * E-05: Control Mapping Framework
 * Maps evidence artifacts to compliance control frameworks
 */
export class ControlMappingFramework {
  private mappings: Map<string, Array<{
    controlId: string;
    controlName: string;
    framework: string;
    organizationId: string;
    evidenceIds: string[];
    status: string;
    notes?: string;
  }>> = new Map();

  /**
   * Map evidence to a control
   */
  async mapEvidenceToControl(
    organizationId: string,
    controlId: string,
    framework: string,
    evidenceIds: string[],
    notes?: string,
  ): Promise<void> {
    const key = `${organizationId}:${controlId}`;
    const existing = this.mappings.get(key) || [];

    existing.push({
      controlId,
      controlName: `Control ${controlId}`,
      framework,
      organizationId,
      evidenceIds,
      status: 'mapped',
      notes,
    });

    this.mappings.set(key, existing);
  }

  /**
   * Get all mappings for an organization
   */
  getMappings(organizationId: string): Array<{
    controlId: string;
    controlName: string;
    framework: string;
    organizationId: string;
    evidenceIds: string[];
    status: string;
    notes?: string;
  }> {
    const result: Array<{
      controlId: string;
      controlName: string;
      framework: string;
      organizationId: string;
      evidenceIds: string[];
      status: string;
      notes?: string;
    }> = [];

    for (const value of this.mappings.values()) {
      result.push(...value.filter((m) => m.organizationId === organizationId));
    }

    return result;
  }

  /**
   * Check if all required evidence is present and verified for a control
   */
  async verifyControl(
    organizationId: string,
    controlId: string,
    ledger: InMemoryEvidenceLedger,
  ): Promise<{
    controlId: string;
    verified: boolean;
    evidenceCount: number;
    allVerified: boolean;
  }> {
    const mappings = this.getMappings(organizationId).filter((m) => m.controlId === controlId);
    let evidenceCount = 0;
    let allVerified = true;

    for (const mapping of mappings) {
      for (const evidenceId of mapping.evidenceIds) {
        evidenceCount++;
        const artifact = await ledger.get(evidenceId, organizationId);
        if (!artifact || artifact.status !== 'VERIFIED') {
          allVerified = false;
        }
      }
    }

    return {
      controlId,
      verified: allVerified && evidenceCount > 0,
      evidenceCount,
      allVerified,
    };
  }
}

export const controlMappingFramework = new ControlMappingFramework();
