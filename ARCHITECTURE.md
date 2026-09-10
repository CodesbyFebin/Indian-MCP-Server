# MCPServer OS — Architecture (Normalized Structure)

**Doctrine:** Evidence-First AI Infrastructure Control Plane
**Target:** app.mcpserver.in
**Architecture:** Next.js App Router + TypeScript + PostgreSQL + Workers + MCP Gateway + Docker

---

## 1. Canonical Repository Structure

The repository follows a **TurboRepo** monorepo pattern with clear separation of concerns:

```text
Indian-MCP-Server/
├── apps/
│   ├── web/                    # Public discovery/evidence system (mcpserver.in)
│   │   ├── app/                # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── content/        # Static content
│   │   │   └── seo/            # SEO utilities
│   │   ├── package.json
│   │   └── next.config.ts
│   └── app/                    # Control plane console (app.mcpserver.in)
│       ├── app/                # Next.js 14 App Router
│       ├── package.json
│       └── tsconfig.json
│
├── services/
│   ├── control-plane/          # Organizations, workspaces, approvals, deployments
│   ├── gateway/                # MCP transport, JSON-RPC, auth, policy, tool access
│   ├── worker/                 # Background jobs, healing, evidence collection
│   ├── registry/               # mcpserver.in trust bridge
│   └── api/                    # REST/GraphQL API
│
├── packages/
│   ├── contracts/              # Shared types, Zod schemas
│   ├── database/               # Prisma client, migrations
│   ├── evidence/               # Hash chain, ledger logic
│   ├── policy/                 # Policy engine, rule evaluation
│   ├── security/               # Secrets, isolation, SSRF
│   ├── registry-client/        # Client for mcpserver.in
│   ├── design-tokens/          # Shared design tokens
│   └── ui/                     # Shared React components
│
├── deploy/
│   ├── docker/                 # Docker Compose files
│   │   └── docker-compose.yml
│   └── caddy/                  # Caddyfile, TLS config
│
├── scripts/
│   ├── audit.sh                # Forensic audit script
│   └── deploy.sh               # Deployment helper
│
├── reports/                    # Generated forensic reports
│   ├── 00-BASELINE.md
│   └── 00-GAP-MATRIX.csv
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│
├── PROJECT-TRACKER.md
├── ARCHITECTURE.md
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json                # Root package.json (TurboRepo)
```

---

## 2. Seven Architecture Planes

### 2.1 Trust Plane
**Purpose:** Establish provenance and publisher evidence via mcpserver.in

**Components:**
- `packages/registry-client/` - Client library for fetching server manifests
- `services/registry/` - Server-side registry synchronization
- **External Integration:** mcpserver.in API

**Data Flow:**
```text
mcpserver.in
    ↓ (signed manifest)
MCPServer Control Plane
    ↓ (provenance validation)
Human Approval
    ↓
Deployment Intent Created
```

**Security Considerations:**
- Never trust repository URLs from browser input
- Verify publisher signatures before deployment
- Maintain evidence of provenance validation
- Log all trust decisions

### 2.2 Control Plane
**Purpose:** Manage organizations, workspaces, approvals, and deployments

**Components:**
- `services/control-plane/` - Main control plane service
- `packages/database/` - Database schema and migrations
- `packages/contracts/` - Shared API contracts

**Data Flow:**
```text
Authenticated Request
    ↓
RBAC Policy Evaluation (packages/policy)
    ↓
Tenant Isolation (PostgreSQL RLS)
    ↓
Deployment State Machine
    ↓
Evidence Record Creation
```

**Security Considerations:**
- All resources must be scoped server-side by tenant
- Cross-tenant data access must be impossible via SQL injection or IDOR
- Deployment approvals must require explicit authorization
- All control plane actions must produce audit events

### 2.3 Runtime Plane
**Purpose:** Execute and manage container/workload lifecycle

**Components:**
- `services/worker/` - Background job processors
- `deploy/docker/docker-compose.yml` - Docker orchestration

**State Machine:**
```text
DRAFT → SOURCE_RESOLUTION → ARTIFACT_VERIFICATION → SECURITY_SCAN →
POLICY_EVALUATION → PENDING_APPROVAL → QUEUED → BUILDING →
DEPLOYING → STARTING → HEALTH_CHECKING → RUNNING

Failure branches:
VALIDATION_FAILED, POLICY_DENIED, BUILD_FAILED, DEPLOY_FAILED,
HEALTH_FAILED, DEGRADED, ROLLBACK_REQUIRED, ROLLED_BACK, STOPPED
```

**Security Considerations:**
- Immutable deployment revisions
- Network isolation between workloads
- Resource limits enforced
- Health checks validate successful startup
- Automatic rollback on health check failure

### 2.4 Gateway Plane
**Purpose:** Manage MCP transport, auth, policy, and tool access

**Components:**
- `services/gateway/` - MCP gateway service

**Architecture:**
```text
MCP CLIENT
    │
    ▼
┌──────────────────────┐
│ Authentication       │ (JWT tokens, API tokens)
├──────────────────────┤
│ Tenant Resolution    │ (extract tenant from token/context)
├──────────────────────┤
│ Rate Limiting        │ (per-client, per-tenant limits)
├──────────────────────┤
│ JSON-RPC Validation  │ (validate MCP protocol compliance)
├──────────────────────┤
│ Tool Policy          │ (allow/deny/monitor per tool)
├──────────────────────┤
│ Prompt Protection    │ (guard against prompt injection)
├──────────────────────┤
│ Secret Broker        │ (provide secrets to authorized tools)
├──────────────────────┤
│ Audit / Trace        │ (OpenTelemetry tracing)
├──────────────────────┤
│ Transport Adapter    │ (HTTP, SSE, stdio, WebSocket)
└──────────┬───────────┘
           ▼
       MCP SERVER
```

**Security Considerations:**
- Never pass raw secrets to client applications
- Validate JSON-RPC schema for all requests
- Enforce tool-level access controls
- Protect against prompt injection
- Log all tool invocations for audit
- Preserve MCP semantics across transports

### 2.5 Security Plane
**Purpose:** Provide isolation, secrets management, and threat detection

**Components:**
- `packages/security/` - Shared security utilities
- `services/api/lib/middleware/pii-redact.ts` - PII redaction
- `app-mcpserver-in/services/security/policy.py` - Security policy engine

**Key Capabilities:**
- **SSRF Defense:** Validate all outbound URLs, block private IPs
- **Secret Management:** Integration with HashiCorp Vault / AWS Secrets Manager
- **Input Validation:** Sanitize all user inputs
- **Threat Detection:** Monitor for anomalous patterns
- **Kill Switch:** Emergency isolation capability

**Security Considerations:**
- Secrets must be encrypted at rest and in transit
- Access to secrets must require proper authorization
- Secret access must be audited
- SSRF protection must block all internal network access
- Kill switch must be accessible even when system is degraded

### 2.6 Evidence Plane
**Purpose:** Collect, store, and verify operational evidence

**Components:**
- `packages/evidence/` - Evidence ledger logic, hash chain
- `services/worker/` - Evidence collection jobs

**EvidenceArtifact Schema:**
```typescript
interface EvidenceArtifact {
  id: string;                              // UUID
  organizationId: string;                   // Tenant scope
  resourceType: string;                     // "deployment", "server", etc.
  resourceId: string;                       // Target resource
  evidenceType:
    | "CONFIG"                             // Configuration evidence
    | "SOURCE"                             // Source code evidence
    | "SCAN"                               // Vulnerability scan results
    | "RUNTIME"                            // Runtime telemetry
    | "LOG"                                // Operational logs
    | "APPROVAL"                           // Approval decisions
    | "ATTESTATION"                        // External attestation
    | "MANUAL";                            // Manually created evidence
  status:
    | "COLLECTED"                          // Newly created
    | "VERIFIED"                           // Verified by automated check
    | "PARTIAL"                            // Partially verified
    | "STALE"                              // Needs re-verification
    | "REJECTED"                           // Failed verification
    | "PENDING_REVIEW";                    // Awaiting manual review
  sha256: string;                          // Hash of evidence content
  previousArtifactHash: string | null;     // Link to previous artifact
  chainRootHash: string;                   // Root hash of evidence chain
  sourceRevision?: string;                // Git commit SHA
  verifierVersion?: string;                // Tool version that verified
  collectedAt: Date;                       // When evidence was collected
  verifiedAt?: Date;                       // When evidence was verified
  expiresAt?: Date;                        // When evidence expires
  metadata: Record<string, unknown>;       // Flexible metadata
}
```

**Hash Chain Implementation:**
```typescript
// Each evidence artifact links to the previous one
const artifact: EvidenceArtifact = {
  id: uuidv4(),
  sha256: hashContent(evidenceData),
  previousArtifactHash: getPreviousHash(),
  chainRootHash: getChainRoot(),
  ...
};
```

**Security Considerations:**
- Hash chains provide tamper-evidence, not immutability
- Evidence must be tenant-scoped
- Verification must be independent of collection
- External anchoring (e.g., blockchain, timestamping) may be added later
- Evidence must not contain sensitive data (PII must be redacted)

### 2.7 Intelligence Plane
**Purpose:** Provide recommendations, predictive health, and bounded healing

**Components:**
- `services/mcp-server/tools/banking.py` - Banking tool
- `services/mcp-server/tools/corporate.py` - Corporate tool
- `services/mcp-server/tools/gst.py` - GST tool
- `services/mcp-server/tools/payments.py` - Payments tool

**Capabilities:**
- **AI Self-Healing:** Detect failures, diagnose root cause, execute approved remediations
- **MCP Doctor:** Diagnostic tool for MCP server health and connectivity
- **Predictive Health:** Anomaly detection and forecasting
- **Least-Privilege Recommendations:** Suggest permission reductions
- **Prompt Injection Analysis:** Detect and alert on potential prompt injection

**Security Considerations:**
- AI can recommend but not execute source code changes without approval
- Healing actions must be pre-approved and bounded
- All AI recommendations must produce evidence records
- Human review required for high-impact changes

---

## 3. Data Flow Architecture

### 3.1 Normal Deployment Flow
```text
Developer/Consumer
    ↓ (browses mcpserver.in)
mcpserver.in Discovery
    ↓ (selects server, clicks deploy)
Signed Deployment Intent
    ↓ (HTTP POST to app.mcpserver.in)
Identity Resolution (Auth Mesh)
    ↓
Tenant Extraction
    ↓
Resource Policy Check
    ↓
Provenance Validation
    ↓
Artifact Pull
    ↓
Security Scan
    ↓
Policy Evaluation
    ↓
Pending Approval
    ↓ (human approval)
Queued → Building → Deploying → Starting
    ↓
Health Checks
    ↓
RUNNING
    ↓
Evidence Generated & Stored
    ↓
Observability Dashboard
```

### 3.2 Evidence Flow
```text
Event Occurs
    ↓
Evidence Collected
    ↓
Artifact Created (with SHA-256)
    ↓
Hash Chain Updated (link to previous)
    ↓
Evidence Stored (tenant-scoped)
    ↓
Status: COLLECTED
    ↓
Automated Verification Runs
    ↓
Status: VERIFIED or PARTIAL or REJECTED
    ↓
Manual Review (if needed)
    ↓
Status: PENDING_REVIEW → VERIFIED/REJECTED
    ↓
Evidence Package Generation (for audits)
```

---

## 4. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context / Zustand
- **Testing**: Vitest

### Backend Services
- **Control Plane**: Node.js / Next.js API Routes
- **Gateway**: Node.js / Next.js API Routes
- **Worker**: Node.js / BullMQ
- **MCP Server**: Python 3.12 / FastAPI
- **Auth Mesh**: TypeScript service

### Infrastructure
- **Database**: PostgreSQL 15 (with RLS)
- **Cache/Queue**: Redis 7
- **Reverse Proxy**: Caddy 2
- **Container Runtime**: Docker
- **Orchestration**: Docker Compose (initial), Kubernetes (future)

### Observability
- **Tracing**: OpenTelemetry
- **Metrics**: Prometheus + Grafana
- **Logging**: Structured JSON logs

---

## 5. Security Architecture

### 5.1 Zero Trust Model
- Never trust network location alone
- Always authenticate and authorize
- Enforce least privilege at every layer
- Encrypt all sensitive data in transit and at rest

### 5.2 Tenant Isolation
- PostgreSQL Row Level Security (RLS) for data isolation
- Kubernetes namespaces (future) for runtime isolation
- Separate database schemas or instances per tenant (configurable)
- API-level tenant scoping on all resources

### 5.3 Secret Management
```typescript
interface SecretProvider {
  create(context: SecretContext): Promise<SecretReference>;
  read(context: SecretContext, ref: SecretReference): Promise<string>;
  rotate(context: SecretContext, ref: SecretReference): Promise<void>;
  revoke(context: SecretContext, ref: SecretReference): Promise<void>;
}

class LocalEncryptedProvider implements SecretProvider {
  // For development only
}

class VaultProvider implements SecretProvider {
  // For production
}

class AWSSecretsProvider implements SecretProvider {
  // For cloud production
}
```

### 5.4 MCP Security
- Transport encryption (mTLS, TLS 1.3)
- JSON-RPC schema validation
- Tool-level access controls
- Prompt injection protection
- Rate limiting per client/tenant

---

## 6. Compliance Mapping (India Evidence Pack)

This architecture supports evidence collection for India-specific frameworks while explicitly avoiding unsupported compliance claims.

| Framework | Implementation | Evidence Available |
|-----------|----------------|-------------------|
| **DPDP Act** | PII Redaction Middleware | PII redaction evidence, consent logs, retention records |
| **RBI Cyber Framework** | Technical Control Profile | Access control evidence, audit logs, incident records |
| **Data Residency** | Tenant Residency Policy Engine | Deployment location evidence, data routing logs |
| **IndiaAI** | Request/Entitlement Tracker | Compute usage evidence, entitlement records |
| **UIDAI (Auth)** | Authorization Tracker | Authorization status evidence, audit trails |

---

## 7. Future Evolution

### Planned Additions
- Edge compute execution (Phase 12+)
- Multi-cloud runtime providers (Phase 13+)
- Blockchain evidence anchoring (Phase 7+)
- Advanced AI analytics (Phase 13+)

### Out of Scope (Deferred)
- Blockchain network (not needed for core functionality)
- Automatic source-code patching (high risk, low value initially)
- Global multi-edge runtime (premature optimization)
- Cross-enterprise data vaults (complexity without clear MVP value)