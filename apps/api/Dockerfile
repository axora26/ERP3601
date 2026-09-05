FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm db:generate
RUN pnpm build:packages
RUN pnpm --filter @axora/api build

FROM node:22-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
