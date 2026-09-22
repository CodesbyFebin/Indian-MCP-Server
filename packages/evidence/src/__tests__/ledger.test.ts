// packages/evidence/src/__tests__/ledger.test.ts
// Unit tests for evidence ledger
// Phase 7 Implementation — CORE PRIORITY

import {
  Artifact,
  ArtifactSchema,
  EvidenceCreateInput,
  EvidenceStatusValue,
  EvidenceTypeValue,
  HashChainLink,
  HashChainState,
  createEvidenceArtifact,
  updateEvidenceStatus,
  computeSHA256,
  canonicalSerialize,
  verifyArtifactHash,
  buildChainLink,
  EvidenceLedger,
  EvidenceCollectionContext,
  ChainVerificationResult,
} from '../types';
import { randomBytes } from 'crypto';

// ============================================================
// Mock Evidence Ledger Implementation
// ============================================================

class MockEvidenceLedger implements EvidenceLedger {
  private artifacts: Map<string, Artifact> = new Map();
  private chainStates: Map<string, HashChainState> = new Map();
  private chainLinks: Map<string, HashChainLink[]> = new Map();

  async create(input: EvidenceCreateInput): Promise<Artifact> {
    const orgId = input.organizationId;
    
    // Get current chain state
    let chainState = this.chainStates.get(orgId);
    if (!chainState) {
      chainState = {
        currentRootHash: '',
        latestArtifactHash: null,
        artifactCount: 0,
        lastUpdated: new Date(),
      };
    }

    // Compute the chain root hash
    // For the first artifact, the chain root is its own hash
    // For subsequent artifacts, we update the root by hashing: root || newArtifactHash
    const content = {
      organizationId: input.organizationId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      evidenceType: input.evidenceType,
      status: 'COLLECTED' as EvidenceStatusValue,
      sourceRevision: input.sourceRevision,
      verifierVersion: input.verifierVersion,
      collectedAt: new Date().toISOString(),
      expiresAt: input.expiresAt?.toISOString(),
      metadata: input.metadata,
    };

    const sha256 = await computeSHA256(canonicalSerialize(content));
    
    // Update chain root
    let chainRootHash: string;
    if (chainState.latestArtifactHash === null) {
      // First artifact in chain
      chainRootHash = await computeSHA256(sha256);
    } else {
      // Link to existing chain
      const chainInput = chainState.currentRootHash + sha256;
      chainRootHash = await computeSHA256(chainInput);
    }

    const artifact: Artifact = {
      id: crypto.randomUUID(),
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
    this.chainStates.set(orgId, chainState);

    // Store chain link
    const link = await buildChainLink(artifact, artifact.previousArtifactHash, chainRootHash);
    const links = this.chainLinks.get(orgId) || [];
    links.push(link);
    this.chainLinks.set(orgId, links);

    return artifact;
  }

  async get(id: string, context: EvidenceCollectionContext): Promise<Artifact | null> {
    const artifact = this.artifacts.get(id);
    if (!artifact) return null;
    if (artifact.organizationId !== context.organizationId) return null;
    return artifact;
  }

  async update(id: string, update: any): Promise<Artifact> {
    const artifact = this.artifacts.get(id);
    if (!artifact) {
      throw new Error('Artifact not found');
    }
    const updated = updateEvidenceStatus(artifact, update.status || artifact.status);
    this.artifacts.set(id, updated);
    return updated;
  }

  async list(input: any): Promise<{ artifacts: Artifact[]; count: number }> {
    const results = Array.from(this.artifacts.values()).filter(a => {
      if (input.organizationId && a.organizationId !== input.organizationId) return false;
      if (input.resourceType && a.resourceType !== input.resourceType) return false;
      if (input.resourceId && a.resourceId !== input.resourceId) return false;
      if (input.evidenceType && a.evidenceType !== input.evidenceType) return false;
      if (input.status && a.status !== input.status) return false;
      return true;
    });

    let sorted = [...results];
    if (input.sortBy) {
      sorted.sort((a, b) => {
        const aVal = a[input.sortBy] ?? new Date(0);
        const bVal = b[input.sortBy] ?? new Date(0);
        if (aVal < bVal) return input.sortOrder === 'desc' ? 1 : -1;
        if (aVal > bVal) return input.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    const limit = input.limit || 100;
    const offset = input.offset || 0;
    const paginated = sorted.slice(offset, offset + limit);

    return { artifacts: paginated, count: results.length };
  }

  async verifyChain(organizationId: string): Promise<ChainVerificationResult> {
    const links = this.chainLinks.get(organizationId) || [];
    const artifacts = Array.from(this.artifacts.values())
      .filter(a => a.organizationId === organizationId)
      .sort((a, b) => (a.collectedAt < b.collectedAt ? -1 : 1));

    let valid = true;
    let brokenAt: string | undefined;
    let chainRootHash = '';
    let previousArtifactHash: string | null = null;

    for (const artifact of artifacts) {
      const content = {
        organizationId: artifact.organizationId,
        resourceType: artifact.resourceType,
        resourceId: artifact.resourceId,
        evidenceType: artifact.evidenceType,
        status: 'COLLECTED' as EvidenceStatusValue,
        sourceRevision: artifact.sourceRevision,
        verifierVersion: artifact.verifierVersion,
        collectedAt: artifact.collectedAt.toISOString(),
        expiresAt: artifact.expiresAt?.toISOString(),
        metadata: artifact.metadata,
      };

      const expectedHash = await computeSHA256(canonicalSerialize(content));
      if (artifact.sha256 !== expectedHash) {
        valid = false;
        brokenAt = artifact.id;
        chainRootHash = artifact.chainRootHash;
        break;
      }

      if (artifact.previousArtifactHash !== previousArtifactHash) {
        valid = false;
        brokenAt = artifact.id;
        chainRootHash = artifact.chainRootHash;
        break;
      }

      previousArtifactHash = artifact.sha256;
    }

    const chainState = this.chainStates.get(organizationId);
    const actualRootHash = chainState?.currentRootHash || '';

    return {
      valid,
      organizationId,
      artifactCount: artifacts.length,
      brokenAt,
      expectedRootHash: chainRootHash || '0'.repeat(64),
      actualRootHash,
      discrepancies: valid ? [] : [{
        artifactId: brokenAt || '',
        field: 'hash_mismatch',
        expected: chainRootHash || '',
        actual: actualRootHash,
      }],
    };
  }

  async generatePackage(input: any): Promise<any> {
    // Mock implementation
    return {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      framework: input.framework,
      generatedAt: new Date(),
      generatedBy: 'system',
      controlMappings: [],
      evidenceArtifacts: [],
      hashChain: {
        rootHash: '',
        artifactCount: 0,
        chainValid: true,
      },
      signature: '',
    };
  }
}

// ============================================================
// Test Suite
// ============================================================

describe('Evidence Ledger', () => {
  let ledger: MockEvidenceLedger;

  beforeEach(() => {
    ledger = new MockEvidenceLedger();
  });

  describe('Hash Functions', () => {
    test('computeSHA256 should return valid SHA-256 hash', async () => {
      const input = 'hello world';
      const hash = await computeSHA256(input);
      
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efbce3');
    });

    test('computeSHA256 should produce different hashes for different inputs', async () => {
      const hash1 = await computeSHA256('input1');
      const hash2 = await computeSHA256('input2');
      
      expect(hash1).not.toBe(hash2);
    });

    test('canonicalSerialize should sort object keys', () => {
      const obj1 = { b: 2, a: 1, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      
      expect(canonicalSerialize(obj1)).toBe(canonicalSerialize(obj2));
    });

    test('canonicalSerialize should handle nested objects', () => {
      const obj1 = { nested: { z: 1, a: 2 }, top: 3 };
      const obj2 = { nested: { a: 2, z: 1 }, top: 3 };
      
      expect(canonicalSerialize(obj1)).toBe(canonicalSerialize(obj2));
    });
  });

  describe('Artifact Creation', () => {
    const testContext = {
      requestId: crypto.randomUUID(),
      organizationId: crypto.randomUUID(),
      source: 'test',
      timestamp: new Date(),
    };

    const baseInput: EvidenceCreateInput = {
      organizationId: testContext.organizationId,
      resourceType: 'deployment',
      resourceId: 'deploy-123',
      evidenceType: 'CONFIG' as EvidenceTypeValue,
      sha256: '',
      metadata: {
        severity: 'high' as const,
        category: 'deployment',
        sourceTool: 'test-suite',
      },
    };

    test('create should produce a valid artifact', async () => {
      const artifact = await ledger.create(baseInput);
      
      expect(artifact.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(artifact.organizationId).toBe(testContext.organizationId);
      expect(artifact.resourceType).toBe('deployment');
      expect(artifact.resourceId).toBe('deploy-123');
      expect(artifact.evidenceType).toBe('CONFIG');
      expect(artifact.status).toBe('COLLECTED');
      expect(artifact.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(artifact.previousArtifactHash).toBeNull();
      expect(artifact.chainRootHash).toMatch(/^[a-f0-9]{64}$/);
    });

    test('create should link artifacts in hash chain', async () => {
      const artifact1 = await ledger.create(baseInput);
      const artifact2 = await ledger.create({
        ...baseInput,
        resourceId: 'deploy-456',
      });
      
      expect(artifact2.previousArtifactHash).toBe(artifact1.sha256);
      expect(artifact2.chainRootHash).not.toBe(artifact1.chainRootHash);
    });

    test('create should set collectedAt to current time', async () => {
      const before = new Date(Date.now() - 1000);
      const artifact = await ledger.create(baseInput);
      const after = new Date();
      
      expect(artifact.collectedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(artifact.collectedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    test('create should handle empty metadata gracefully', async () => {
      const artifact = await ledger.create({
        ...baseInput,
        metadata: {},
      });
      
      expect(artifact.metadata).toEqual({});
    });

    test('create should handle custom metadata fields', async () => {
      const metadata = {
        severity: 'critical' as const,
        complianceFramework: 'rbi' as const,
        controlId: 'RBI-001',
        customField: 'custom-value',
      };

      const artifact = await ledger.create({
        ...baseInput,
        metadata,
      });

      expect(artifact.metadata.severity).toBe('critical');
      expect(artifact.metadata.complianceFramework).toBe('rbi');
      expect(artifact.metadata.controlId).toBe('RBI-001');
      expect(artifact.metadata.customField).toBe('custom-value');
    });
  });

  describe('Artifact Retrieval', () => {
    const testOrgId = crypto.randomUUID();
    
    const createContext = (orgId: string): EvidenceCollectionContext => ({
      requestId: crypto.randomUUID(),
      organizationId: orgId,
      source: 'test',
      timestamp: new Date(),
    });

    test('get should retrieve artifact by ID', async () => {
      const artifact = await ledger.create({
        organizationId: testOrgId,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: { severity: 'low' },
      });

      const retrieved = await ledger.get(artifact.id, createContext(testOrgId));
      
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(artifact.id);
      expect(retrieved!.metadata.severity).toBe('low');
    });

    test('get should return null for invalid ID', async () => {
      const retrieved = await ledger.get(crypto.randomUUID(), createContext(testOrgId));
      expect(retrieved).toBeNull();
    });

    test('get should enforce organization isolation', async () => {
      const orgA = crypto.randomUUID();
      const orgB = crypto.randomUUID();
      
      const artifact = await ledger.create({
        organizationId: orgA,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: { severity: 'low' },
      });

      // Org A can retrieve
      const retrievedA = await ledger.get(artifact.id, createContext(orgA));
      expect(retrievedA).not.toBeNull();
      
      // Org B cannot retrieve
      const retrievedB = await ledger.get(artifact.id, createContext(orgB));
      expect(retrievedB).toBeNull();
    });
  });

  describe('Artifact Listing', () => {
    test('list should return empty array for no artifacts', async () => {
      const result = await ledger.list({
        organizationId: crypto.randomUUID(),
      });
      
      expect(result.artifacts).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    test('list should return all artifacts for organization', async () => {
      const orgId = crypto.randomUUID();
      
      for (let i = 0; i < 5; i++) {
        await ledger.create({
          organizationId: orgId,
          resourceType: 'config',
          resourceId: `config-${i}`,
          evidenceType: 'CONFIG',
          metadata: {},
        });
      }

      const result = await ledger.list({ organizationId: orgId });
      
      expect(result.count).toBe(5);
      expect(result.artifacts).toHaveLength(5);
    });

    test('list should filter by evidence type', async () => {
      const orgId = crypto.randomUUID();
      
      await ledger.create({
        organizationId: orgId,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: {},
      });

      await ledger.create({
        organizationId: orgId,
        resourceType: 'source',
        resourceId: 'source-1',
        evidenceType: 'SOURCE',
        metadata: {},
      });

      const result = await ledger.list({
        organizationId: orgId,
        evidenceType: 'CONFIG',
      });

      expect(result.count).toBe(1);
      expect(result.artifacts[0].evidenceType).toBe('CONFIG');
    });

    test('list should filter by status', async () => {
      const orgId = crypto.randomUUID();
      
      const artifact = await ledger.create({
        organizationId: orgId,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: {},
      });

      await ledger.update(artifact.id, { status: 'VERIFIED' });

      const verified = await ledger.list({
        organizationId: orgId,
        status: 'VERIFIED',
      });

      const collected = await ledger.list({
        organizationId: orgId,
        status: 'COLLECTED',
      });

      expect(verified.count).toBe(1);
      expect(collected.count).toBe(0);
    });

    test('list should support pagination', async () => {
      const orgId = crypto.randomUUID();
      
      for (let i = 0; i < 10; i++) {
        await ledger.create({
          organizationId: orgId,
          resourceType: 'config',
          resourceId: `config-${i}`,
          evidenceType: 'CONFIG',
          metadata: {},
        });
      }

      const page1 = await ledger.list({
        organizationId: orgId,
        limit: 5,
        offset: 0,
      });

      const page2 = await ledger.list({
        organizationId: orgId,
        limit: 5,
        offset: 5,
      });

      expect(page1.artifacts).toHaveLength(5);
      expect(page2.artifacts).toHaveLength(5);
      expect(page1.artifacts[0].id).not.toBe(page2.artifacts[0].id);
    });
  });

  describe('Artifact Updates', () => {
    test('update should change artifact status', async () => {
      const orgId = crypto.randomUUID();
      
      const artifact = await ledger.create({
        organizationId: orgId,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: {},
      });

      expect(artifact.status).toBe('COLLECTED');

      const updated = await ledger.update(artifact.id, {
        status: 'VERIFIED',
        verifierVersion: 'v1.0.0',
      });

      expect(updated.status).toBe('VERIFIED');
      expect(updated.verifiedAt).toBeDefined();
      expect(updated.verifierVersion).toBe('v1.0.0');
    });

    test('update should throw on non-existent artifact', async () => {
      await expect(
        ledger.update(crypto.randomUUID(), { status: 'VERIFIED' }),
      ).rejects.toThrow('Artifact not found');
    });

    test('update should preserve existing fields', async () => {
      const orgId = crypto.randomUUID();
      
      const artifact = await ledger.create({
        organizationId: orgId,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: {
          severity: 'high',
          category: 'deployment',
        },
      });

      const updated = await ledger.update(artifact.id, { status: 'VERIFIED' });

      expect(updated.metadata.severity).toBe('high');
      expect(updated.metadata.category).toBe('deployment');
      expect(updated.resourceId).toBe('config-1');
      expect(updated.evidenceType).toBe('CONFIG');
    });
  });

  describe('Hash Chain Verification', () => {
    test('verifyChain should return valid for intact chain', async () => {
      const orgId = crypto.randomUUID();
      
      // Create multiple artifacts
      for (let i = 0; i < 5; i++) {
        await ledger.create({
          organizationId: orgId,
          resourceType: 'config',
          resourceId: `config-${i}`,
          evidenceType: 'CONFIG',
          metadata: {},
        });
      }

      const result = await ledger.verifyChain(orgId);
      
      expect(result.valid).toBe(true);
      expect(result.artifactCount).toBe(5);
      expect(result.discrepancies).toHaveLength(0);
    });

    test('verifyChain should return empty chain for new org', async () => {
      const result = await ledger.verifyChain(crypto.randomUUID());
      
      expect(result.valid).toBe(true);
      expect(result.artifactCount).toBe(0);
      expect(result.discrepancies).toHaveLength(0);
    });

    test('verifyChain should detect broken links', async () => {
      const orgId = crypto.randomUUID();
      
      const artifact1 = await ledger.create({
        organizationId: orgId,
        resourceType: 'config',
        resourceId: 'config-1',
        evidenceType: 'CONFIG',
        metadata: {},
      });

      const artifact2 = await ledger.create({
        organizationId: orgId,
        resourceType: 'config',
        resourceId: 'config-2',
        evidenceType: 'CONFIG',
        metadata: {},
      });

      // Simulate artifact tampering
      const tamperedArtifact = this.artifacts?.get(artifact2.id) || artifact2;
      tamperedArtifact.sha256 = '0'.repeat(64);

      const result = await ledger.verifyChain(orgId);
      expect(result.valid).toBe(false);
      expect(result.discrepancies.length).toBeGreaterThan(0);
    });

    test('verifyChain should be isolated per organization', async () => {
      const orgA = crypto.randomUUID();
      const orgB = crypto.randomUUID();
      
      for (let i = 0; i < 3; i++) {
        await ledger.create({
          organizationId: orgA,
          resourceType: 'config',
          resourceId: `config-${i}`,
          evidenceType: 'CONFIG',
          metadata: {},
        });
      }

      for (let i = 0; i < 2; i++) {
        await ledger.create({
          organizationId: orgB,
          resourceType: 'config',
          resourceId: `config-${i}`,
          evidenceType: 'CONFIG',
          metadata: {},
        });
      }

      const resultA = await ledger.verifyChain(orgA);
      const resultB = await ledger.verifyChain(orgB);
      
      expect(resultA.artifactCount).toBe(3);
      expect(resultB.artifactCount).toBe(2);
    });
  });

  describe('Factory Functions', () => {
    test('createEvidenceArtifact should set correct defaults', () => {
      const input: EvidenceCreateInput = {
        organizationId: 'org-123',
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        sha256: 'abc123',
        metadata: {},
      };

      const artifact = createEvidenceArtifact(input, 'root-hash', null);
      
      expect(artifact.status).toBe('COLLECTED');
      expect(artifact.previousArtifactHash).toBeNull();
      expect(artifact.chainRootHash).toBe('root-hash');
      expect(artifact.collectedAt).toBeInstanceOf(Date);
    });

    test('updateEvidenceStatus should set verifiedAt for VERIFIED status', () => {
      const artifact: Artifact = {
        id: 'test-id',
        organizationId: 'org-123',
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'abc123',
        previousArtifactHash: null,
        chainRootHash: 'root',
        metadata: {},
        collectedAt: new Date(),
      };

      const updated = updateEvidenceStatus(artifact, 'VERIFIED', 'v2.0.0');
      
      expect(updated.status).toBe('VERIFIED');
      expect(updated.verifiedAt).toBeDefined();
      expect(updated.verifierVersion).toBe('v2.0.0');
    });

    test('updateEvidenceStatus should not set verifiedAt for non-VERIFIED status', () => {
      const artifact: Artifact = {
        id: 'test-id',
        organizationId: 'org-123',
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'abc123',
        previousArtifactHash: null,
        chainRootHash: 'root',
        metadata: {},
        collectedAt: new Date(),
        verifiedAt: new Date(),
        verifierVersion: 'v1.0.0',
      };

      const updated = updateEvidenceStatus(artifact, 'STALE');
      
      expect(updated.status).toBe('STALE');
      expect(updated.verifiedAt).toBe(artifact.verifiedAt);
      expect(updated.verifierVersion).toBe('v1.0.0');
    });
  });

  describe('Schema Validation', () => {
    test('ArtifactSchema should reject invalid uuid', () => {
      const invalid = {
        id: 'not-a-uuid',
        organizationId: 'not-a-uuid',
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: '0'.repeat(64),
        previousArtifactHash: null,
        chainRootHash: '0'.repeat(64),
        metadata: {},
        collectedAt: new Date(),
      };

      expect(() => ArtifactSchema.parse(invalid)).toThrow();
    });

    test('ArtifactSchema should reject invalid sha256', () => {
      const invalid = {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'too-short',
        previousArtifactHash: null,
        chainRootHash: '0'.repeat(64),
        metadata: {},
        collectedAt: new Date(),
      };

      expect(() => ArtifactSchema.parse(invalid)).toThrow();
    });

    test('ArtifactSchema should reject invalid evidenceType', () => {
      const invalid = {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'INVALID_TYPE',
        status: 'COLLECTED',
        sha256: '0'.repeat(64),
        previousArtifactHash: null,
        chainRootHash: '0'.repeat(64),
        metadata: {},
        collectedAt: new Date(),
      };

      expect(() => ArtifactSchema.parse(invalid)).toThrow();
    });

    test('ArtifactSchema should accept valid artifact', () => {
      const valid = {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: '0'.repeat(64),
        previousArtifactHash: null,
        chainRootHash: '0'.repeat(64),
        metadata: { severity: 'high', category: 'test' },
        collectedAt: new Date(),
      };

      const parsed = ArtifactSchema.parse(valid);
      expect(parsed).toBeDefined();
    });
  });

  describe('Hash Chain Link Building', () => {
    test('buildChainLink should create correct link structure', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        organizationId: 'org-123',
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'a'.repeat(64),
        previousArtifactHash: null,
        chainRootHash: 'b'.repeat(64),
        metadata: {},
        collectedAt: new Date(),
      };

      const link = await buildChainLink(artifact, null, 'b'.repeat(64));
      
      expect(link.artifactId).toBe('test-id');
      expect(link.artifactHash).toBe('a'.repeat(64));
      expect(link.previousArtifactHash).toBeNull();
      expect(link.chainRootHash).toBe('b'.repeat(64));
      expect(link.linkedAt).toBeInstanceOf(Date);
    });

    test('buildChainLink should handle previousHash', async () => {
      const artifact: Artifact = {
        id: 'test-id',
        organizationId: 'org-123',
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'a'.repeat(64),
        previousArtifactHash: 'c'.repeat(64),
        chainRootHash: 'b'.repeat(64),
        metadata: {},
        collectedAt: new Date(),
      };

      const link = await buildChainLink(artifact, 'c'.repeat(64), 'b'.repeat(64));
      
      expect(link.previousArtifactHash).toBe('c'.repeat(64));
    });
  });

  describe('verifyArtifactHash', () => {
    test('should return true for unmodified artifact', async () => {
      const artifact: Artifact = {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: '',
        previousArtifactHash: null,
        chainRootHash: '',
        metadata: {},
        collectedAt: new Date(),
      };

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

      artifact.sha256 = await computeSHA256(canonicalSerialize(content));
      
      const valid = await verifyArtifactHash(artifact);
      expect(valid).toBe(true);
    });

    test('should return false for modified artifact', async () => {
      const artifact: Artifact = {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        resourceType: 'deployment',
        resourceId: 'deploy-456',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'a'.repeat(64),
        previousArtifactHash: null,
        chainRootHash: '',
        metadata: {},
        collectedAt: new Date(),
      };

      const valid = await verifyArtifactHash(artifact);
      expect(valid).toBe(false);
    });
  });
});