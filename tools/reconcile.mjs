/** Read-only traversal; writes new evidence reports but never changes seed or source files. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : fallback;
};
const filter = arg('--filter', 'all');
const run = arg('--run', filter === 'open' ? 'filtered' : 'first');
if (!['all','open'].includes(filter) || !/^[a-zA-Z0-9_-]{1,32}$/.test(run)) {
  console.error('Usage: --filter all|open --run safe-name');
  process.exit(1);
}
const expected = JSON.parse(await readFile(path.join(root, `inventory/expected-${filter}.json`), 'utf8'));
const source = JSON.parse(await readFile(path.join(root, 'inventory/seed-cases.json'), 'utf8'));
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4183';
const seen = new Set();
const pages = [];
const collected = [];
let cursor = null;
let cycle = false;
for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
  const url = new URL('/api/cases', baseUrl);
  url.searchParams.set('limit','5');
  if (filter !== 'all') url.searchParams.set('status', filter);
  if (cursor) url.searchParams.set('cursor', cursor);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
  const body = await response.json();
  if (!Array.isArray(body.rows)) throw new Error('Invalid API page');
  pages.push({ page:pageIndex+1, url:url.toString(), requestedCursor:cursor,
    ids:body.rows.map((r)=>r.id), rows:body.rows, nextCursor:body.nextCursor, hasMore:body.hasMore });
  collected.push(...body.rows);
  if (!body.nextCursor) break;
  if (seen.has(body.nextCursor)) { cycle = true; break; }
  seen.add(body.nextCursor);
  cursor = body.nextCursor;
  if (pageIndex === 19) throw new Error('Safety limit of 20 pages reached');
}
const ids = collected.map((r)=>r.id);
const expectedSet = new Set(expected.ids);
const actualSet = new Set(ids);
const missingIds = expected.ids.filter((id)=>!actualSet.has(id));
const extraIds = ids.filter((id)=>!expectedSet.has(id));
const counts = new Map();
for (const id of ids) counts.set(id,(counts.get(id)||0)+1);
const duplicateIds = [...counts].filter(([,n])=>n>1).map(([id])=>id);
const compare = (a,b) => b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id);
const orderingViolations = [];
for(let i=1;i<collected.length;i++) {
  if(compare(collected[i-1],collected[i])>0) orderingViolations.push({before:collected[i-1].id,after:collected[i].id});
}
const firstDifferenceIndex = expected.ids.findIndex((id,i)=>id!==ids[i]);
const sequenceMatches = expected.ids.length===ids.length && expected.ids.every((id,i)=>id===ids[i]);
const report = {
  run, filter, fixture:'CASEFLOW-RC-2026-11-02',
  expectedCount:expected.count,actualCount:ids.length,
  expectedIds:expected.ids,actualIds:ids,
  missingIds,extraIds,duplicateIds,orderingViolations,sequenceMatches,cursorCycle:cycle,
  firstDifference: firstDifferenceIndex<0 ? null : {
    atPosition:firstDifferenceIndex+1,
    expected:expected.ids[firstDifferenceIndex],
    actual:ids[firstDifferenceIndex]||null
  },
  pages, seedFile:'inventory/seed-cases.json', inventoryFile:`inventory/expected-${filter}.json`
};
const passed=sequenceMatches && !cycle && !duplicateIds.length && !orderingViolations.length;
const summary = [
  `CASEFLOW PAGINATION RECONCILIATION — ${run.toUpperCase()} (${filter})`,
  `Expected cases: ${report.expectedCount}`,
  `Collected cases: ${report.actualCount}`,
  `API pages: ${pages.length}`,
  `Missing IDs: ${missingIds.length ? missingIds.join(', ') : '(none)'}`,
  `Duplicate IDs: ${duplicateIds.length ? duplicateIds.join(', ') : '(none)'}`,
  `Extra IDs: ${extraIds.length ? extraIds.join(', ') : '(none)'}`,
  `Ordering violations: ${orderingViolations.length}`,
  `Expected ordered sequence: ${sequenceMatches ? 'MATCH' : 'MISMATCH'}`,
  `First divergence: ${report.firstDifference ? `position ${report.firstDifference.atPosition}, expected ${report.firstDifference.expected}, got ${report.firstDifference.actual}` : '(none)'}`,
  `RELEASE CHECK: ${passed ? 'PASS' : 'HOLD'}`,
].join('\n');
await mkdir(path.join(root,'evidence'), {recursive:true});
const stem=`${filter}-${run}`;
await writeFile(path.join(root,'evidence',`${stem}.json`), JSON.stringify(report,null,2)+'\n');
await writeFile(path.join(root,'evidence',`${stem}.txt`), summary+'\n');
console.log(summary);
console.log(`Evidence: evidence/${stem}.json and evidence/${stem}.txt`);
// A mismatch is a release-assessment finding, not a script execution failure.
