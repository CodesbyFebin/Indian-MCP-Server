// lib/db/index.ts
// Database connection (Drizzle ORM + Postgres)
// Configured with connection pooling and error handling

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client with connection pooling
const client = postgres(process.env.DATABASE_URL, {
  max: 20, // Maximum number of connections
  idle_timeout: 30, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle ORM instance
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Export types
export type { Server, NewServer, Evidence, NewEvidence } from './schema';
export * from './schema';
