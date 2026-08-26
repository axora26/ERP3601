# Deployment

## Environments

`development`, `test`, `staging`, `production` — this repository currently
only defines `development` concretely (`.env.example`, local Postgres or
`docker compose up`). `staging`/`production` topology is not decided yet;
this section is intentionally short rather than inventing infrastructure
that has not been built or tested.

## Local / development

```bash
pnpm install
pnpm db:migrate:dev
pnpm db:seed
pnpm dev
```

## Docker (written, not smoke-tested in this session)

```bash
docker compose up --build
```

`docker-compose.yml` builds `apps/api/Dockerfile` and `apps/web/Dockerfile`
against a `postgres:16-alpine` service. This was authored against the same
architecture as the local-Postgres path that *was* verified, but the
Docker path itself was not run in the sandbox this repository was
initialized in (no Docker daemon available) — see `docs/DECISIONS.md`
ADR-0001. Treat it as `NOT TESTED` until someone runs it and records the
result.

## Secrets

Never commit real secrets. `.env.example` contains placeholder/dev-only
values (a dev Postgres password meant only for a local, throwaway
database). `.env` is gitignored. No CI workflow in this repository reads a
production secret.

## What is not built yet

Staging/production hosting, CDN, backups, rollback tooling, release
provenance, Windows packaging, PWA install flow — none of this exists in
Wave 1. Building it before Wave 2+ business domains exist would be
premature; revisit once there is a product worth deploying continuously.
