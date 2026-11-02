# Release issue draft — CASEFLOW-142: Validate cursor-based case pagination

**Status:** Ready for release assessment · **Candidate:** CASEFLOW-RC-2026-11-02

**Background:** The synthetic case-list API uses descending creation timestamps with a deterministic case-ID tie-breaker. Some seeded cases intentionally share the same timestamp near 5-row page boundaries. Review the release candidate to confirm full result completeness and stable continuation behavior.

**Review request:**
- Inspect the contract and expected record inventories.
- Browse all cases with DevTools open and inspect one tied-timestamp boundary in the request and JSON response.
- Reconcile a complete API traversal against `inventory/expected-all.json`.
- Review the cursor construction, query predicate, and tie-break handling in TypeScript source.
- Run a second traversal without editing the dataset, followed by an open-only filtered traversal.
- Document observed page boundary, missing/duplicate/out-of-order identifiers, reproducibility, limitations, and an APPROVE/HOLD decision.

**Acceptance:** Every expected case appears once, in contract order, for both all-case and filtered traversals. Any mismatch blocks the candidate until a correction is proposed and retested (fixing is not part of this task).

**For GitHub:** This file is an **offline draft**; it is not a published GitHub issue. If Studio requires a GitHub issue, publish this text to an authorized synthetic repository *before recording* and verify it is accessible in Brave. Do not describe it as an existing GitHub issue until it has been posted.
