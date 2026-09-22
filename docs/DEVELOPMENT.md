# Development

Work from `app-mcpserver-in/` (pnpm workspace).

```bash
corepack enable
cd app-mcpserver-in
pnpm install --frozen-lockfile
pnpm compile
pnpm test
```

Python MCP tools:

```bash
python3 -m py_compile app-mcpserver-in/services/mcp-server/main.py \
  app-mcpserver-in/services/mcp-server/tools/payments.py
```

Do not run `npm install` at the workspace root of `app-mcpserver-in`; the lockfile is pnpm.
