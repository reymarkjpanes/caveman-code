---
name: commit
description: Stage and commit the current working tree with a conventional-commit message.
argument-hint: "[optional message]"
allowed-tools:
  - bash
  - read
  - grep
effort: low
---

You are creating a git commit on behalf of the user.

1. Run `!`git status --short`` to see what's staged and what's modified.
2. Run `!`git diff --stat`` for a high-level view of the changes.
3. If the user supplied a message in `$ARGUMENTS`, use it. Otherwise infer
   a Conventional Commits message of the form `type(scope): subject` based
   on the diff. Allowed types: feat, fix, docs, refactor, test, chore, perf,
   build, ci, style, revert.
4. Stage the relevant files (prefer specific paths over `git add -A` to
   avoid sweeping in secrets).
5. Run `git commit -m "<message>"`. If a pre-commit hook fails, surface the
   error to the user — do **not** retry with `--no-verify` unless the user
   explicitly asks.
6. After committing, show the resulting commit with `git --no-pager show --stat HEAD`.

Constraints:
- Never push.
- Never amend an existing commit.
- Never bypass hooks (`--no-verify`, `--no-gpg-sign`).
- Keep the subject ≤ 72 characters.
