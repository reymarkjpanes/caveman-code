---
name: log
description: Summarise recent git history.
argument-hint: "[count=20]"
allowed-tools:
  - bash
effort: low
---

Show recent commits and call out anything noteworthy.

1. Run `!`git --no-pager log --oneline --decorate -n ${1:-20}``.
2. Run `git --no-pager shortlog -sn -n 5` to show top contributors.
3. Highlight:
   - Merge commits and what branch they came from.
   - Commits whose messages are non-conventional (no `type:` prefix).
   - Commits with very large diffs (`--shortstat` filter).
4. If the user passed `--since=<date>`, scope all output to that range.

Keep the output ≤ 30 lines. Group by date if there are commits across
multiple days.
