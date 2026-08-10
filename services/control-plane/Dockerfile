FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json .prettierrc ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY services/control-plane/package.json services/control-plane/package.json
RUN pnpm install --no-frozen-lockfile

COPY packages/contracts packages/contracts
COPY services/control-plane services/control-plane
RUN pnpm --filter @mcpserver-os/contracts build && pnpm --filter @mcpserver-os/control-plane build

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "services/control-plane/dist/index.js"]
