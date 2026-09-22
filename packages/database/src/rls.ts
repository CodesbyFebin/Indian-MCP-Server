// packages/database/src/rls.ts
// Row Level Security (RLS) helpers for PostgreSQL tenant isolation
// Phase 2 - Identity & Tenancy Foundation (P0)

import { prisma } from './index';

/**
 * Enable Row Level Security on all tenant-scoped tables.
 * Must be run as a database migration.
 */
export async function enableRLS(): Promise<void> {
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
}

/**
 * Create tenant isolation policies for all tables.
 * These policies enforce that users can only access data within their organization.
 */
export async function createTenantPolicies(): Promise<void> {
  const policies = [
    // Users: isolation by organization
    `CREATE POLICY "users_tenant_isolation" ON "User"
       FOR ALL
       USING (organization_id = current_setting('app.current_org_id')::uuid);`,

    // Workspaces: isolation by organization
    `CREATE POLICY "workspaces_tenant_isolation" ON "Workspace"
       FOR ALL
       USING (organization_id = current_setting('app.current_org_id')::uuid);`,

    // Environments: isolation through workspace -> organization
    `CREATE POLICY "environments_tenant_isolation" ON "Environment"
       FOR ALL
       USING (
         EXISTS (
           SELECT 1 FROM "Workspace" w
           WHERE w.id = "Environment"."workspaceId"
           AND w.organization_id = current_setting('app.current_org_id')::uuid
         )
       );`,

    // Policies: isolation through workspace -> organization
    `CREATE POLICY "policies_tenant_isolation" ON "Policy"
       FOR ALL
       USING (
         EXISTS (
           SELECT 1 FROM "Workspace" w
           WHERE w.id = "Policy"."workspaceId"
           AND w.organization_id = current_setting('app.current_org_id')::uuid
         )
       );`,

    // Deployments: isolation by organization
    `CREATE POLICY "deployments_tenant_isolation" ON "Deployment"
       FOR ALL
       USING (organization_id = current_setting('app.current_org_id')::uuid);`,

    // Evidence: isolation by organization + workspace
    `CREATE POLICY "evidence_tenant_isolation" ON "EvidenceArtifact"
       FOR ALL
       USING (
         organization_id = current_setting('app.current_org_id')::uuid
         AND (
           workspace_id IS NULL
           OR workspace_id = current_setting('app.current_workspace_id')::uuid
         )
       );`,

    // Secrets: isolation by organization + environment
    `CREATE POLICY "secrets_tenant_isolation" ON "Secret"
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
       );`,

    // API tokens: isolation by organization
    `CREATE POLICY "api_tokens_tenant_isolation" ON "ApiToken"
       FOR ALL
       USING (organization_id = current_setting('app.current_org_id')::uuid);`,

    // User sessions: isolation by organization
    `CREATE POLICY "user_sessions_tenant_isolation" ON "UserSession"
       FOR ALL
       USING (organization_id = current_setting('app.current_org_id')::uuid);`,

    // Audit logs: isolation by organization
    `CREATE POLICY "audit_logs_tenant_isolation" ON "AuditLog"
       FOR ALL
       USING (organization_id = current_setting('app.current_org_id')::uuid);`,
  ];

  for (const policy of policies) {
    try {
      await prisma.$executeRawUnsafe(policy);
    } catch (error) {
      // Policy may already exist; log and continue
      console.warn(`Policy creation warning:`, error);
    }
  }
}

/**
 * Drop all tenant isolation policies (for testing/development only).
 */
export async function dropTenantPolicies(): Promise<void> {
  const policies = [
    'users_tenant_isolation',
    'workspaces_tenant_isolation',
    'environments_tenant_isolation',
    'policies_tenant_isolation',
    'deployments_tenant_isolation',
    'evidence_tenant_isolation',
    'secrets_tenant_isolation',
    'api_tokens_tenant_isolation',
    'user_sessions_tenant_isolation',
    'audit_logs_tenant_isolation',
  ];

  for (const policy of policies) {
    try {
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "${policy}" ON "${policy.replace('_tenant_isolation', '')}";`);
    } catch (error) {
      // Policy may not exist; continue
    }
  }
}

/**
 * Verify tenant isolation is working by attempting a cross-tenant query.
 * Returns true if isolation is enforced (cross-tenant query returns empty).
 */
export async function verifyTenantIsolation(orgAId: string, orgBId: string): Promise<boolean> {
  // Set context to org A
  await prisma.$executeRawUnsafe(`
    SELECT set_config('app.current_org_id', '${orgAId}', false);
  `);

  // Try to query org B's data
  const result = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) FROM "Organization" WHERE id = '${orgBId}';
  `);

  // If isolation is working, the count should be 0
  const count = (result as any)[0]?.count || 0;
  return count === 0;
}