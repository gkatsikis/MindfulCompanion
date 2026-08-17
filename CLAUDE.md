# MindfulCompanion — CLAUDE.md

## Personal vs. company separation (IMPORTANT)

MindfulCompanion is a **personal project**. This machine also carries company work —
the two must never mix.

**Personal (MindfulCompanion):**
- Google account: `geo.bjj.kat@gmail.com`
- GCP project: `<GCP_PROJECT_ID>` (name "MindfulCompanion")
- Billing: personal billing account only — never a company one

**Company (hands off):**
- Anything named `ocean`, `ocean-labs-beta`, or similar is COMPANY property.
- Never deploy this project into, bill against, grant IAM on, or read data from
  company projects.
- Do not modify shared machine-level credentials that company tooling may rely
  on (e.g. Application Default Credentials / ADC quota project) for this
  project's sake.

**Named gcloud configs (the `default` config was deleted — switching is
always explicit):**
- `<PERSONAL_CONFIG_NAME>` → `geo.bjj.kat@gmail.com` / `<GCP_PROJECT_ID>`
- `ocean` → `georgios@tryocean.io` / `ocean-labs-beta` (company)
- Switch: `gcloud config configurations activate <PERSONAL_CONFIG_NAME>|ocean`

**Before any `gcloud`/cloud command:** verify the active config is
`<PERSONAL_CONFIG_NAME>` (`gcloud config configurations list`). If `ocean` is
active, stop and switch — never run personal-project operations against a
company project.

## Product invariants

<!-- Per-project: list the rules about DATA and USERS that code must never
     violate — privacy stances, anonymity guarantees, what is never stored or
     shown, who may see what. If a change would touch one, stop and ask. -->

- <INVARIANT_1>
- <INVARIANT_2>

## Working agreements

- **I run git and deploys.** Never `git add/commit/push`, never deploy. Stop at
  the working tree and tell me what's ready.
- **No AI attribution.** Never add Claude/AI co-author trailers, "Generated
  with" lines, or similar to commits, PRs, or code.
- **Backend commands run in the container** (`docker compose exec <service> …`),
  not against a locally installed toolchain.

## Confidence gate — before writing any code

- **Features/refactors:** only start coding when you are >90% confident you
  understand what is being asked for. Below that, ask questions or request code
  samples/examples until you cross the gate.
- **Bugs:** only start a fix when you are >90% confident you know *why* the bug
  happens and *how* to fix it. Below that, keep investigating (logs, repro,
  reading code) or ask questions until you reach that confidence.
- Stating your confidence and what would raise it is a good way to ask.

## Definition of done

A change is "done" only when all of these hold:

- Tests pass (all affected suites), and the build compiles.
- Lint introduces no new errors.
- Test coverage stays at **80% or above** — new features ship with their tests.
- Docs and `ToDo.md` reflect the change (see below).
- **The summary is honest:** failing tests, skipped steps, and known ceilings
  are reported plainly — and logged in `ToDo.md` (under Bugs/Fixes or MVP
  Features) — never glossed over.

## Engineering principles

- **Client-side validation is advice; the server enforces.** Where the project
  has a frontend/backend split, every gate the UI presents (required fields,
  role checks, state-based restrictions) must also be enforced by the API.
- **Fix data with migrations, not manual DB edits** — so every environment,
  including production, heals itself on deploy instead of drifting.

## Task tracking — ToDo.md

- `ToDo.md` lives at the project root, divided into these sections:
  **Styling**, **Bugs/Fixes**, **MVP Features**, **IceBox Features**.
- Any work discovered while building a feature but not done as part of it
  (follow-ups, known ceilings, deferred polish) goes into `ToDo.md` under the
  right section — never just mentioned in chat and lost.
- While working, consult both `CLAUDE.md` and `ToDo.md`; when a change completes
  or invalidates a ToDo item, update it (check it off, edit it, or remove it).

## Documentation

- Anything important about **running the app** — starting it locally, env vars,
  deploying, one-off operational commands — goes in `README.md` automatically,
  without being asked.
- When a code change makes any `.md` file stale (README, DEPLOYMENT, ToDo,
  this file), update it in the same change.
