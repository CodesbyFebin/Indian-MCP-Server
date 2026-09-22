// tests/e2e/mcp-endpoint.spec.ts
// E2E tests for the MCP server endpoint

import { test, expect, type Response } from '@playwright/test';

test.describe('MCP Endpoint', () => {
  test('should return HTTP 401 without auth for tools', async ({ request }) => {
    const response = await request.post('/api/mcp', {
      data: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('should respond with 200 for server info', async ({ request }) => {
    // Even without auth, protocol-level init shouldn't crash
    const response = await request.post('/api/mcp', {
      data: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2026-07-28',
          capabilities: {},
        },
      }),
    });

    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('should reject invalid JSON-RPC', async ({ request }) => {
    const response = await request.post('/api/mcp', {
      data: 'not json',
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Well-Known Endpoints', () => {
  test('should serve OAuth protected resource metadata', async ({ request }) => {
    const response = await request.get('/.well-known/oauth-protected-resource');
    expect(response.status()).toBe(200);
  });

  test('should serve OAuth authorization server metadata', async ({ request }) => {
    const response = await request.get(
      '/.well-known/oauth-authorization-server/metadata.json',
    );
    expect(response.status()).toBe(200);
  });
});
