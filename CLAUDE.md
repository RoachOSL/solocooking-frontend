# CLAUDE.md

## Project Instructions

Before starting work in this repository, read:

- `ARCHITECTURE.md`
- `PROJECT_NOTES.md`

Follow both files as durable project guidance. Reusable engineering and
architecture rules belong in `ARCHITECTURE.md`; SoloCookingFrontend-specific
facts and decisions belong in `PROJECT_NOTES.md`.

## Workflow

- Before presenting or running any executable command, first explain what it
  does and what effects it may have.
- The assistant may create branches and stage changes (`git add`), and
  proposes the commit subject — but never runs `git commit` or `git push`.
  The user reviews the staged diff and commits/pushes themselves.
- Naming convention: branch `<type>/<short-desc>`, all lowercase,
  hyphen-separated; allowed types: `chore`, `feature`, `bugfix`, `hotfix`.
  Commit subject is the description without the type segment (branch
  `chore/refactor-sth` -> commit `refactor sth`); body only when the why is
  not obvious from the diff. Work never lands directly on `main`.
- When the user adds GitHub code review comments, read and discuss them with
  the user in the local console first. Apply agreed changes locally, test,
  and summarize. Do not publish GitHub comments unless explicitly asked.
- When a reusable architectural or engineering decision is agreed, record it
  in `ARCHITECTURE.md`. Record project-specific decisions in
  `PROJECT_NOTES.md`.

## Code Review

When the user asks for a code review, run `/code-review max` — the local
review at the strongest reasoning effort. If that argument is rejected, fall
back to plain `/code-review` and say so.

Never launch `/code-review ultra` (alias `/ultrareview`). It runs a
multi-agent review in the cloud, draws on a limited quota, and is
user-triggered by design — only the user starts it, for a full branch before
a merge to `main`.

## Communication

Use `/caveman full` by default for all assistant responses in this repository,
unless the user explicitly asks for a different level or normal mode.
