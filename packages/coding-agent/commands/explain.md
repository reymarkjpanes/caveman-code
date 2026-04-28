---
name: explain
description: Explain a file, function, or concept in the codebase.
argument-hint: "<path-or-symbol> [extra-context...]"
allowed-tools:
  - read
  - grep
  - bash
effort: low
---

Explain `$ARGUMENTS` in the context of this codebase.

1. If the argument looks like a path, read it. If it looks like a symbol,
   use `grep` to locate definitions and call sites.
2. Summarise the answer in three layers:
   - **What it is** — one sentence.
   - **How it works** — bullet list, ≤ 6 items, with concrete file:line
     references.
   - **Why it matters / who calls it** — list upstream callers and the
     contract they rely on.
3. If the symbol is part of a public API, also mention versioning concerns.
4. End with a short list of "Things to read next" — adjacent files the user
   would benefit from skimming.

Avoid speculation: if you can't find the symbol or file, say so explicitly
and suggest a `grep` query that might find it.
