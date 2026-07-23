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
- Clarifying questions go both ways. When a task is large, ambiguous, or
  design-heavy, the assistant may ask a few pointed questions up front to fit
  the work to the user's real needs — it is not only the user who asks. Keep
  it to a small number, one topic at a time; never open with a flood of
  questions. For small, obvious tasks, proceed on sensible defaults and state
  the assumption instead of asking.
- `ARCHITECTURE.md` is binding. Follow every decision recorded there; never
  silently deviate from it or change established direction. When you believe a
  recorded decision is wrong, raise it and ask first — do not change it, or act
  against it, without asking.
- When the user asks a question and the reply grows into a real explanation (a
  concept, a pattern, a why — not a one-line answer), capture it in
  `ai-notes/LEARNING.md` as a dated entry and tell the user. Create the file if
  it is missing. `ai-notes/` is gitignored local learning notes — keep it that
  way; never commit it.
- When the user floats a future plan, an idea, or something they would like to
  add to the project (not to build right now), record it in
  `ai-notes/BACKLOG.md` and tell the user. Keep it a parked idea, not scheduled
  work — do not start on it unless asked.
- When the user asks for a plan — to design or think work through before
  building it — write the plan to `ai-notes/plans/<short-kebab-topic>.md` and
  tell the user. One file per plan; when the same work is re-planned, update
  that file rather than adding a second. `ai-notes/` is gitignored local notes —
  keep it that way; never commit it.

## Code Review

When the user asks for a code review, always run `/code-review ultra`.

## Communication

Use `/caveman full` by default for all assistant responses in this repository,
unless the user explicitly asks for a different level or normal mode.
