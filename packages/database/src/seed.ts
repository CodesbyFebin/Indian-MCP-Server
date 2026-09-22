// packages/database/src/seed.ts
// Database seed script for development and testing

import { prisma } from './index';
import { randomUUID } from 'crypto';

/**
 * Seed the database with initial data for development.
 * Run with: npx ts-node packages/database/src/seed.ts
 */
async function seed(): Promise<void> {
  console.log('Seeding database...');

  // Create a default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Default Organization',
      slug: 'default',
      description: 'Default organization for development',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created organization: ${org.name} (${org.id})`);

  // Create a default workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Default Workspace',
      slug: 'default',
      organizationId: org.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created workspace: ${workspace.name} (${workspace.id})`);

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@mcpserver.in' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin@mcpserver.in',
      name: 'Admin User',
      organizationId: org.id,
      passwordHash: '$2a$12$LQv3c1yqBwEHFxUjma44OeF5j3Z5y5y5y5y5y5y5y5y5y5y5y5y5y5y', // placeholder hash
      role: 'ADMIN',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created user: ${user.email} (${user.id})`);

  // Create a default API token
  const token = await prisma.apiToken.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Default API Token',
      tokenHash: '0000000000000000000000000000000000000000000000000000000000000000',
      prefix: 'tkp_00000000',
      scopes: ['mcp:read', 'mcp:execute', 'compliance:read'],
      userId: user.id,
      organizationId: org.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created API token: ${token.name} (${token.id})`);

  console.log('Seeding complete.');
}

// Run if called directly
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seed };