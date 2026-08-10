# MCPServer OS Architecture

MCPServer OS is a self-hosted control plane for MCP infrastructure.

```text
Clients / Agents / Pocket
          |
       HTTPS
          v
   Control Plane API
          |
   Policy / Approval / Audit
          |
     MCP Gateway
       /   |   \
      v    v    v
   Local  Remote  Managed
   MCP    MCP     Runners
   server servers containers
```

## Foundation services

- **Control Plane:** API surface for identity, server inventory, policies, approvals, and audit events.
- **Gateway:** Single MCP ingress point. PR #1 contains the transport endpoint placeholder; protocol routing arrives in PR #3.
- **Contracts:** Shared TypeScript types used by services and future apps.
- **PostgreSQL:** System-of-record for organizations, users, servers, tools, policies, approvals, and audit events.
- **Redis:** Reserved for caching, queues, sessions, and asynchronous work.

## Security model

The intended request path is:

`identity -> firewall/policy -> risk evaluation -> approval when required -> MCP server -> audit`

The foundation intentionally keeps authentication and policy execution minimal. These become dedicated increments rather than being hidden inside the gateway.
