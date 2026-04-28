---
name: perf
description: Profile or analyse a hot path and propose a measured speedup.
argument-hint: "<file-or-function> [scenario]"
allowed-tools:
  - bash
  - read
  - grep
effort: high
---

Investigate the performance of `$ARGUMENTS`.

1. Locate the target function or path. Read its source and the immediate
   callers.
2. Identify the *measurable* hot signal:
   - Wall-clock time per call,
   - Allocations / GC pressure,
   - Sync I/O on hot paths,
   - N+1 queries / quadratic loops,
   - Cache miss rate or hit ratio.
3. Propose 1–3 concrete changes ranked by expected impact and implementation
   risk. For each change, give:
   - The exact diff or pseudo-diff.
   - Expected speedup with reasoning (Big-O if applicable).
   - The smallest benchmark that would prove the speedup.
4. If a benchmark already exists for this path, re-run it and report
   baseline numbers; if not, sketch how to add one.
5. Do not ship "premature optimization" — if the path is not actually hot,
   say so and recommend instrumentation first.

Output as a checklist the user can approve or reject item by item.
