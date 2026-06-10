# Adapter Review Prompt

Review all files in `lib/adapters/healthcare/` against the juA.kali Codex contract (AGENTS.md).

Check the following and report findings:

1. **UQ contract** — every state field in `WorldHealthState.ts` uses `Measured<T>`. Flag any raw scalar.
2. **Safety gate** — `write()` in `HealthcareAdapter.ts` checks allowlist, `requiresApproval`, and `dryRun` before every action. Flag any missing check.
3. **Forecast model** — `forecast()` returns a named `model` string. Flag if missing.
4. **ESM compliance** — no `require()` calls anywhere in `lib/adapters/`. Flag any found.
5. **Action coverage** — every type in the `HealthcareAction` union has a matching `case` in `execute()`. Flag any missing handler.

Output a markdown report with:
- ✓ PASS or ✗ FAIL for each check
- Line references for any failures
- Suggested fix for each failure
