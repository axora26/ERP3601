FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @axora/design-system build
RUN pnpm --filter @axora/web build

FROM node:22-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
EXPOSE 3000
CMD ["pnpm", "--filter", "@axora/web", "start"]
