---
name: test
description: Run the project's test suite and triage failures.
argument-hint: "[optional path or test name filter]"
allowed-tools:
  - bash
  - read
  - grep
effort: medium
---

Run the project's tests and triage any failures.

Steps:
1. Detect the runner. Inspect `!`ls package.json pyproject.toml Cargo.toml go.mod Gemfile build.gradle pom.xml 2>/dev/null``
   and pick the closest match. Common cases:
   - Node: `npm test` or `npm run test`
   - Python: `pytest` (or whatever `pyproject.toml` declares)
   - Rust: `cargo test`
   - Go: `go test ./...`
2. If the user supplied a filter in `$ARGUMENTS`, pass it through to the
   runner (e.g. `npm test -- $ARGUMENTS`, `pytest $ARGUMENTS`,
   `cargo test $ARGUMENTS`).
3. Run the tests once. Capture exit code and the last ~200 lines of output.
4. If failures exist:
   - List each failing test with file:line.
   - Open the first failing file with the `read` tool and propose a
     concrete fix.
   - Do not edit anything yet — wait for the user to confirm.
5. Otherwise, report the pass count and elapsed time.
