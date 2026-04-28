---
name: fix-types
description: Run the project's type-checker and fix the smallest set of errors.
argument-hint: "[scope-path]"
allowed-tools:
  - bash
  - read
  - edit
  - grep
effort: medium
---

Fix type errors in the smallest, safest way.

1. Detect the type-checker:
   - TypeScript projects: `tsc --noEmit` or `tsgo -p tsconfig.json --noEmit`.
   - Python: `mypy` or `pyright`.
   - Rust: `cargo check`.
2. Run it once over the scope `${1:-.}` and capture the error list.
3. Group errors by file. Open the file with the most errors first, read it
   end-to-end, and apply minimal edits.
4. Re-run the type-checker after each batch. Stop when:
   - All errors are gone, or
   - No further error reduction is possible without a wider refactor.
5. Never silence errors with `any`, `# type: ignore`, `@ts-ignore` or
   equivalent unless there is no alternative; if you must, add a brief
   comment explaining why.

Report:
- Errors before / after.
- Files modified.
- Any errors deliberately left and the reason.
