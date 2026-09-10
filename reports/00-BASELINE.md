=== MCPServer OS Forensic Audit ===
Timestamp: 2026-09-10T07:07:04Z

1. Repository Identity
----------------------
Repository URL: https://github.com/CodesbyFebin/Indian-MCP-Server.git
Current Branch: kilo/orbital-eagle-zbx
HEAD SHA: 9325991901bf5e9f5f63acbe87021cd75910b54a
Dirty State: Dirty

2. Stack Information
--------------------
Node.js Version: v22.23.2
npm Version: 10.9.8
pnpm Version: 12.3.4
yarn Version: Not installed
Python Version: Python 3.10.12
PostgreSQL Version: Not installed or not in PATH
Redis Version: Not installed or not in PATH
Docker Version: Not installed
Docker Compose Version: Not installed

3. File Structure Overview (Top-level Directories)
--------------------------------------------------
- .
- app-mcpserver-in
- reports
- scripts

4. Key Files Check
------------------
✗ package.json (MISSING)
✗ pnpm-lock.yaml (MISSING)
✗ requirements.txt (MISSING)
✗ tsconfig.json (MISSING)
✗ next.config.mjs (MISSING)
✗ vercel.json (MISSING)
✗ vitest.config.mjs (MISSING)
✗ tailwind.config.ts (MISSING)
✗ postcss.config.cjs (MISSING)
✗ .env.example (MISSING)
✗ .gitignore (MISSING)
✓ README.md
✓ ARCHITECTURE.md
✓ PROJECT-TRACKER.md
✓ pii-redact-middleware.ts
✓ upi-sandbox-integration.py
✓ app-mcpserver-in/package.json
✓ app-mcpserver-in/services/api/lib/middleware/pii-redact.ts
✓ app-mcpserver-in/services/mcp-server/main.py
✓ app-mcpserver-in/deploy/docker/docker-compose.yml
✓ app-mcpserver-in/services/mcp-server/package.json
✓ app-mcpserver-in/services/gateway/package.json
✓ app-mcpserver-in/services/workflow-engine/package.json
✓ app-mcpserver-in/services/registry-sync/package.json
✓ app-mcpserver-in/packages/contracts/package.json
✗ app-mcpserver-in/packages/database/package.json (MISSING)
✓ app-mcpserver-in/packages/evidence/package.json
✗ app-mcpserver-in/packages/policy/package.json (MISSING)
✗ app-mcpserver-in/packages/security/package.json (MISSING)
✗ app-mcpserver-in/packages/ui/package.json (MISSING)

5. Key Directory Structures
---------------------------
✓ app-mcpserver-in/apps (2 subdirectories)
✓ app-mcpserver-in/services (9 subdirectories)
✓ app-mcpserver-in/packages (7 subdirectories)
✓ app-mcpserver-in/deploy (2 subdirectories)
✓ app-mcpserver-in/scripts (0 subdirectories)
✓ app-mcpserver-in/tests (1 subdirectories)

6. Next.js Specific Checks
--------------------------

7. Basic Repository Metrics
---------------------------
Total Commits: 2
Contributors: 2
Branches: 4
Tags: 0
TypeScript Files: 56
TSX Files: 47
JavaScript Files: 7
JSX Files: 0
Python Files: 18
Markdown Files: 17

=== Audit Complete ===
Save this output to reports/00-BASELINE.md for further analysis

