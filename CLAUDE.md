# Stirling-Image

Open-source, self-hostable image manipulation suite. Docker-first deployment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Zustand, react-router-dom v7 |
| Backend | Fastify 5, tsx (no compile step in dev), Sharp |
| Database | SQLite via Drizzle ORM (better-sqlite3) |
| AI/ML | Python sidecar (rembg, RealESRGAN, PaddleOCR, MediaPipe, LaMa) |
| Docs | VitePress |
| Testing | Vitest (unit/integration), Playwright (e2e) |
| CI/CD | GitHub Actions, semantic-release, Docker multi-arch |
| Linting | Biome (format + lint in one pass) |

## Monorepo Structure

```
apps/
  api/          # Fastify backend (port 13490)
  web/          # Vite + React frontend (port 1349, proxies /api to 13490)
  docs/         # VitePress documentation
packages/
  shared/       # Constants, types, i18n strings
  image-engine/ # Sharp-based image operations
  ai/           # Python sidecar bridge for ML models
tests/
  unit/         # Vitest unit tests
  integration/  # Vitest integration tests (full API)
  e2e/          # Playwright e2e specs (13 files)
  fixtures/     # Small test images
```

## Key Conventions

- **Simplicity over complexity** — do not over-engineer
- **Double quotes**, **semicolons**, **2-space indent** (enforced by Biome)
- **ES modules** in all workspaces (`"type": "module"`)
- Conventional commits for semantic-release (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
- API tool routes in `apps/api/src/routes/tools/`
- Tool UI components in `apps/web/src/components/tools/`
- i18n strings in `packages/shared/src/i18n/en.ts`
- Zod for all API input validation

## Commands

```bash
pnpm dev              # Start all dev servers (web + api)
pnpm build            # Build all workspaces
pnpm typecheck        # TypeScript check across monorepo
pnpm lint             # Biome lint + format check
pnpm lint:fix         # Biome auto-fix lint + format issues
pnpm test             # Vitest unit + integration tests
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e         # Playwright e2e tests
pnpm test:coverage    # Tests with coverage report
```

## Database

SQLite via Drizzle ORM. Migrations in `apps/api/drizzle/`.

```bash
cd apps/api && npx drizzle-kit generate   # Generate migration from schema changes
cd apps/api && npx drizzle-kit migrate    # Apply pending migrations
```

Schema: `apps/api/src/db/schema.ts` — tables: users, sessions, settings, jobs, apiKeys, pipelines.

## Do Not Modify Config Files

Biome, TypeScript, and editor config files are protected by hooks. Fix the code to satisfy the linter/compiler, not the other way around. This prevents a common AI failure mode where rules get weakened instead of code getting fixed.

## Model Routing for Subagents

When spawning subagents via the Agent tool, use the cheapest model that can handle the task:

- **Haiku**: File search, simple lookups, grep operations, quick checks
- **Sonnet**: Standard development, test writing, refactoring, code review
- **Opus**: Complex architecture decisions, multi-file debugging, planning

This saves significant cost without losing quality on the main session.

## Strategic Compaction

When context gets large, compact at logical phase boundaries:

- **Good times to compact**: After research and before planning. After debugging and before implementing the fix. After completing a major feature.
- **Bad times to compact**: Mid-implementation. While actively debugging. During a multi-step refactor.
- **Survives compaction**: This CLAUDE.md, active tasks, git state, memory files
- **Lost on compaction**: Intermediate reasoning, file contents previously read, conversation flow

## Security

- Never commit `.env`, credentials, or API keys
- Validate user input at API boundaries with Zod schemas
- Use parameterized queries (Drizzle ORM handles this)
- SVG sanitization is already in place for uploads
- Rate limiting is configured on the API
