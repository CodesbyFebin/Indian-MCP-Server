// packages/gateway/src/index.ts
// Phase 5 - MCP Gateway Implementation (G-01 through G-04)
// Transport layer, JSON-RPC validation, and tool policy engine

import { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

// ============================================================
// G-01: MCP Transport Layer
// ============================================================

export type TransportType = 'stdio' | 'streamable_http' | 'sse';

export interface TransportConfig {
  type: TransportType;
  port?: number;
  host?: string;
  corsOrigins?: string[];
  tlsEnabled?: boolean;
}

export interface MCPTransportHandlers {
  onRequest: (req: MCPRequest) => Promise<MCPResponse>;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  capabilities: ServerCapabilities;
  instructions?: string;
}

export interface ServerCapabilities {
  tools?: boolean;
  resources?: {
    subscribe?: boolean;
    list?: boolean;
  };
  prompts?: {
    list?: boolean;
  };
  logging?: boolean;
  completions?: boolean;
}

export class MCPGateway extends EventEmitter {
  private config: TransportConfig;
  private handlers: MCPTransportHandlers | null = null;
  private serverInfo: MCPServerInfo;
  private initialized: boolean = false;
  private requestIdCounter: number = 0;

  constructor(config: TransportConfig, serverInfo: MCPServerInfo) {
    super();
    this.config = config;
    this.serverInfo = serverInfo;
  }

  /**
   * Register request handlers for incoming MCP requests
   */
  setHandlers(handlers: MCPTransportHandlers): void {
    this.handlers = handlers;
  }

  /**
   * G-01: Handle a single MCP request through the transport pipeline
   * This is called by the transport layer (HTTP, SSE, stdio)
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.requestIdCounter += 1;
    const requestId = request.id;

    try {
      // G-03: JSON-RPC Validation
      const validationResult = MCPRequestValidator.validate(request);
      if (!validationResult.valid) {
        return MCPResponseBuilder.error(requestId, {
          code: MCP_ERROR_CODES.INVALID_REQUEST,
          message: validationResult.error,
        });
      }

      // Check if this is a system method
      if (this.isSystemMethod(request.method)) {
        return await this.handleSystemMethod(request);
      }

      // Forward to registered handler
      if (this.handlers?.onRequest) {
        return await this.handlers.onRequest(request);
      }

      return MCPResponseBuilder.error(requestId, {
        code: MCP_ERROR_CODES.METHOD_NOT_FOUND,
        message: `Method not found: ${request.method}`,
      });
    } catch (error) {
      return MCPResponseBuilder.error(requestId, {
        code: MCP_ERROR_CODES.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : 'Internal error',
        data: { requestId: this.requestIdCounter },
      });
    }
  }

  private isSystemMethod(method: string): boolean {
    return ['initialize', 'initialized', 'tools/list', 'prompts/list', 'resources/list'].includes(method);
  }

  private async handleSystemMethod(request: MCPRequest): Promise<MCPResponse> {
    switch (request.method) {
      case 'initialize':
        return MCPResponseBuilder.success(request.id, {
          protocolVersion: '2026-07-28',
          capabilities: this.serverInfo.capabilities,
          serverInfo: {
            name: this.serverInfo.name,
            version: this.serverInfo.version,
          },
          instructions: this.serverInfo.instructions,
        });

      case 'initialized':
        this.emit('client-initialized');
        return { jsonrpc: '2.0', id: request.id, result: null };

      default:
        return MCPResponseBuilder.error(request.id, {
          code: MCP_ERROR_CODES.METHOD_NOT_FOUND,
          message: `System method not found: ${request.method}`,
        });
    }
  }

  /**
   * Start the gateway server
   */
  async start(): Promise<void> {
    if (this.initialized) {
      throw new Error('Gateway already started');
    }
    this.initialized = true;

    // In production, this would start the HTTP server, SSE handler, or stdio loop
    this.emit('started');
  }

  /**
   * Stop the gateway server
   */
  async stop(): Promise<void> {
    this.initialized = false;
    this.emit('stopped');
  }
}

// ============================================================
// JSON-RPC 2.0 Types
// ============================================================

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

// ============================================================
// G-03: JSON-RPC Validation
// ============================================================

const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // MCP-specific
  METHOD_NOT_AVAILABLE: -32000,
  TOOL_NOT_FOUND: -32001,
  TOOL_EXECUTION_ERROR: -32002,
  POLICY_VIOLATION: -32003,
  UNAUTHORIZED: -32004,
  RATE_LIMITED: -32005,
  PII_DETECTED: -32006,
} as const;

export type MCPErrorCode = typeof MCP_ERROR_CODES[keyof typeof MCP_ERROR_CODES];

export class MCPRequestValidator {
  static validate(request: unknown): { valid: true; data: MCPRequest } | { valid: false; error: string } {
    try {
      if (typeof request !== 'object' || request === null) {
        return { valid: false, error: 'Request must be an object' };
      }

      const req = request as Record<string, unknown>;

      // jsonrpc version
      if (req.jsonrpc !== undefined && req.jsonrpc !== '2.0') {
        return { valid: false, error: `Invalid JSON-RPC version: ${req.jsonrpc}` };
      }

      // id
      if (req.id !== null && typeof req.id !== 'string' && typeof req.id !== 'number') {
        return { valid: false, error: 'ID must be string, number, or null' };
      }

      // method
      if (typeof req.method !== 'string' || req.method.length === 0) {
        return { valid: false, error: 'Method is required and must be a non-empty string' };
      }

      // params (optional, must be object if present)
      if (req.params !== undefined && (typeof req.params !== 'object' || req.params !== null || Array.isArray(req.params))) {
        return { valid: false, error: 'Params must be an object' };
      }

      // Ensure jsonrpc is set
      const validated: MCPRequest = {
        jsonrpc: '2.0',
        id: req.id as string | number | null,
        method: req.method as string,
        ...(req.params !== undefined ? { params: req.params as Record<string, unknown> } : {}),
      };

      return { valid: true, data: validated };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }
  }
}

// ============================================================
// Response Builder
// ============================================================

export class MCPResponseBuilder {
  static success(id: string | number | null, result: unknown): MCPResponse {
    return { jsonrpc: '2.0', id, result };
  }

  static error(id: string | number | null, error: MCPError): MCPResponse {
    return { jsonrpc: '2.0', id, error };
  }

  static notification(method: string, params?: Record<string, unknown>): MCPNotification {
    return { jsonrpc: '2.0', method, ...(params ? { params } : {}) };
  }

  static errorFromCode(id: string | number | null, code: MCPErrorCode, message: string, data?: unknown): MCPResponse {
    return MCPResponseBuilder.error(id, { code, message, ...(data ? { data } : {}) });
  }
}

// ============================================================
// G-04: Tool Policy Engine
// ============================================================

export interface ToolPolicy {
  toolName: string;
  allowedPrincipals: string[];
  requiredScopes: string[];
  rateLimit?: {
    requestsPerSecond: number;
    burst: number;
  };
  piiHandling: 'allow' | 'redact' | 'block';
  allowedWorkspaces: string[];
}

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  matchedPolicy?: ToolPolicy;
}

export class ToolPolicyEngine {
  private policies: Map<string, ToolPolicy> = new Map();
  private rateLimiters: Map<string, TokenBucketRateLimiter> = new Map();

  /**
   * Register or update a tool policy
   */
  setPolicy(policy: ToolPolicy): void {
    this.policies.set(policy.toolName, policy);
  }

  /**
   * Remove a tool policy
   */
  removePolicy(toolName: string): boolean {
    return this.policies.delete(toolName);
  }

  /**
   * Evaluate whether a tool call is allowed for a given principal
   * G-04: Tool Policy Engine
   */
  evaluate(
    toolName: string,
    principalId: string,
    scopes: string[],
    tenantId?: string,
  ): PolicyDecision {
    const policy = this.policies.get(toolName);

    if (!policy) {
      // No explicit policy = allow but log for review
      return { allowed: true, reason: 'no policy defined' };
    }

    // Check principal allowlist
    if (policy.allowedPrincipals.length > 0) {
      if (!policy.allowedPrincipals.includes(principalId)) {
        return {
          allowed: false,
          reason: `Principal ${principalId} not in allowlist`,
          matchedPolicy: policy,
        };
      }
    }

    // Check required scopes
    if (policy.requiredScopes.length > 0) {
      const hasScope = policy.requiredScopes.some((scope) => scopes.includes(scope));
      if (!hasScope) {
        return {
          allowed: false,
          reason: `Missing required scopes: ${policy.requiredScopes.join(', ')}`,
          matchedPolicy: policy,
        };
      }
    }

    // Check tenant/workspace isolation
    if (policy.allowedWorkspaces.length > 0 && tenantId) {
      if (!policy.allowedWorkspaces.includes(tenantId)) {
        return {
          allowed: false,
          reason: `Workspace ${tenantId} not in allowed list`,
          matchedPolicy: policy,
        };
      }
    }

    return { allowed: true, matchedPolicy: policy };
  }

  /**
   * Check rate limit for a principal + tool combination
   */
  checkRateLimit(toolName: string, principalId: string): boolean {
    const policy = this.policies.get(toolName);
    if (!policy?.rateLimit) return true;

    const key = `${toolName}:${principalId}`;
    let limiter = this.rateLimiters.get(key);
    if (!limiter) {
      limiter = new TokenBucketRateLimiter(
        policy.rateLimit.requestsPerSecond,
        policy.rateLimit.burst,
      );
      this.rateLimiters.set(key, limiter);
    }

    return limiter.consume();
  }
}

// ============================================================
// Rate Limiter (Token Bucket)
// ============================================================

export class TokenBucketRateLimiter {
  private tokens: number;
  private maxBurst: number;
  private tokensPerSecond: number;
  private lastRefill: number;

  constructor(tokensPerSecond: number, maxBurst: number) {
    this.tokensPerSecond = tokensPerSecond;
    this.maxBurst = maxBurst;
    this.tokens = maxBurst;
    this.lastRefill = Date.now();
  }

  consume(count: number = 1): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxBurst, this.tokens + elapsed * this.tokensPerSecond);
    this.lastRefill = now;

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
}

// ============================================================
// G-02: Authentication & Tenant Resolution
// ============================================================

export interface AuthContext {
  principalId: string;
  tenantId: string;
  scopes: string[];
  tokenId?: string;
  issuedAt: Date;
  expiresAt: Date;
}

export interface AuthValidator {
  validate(token: string): Promise<AuthContext | null>;
  extractContext(req: MCPRequest): Promise<AuthContext | null>;
}

export class BearerTokenValidator implements AuthValidator {
  private jwtSecret: Buffer;

  constructor(secret: string) {
    this.jwtSecret = Buffer.from(secret, 'utf-8');
  }

  async validate(token: string): Promise<AuthContext | null> {
    try {
      // Use jose or jsonwebtoken in production
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      // Check expiration
      if (payload.exp && payload.exp < Date.now() / 1000) return null;

      return {
        principalId: payload.sub || payload.pid,
        tenantId: payload.tid || payload.oid,
        scopes: payload.scp?.split(' ') || [],
        tokenId: payload.jti,
        issuedAt: new Date((payload.iat || 0) * 1000),
        expiresAt: new Date((payload.exp || 0) * 1000),
      };
    } catch {
      return null;
    }
  }

  async extractContext(req: MCPRequest): Promise<AuthContext | null> {
    // Extract from params (for MCP protocol) or headers (for HTTP transport)
    const params = req.params || {};
    const token = params._token || params.authorizationToken || params.bearerToken;

    if (token && typeof token === 'string') {
      return this.validate(token);
    }

    return null;
  }
}

// ============================================================
// Audit & Tracing (G-06)
// ============================================================

export interface GatewayAuditEvent {
  requestId: string;
  timestamp: Date;
  principalId: string;
  method: string;
  toolName?: string;
  params?: Record<string, unknown>;
  result: 'success' | 'error' | 'denied' | 'rate_limited';
  durationMs: number;
  error?: string;
  piiDetected?: boolean;
}

export class AuditLogger extends EventEmitter {
  private events: GatewayAuditEvent[] = [];

  log(event: GatewayAuditEvent): void {
    this.events.push(event);
    this.emit('audit', event);
  }

  getRecentEvents(limit: number = 100): GatewayAuditEvent[] {
    return this.events.slice(-limit);
  }
}

// ============================================================
// Export everything
// ============================================================

export {
  MCP_ERROR_CODES,
  MCPRequestValidator,
  MCPResponseBuilder,
  TokenBucketRateLimiter,
};

export type {
  TransportType,
  MCPTransportHandlers,
  MCPServerInfo,
  ServerCapabilities,
  MCPRequest,
  MCPResponse,
  MCPError,
  MCPNotification,
  MCPErrorCode,
  ToolPolicy,
  PolicyDecision,
  AuthContext,
  AuthValidator,
  GatewayAuditEvent,
};
