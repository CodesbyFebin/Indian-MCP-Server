import Fastify from 'fastify';
import type { McpServer } from '@mcpserver-os/contracts';

const app = Fastify({ logger: true });

app.get('/health', async () => ({
  status: 'ok',
  service: 'gateway',
  version: '0.1.0',
}));

app.post<{
  Reply: {
    jsonrpc: string;
    error?: { code: number; message: string };
    server?: McpServer;
  };
}>('/mcp', async (_request, reply) => {
  return reply.code(501).send({
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: 'MCP gateway is not implemented yet; see PR #3.',
    },
  });
});

const port = Number(process.env.PORT ?? 3002);
const host = process.env.HOST ?? '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
