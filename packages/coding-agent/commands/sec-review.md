---
name: sec-review
description: Security review of the current diff (or the whole repo, if --all).
argument-hint: "[--all|<path>]"
allowed-tools:
  - bash
  - read
  - grep
effort: high
---

Perform a security review of `$ARGUMENTS` (defaults to the diff vs. main).

Checklist:
1. **Secrets / credentials** — leaked API keys, passwords, JWTs, private
   keys, OAuth tokens. Search both code and committed config.
2. **Injection** — SQL, shell, template, prototype-pollution, XSS, SSRF,
   path-traversal. Look at every `exec`, `system`, raw query string,
   `dangerouslySetInnerHTML`, dynamic `require/import`, and `fs.readFile`
   path that is built from user input.
3. **AuthN / AuthZ** — every privileged endpoint must check authentication
   and authorization. Flag broken object-level authorization (BOLA) and
   IDOR patterns.
4. **Crypto** — no MD5/SHA-1 for security; no static IVs; no homemade
   crypto. Token expiry must be enforced server-side.
5. **Dependencies** — anything pinned to an outdated major with known CVEs.
6. **Network surface** — overly permissive CORS, missing CSRF protection,
   leaky error messages.
7. **Logging / telemetry** — no PII, no secrets, no tokens.

For each finding produce:
- Severity: Critical / High / Medium / Low / Info.
- File:line.
- Concrete exploitation scenario in one sentence.
- Recommended remediation (specific, copy-pasteable when possible).

Do **not** fix anything during review. Conclude with a short "Areas left
unreviewed" section so the user knows the boundary.
