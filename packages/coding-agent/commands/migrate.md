---
name: migrate
description: Walk through an opinionated multi-step code migration.
argument-hint: "<migration-name> [target-version]"
allowed-tools:
  - bash
  - read
  - edit
  - grep
effort: high
---

Execute a code migration named `$1` (target: `${2:-latest}`).

Generic migration playbook (apply iff the named migration matches one of
these shapes; otherwise plan first):

1. **Snapshot.** Confirm the working tree is clean — abort if not.
2. **Inventory.** Search for every occurrence of the deprecated symbol /
   pattern. Report counts grouped by file. Pause for user approval.
3. **Plan.** List the migration in 3–7 numbered steps. Each step must be:
   - Reviewable in isolation.
   - Independently testable (or explicitly marked "no test possible").
4. **Execute step-by-step.** After each step:
   - Run the affected tests.
   - Run the type-checker.
   - Stop on the first failure and ask the user before proceeding.
5. **Verify.** Run the full test suite and any project-specific lints.
6. **Document.** Append a CHANGELOG entry under `## Unreleased`.

Hard rules:
- Never combine multiple steps into one commit.
- Never disable tests "temporarily" — fix or revert.
- Pin third-party version bumps to exact versions during migration; relax
  the pin in a follow-up PR.
