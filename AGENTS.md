# juA.kali World Runtime — Codex Contract

Codex reads this file before every task in this repository.
All instructions here are durable and apply to every session, CI run, and agent task.

---

## Architecture

- All World Runtime adapters live in `lib/adapters/` and implement the `Adapter` interface from `lib/adapters/healthcare/AdapterContract.ts`
- Every adapter **must** implement: `connect()`, `read()`, `forecast()`, `write()`, `health()`
- All `WorldEvent` payloads must use `Measured<T>` wrappers for UQ (uncertainty quantification) — never raw scalar values
- The `write()` method **must** pass every action through the safety gate (`requiresApproval` + allowlist check + dry-run guard) before execution
- No raw SQL — all DB access goes through Drizzle ORM in `server/db/`
- No direct M-Pesa API calls outside `lib/adapters/healthcare/HealthcareAdapter.ts` — always go through `mpesaClient`
- Railway env vars are injected at runtime — never hardcode credentials or tokens

## Stack

- TypeScript / React / Vite / tRPC / Drizzle ORM / pnpm
- Node.js >= 20 (required for `import.meta.dirname`)
- No CommonJS — this is a pure ESM project; never add `require()` or `module.exports`
- pnpm only — never use npm or yarn; lockfile must stay in sync

## Adapter rules

- New adapters go in `lib/adapters/<domain>/` with four files:
  - `AdapterContract.ts` (if domain-specific extension needed)
  - `<Domain>State.ts` (world state type with `Measured<T>` fields)
  - `<Domain>Adapter.ts` (implementation)
  - `<domain>Adapter.write.ts` (action space + safety gate)
- Every `HealthcareAction` type must appear in the discriminated union in `healthcareAdapter.write.ts`
- `PRODUCTION_ALLOWLIST` starts conservative (`flag_shortage`, `escalate_alert` only) — expand only after agent validation
- `forecast()` must return a `ForecastResult` with a named `model` string — never return without identifying the model used

## Before declaring a task complete

1. Run `pnpm tsc --noEmit` — zero type errors
2. Run `pnpm test -- --passWithNoTests` — all tests pass
3. Confirm no new `require()` calls introduced
4. Confirm no credentials or tokens in committed files
5. Confirm `Measured<T>` used for all new state fields
6. If modifying `write()`: confirm safety gate is intact (`requiresApproval` + allowlist + dryRun check)

## Test patterns

- Adapter tests go in `lib/adapters/__tests__/`
- For agent changes, prefer integration tests over unit tests
- Safety gate must be tested: `requiresApproval(emergencyRestock) === true`, `requiresApproval(flagShortage) === false`
- Use `--passWithNoTests` flag — tests are additive, CI must not break on empty test suites

## What Codex should NOT do

- Do not modify `.github/workflows/` files unless explicitly asked
- Do not change `PRODUCTION_ALLOWLIST` to include `transfer_patient` or `mpesa_payment` without explicit instruction
- Do not introduce new npm/pip dependencies without noting them in the PR description
- Do not rewrite `forecast()` to remove the `model` field
- Do not flatten `Measured<T>` back to raw scalars — this breaks the Willcox UQ contract
