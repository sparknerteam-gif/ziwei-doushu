Purpose

This file gives Copilot-style assistants repository-specific facts: install/build/test/lint commands, the high-level architecture, and repository conventions that are not obvious from a single file. Keep it short and factual.

Install

- Install dependencies (root):
  - pnpm install
  - Note: packageManager is pnpm@9.0.0 (root package.json)

Common commands

- Monorepo (root):
  - Dev (runs turborepo dev across workspaces): pnpm dev
  - Build (turborepo build): pnpm build
  - Lint (turborepo lint): pnpm lint
  - Clean (turborepo clean): pnpm clean

- App-specific (apps/web):
  - Dev (web only): pnpm --filter ./apps/web dev  (or from apps/web: pnpm dev)
  - Build (web only): pnpm --filter ./apps/web build
  - Start production server (web only): pnpm --filter ./apps/web start  or cd apps/web && pnpm start
  - Lint (web only): pnpm --filter ./apps/web lint

Tests

- No test script or test runner is configured in the repo at time of writing.
- When tests are added to a package, run a single test via the package script. Example (placeholder):
  - pnpm --filter ./apps/web test -- -t "My test name"
  - Or use the runner directly: pnpm --filter ./apps/web vitest -t "My test name"

High-level architecture (big picture)

- Monorepo: pnpm workspace + turborepo. workspace packages: packages/* and apps/*.
- Pipeline: turbo.json defines build, dev, lint, clean. Build outputs include .next/** and dist/**.
- packages/zwds-core: the calculation engine (pure TypeScript). Exposes public API used by the frontend.
  - Responsible for calendar conversions, four-pillars, palace & star placement, transformations, true-solar-time corrections.
- apps/web: Next.js frontend (Next 16, app router). Key points:
  - TypeScript + React 19 + Tailwind CSS + shadcn/ui component primitives.
  - UI components live under apps/web/src/components (ui, chart, forms).
  - App uses src/app (App Router) with layout.tsx and page.tsx as entry.
  - next.config.ts transpiles @zwds/core to the app bundle (transpilePackages).
- Dataflow: user -> BirthData input form -> frontend calls into @zwds/core to compute chart -> UI renders chart and transformations.
- Time handling: uses luxon (IANA timezones) and true-solar-time correction logic in zwds-core. Recent DST fixes moved inputs from timezoneOffset to IANA timezone values.

Key conventions and repo-specific rules

- Timezones & DST: prefer IANA timezone identifiers (e.g., "America/New_York") over fixed UTC offsets. Refer to zwds-core true-solar-time and calendar code for how to compute corrected hour/shichen.
- BirthData shape: historically had timezoneOffset; newer code prefers an ianaTimeZone property and longitude for true-solar-time. Modify both the core and UI together when changing this model.
- shadcn/ui: many components under apps/web/src/components/ui are generated. Regenerate via the project's recommended generator (do not hand-edit generated files unless necessary).
- Next.js agent block: apps/web/AGENTS.md contains an authoritative agent instruction block for Next.js — obey it. The block is re-written by next dev; committing the block with code changes keeps diffs clean.
- Transpiled packages: next.config.ts lists transpilePackages (e.g., ["@zwds/core"]). Respect that when changing build or import behavior.
- Turbo outputs: turbo.json lists .next/** and dist/** as build outputs. Avoid committing build artifacts.
- Workspace package name for web: package name is "web" (apps/web/package.json). Use pnpm filter selectors with either the package path (./apps/web) or package name when running per-package commands.

AI assistant / agent files discovered

- apps/web/AGENTS.md (important): contains Next.js agent rules and must be obeyed for edits in the web app.
- apps/web/CLAUDE.md references AGENTS.md (tells other assistants to import the same rules).

---

Included agent rule (copy from apps/web/AGENTS.md)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a dif f only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

If you (the human) want this file improved, or want Copilot sessions to also include a brief mapping of important source files to responsibilities (e.g., list the most important files in zwds-core and apps/web), say so and an updated version will be created.
