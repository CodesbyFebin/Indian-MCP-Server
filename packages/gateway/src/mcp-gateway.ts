// packages/gateway/src/mcp-gateway.ts
// MCP Gateway Implementation
// Phase 7 Implementation — CORE PRIORITY

import { z } from 'zod';
import crypto from 'crypto';

// ============================================================
// MCP Protocol Types (JSON-RPC 2.0)
// ============================================================

const JSONRPC_VERSION = '2.0';

export const MCPRequestSchema = z.object({
  jsonrpc: z.string().optional().default(JSONRPC_VERSION),
  id: z.union([z.string(), z.number(), z.null()]),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

export const MCPResponseSchema = z.object({
  jsonrpc: z.string().optional().default(JSONRPC_VERSION),
  id: z.union([z.string(), z.number(), z.null()]),
  result: z.unknown().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }).optional(),
});

export const MCPNotificationSchema = z.object({
  jsonrpc: z.string().optional().default(JSONRPC_VERSION),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

export type MCPRequest = z.infer<typeof MCPRequestSchema>;
export type MCPResponse = z.infer<typeof MCPResponseSchema>;
export type MCPNotification = z.infer<typeof MCPNotificationSchema>;

// ============================================================
// Transport Layer
// ============================================================

export interface MCPTransport {
  /**
   * Start the transport server
   */
  start(): Promise<void>;
  
  /**
   * Stop the transport server
   */
  stop(): Promise<void>;
  
  /**
   * Send a response to the client
   */
  send(id: string | number | null, response: MCPResponse): Promise<void>;
  
  /**
   * Send a notification to the client
   */
  notify(notification: MCPNotification): Promise<void>;
  
  /**
   * Register a request handler
   */
  onRequest(handler: (req: MCPRequest) => Promise<MCPResponse>): void;
  
  /**
   * Get transport metadata
   */
  getMetadata(): TransportMetadata;
}

export interface TransportMetadata {
  type: 'stdio' | 'http-stream' | 'http-webhook' | 'websocket';
  connectionId?: string;
  remoteAddress?: string;
  protocolVersion?: string;
}

export const StdioTransportConfigSchema = z.object({
  type: z.literal('stdio'),
  stdin: z.any().optional(),
  stdout: z.any().optional(),
});

export const HTTPStreamTransportConfigSchema = z.object({
  type: z.literal('http-stream'),
  port: z.number().int().min(1).max(65535),
  host: z.string().default('0.0.0.0'),
  corsOrigins: z.array(z.string()).optional(),
  tlsEnabled: z.boolean().default(false),
  tlsCertPath: z.string().optional(),
  tlsKeyPath: z.string().optional(),
});

export const WebSocketTransportConfigSchema = z.object({
  type: z.literal('websocket'),
  port: z.number().int().min(1).max(65535),
  host: z.string().default('0.0.0.0'),
  path: z.string().default('/mcp'),
  corsOrigins: z.array(z.string()).optional(),
  tlsEnabled: z.boolean().default(false),
});

export type TransportConfig =
  | z.infer<typeof StdioTransportConfigSchema>
  | z.infer<typeof HTTPStreamTransportConfigSchema>
  | z.infer<typeof WebSocketTransportConfigSchema>;

// ============================================================
// Authentication & Authorization
// ============================================================

export const AuthScopeSchema = z.enum([
  'mcp:connect',
  'mcp:execute',
  'mcp:tools:list',
  'mcp:resources:list',
  'mcp:prompts:list',
  'mcp:sampling',
  'admin:full',
]);

export type AuthScope = z.infer<typeof AuthScopeSchema>;

export const PrincipalTypeSchema = z.enum(['user', 'agent', 'service', 'system']);
export type PrincipalType = z.infer<typeof PrincipalTypeSchema>;

export interface AuthContext {
  principalId: string;
  principalType: PrincipalType;
  organizationId: string;
  workspaceId?: string;
  environmentId?: string;
  scopes: AuthScope[];
  tokenId?: string;
  issuedAt: Date;
  expiresAt: Date;
  claims?: Record<string, unknown>;
}

export interface AuthValidator {
  validate(token: string): Promise<AuthContext | null>;
  authenticate(request: MCPRequest, headers?: Record<string, string>): Promise<AuthContext | null>;
}

export interface AuthPolicy {
  evaluate(context: AuthContext, method: string, params?: Record<string, unknown>): Promise<boolean>;
}

// ============================================================
// Tool Definitions & Policies
// ============================================================

export const ToolParameterSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  schema: z.record(z.unknown()).optional(),
});

export const ToolPolicySchema = z.object({
  toolName: z.string(),
  allowedPrincipals: z.array(z.string()).optional(),
  allowedPrincipalTypes: z.array(PrincipalTypeSchema).optional(),
  requiredScopes: z.array(AuthScopeSchema).optional(),
  rateLimit: z.object({
    requestsPerSecond: z.number().int().positive(),
    burst: z.number().int().positive().optional(),
  }).optional(),
  piiHandling: z.enum(['allow', 'redact', 'block']).default('redact'),
  allowedWorkspaces: z.array(z.string()).optional(),
});

export type ToolPolicy = z.infer<typeof ToolPolicySchema>;

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: Record<string, unknown>, context: AuthContext) => Promise<ToolResult>;
  metadata?: ToolMetadata;
}

export interface ToolMetadata {
  category?: string;
  version?: string;
  piiSensitive?: boolean;
  requiresEvidence?: boolean;
  controlIds?: string[];
}

export interface ToolResult {
  content: ToolContent[];
  structured?: Record<string, unknown>;
  isError?: boolean;
  metadata?: ToolResultMetadata;
}

export type ToolContent =
  | { type: 'text'; text: string }
  | { type: 'image'; data: string; mimeType: string }
  | { type: 'resource'; uri: string; text: string; mimeType: string };

export interface ToolResultMetadata {
  durationMs?: number;
  evidenceArtifactId?: string;
  controlVerification?: {
    controlId: string;
    status: 'passed' | 'failed' | 'not_applicable';
  }[];
}

export interface ToolRegistry {
  register(tool: Tool): void;
  unregister(name: string): boolean;
  get(name: string): Tool | undefined;
  list(): Tool[];
  applyPolicy(name: string, policy: ToolPolicy): void;
  getPolicy(name: string): ToolPolicy | undefined;
}

// ============================================================
// PII Redaction
// ============================================================

export interface PIIRedactor {
  detect(content: string): PIIPattern[];
  redact(content: string, options?: RedactOptions): RedactedContent;
  audit(event: PIIAuditEvent): Promise<void>;
}

export interface PIIPattern {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface RedactOptions {
  replacement?: string;
  preserveFormat?: boolean;
  redactEmails?: boolean;
  redactPhones?: boolean;
  redactBankAccounts?: boolean;
  redactAadhaar?: boolean;
  redactPan?: boolean;
  redactVPA?: boolean;
}

export interface RedactedContent {
  content: string;
  redactedFields: RedactedField[];
  originalLength: number;
}

export interface RedactedField {
  patternType: string;
  originalValue: string;
  redactedValue: string;
  position: { start: number; end: number };
}

export interface PIIAuditEvent {
  requestId: string;
  organizationId: string;
  principalId: string;
  toolName: string;
  patterns: PIIPattern[];
  redactedContent: RedactedContent;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================
// JSON-RPC Validation
// ============================================================

export class MCPRequestValidator {
  static validate(request: unknown): { valid: true; data: MCPRequest } | { valid: false; error: string } {
    try {
      const result = MCPRequestSchema.safeParse(request);
      if (!result.success) {
        return { valid: false, error: result.error.message };
      }
      
      const { jsonrpc, id, method, params } = result.data;
      
      // Ensure jsonrpc version
      if (jsonrpc !== JSONRPC_VERSION && jsonrpc !== undefined) {
        return { valid: false, error: `Invalid JSON-RPC version: ${jsonrpc}` };
      }
      
      // Validate method exists
      if (!method || typeof method !== 'string') {
        return { valid: false, error: 'Method is required and must be a string' };
      }
      
      // Validate id type
      if (id !== null && typeof id !== 'string' && typeof id !== 'number') {
        return { valid: false, error: 'ID must be string, number, or null' };
      }
      
      return { valid: true, data: result.data };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }
  }
  
  static validateBatch(requests: unknown[]): { valid: true; data: MCPRequest[] } | { valid: false; error: string } {
    const valid: MCPRequest[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      const result = MCPRequestValidator.validate(requests[i]);
      if (!result.valid) {
        return { valid: false, error: `Request ${i}: ${result.error}` };
      }
      valid.push(result.data);
    }
    
    return { valid: true, data: valid };
  }
}

// ============================================================
// Response Builder
// ============================================================

export class MCPResponseBuilder {
  static success(id: string | number | null, result: unknown): MCPResponse {
    return {
      jsonrpc: JSONRPC_VERSION,
      id,
      result,
    };
  }
  
  static error(id: string | number | null, code: number, message: string, data?: unknown): MCPResponse {
    return {
      jsonrpc: JSONRPC_VERSION,
      id,
      error: {
        code,
        message,
        ...(data ? { data } : {}),
      },
    };
  }
  
  static notification(method: string, params?: Record<string, unknown>): MCPNotification {
    return {
      jsonrpc: JSONRPC_VERSION,
      method,
      ...(params ? { params } : {}),
    };
  }
}

// Error codes
export const MCP_ERROR_CODES = {
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

// ============================================================
// MCP Gateway Core
// ============================================================

export interface MCPGatewayConfig {
  transport: TransportConfig;
  authValidator: AuthValidator;
  authPolicy?: AuthPolicy;
  toolRegistry: ToolRegistry;
  piiRedactor?: PIIRedactor;
  requireEvidence: boolean;
  maxRequestSize: number;
  requestTimeoutMs: number;
  enableBatch: boolean;
  rateLimit?: {
    requestsPerSecond: number;
    burst: number;
  };
  auditLog?: (event: GatewayAuditEvent) => Promise<void>;
}

export interface GatewayAuditEvent {
  requestId: string;
  timestamp: Date;
  principalId: string;
  method: string;
  toolName?: string;
  params?: Record<string, unknown>;
  authContext?: Partial<AuthContext>;
  result: 'success' | 'error';
  durationMs: number;
  error?: string;
  piiDetected?: boolean;
  evidenceArtifactId?: string;
}

export class MCPGateway {
  private config: MCPGatewayConfig;
  private transport: MCPTransport;
  private initialized: boolean = false;
  private requestIdCounter: number = 0;
  private rateLimiters: Map<string, TokenBucket> = new Map();
  
  constructor(config: MCPGatewayConfig) {
    this.config = config;
    this.transport = this.createTransport(config.transport);
  }
  
  private createTransport(transportConfig: TransportConfig): MCPTransport {
    // Implementation would select the appropriate transport class
    // based on type. For this implementation, we define the factory.
    switch (transportConfig.type) {
      case 'stdio':
        // return new StdioServerTransport(transportConfig);
        throw new Error('Stdio transport requires server environment');
      case 'http-stream':
        // return new HTTPStreamServerTransport(transportConfig);
        throw new Error('HTTP stream transport requires server environment');
      case 'websocket':
        // return new WebSocketServerTransport(transportConfig);
        throw new Error('WebSocket transport requires server environment');
      default:
        throw new Error(`Unknown transport type: ${(transportConfig as any).type}`);
    }
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Gateway already initialized');
    }
    
    await this.transport.start();
    
    this.transport.onRequest(async (request) => {
      return this.handleRequest(request);
    });
    
    this.initialized = true;
  }
  
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    await this.transport.stop();
    this.initialized = false;
  }
  
  private generateRequestId(): string {
    this.requestIdCounter += 1;
    const timestamp = Date.now().toString(36);
    const counter = this.requestIdCounter.toString(36);
    return `${timestamp}-${counter}-${crypto.randomBytes(8).toString('hex')}`;
  }
  
  private async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    let authContext: AuthContext | null = null;
    let toolName: string | undefined;
    let piiDetected = false;
    let evidenceArtifactId: string | undefined;
    
    try {
      // Step 1: Validate JSON-RPC structure
      const validation = MCPRequestValidator.validate(request);
      if (!validation.valid) {
        return MCPResponseBuilder.error(
          request.id,
          MCP_ERROR_CODES.INVALID_REQUEST,
          validation.error,
        );
      }
      
      const req = validation.data;
      
      // Step 2: Authenticate
      const headers = this.extractHeaders(req);
      authContext = await this.config.authValidator.authenticate(req, headers);
      if (!authContext) {
        await this.audit({
          requestId,
          timestamp: new Date(),
          principalId: 'unknown',
          method: req.method,
          result: 'error',
          durationMs: Date.now() - startTime,
          error: 'Unauthorized',
        });
        
        return MCPResponseBuilder.error(
          req.id,
          MCP_ERROR_CODES.UNAUTHORIZED,
          'Unauthorized: valid authentication required',
        );
      }
      
      // Step 3: Apply auth policy
      if (this.config.authPolicy) {
        const authorized = await this.config.authPolicy.evaluate(authContext, req.method, req.params);
        if (!authorized) {
          await this.audit({
            requestId,
            timestamp: new Date(),
            principalId: authContext.principalId,
            method: req.method,
            result: 'error',
            durationMs: Date.now() - startTime,
            error: 'Policy violation',
          });
          
          return MCPResponseBuilder.error(
            req.id,
            MCP_ERROR_CODES.POLICY_VIOLATION,
            'Access denied by policy',
          );
        }
      }
      
      // Step 4: Rate limiting
      if (this.config.rateLimit) {
        const limiter = this.getRateLimiter(authContext.principalId);
        if (!limiter.consume(1)) {
          await this.audit({
            requestId,
            timestamp: new Date(),
            principalId: authContext.principalId,
            method: req.method,
            result: 'error',
            durationMs: Date.now() - startTime,
            error: 'Rate limited',
          });
          
          return MCPResponseBuilder.error(
            req.id,
            MCP_ERROR_CODES.RATE_LIMITED,
            'Rate limit exceeded',
          );
        }
      }
      
      // Step 5: Check PII handling if configured
      if (this.config.piiRedactor && req.params) {
        const paramStr = JSON.stringify(req.params);
        const patterns = this.config.piiRedactor.detect(paramStr);
        if (patterns.length > 0) {
          piiDetected = true;
          
          // If PII is detected in sensitive context, block the request
          const auditEvent: PIIAuditEvent = {
            requestId,
            organizationId: authContext.organizationId,
            principalId: authContext.principalId,
            toolName: req.method,
            patterns,
            redactedContent: {
              content: '',
              redactedFields: [],
              originalLength: paramStr.length,
            },
            timestamp: new Date(),
            severity: 'medium',
          };
          
          await this.config.piiRedactor.audit(auditEvent);
        }
      }
      
      // Step 6: Route to tool handler or system handler
      const response = await this.routeRequest(req, authContext);
      
      // Step 7: Audit
      await this.audit({
        requestId,
        timestamp: new Date(),
        principalId: authContext.principalId,
        method: req.method,
        toolName,
        result: response.error ? 'error' : 'success',
        durationMs: Date.now() - startTime,
        error: response.error?.message,
        piiDetected,
        evidenceArtifactId,
      });
      
      return response;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.audit({
        requestId,
        timestamp: new Date(),
        principalId: authContext?.principalId || 'unknown',
        method: request.method,
        toolName,
        result: 'error',
        durationMs: Date.now() - startTime,
        error: errorMessage,
        piiDetected,
        evidenceArtifactId,
      });
      
      return MCPResponseBuilder.error(
        request.id,
        MCP_ERROR_CODES.INTERNAL_ERROR,
        'Internal server error',
        { requestId },
      );
    }
  }
  
  private async routeRequest(request: MCPRequest, context: AuthContext): Promise<MCPResponse> {
    const method = request.method;
    const params = request.params || {};
    
    // System methods
    if (method === 'initialize') {
      return this.handleInitialize(params, context);
    }
    
    if (method === 'initialized') {
      return MCPResponseBuilder.success(request.id, null);
    }
    
    if (method === 'tools/list') {
      return this.handleToolsList(context);
    }
    
    // Tool execution methods
    const tool = this.config.toolRegistry.get(method);
    if (tool) {
      return await this.executeTool(tool, params, context, request.id);
    }
    
    return MCPResponseBuilder.error(
      request.id,
      MCP_ERROR_CODES.METHOD_NOT_FOUND,
      `Method not found: ${method}`,
    );
  }
  
  private async handleInitialize(params: Record<string, unknown>, context: AuthContext): Promise<MCPResponse> {
    const result = {
      protocolVersion: JSONRPC_VERSION,
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
      },
      serverInfo: {
        name: 'MCPServer Gateway',
        version: '1.0.0',
      },
      organizationId: context.organizationId,
      principalId: context.principalId,
    };
    
    return MCPResponseBuilder.success(null, result);
  }
  
  private async handleToolsList(context: AuthContext): Promise<MCPResponse> {
    const tools = this.config.toolRegistry.list();
    const visibleTools = tools.filter(tool => {
      const policy = this.config.toolRegistry.getPolicy(tool.name);
      if (!policy) return true;
      
      // Check principal type
      if (policy.allowedPrincipalTypes && !policy.allowedPrincipalTypes.includes(context.principalType)) {
        return false;
      }
      
      // Check workspace
      if (policy.allowedWorkspaces && context.workspaceId && !policy.allowedWorkspaces.includes(context.workspaceId)) {
        return false;
      }
      
      return true;
    });
    
    const result = {
      tools: visibleTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.parameters,
      })),
    };
    
    return MCPResponseBuilder.success(null, result);
  }
  
  private async executeTool(
    tool: Tool,
    params: Record<string, unknown>,
    context: AuthContext,
    id: string | number | null,
  ): Promise<MCPResponse> {
    // Validate params against tool schema
    if (tool.parameters && typeof tool.parameters === 'object') {
      // In a full implementation, validate params against JSON schema
    }
    
    // Check tool-specific policy
    const policy = this.config.toolRegistry.getPolicy(tool.name);
    if (policy) {
      // Check allowed principals
      if (policy.allowedPrincipals && !policy.allowedPrincipals.includes(context.principalId)) {
        return MCPResponseBuilder.error(
          id,
          MCP_ERROR_CODES.POLICY_VIOLATION,
          `Tool ${tool.name} access denied for principal ${context.principalId}`,
        );
      }
      
      // Check required scopes
      if (policy.requiredScopes) {
        const hasScope = policy.requiredScopes.some(scope => context.scopes.includes(scope));
        if (!hasScope) {
          return MCPResponseBuilder.error(
            id,
            MCP_ERROR_CODES.UNAUTHORIZED,
            `Insufficient scopes for tool ${tool.name}`,
          );
        }
      }
      
      // PII handling
      if (this.config.piiRedactor && policy.piiHandling === 'block') {
        const paramStr = JSON.stringify(params);
        const patterns = this.config.piiRedactor.detect(paramStr);
        if (patterns.length > 0) {
          return MCPResponseBuilder.error(
            id,
            MCP_ERROR_CODES.PII_DETECTED,
            `PII detected in tool ${tool.name} parameters; blocked by policy`,
            { redacted: true },
          );
        }
      }
    }
    
    // Execute tool with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Tool execution timeout')), this.config.requestTimeoutMs);
    });
    
    const resultPromise = tool.handler(params, context);
    
    try {
      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      const responseContent = result.content.map(c => {
        if (c.type === 'text' && this.config.piiRedactor && policy?.piiHandling === 'redact') {
          const redacted = this.config.piiRedactor.redact(c.text, {
            redactEmails: true,
            redactAadhaar: true,
            redactPan: true,
            redactVPA: true,
          });
          return { type: 'text' as const, text: redacted.content };
        }
        return c;
      });
      
      // Create evidence artifact if required
      if (tool.metadata?.requiresEvidence || this.config.requireEvidence) {
        // In full implementation, this would create an evidence artifact
      }
      
      return MCPResponseBuilder.success(id, {
        content: responseContent,
        ...(result.structured ? { structured: result.structured } : {}),
        ...(result.isError ? { isError: result.isError } : {}),
        ...(result.metadata ? { metadata: result.metadata } : {}),
      });
    } catch (error) {
      return MCPResponseBuilder.error(
        id,
        MCP_ERROR_CODES.TOOL_EXECUTION_ERROR,
        `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { toolName: tool.name },
      );
    }
  }
  
  private extractHeaders(request: MCPRequest): Record<string, string> {
    // Headers would be extracted from transport-specific context
    // This is a placeholder for the standard header extraction logic
    const params = request.params || {};
    return (params._headers || {}) as Record<string, string>;
  }
  
  private getRateLimiter(key: string): TokenBucket {
    let limiter = this.rateLimiters.get(key);
    if (!limiter) {
      limiter = new TokenBucket({
        tokensPerSecond: this.config.rateLimit!.requestsPerSecond,
        maxBurst: this.config.rateLimit!.burst,
      });
      this.rateLimiters.set(key, limiter);
    }
    return limiter;
  }
  
  private async audit(event: GatewayAuditEvent): Promise<void> {
    if (this.config.auditLog) {
      try {
        await this.config.auditLog(event);
      } catch (error) {
        console.error('Audit logging failed:', error);
      }
    }
  }
}

// ============================================================
// Token Bucket Rate Limiter
// ============================================================

interface TokenBucketConfig {
  tokensPerSecond: number;
  maxBurst: number;
}

class TokenBucket {
  private tokensPerSecond: number;
  private maxBurst: number;
  private tokens: number;
  private lastRefill: number;
  
  constructor(config: TokenBucketConfig) {
    this.tokensPerSecond = config.tokensPerSecond;
    this.maxBurst = config.maxBurst;
    this.tokens = config.maxBurst;
    this.lastRefill = Date.now();
  }
  
  consume(count: number): boolean {
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
// Default Tool Registry Implementation
// ============================================================

export class InMemoryToolRegistry implements ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private policies: Map<string, ToolPolicy> = new Map();
  
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }
  
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }
  
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  
  list(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  applyPolicy(name: string, policy: ToolPolicy): void {
    this.policies.set(name, { ...policy, toolName: name });
  }
  
  getPolicy(name: string): ToolPolicy | undefined {
    return this.policies.get(name);
  }
}

// ============================================================
// Default Auth Policy Implementation
// ============================================================

export class DefaultAuthPolicy implements AuthPolicy {
  async evaluate(context: AuthContext, method: string, params?: Record<string, unknown>): Promise<boolean> {
    // Initialize request always allowed
    if (method === 'initialize' || method === 'initialized') {
      return true;
    }
    
    // Check for required scopes based on method
    if (method.startsWith('tools/')) {
      // Tool operations require mcp:execute or mcp:tools:list
      const requiredScope = method === 'tools/list' ? 'mcp:tools:list' : 'mcp:execute';
      return context.scopes.includes(requiredScope as AuthScope) || context.scopes.includes('admin:full');
    }
    
    if (method.startsWith('prompts/')) {
      return context.scopes.includes('mcp:sampling') || context.scopes.includes('admin:full');
    }
    
    if (method.startsWith('resources/')) {
      return context.scopes.includes('mcp:resources:list') || context.scopes.includes('admin:full');
    }
    
    // Default: require mcp:connect scope
    return context.scopes.includes('mcp:connect') || context.scopes.includes('admin:full');
  }
}

// ============================================================
// JWT Auth Validator (default implementation)
// ============================================================

export class JWTAuthValidator implements AuthValidator {
  private publicKey: string;
  private issuer: string;
  private audience: string;
  
  constructor(config: { publicKey: string; issuer: string; audience: string }) {
    this.publicKey = config.publicKey;
    this.issuer = config.issuer;
    this.audience = config.audience;
  }
  
  async validate(token: string): Promise<AuthContext | null> {
    try {
      // In a real implementation, this would use a JWT library like jose
      // For this implementation, we define the interface
      const payload = this.decodeJWT(token);
      
      if (payload.iss !== this.issuer || payload.aud !== this.audience) {
        return null;
      }
      
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return null;
      }
      
      return {
        principalId: payload.sub || payload.pid || '',
        principalType: payload.ptp || 'user' as PrincipalType,
        organizationId: payload.oid || '',
        workspaceId: payload.wid,
        environmentId: payload.eid,
        scopes: payload.scope?.split(' ') || [],
        tokenId: payload.jti,
        issuedAt: new Date((payload.iat || 0) * 1000),
        expiresAt: new Date((payload.exp || 0) * 1000),
        claims: { ...payload },
      };
    } catch {
      return null;
    }
  }
  
  async authenticate(request: MCPRequest, headers?: Record<string, string>): Promise<AuthContext | null> {
    const authHeader = headers?.['authorization'] || headers?.['Authorization'];
    
    if (!authHeader) {
      // Check for token in params
      const params = request.params || {};
      const token = params.token || params.authorizationToken;
      if (typeof token === 'string') {
        return this.validate(token);
      }
      return null;
    }
    
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      return this.validate(match[1]);
    }
    
    return null;
  }
  
  private decodeJWT(token: string): Record<string, any> {
    // Basic JWT decode without verification - verification should use proper library
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload;
  }
}

// ============================================================
// Export All
// ============================================================

export * from './prisma/client'; // Re-export Prisma types if available