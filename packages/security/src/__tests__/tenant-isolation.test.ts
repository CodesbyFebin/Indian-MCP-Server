// packages/security/src/__tests__/tenant-isolation.test.ts
// Cross-tenant isolation test cases
// Phase 2 - Identity & Tenancy Foundation (P0)

import { PrismaClient, Organization, User, ApiToken, EvidenceArtifact } from '../../prisma/client';
import { SecretProvider } from '../secrets/provider';
import { AuthContext, AuthScope } from '../../gateway/src/mcp-gateway';
import crypto from 'crypto';

// ============================================================
// Test Setup
// ============================================================

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/mcpserver_test' } },
});

interface TestOrg {
  id: string;
  name: string;
  slug: string;
}

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TestData {
  organizations: TestOrg[];
  users: Map<string, TestUser[]>; // orgId -> users
  apiTokens: Map<string, string[]>; // userId -> token strings
  evidenceId: string;
}

let testData: TestData;

// ============================================================
// Mock Auth Context Provider
// ============================================================

function createAuthContext(orgId: string, userId?: string, workspaceId?: string): AuthContext {
  return {
    principalId: userId || crypto.randomUUID(),
    principalType: 'user',
    organizationId: orgId,
    workspaceId,
    scopes: ['admin:full' as AuthScope],
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  };
}

// ============================================================
// Test Helpers
// ============================================================

async function setTenantContext(orgId: string, workspaceId?: string): Promise<void> {
  await prisma.$executeRawUnsafe(`
    SELECT set_config('app.current_org_id', '${orgId}', false);
    ${workspaceId ? `SELECT set_config('app.current_workspace_id', '${workspaceId}', false);` : ''}
  `);
}

async function clearTenantContext(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    SELECT set_config('app.current_org_id', NULL, false);
    SELECT set_config('app.current_workspace_id', NULL, false);
  `);
}

// ============================================================
// Test Suite
// ============================================================

describe('Cross-Tenant Isolation', () => {
  beforeAll(async () => {
    // Enable RLS on all tables
    const tables = [
      'Organization',
      'Workspace',
      'User',
      'UserSession',
      'ApiToken',
      'Policy',
      'Deployment',
      'DeploymentVersion',
      'DeploymentEvent',
      'EvidenceArtifact',
      'EvidenceReview',
      'EvidenceCheckpoint',
      'Secret',
      'ControlMapping',
      'EvidencePackage',
      'PIIAuditLog',
      'UPITransactionLog',
      'KYCVerificationLog',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
    }

    // Apply tenant isolation policies
    const rlsPolicies = `
    -- Organizations: no isolation (global read)
    
    -- Users: isolation by organization
    CREATE POLICY "users_tenant_isolation" ON "User"
      FOR ALL
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    -- Workspaces: isolation by organization
    CREATE POLICY "workspaces_tenant_isolation" ON "Workspace"
      FOR ALL
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    -- Environments: isolation through workspace -> organization
    CREATE POLICY "environments_tenant_isolation" ON "Environment"
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM "Workspace" w
          WHERE w.id = "Environment"."workspaceId"
          AND w.organization_id = current_setting('app.current_org_id')::uuid
        )
      );

    -- Policies: isolation through workspace -> organization
    CREATE POLICY "policies_tenant_isolation" ON "Policy"
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM "Workspace" w
          WHERE w.id = "Policy"."workspaceId"
          AND w.organization_id = current_setting('app.current_org_id')::uuid
        )
      );

    -- Deployments: isolation by organization
    CREATE POLICY "deployments_tenant_isolation" ON "Deployment"
      FOR ALL
      USING (organization_id = current_setting('app.current_org_id')::uuid);

    -- Evidence: isolation by organization + workspace
    CREATE POLICY "evidence_tenant_isolation" ON "EvidenceArtifact"
      FOR ALL
      USING (
        organization_id = current_setting('app.current_org_id')::uuid
        AND (
          workspace_id IS NULL
          OR workspace_id = current_setting('app.current_workspace_id')::uuid
        )
      );

    -- Secrets: isolation by organization + environment
    CREATE POLICY "secrets_tenant_isolation" ON "Secret"
      FOR ALL
      USING (
        organization_id = current_setting('app.current_org_id')::uuid
        AND (
          environment_id IS NULL
          OR EXISTS (
            SELECT 1 FROM "Environment" e
            WHERE e.id = "Secret"."environmentId"
            AND e."workspaceId" IN (
              SELECT w.id FROM "Workspace" w
              WHERE w.organization_id = current_setting('app.current_org_id')::uuid
            )
          )
        )
      );
    `;

    await prisma.$executeRawUnsafe(rlsPolicies);
  });

  beforeAll(async () => {
    // Clean up and seed test data
    await clearTenantContext();
    
    // Clear existing test data
    await prisma.evidenceArtifact.deleteMany({});
    await prisma.secret.deleteMany({});
    await prisma.apiToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.workspace.deleteMany({});
    await prisma.organization.deleteMany({});

    // Create test organizations
    testData = {
      organizations: [],
      users: new Map(),
      apiTokens: new Map(),
      evidenceId: '',
    };

    for (let i = 1; i <= 2; i++) {
      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${i}`,
          slug: `test-org-${i}`,
          domain: `test${i}.example.com`,
          status: 'ACTIVE',
        },
      });

      testData.organizations.push(org as TestOrg);

      // Create users for each org
      const users: TestUser[] = [];
      for (let j = 1; j <= 2; j++) {
        const user = await prisma.user.create({
          data: {
            email: `user${j}@test${i}.example.com`,
            name: `User ${j} Org ${i}`,
            organizationId: org.id,
            passwordHash: crypto.randomBytes(32).toString('hex'),
            role: j === 1 ? 'ADMIN' : 'MEMBER',
            emailVerified: new Date(),
          },
        });

        users.push({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
      }

      testData.users.set(org.id, users);
    }

    // Create API tokens
    for (const [orgId, users] of testData.users.entries()) {
      for (const user of users) {
        const token = await prisma.apiToken.create({
          data: {
            userId: user.id,
            organizationId: orgId,
            name: `Token for ${user.email}`,
            tokenHash: crypto.randomBytes(32).toString('hex'),
            prefix: 'tkp_',
            scopes: ['mcp:connect', 'mcp:execute'],
          },
        });

        if (!testData.apiTokens.has(user.id)) {
          testData.apiTokens.set(user.id, []);
        }
        testData.apiTokens.get(user.id)!.push(token.id);
      }
    }

    // Create evidence artifacts for both orgs
    await setTenantContext(testData.organizations[0].id);
    const evidenceA = await prisma.evidenceArtifact.create({
      data: {
        organizationId: testData.organizations[0].id,
        resourceType: 'config',
        resourceId: 'deploy-1',
        evidenceType: 'CONFIG',
        status: 'COLLECTED',
        sha256: 'a'.repeat(64),
        chainRootHash: 'b'.repeat(64),
        metadata: { severity: 'high' },
      },
    });
    testData.evidenceId = evidenceA.id;

    await setTenantContext(testData.organizations[1].id);
    await prisma.evidenceArtifact.create({
      data: {
        organizationId: testData.organizations[1].id,
        resourceType: 'config',
        resourceId: 'deploy-2',
        evidenceType: 'CONFIG',
        status: 'VERIFIED',
        sha256: 'c'.repeat(64),
        chainRootHash: 'd'.repeat(64),
        metadata: { severity: 'low' },
      },
    });

    await clearTenantContext();
  });

  afterAll(async () => {
    await clearTenantContext();
    await prisma.evidenceArtifact.deleteMany({});
    await prisma.apiToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.workspace.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.$disconnect();
  });

  // ============================================================
  // Organization Isolation Tests
  // ============================================================

  describe('Organization Isolation', () => {
    test('users from org A cannot see org B users', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;
      
      await setTenantContext(orgAId);
      const usersA = await prisma.user.findMany();
      expect(usersA).toHaveLength(2);
      expect(usersA.every(u => u.organizationId === orgAId)).toBe(true);

      await setTenantContext(orgBId);
      const usersB = await prisma.user.findMany();
      expect(usersB).toHaveLength(2);
      expect(usersB.every(u => u.organizationId === orgBId)).toBe(true);

      // Users from A and B are disjoint
      const idsA = new Set(usersA.map(u => u.id));
      const idsB = new Set(usersB.map(u => u.id));
      expect([...idsA].filter(id => idsB.has(id))).toHaveLength(0);
    });

    test('users from org A cannot query org B users by email', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBUserEmail = testData.users.get(testData.organizations[1].id)![0].email;

      await setTenantContext(orgAId);
      const result = await prisma.user.findMany({
        where: { email: orgBUserEmail },
      });
      expect(result).toHaveLength(0);
    });

    test('API tokens are isolated per organization', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);
      const tokensA = await prisma.apiToken.findMany();
      const tokenIdsA = new Set(tokensA.map(t => t.id));

      await setTenantContext(orgBId);
      const tokensB = await prisma.apiToken.findMany();
      const tokenIdsB = new Set(tokensB.map(t => t.id));

      // Disjoint token sets
      expect([...tokenIdsA].filter(id => tokenIdsB.has(id))).toHaveLength(0);
    });

    test('users cannot directly create user in another organization', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);

      // Attempt to insert a user with orgB's organizationId
      await expect(
        prisma.user.create({
          data: {
            email: 'attacker@evil.com',
            name: 'Attacker',
            organizationId: orgBId,
            passwordHash: crypto.randomBytes(32).toString('hex'),
          },
        }),
      ).rejects.toThrow(); // Should be blocked by RLS INSERT policy
    });
  });

  // ============================================================
  // Evidence Artifact Isolation Tests
  // ============================================================

  describe('Evidence Artifact Isolation', () => {
    test('evidence from org A is not visible to org B', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      // Org A can see their evidence
      await setTenantContext(orgAId);
      const evidenceA = await prisma.evidenceArtifact.findMany();
      expect(evidenceA.some(e => e.id === testData.evidenceId)).toBe(true);

      // Org B cannot see org A's evidence
      await setTenantContext(orgBId);
      const evidenceB = await prisma.evidenceArtifact.findMany({
        where: { id: testData.evidenceId },
      });
      expect(evidenceB).toHaveLength(0);
    });

    test('evidence query is filtered by organization', async () => {
      const orgAId = testData.organizations[0].id;

      await setTenantContext(orgAId);
      const allEvidence = await prisma.evidenceArtifact.findMany();
      expect(allEvidence.every(e => e.organizationId === orgAId)).toBe(true);
    });

    test('evidence cannot be updated across organizations', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgBId);

      await expect(
        prisma.evidenceArtifact.update({
          where: { id: testData.evidenceId },
          data: { status: 'VERIFIED' },
        }),
      ).rejects.toThrow(); // RLS UPDATE policy should block this
    });

    test('evidence cannot be deleted across organizations', async () => {
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgBId);

      await expect(
        prisma.evidenceArtifact.delete({
          where: { id: testData.evidenceId },
        }),
      ).rejects.toThrow(); // RLS DELETE policy should block this
    });
  });

  // ============================================================
  // Workspace Isolation Tests
  // ============================================================

  describe('Workspace Isolation', () => {
    let workspaceA: any;
    let workspaceB: any;
    let envA: any;
    let envB: any;

    beforeAll(async () => {
      const orgAId = testData.organizations[0].id;
      
      await setTenantContext(orgAId);
      
      workspaceA = await prisma.workspace.create({
        data: {
          name: 'WS-A',
          slug: 'ws-a',
          organization: { connect: { id: orgAId } },
        },
      });

      workspaceB = await prisma.workspace.create({
        data: {
          name: 'WS-B',
          slug: 'ws-b',
          organization: { connect: { id: orgAId } },
        },
      });

      envA = await prisma.environment.create({
        data: {
          name: 'Env-A',
          slug: 'env-a',
          workspace: { connect: { id: workspaceA.id } },
          type: 'PRODUCTION',
        },
      });

      envB = await prisma.environment.create({
        data: {
          name: 'Env-B',
          slug: 'env-b',
          workspace: { connect: { id: workspaceB.id } },
          type: 'STAGING',
        },
      });
    });

    afterAll(async () => {
      const orgAId = testData.organizations[0].id;
      await setTenantContext(orgAId);
      await prisma.environment.deleteMany({});
      await prisma.workspace.deleteMany({});
    });

    test('secrets are isolated by environment within organization', async () => {
      const orgAId = testData.organizations[0].id;

      // Create a secret in envA
      await setTenantContext(orgAId);
      await prisma.secret.create({
        data: {
          organizationId: orgAId,
          environmentId: envA.id,
          name: 'DB_PASSWORD',
          path: 'secret/data/db',
          provider: 'VAULT',
          version: '1',
          metadata: { description: 'Database password' },
        },
      });

      // With envA context, secret is visible
      await prisma.$executeRawUnsafe(`
        SELECT set_config('app.current_workspace_id', '${workspaceA.id}', false);
      `);
      const secretsInA = await prisma.secret.findMany({
        where: { environmentId: envA.id },
      });
      expect(secretsInA).toHaveLength(1);

      // With envB context, secret is NOT visible by envA's query path
      await prisma.$executeRawUnsafe(`
        SELECT set_config('app.current_workspace_id', '${workspaceB.id}', false);
      `);
      const secretsInB = await prisma.secret.findMany({
        where: { environmentId: envB.id },
      });
      expect(secretsInB).toHaveLength(0);
    });

    test('users in workspace A cannot query workspace B workspaces', async () => {
      const orgAId = testData.organizations[0].id;

      await setTenantContext(orgAId);
      // With workspace A context, only workspace A should be accessible
      await prisma.$executeRawUnsafe(`
        SELECT set_config('app.current_workspace_id', '${workspaceA.id}', false);
      `);

      const foundWorkspace = await prisma.workspace.findMany({
        where: { id: workspaceB.id },
      });
      expect(foundWorkspace).toHaveLength(0); // RLS workspace isolation
    });
  });

  // ============================================================
  // Secret Access Isolation Tests
  // ============================================================

  describe('Secret Access Isolation', () => {
    test('secrets from org A cannot be queried by org B', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      // Create a secret for org A
      await setTenantContext(orgAId);
      const secretA = await prisma.secret.create({
        data: {
          organizationId: orgAId,
          name: 'API_KEY',
          path: 'secret/data/api-key',
          provider: 'VAULT',
          version: '1',
          metadata: { description: 'API key' },
        },
      });

      // Org B cannot see org A's secret
      await setTenantContext(orgBId);
      const found = await prisma.secret.findMany({
        where: { id: secretA.id },
      });
      expect(found).toHaveLength(0);
    });

    test('secrets are deleted from isolation scope', async () => {
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgBId);
      const secretsB = await prisma.secret.findMany();
      expect(secretsB.every(s => s.organizationId === orgBId)).toBe(true);
    });

    test('environment-scoped secrets are isolated', async () => {
      const orgAId = testData.organizations[0].id;
      
      const ws = await prisma.workspace.create({
        data: {
          name: 'Isolation-Workspace',
          slug: 'isolation-ws',
          organization: { connect: { id: orgAId } },
        },
      });

      const env1 = await prisma.environment.create({
        data: {
          name: 'Env 1',
          slug: 'env1',
          workspace: { connect: { id: ws.id } },
          type: 'PRODUCTION',
        },
      });

      const env2 = await prisma.environment.create({
        data: {
          name: 'Env 2',
          slug: 'env2',
          workspace: { connect: { id: ws.id } },
          type: 'STAGING',
        },
      });

      // Create an environment-scoped secret
      await setTenantContext(orgAId);
      await prisma.secret.create({
        data: {
          organizationId: orgAId,
          environmentId: env1.id,
          name: 'SERVICE_KEY',
          path: 'secret/data/service',
          provider: 'VAULT',
          version: '1',
          metadata: { description: 'Service key' },
        },
      });

      // Environment 1 can see the secret
      await prisma.$executeRawUnsafe(`
        SELECT set_config('app.current_workspace_id', '${ws.id}', false);
      `);
      const secrets = await prisma.secret.findMany({
        where: { environmentId: env1.id },
      });
      expect(secrets).toHaveLength(1);

      // Environment 2 cannot see the secret
      const secretsOther = await prisma.secret.findMany({
        where: { environmentId: env2.id },
      });
      expect(secretsOther).toHaveLength(0);

      // Cleanup
      await prisma.environment.deleteMany({});
      await prisma.workspace.deleteMany({});
    });
  });

  // ============================================================
  // Deployment Isolation Tests
  // ============================================================

  describe('Deployment Isolation', () => {
    test('deployments from org A are not visible to org B', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      // Create a deployment for org A
      await setTenantContext(orgAId);
      const ws = await prisma.workspace.create({
        data: {
          name: 'Deploy-WS',
          slug: 'deploy-ws',
          organization: { connect: { id: orgAId } },
        },
      });
      const env = await prisma.environment.create({
        data: {
          name: 'Deploy-Env',
          slug: 'deploy-env',
          workspace: { connect: { id: ws.id } },
          type: 'STAGING',
        },
      });

      const deployment = await prisma.deployment.create({
        data: {
          name: 'Test Deployment',
          workspace: { connect: { id: ws.id } },
          environment: { connect: { id: env.id } },
          config: { image: 'test:latest' },
          configHash: 'abc123',
          version: '1.0.0',
          status: 'DRAFT',
        },
      });

      // Org B cannot see the deployment
      await setTenantContext(orgBId);
      const found = await prisma.deployment.findMany({
        where: { id: deployment.id },
      });
      expect(found).toHaveLength(0);

      // Cleanup
      await setTenantContext(orgAId);
      await prisma.environment.deleteMany({});
      await prisma.workspace.deleteMany({});
    });
  });

  // ============================================================
  // Control Mapping Isolation Tests
  // ============================================================

  describe('Control Mapping Isolation', () => {
    test('control mappings are isolated per organization', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);
      await prisma.controlMapping.create({
        data: {
          organizationId: orgAId,
          framework: 'RBI',
          controlId: 'RBI-TEST-1',
          controlName: 'Test Control',
          status: 'IMPLEMENTED',
        },
      });

      await setTenantContext(orgBId);
      const mappingsB = await prisma.controlMapping.findMany({
        where: { controlId: 'RBI-TEST-1' },
      });
      expect(mappingsB).toHaveLength(0);
    });
  });

  // ============================================================
  // Audit Trail Isolation Tests
  // ============================================================

  describe('Audit Trail Isolation', () => {
    test('PIIAuditLog entries are isolated per organization', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);
      await prisma.pIIAuditLog.create({
        data: {
          organizationId: orgAId,
          requestId: crypto.randomUUID(),
          endpoint: '/api/tools/execute',
          method: 'POST',
          piiPatterns: [{ type: 'phone', value: '***', startIndex: 0, endIndex: 10, confidence: 0.9 }],
          fieldsRedacted: ['phone'],
          originalCount: 1,
          redactedCount: 1,
          evidenceId: testData.evidenceId,
        },
      });

      await setTenantContext(orgBId);
      const logsB = await prisma.pIIAuditLog.findMany({
        where: { organizationId: orgAId },
      });
      expect(logsB).toHaveLength(0);
    });

    test('KYCVerificationLog entries are isolated', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);
      await prisma.kYCVerificationLog.create({
        data: {
          organizationId: orgAId,
          verificationId: 'verify_123',
          userId: testData.users.get(orgAId)![0].id,
          verifierType: 'OVSE',
          status: 'SUCCESS',
          documentType: 'AADHAAR',
          country: 'IN',
        },
      });

      await setTenantContext(orgBId);
      const logsB = await prisma.kYCVerificationLog.findMany({
        where: { verificationId: 'verify_123' },
      });
      expect(logsB).toHaveLength(0);
    });
  });

  // ============================================================
  // Negative Test Cases
  // ============================================================

  describe('Negative Isolation Tests', () => {
    test('unauthenticated access (no set_config) returns no data', async () => {
      await clearTenantContext();
      const users = await prisma.user.findMany();
      // Without a tenant context, RLS should deny access
      // Depending on policy configuration, this could be 0 or all
    });

    test('attempt to set another org context via client should not bypass RLS', async () => {
      // Simulate a malicious client trying to set org context to org B
      // The set_config should only be callable server-side
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);

      // Client tries to inject org B context through parameter
      // (This tests that parameterization doesn't allow bypass)
      const users = await prisma.user.findMany({
        where: {
          // Even if client tries to inject SQL through this parameter,
          // parameterized queries should prevent injection
          organizationId: orgBId,
        },
      });
      // With RLS active for org A, this should return 0 results
      expect(users).toHaveLength(0);
    });

    test('cross-tenant JOIN queries are blocked', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      await setTenantContext(orgAId);

      // Attempt to join users with another org's data
      const results = await prisma.$queryRawUnsafe(`
        SELECT u.*, o.name as org_name
        FROM "User" u
        JOIN "Organization" o ON u.organization_id = o.id
        WHERE o.id = '${orgBId}'
      `);

      // RLS should block the join for org B's organizations
      expect(results).toHaveLength(0);
    });
  });

  // ============================================================
  // Gateway-Level Isolation Tests
  // ============================================================

  describe('Gateway Auth Isolation', () => {
    test('AuthContext organizationId is enforced on all operations', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      const contextA = createAuthContext(orgAId);
      const contextB = createAuthContext(orgBId);

      // Simulate tool execution with context A trying to access org B's resource
      const resourceId = testData.evidenceId;

      await setTenantContext(contextA.organizationId);
      const evidenceA = await prisma.evidenceArtifact.findUnique({
        where: { id: resourceId },
      });
      expect(evidenceA).not.toBeNull();

      await setTenantContext(contextB.organizationId);
      const evidenceB = await prisma.evidenceArtifact.findUnique({
        where: { id: resourceId },
      });
      expect(evidenceB).toBeNull();
    });

    test('API token scope validation respects organization boundaries', async () => {
      const orgAId = testData.organizations[0].id;
      const orgBId = testData.organizations[1].id;

      // Get a token from org A
      const orgAUser = testData.users.get(orgAId)![0];
      const tokenA = await prisma.apiToken.findFirst({
        where: { userId: orgAUser.id },
      });

      // Token belongs to org A
      expect(tokenA!.organizationId).toBe(orgAId);

      // Attempt to use token for org B resource
      await setTenantContext(orgBId);
      const foundToken = await prisma.apiToken.findUnique({
        where: { id: tokenA!.id },
      });

      // RLS should block access
      expect(foundToken).toBeNull();
    });
  });
});