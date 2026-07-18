# AGENTS.md

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
- Commits and pushes are done only by the user. Prepare and test changes and
  suggest branch names and commit messages, but never run `git commit` or
  `git push`.
- When the user adds GitHub code review comments, read and discuss them with
  the user in the local console first. Apply agreed changes locally, test,
  and summarize. Do not publish GitHub comments unless explicitly asked.
- When a reusable architectural or engineering decision is agreed, record it
  in `ARCHITECTURE.md`. Record project-specific decisions in
  `PROJECT_NOTES.md`.

## Code Review

When the user asks for a code review, always run `/code-review ultra`.

## Communication

Use `/caveman full` by default for all assistant responses in this repository,
unless the user explicitly asks for a different level or normal mode.
