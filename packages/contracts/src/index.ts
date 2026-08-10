export type ID = string;

export type ServerTransport = 'streamable-http' | 'sse' | 'stdio';
export type ServerStatus = 'unknown' | 'online' | 'offline' | 'degraded';
export type PolicyEffect = 'allow' | 'deny' | 'require_approval';
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  createdAt: string;
}

export interface User {
  id: ID;
  organizationId: ID;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'operator' | 'viewer';
  createdAt: string;
}

export interface McpServer {
  id: ID;
  organizationId: ID;
  name: string;
  description?: string;
  endpoint?: string;
  transport: ServerTransport;
  status: ServerStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: ID;
  serverId: ID;
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  riskLevel: RiskLevel;
}

export interface Policy {
  id: ID;
  organizationId: ID;
  name: string;
  effect: PolicyEffect;
  serverId?: ID;
  toolName?: string;
  enabled: boolean;
}

export interface Approval {
  id: ID;
  organizationId: ID;
  policyId?: ID;
  serverId: ID;
  toolName: string;
  requestedBy: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  expiresAt?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: ID;
  organizationId: ID;
  actorId?: ID;
  action: string;
  resourceType: string;
  resourceId?: ID;
  metadata: Record<string, unknown>;
  createdAt: string;
}
