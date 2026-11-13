# AGENTS.md · Klay Consultants

Repository guide and operational conventions for AI agents working in this codebase.

## Repository Overview
Klay Consultants is a Dubai-based corporate structuring and business setup advisory platform built with React, Vite, Tailwind CSS, TypeScript, and Express.

- **Frontend:** React 19, TypeScript, Tailwind CSS, Space UI primitives, `@componentry/magnetic-dock`, Framer Motion.
- **SSG Prerendering:** Custom static rendering pipeline (`scripts/prerender.mjs` and `scripts/seo.cjs`) prerendering 126 public routes with exact `<h1>` and structured JSON-LD validation.
- **Server:** Node.js Express server (`server.js`) serving static files and handling lead capture at `POST /api/leads`.

## Environment & Scripts
Always ensure Node v24 is in PATH:
```bash
export PATH="/Users/hayaat/.local/share/node-v24.22.1-darwin-arm64/bin:$PATH"
```

- `npm run dev`: Start local dynamic Vite development server.
- `npm run typecheck`: Run TypeScript typecheck without emitting (`tsc --noEmit`).
- `npm run build`: Full production build with SSG prerendering and SEO validation.
- `npm run build:staging`: Build in staging environment mode.
- `npm run preview:staging`: Serve built staging assets locally on port 3001.
- `./scripts/time-machine.sh list`: View Time Machine milestone checkpoints.

## Strict Boundaries
- **LOCAL WORK ONLY:** Never run `git push origin` or push commits/tags to the remote GitHub repository unless explicitly instructed by the user.

---

## Agent skills

### Issue tracker

Issues and task specs live as local markdown files in `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository layout (`GLOSSARY.md` and `docs/adr/`). See `docs/agents/domain.md`.

<!-- GSD Configuration — managed by gsd-core installer -->
# Instructions for GSD

- Use the gsd-core skill when the user asks for GSD or uses a `gsd-*` command.
- Treat `/gsd-...` or `gsd-...` as command invocations and load the matching file from `.github/skills/gsd-*`.
- When a command says to spawn a subagent, prefer a matching custom agent from `.github/agents`.
- Do not apply GSD workflows unless the user explicitly asks for them.
- After completing any `gsd-*` command (or any deliverable it triggers: feature, bug fix, tests, docs, etc.), ALWAYS: (1) offer the user the next step by prompting via `ask_user`; repeat this feedback loop until the user explicitly indicates they are done.
<!-- /GSD Configuration -->
