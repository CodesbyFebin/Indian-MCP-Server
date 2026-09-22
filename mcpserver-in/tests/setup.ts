// tests/setup.ts
// Global test setup

beforeAll(async () => {
  // Set up test environment variables
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://test:test@localhost:5432/mcpserver_test';
  process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';
  process.env.AUTH_SERVER_URL = 'http://localhost:3000';
  process.env.REVALIDATE_TOKEN = 'test-revalidate-token';

  // Import database and run any setup
  const { db } = await import('@/lib/db');
  // In CI, migrations would be run before tests
});

afterAll(async () => {
  // Cleanup
  const { db } = await import('@/lib/db');
  await db?.$disconnect?.();
});
