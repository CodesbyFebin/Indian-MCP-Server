FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json .prettierrc ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY services/gateway/package.json services/gateway/package.json
RUN pnpm install --no-frozen-lockfile

COPY packages/contracts packages/contracts
COPY services/gateway services/gateway
RUN pnpm --filter @mcpserver-os/contracts build && pnpm --filter @mcpserver-os/gateway build

ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

CMD ["node", "services/gateway/dist/index.js"]
