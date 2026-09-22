// packages/database/prisma.config.ts
// Prisma configuration for the database package

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: '../../prisma/schema.prisma',
  migrations: {
    path: '../../prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});