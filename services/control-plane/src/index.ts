import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { Organization } from '@mcpserver-os/contracts';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get('/health', async () => ({
  status: 'ok',
  service: 'control-plane',
  version: '0.1.0',
}));

app.get('/api/v1', async () => ({
  service: 'mcpserver-os-control-plane',
  apiVersion: 'v1',
  capabilities: ['servers', 'policies', 'approvals', 'audit'],
}));

app.get<{ Reply: { example: Organization } }>('/api/v1/contracts/example', async () => ({
  example: {
    id: 'example',
    name: 'Example Organization',
    slug: 'example',
    createdAt: new Date().toISOString(),
  },
}));

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
