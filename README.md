# Caseflow — Cursor Pagination Release Assessment

**Synthetic TypeScript case-list application** with a locally served API, immutable seeded dataset, independent expected inventories, a browser case-list UI and read-only evidence-exporting reconciliation commands.

## Run (Node.js 18+; no npm install required)

Open this `input 1` folder in VS Code and run:

```bash
npm start
```

Open `http://127.0.0.1:4183` in Brave. In DevTools → Network, select **Fetch/XHR**, and examine requests to `cases`. Use **Next page**, **Previous**, **Restart traversal**, and the **Open only** filter. Default page size: **5**.

## Read-only reconciliation (keep server running)

In another VS Code terminal:

```bash
npm run audit:all -- --run first
npm run audit:all -- --run repeat
npm run audit:filtered -- --run filtered
```

Each run queries the unchanged local API, compares returned IDs with the independently prepared inventory, prints a concise reconciliation, and writes two report files to `evidence/`. These commands **never edit the seed, TypeScript source, manifest, or expected inventories**.

Output examples: `evidence/all-first.json`, `evidence/all-first.txt`, `evidence/all-repeat.json`, `evidence/open-filtered.json`.

## Review materials

- `contracts/pagination-contract.md`: required sorting, composite cursor behavior, acceptance criteria.
- `inventory/seed-cases.json`: immutable synthetic cases, some with tied timestamps.
- `inventory/expected-all.json` and `inventory/expected-open.json`: independently prepared ordered inventories.
- `src/pagination.ts`: TypeScript cursor encoder, decoder, ordering, page predicate (inspect; do not edit).
- `src/server.ts`: TypeScript API source counterpart.
- `dist/*.mjs`: shipped precompiled JS runtime; matches the prepared TS source for review; no build step required.
- `docs/release-review-issue.md`: synthetic GitHub issue **draft**, not a published issue.

## Important restrictions

1. This is an **assessment**, not a correction. No fixing the cursor predicate, new tests, rebuilding, or changing the seed/inventories.
2. The fixture is local-only and uses no external processing APIs or personal data.
3. The GitHub release issue is **not** automatically created by this ZIP. To satisfy the approved GitHub review step, publish the supplied issue draft and reference contract/inventory in your permitted synthetic GitHub repository before recording, or replace these with the actual approved GitHub materials.
4. Keep an initially empty Notion findings page; populate with observed results during recording and export PDF.
5. Do not copy earlier recordings' screenshots or reports into the current recording's final output.
6. The ZIP is **AI-generated in this ChatGPT conversation**. Describe its provenance accurately in Mercor Studio; do not label it manually created just because you save/open it in VS Code.

## Suggested deliverables after recording

- `input 1/` — this prepared starter (plus runtime exports written during recording if packaging separately is inconvenient)
- `final output 1/` — reconciliation exports and evidence screenshots genuinely created during this recording
- `final output 2.pdf` — Notion assessment PDF exported during recording
- `Metadata.rtf` — must reproduce the approved Goal verbatim and actual application topology

Do not submit the example structure as if generated artifacts already exist; create actual evidence while recording.
