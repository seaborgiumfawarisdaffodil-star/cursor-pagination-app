# Cursor Pagination Contract — Caseflow RC

**Fixture:** `CASEFLOW-RC-2026-11-02` · Synthetic local API; immutable dataset.

## API behavior

- Endpoint: `GET /api/cases?limit=5[&status=open][&cursor=<opaque>]`.
- Default page size used for release review: **5**. Status `all` is implicit when omitted.
- `rows` contains the page's cases. `hasMore` and `nextCursor` determine whether another page exists.
- A missing `nextCursor` signals the end of the traversal; it must not hide matching records.
- Cursor tokens are opaque to API clients. They encode **both** `createdAt` and `id` (the two sort keys).

## Required deterministic ordering

1. Sort by `createdAt` descending.
2. For equal timestamps, sort by case `id` descending as a stable tie-breaker.
3. The continuation page must contain only records **strictly after** the preceding page's final `(createdAt, id)` tuple in that ordering.
4. Every matching record is returned **exactly once** across the complete traversal (no omissions or duplicates).
5. Re-running against the fixed dataset must produce identical ordered identifiers.
6. The `status=open` filter follows the same rules within the open-case subset.

## Release acceptance criteria

- Entire **all-case** traversal matches `inventory/expected-all.json` in both membership and order.
- Entire **open-only** traversal matches `inventory/expected-open.json` in both membership and order.
- The API does not skip or duplicate records across equal-timestamp page boundaries.
- Returned cursor behavior is consistent with the two-field contract.
- Reconciliation exports, a reproducible browser demonstration, and source-code references support the decision.

Do not edit the source or seed during the assessment. Review the prepared release candidate as delivered.
