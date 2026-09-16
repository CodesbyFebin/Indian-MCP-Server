// packages/contracts/src/deployment.ts
// Phase 4 - Deployment Engine Schema (P0)
// Deployment state machine with evidence collection

import { z } from 'zod';

// ============================================================
// Deployment State Machine States
// ============================================================

export enum DeploymentStatus {
  // Initial states
  DRAFT = 'DRAFT',
  
  // Source resolution
  SOURCE_RESOLUTION = 'SOURCE_RESOLUTION',
  
  // Artifact verification
  ARTIFACT_VERIFICATION = 'ARTIFACT_VERIFICATION',
  
  // Security scanning
  SECURITY_SCAN = 'SECURITY_SCAN',
  
  // Policy evaluation
  POLICY_EVALUATION = 'POLICY_EVALUATION',
  
  // Approval workflow
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  
  // Queue
  QUEUED = 'QUEUED',
  
  // Build
  BUILDING = 'BUILDING',
  
  // Deploy
  DEPLOYING = 'DEPLOYING',
  
  // Start
  STARTING = 'STARTING',
  
  // Health check
  HEALTH_CHECKING = 'HEALTH_CHECKING',
  
  // Running (success state)
  RUNNING = 'RUNNING',
  
  // Failure states
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  POLICY_DENIED = 'POLICY_DENIED',
  BUILD_FAILED = 'BUILD_FAILED',
  DEPLOY_FAILED = 'DEPLOY_FAILED',
  HEALTH_FAILED = 'HEALTH_FAILED',
  DEGRADED = 'DEGRADED',
  ROLLBACK_REQUIRED = 'ROLLBACK_REQUIRED',
  ROLLED_BACK = 'ROLLED_BACK',
  STOPPED = 'STOPPED',
}

// ============================================================
// Event Definitions
// ============================================================

export const DeploymentEventSchema = z.object({
  deploymentId: z.string().uuid(),
  from: z.nativeEnum(DeploymentStatus),
  to: z.nativeEnum(DeploymentStatus),
  actor: z.object({
    type: z.enum(['user', 'system', 'ai-agent']),
    id: z.string(),
  }),
  reason: z.string(),
  requestId: z.string().uuid(),
  timestamp: z.date(),
  evidenceRef: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type DeploymentEvent = z.infer<typeof DeploymentEventSchema>;

// ============================================================
// Deployment Configuration
// ============================================================

export const DeploymentConfigSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string(),
  source: z.object({
    type: z.enum(['docker', 'git', 'oci']),
    // For git source
    gitUrl: z.string().url().optional(),
    gitBranch: z.string().optional(),
    gitRevision: z.string().optional(),
    // For docker source
    image: z.string().optional(),
    imageTag: z.string().optional(),
    // For OCI source
    ociUrl: z.string().optional(),
    ociDigest: z.string().optional(),
  }),
  runtime: z.object({
    provider: z.enum(['docker', 'kubernetes', 'nomad']),
    image: z.string().optional(),
    tag: z.string().optional(),
    resources: z.object({
      cpu: z.string().optional(),
      memory: z.string().optional(),
      storage: z.string().optional(),
    }).optional(),
    environment: z.record(z.string()).optional(),
    ports: z.array(z.object({
      containerPort: z.number().int().min(1).max(65535),
      hostPort: z.number().int().min(1).max(65535).optional(),
      protocol: z.enum(['tcp', 'udp']).default('tcp'),
    })).optional(),
    volumes: z.array(z.object({
      name: z.string(),
      path: z.string(),
      source: z.string().optional(),
      readOnly: z.boolean().default(false),
    })).optional(),
  }),
  network: z.object({
    tenantIsolation: z.boolean().default(true),
    allowedInbound: z.array(z.string()).optional(),
    allowedOutbound: z.array(z.string()).optional(),
  }).optional(),
  scaling: z.object({
    minReplicas: z.number().int().min(1).default(1),
    maxReplicas: z.number().int().min(1).default(3),
    targetCPU: z.number().min(1).max(100).default(70),
  }).optional(),
  policy: z.object({
    allowToolCalls: z.boolean().default(true),
    promptProtection: z.boolean().default(true),
    rateLimitPerSecond: z.number().int().min(1).default(100),
    timeoutMs: z.number().int().min(1000).default(30000),
  }).optional(),
  healthCheck: z.object({
    endpoint: z.string().optional(),
    intervalSeconds: z.number().int().min(1).default(30),
    timeoutSeconds: z.number().int().min(1).default(5),
    failureThreshold: z.number().int().min(1).default(3),
    successThreshold: z.number().int().min(1).default(1),
  }).optional(),
}).strict();

export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;

// ============================================================
// Deployment Version
// ============================================================

export const DeploymentVersionSchema = z.object({
  id: z.string().uuid(),
  deploymentId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  config: DeploymentConfigSchema,
  createdAt: z.date(),
  createdBy: z.string().uuid(),
  status: z.nativeEnum(DeploymentStatus),
  // Immutable revision tracking
  sourceRevision: z.string().optional(),
  configRevision: z.string().uuid(),
  policyRevision: z.string().uuid(),
  secretReferences: z.array(z.string().uuid()).default([]),
  // Hash of the entire configuration for verification
  configHash: z.string(),
  // Evidence references for this version
  evidence: z.array(z.string().uuid()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type DeploymentVersion = z.infer<typeof DeploymentVersionSchema>;

// ============================================================
// Deployment Instance
// ============================================================

export const DeploymentInstanceSchema = z.object({
  id: z.string().uuid(),
  deploymentId: z.string().uuid(),
  versionId: z.string().uuid(),
  organizationId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  environmentId: z.string().uuid(),
  name: z.string(),
  status: z.nativeEnum(DeploymentStatus),
  currentStep: z.string().optional(),
  runtimeUrl: z.string().url().optional(),
  runtimeInfo: z.record(z.unknown()).optional(),
  health: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']).default('unknown'),
    lastCheck: z.date().optional(),
    message: z.string().optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  evidence: z.array(z.string().uuid()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type DeploymentInstance = z.infer<typeof DeploymentInstanceSchema>;

// ============================================================
// State Machine Transition Rules
// ============================================================

export const ALLOWED_TRANSITIONS: Record<DeploymentStatus, DeploymentStatus[]> = {
  [DeploymentStatus.DRAFT]: [DeploymentStatus.SOURCE_RESOLUTION, DeploymentStatus.VALIDATION_FAILED],
  [DeploymentStatus.SOURCE_RESOLUTION]: [DeploymentStatus.ARTIFACT_VERIFICATION, DeploymentStatus.VALIDATION_FAILED],
  [DeploymentStatus.ARTIFACT_VERIFICATION]: [DeploymentStatus.SECURITY_SCAN, DeploymentStatus.VALIDATION_FAILED],
  [DeploymentStatus.SECURITY_SCAN]: [DeploymentStatus.POLICY_EVALUATION, DeploymentStatus.POLICY_DENIED],
  [DeploymentStatus.POLICY_EVALUATION]: [DeploymentStatus.PENDING_APPROVAL, DeploymentStatus.POLICY_DENIED],
  [DeploymentStatus.PENDING_APPROVAL]: [
    DeploymentStatus.QUEUED,
    DeploymentStatus.VALIDATION_FAILED,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.QUEUED]: [DeploymentStatus.BUILDING, DeploymentStatus.STOPPED],
  [DeploymentStatus.BUILDING]: [DeploymentStatus.DEPLOYING, DeploymentStatus.BUILD_FAILED],
  [DeploymentStatus.DEPLOYING]: [DeploymentStatus.STARTING, DeploymentStatus.DEPLOY_FAILED],
  [DeploymentStatus.STARTING]: [DeploymentStatus.HEALTH_CHECKING, DeploymentStatus.DEPLOY_FAILED],
  [DeploymentStatus.HEALTH_CHECKING]: [DeploymentStatus.RUNNING, DeploymentStatus.HEALTH_FAILED],
  [DeploymentStatus.RUNNING]: [
    DeploymentStatus.RUNNING, // self-loop for events
    DeploymentStatus.DEGRADED,
    DeploymentStatus.ROLLBACK_REQUIRED,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.DEGRADED]: [
    DeploymentStatus.RUNNING,
    DeploymentStatus.HEALTH_FAILED,
    DeploymentStatus.ROLLBACK_REQUIRED,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.ROLLBACK_REQUIRED]: [
    DeploymentStatus.ROLLED_BACK,
    DeploymentStatus.RUNNING,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.ROLLED_BACK]: [DeploymentStatus.STOPPED],
  [DeploymentStatus.STOPPED]: [],
  [DeploymentStatus.VALIDATION_FAILED]: [
    DeploymentStatus.DRAFT,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.POLICY_DENIED]: [
    DeploymentStatus.DRAFT,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.BUILD_FAILED]: [
    DeploymentStatus.QUEUED,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.DEPLOY_FAILED]: [
    DeploymentStatus.QUEUED,
    DeploymentStatus.ROLLBACK_REQUIRED,
    DeploymentStatus.STOPPED,
  ],
  [DeploymentStatus.HEALTH_FAILED]: [
    DeploymentStatus.ROLLBACK_REQUIRED,
    DeploymentStatus.STOPPED,
  ],
};

// ============================================================
// Deployment State Machine Implementation
// ============================================================

export interface DeploymentStateMachine {
  deploymentId: string;
  currentStatus: DeploymentStatus;
  history: DeploymentEvent[];
  version: DeploymentVersion;
  
  // Transition methods
  canTransition(to: DeploymentStatus): boolean;
  transition(to: DeploymentStatus, event: Omit<DeploymentEvent, 'from' | 'to'>): boolean;
  recordEvent(event: DeploymentEvent): void;
  
  // Health state
  setHealth(status: 'healthy' | 'degraded' | 'unhealthy', message?: string): void;
  
  // Rollback
  isRollbackRequired(): boolean;
  shouldAutoRollback(): boolean;
}

/**
 * Check if a deployment status transition is valid
 */
export function isValidTransition(from: DeploymentStatus, to: DeploymentStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed || allowed.length === 0) {
    return false;
  }
  return allowed.includes(to);
}

/**
 * Determine if a status is a failure state
 */
export function isFailureStatus(status: DeploymentStatus): boolean {
  return [
    DeploymentStatus.VALIDATION_FAILED,
    DeploymentStatus.POLICY_DENIED,
    DeploymentStatus.BUILD_FAILED,
    DeploymentStatus.DEPLOY_FAILED,
    DeploymentStatus.HEALTH_FAILED,
  ].includes(status);
}

/**
 * Determine if a status is a terminal state (no further transitions)
 */
export function isTerminalStatus(status: DeploymentStatus): boolean {
  return [
    DeploymentStatus.STOPPED,
    DeploymentStatus.ROLLED_BACK,
  ].includes(status);
}

/**
 * Determine if a status represents successful operation
 */
export function isRunningStatus(status: DeploymentStatus): boolean {
  return [
    DeploymentStatus.RUNNING,
  ].includes(status);
}

/**
 * Determine if a status represents operational but degraded state
 */
export function isDegradedStatus(status: DeploymentStatus): boolean {
  return [
    DeploymentStatus.DEGRADED,
    DeploymentStatus.HEALTH_CHECKING,
    DeploymentStatus.STARTING,
  ].includes(status);
}