---
status: resolved
trigger: "Diagnose why all Azure Functions endpoints return 'Missing or invalid Authorization header' when called locally via curl without a Bearer token."
created: 2026-03-16T00:00:00Z
updated: 2026-03-16T17:00:00Z
---

## Current Focus

hypothesis: AuthenticationMiddleware unconditionally rejects requests without Bearer token -- no development-environment bypass exists
test: Read AuthenticationMiddleware.cs and trace the code path for a request without an Authorization header
expecting: A hard guard clause returning 401 with no environment check
next_action: Return diagnosis

## Symptoms

expected: During skeleton/mock-data phase, endpoints should be testable locally without a real Entra ID token
actual: All HTTP-triggered endpoints (except /api/health) return 401 "Missing or invalid Authorization header"
errors: "Missing or invalid Authorization header."
reproduction: `curl http://localhost:7071/api/articles` -- returns 401
started: Always -- middleware was written without a dev bypass path

## Eliminated

(none needed -- root cause identified on first hypothesis)

## Evidence

- timestamp: 2026-03-16T00:00:00Z
  checked: UserIdentityMiddleware.cs
  found: Lines 14-21 use a conditional `if (context.Items.TryGetValue("User", ...))` -- it silently passes through when no ClaimsPrincipal is present. NOT the blocker.
  implication: UserIdentityMiddleware is innocent; it gracefully degrades.

- timestamp: 2026-03-16T00:00:00Z
  checked: AuthenticationMiddleware.cs lines 58-72
  found: Hard guard at line 65 checks for Authorization header; if missing or not "Bearer ...", immediately returns 401 at line 69. No environment check anywhere in the file.
  implication: This is the exact code path producing the error.

- timestamp: 2026-03-16T00:00:00Z
  checked: Grep for "AZURE_FUNCTIONS_ENVIRONMENT", "IsDevelopment", "Development" in WissensHub.Functions project
  found: Zero matches. No environment-aware branching anywhere in the Functions project.
  implication: There is no dev-bypass mechanism at all.

- timestamp: 2026-03-16T00:00:00Z
  checked: local.settings.json
  found: No AZURE_FUNCTIONS_ENVIRONMENT key set. AzureAd values are placeholder `{tenant-id}` / `{client-id}`.
  implication: Even if someone sent a real token, validation would fail because config values are placeholders.

## Resolution

root_cause: AuthenticationMiddleware.cs (line 65-71) unconditionally rejects any HTTP request that lacks a valid "Bearer <token>" Authorization header. There is no environment check (e.g., IsDevelopment) to bypass auth during local development. The middleware runs for ALL HTTP-triggered functions except "Health", with zero consideration of the hosting environment.
fix: (not applied -- diagnosis only)
verification: (not applicable)
files_changed: []
