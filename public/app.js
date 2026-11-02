const state = { filter: 'all', pageCursors: [null], currentPage: 0, response: null };
const $ = (id) => document.getElementById(id);
const pageRows = $('caseRows');

async function loadPage() {
  const requestedCursor = state.pageCursors[state.currentPage];
  const url = new URL('/api/cases', window.location.origin);
  url.searchParams.set('limit', '5');
  if (state.filter !== 'all') url.searchParams.set('status', state.filter);
  if (requestedCursor) url.searchParams.set('cursor', requestedCursor);
  pageRows.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
  $('next').disabled = true;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const page = await response.json();
    state.response = page;
    pageRows.innerHTML = '';
    if (page.rows.length === 0) {
      pageRows.innerHTML = '<tr><td colspan="5">No results for this page.</td></tr>';
    }
    for (const record of page.rows) {
      const tr = document.createElement('tr');
      for (const value of [record.id, record.title, record.status, record.createdAt.replace('.000Z', 'Z'), record.queue]) {
        const td = document.createElement('td');
        if (value === record.status) {
          const badge = document.createElement('span');
          badge.className = `status ${record.status}`;
          badge.textContent = value;
          td.appendChild(badge);
        } else td.textContent = value;
        tr.appendChild(td);
      }
      pageRows.appendChild(tr);
    }
    $('pageNumber').textContent = `Page ${state.currentPage + 1}`;
    $('resultsCount').textContent = `${page.rows.length} returned · ${page.hasMore ? 'more available' : 'end of traversal'}`;
    $('previous').disabled = state.currentPage === 0;
    $('next').disabled = !page.nextCursor;
    $('requestCursor').textContent = requestedCursor || '(first page)';
    $('nextCursor').textContent = page.nextCursor || '(none)';
    $('pageIds').textContent = page.rows.map((row) => row.id).join(', ') || '(none)';
  } catch (error) {
    pageRows.innerHTML = `<tr><td colspan="5">Unable to load local API: ${String(error.message).replace(/[<>]/g,'')}</td></tr>`;
    $('resultsCount').textContent = 'API error';
  }
}
$('next').addEventListener('click', () => {
  if (!state.response?.nextCursor) return;
  state.pageCursors[state.currentPage + 1] = state.response.nextCursor;
  state.currentPage += 1;
  void loadPage();
});
$('previous').addEventListener('click', () => {
  if (state.currentPage === 0) return;
  state.currentPage -= 1;
  void loadPage();
});
function reset() {
  state.currentPage = 0;
  state.pageCursors = [null];
  state.response = null;
  void loadPage();
}
$('restart').addEventListener('click', reset);
$('status').addEventListener('change', (event) => { state.filter = event.target.value; reset(); });
void loadPage();
