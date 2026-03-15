---
status: complete
phase: 01-project-scaffolding-local-dev
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md]
started: 2026-03-15T00:00:00Z
updated: 2026-03-15T06:25:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running Docker containers and Azure Functions host. From the project root, run `npm run db:up` (SQL Server starts), `npm run db:migrate` (8 tables created), `npm run api:start` (Functions host starts), `curl http://localhost:7071/api/health` (returns 200 with JSON status).
result: pass

### 2. SPFx Heft Build
expected: From `spfx/` directory, run `npx heft build --clean`. Build completes in under 10 seconds with 0 errors and 0 warnings. Output shows Heft lifecycle completing successfully.
result: pass

### 3. .NET Solution Build
expected: From `api/` directory, run `dotnet build`. All 5 projects (Domain, Application, Infrastructure, Functions, Tests) build with 0 errors, 0 warnings.
result: pass

### 4. Database Schema Tests
expected: From `api/` directory, run `dotnet test --filter "DatabaseSchema"`. All 13 tests pass — verifying DbSets, entity types, unique indexes, and composite primary keys.
result: pass

### 5. Web Part Component Stubs
expected: In `spfx/src/webparts/`, each of the 4 web parts (dashboard, articleSidebar, freigabecenter, adminPanel) has a `components/*.tsx` file that exports a `React.FunctionComponent`. No class components exist in any .tsx file. Verify with: `grep -r "extends React.Component" spfx/src/ --include="*.tsx"` returns no matches.
result: pass

### 6. Dev Scripts Available
expected: From project root, run `npm run` and verify these scripts exist: `dev`, `spfx:serve`, `api:start`, `db:up`, `db:down`, `db:migrate`.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
