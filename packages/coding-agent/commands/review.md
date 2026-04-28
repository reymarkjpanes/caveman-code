---
name: review
description: Review the diff on the current branch against main (or a target branch).
argument-hint: "[base-branch=main]"
allowed-tools:
  - bash
  - read
  - grep
effort: medium
---

Code review the changes on the current branch.

Inputs:
- Base branch: `${1:-main}` (default `main` when no argument given).
- Current branch: `!`git rev-parse --abbrev-ref HEAD``.

Steps:
1. Run `!`git --no-pager log --oneline ${1:-main}..HEAD`` to list commits
   in scope.
2. Run `git --no-pager diff ${1:-main}...HEAD --stat` for a file-level summary.
3. For each file with non-trivial changes, read it and evaluate:
   - **Correctness** — does the change do what its commit message says?
   - **Edge cases** — null/empty/large/unicode inputs, error paths.
   - **Security** — injection sinks, unvalidated input, leaked secrets.
   - **Performance** — quadratic loops, sync I/O on hot paths, missing
     caching/indexing.
   - **Style** — matches surrounding conventions; no debug prints; comments
     on intent not mechanics.
   - **Tests** — new behaviour has tests; tests fail without the change.
4. Produce a structured report:

   ```
   ## Summary
   <2–4 sentence overview>

   ## Blockers
   - <must-fix items>

   ## Suggestions
   - <nice-to-have items>

   ## Nits
   - <small style/typo issues>
   ```

Constraints: do not edit anything during review. Provide concrete file:line
references for each finding.
