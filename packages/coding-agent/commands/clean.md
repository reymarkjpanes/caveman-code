---
name: clean
description: Remove obvious dead code, unused imports, and stale TODOs.
argument-hint: "[scope-path=.]"
allowed-tools:
  - bash
  - read
  - edit
  - grep
effort: medium
---

Tidy `${1:-.}` without changing behaviour.

Targets:
1. Unused imports (use the language's tooling — `tsc --noUnusedLocals`,
   `ruff check --select F401`, `cargo clippy -- -W unused-imports`, etc.).
2. Variables / functions / classes that have zero references.
3. Dead branches (`if (false)`, unreachable code after `return`/`throw`).
4. Stale TODO/FIXME comments that reference long-resolved work — only
   delete when you can prove the underlying issue is done (closed PR,
   missing function, etc.).
5. Commented-out code blocks > 5 lines.

Hard rules:
- Behaviour-preserving only. If you're unsure, leave it.
- One commit per category if possible.
- Never delete public API surface (exported symbols / public functions)
  without explicit user approval.
- Never delete tests.

Output a summary table at the end:

| Category | Lines removed | Files touched |
|---|---|---|
| Unused imports | … | … |
| Dead code | … | … |
| Stale TODOs | … | … |
