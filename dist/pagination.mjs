export function encodeCursor(record) {
  return Buffer.from(JSON.stringify({ createdAt: record.createdAt, id: record.id })).toString('base64url');
}
export function decodeCursor(raw) {
  const cursor = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  if (!cursor || typeof cursor.createdAt !== 'string' || typeof cursor.id !== 'string') {
    throw new Error('Invalid cursor');
  }
  return cursor;
}
export function compareRecords(a, b) {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}
export function listCases(seed, options) {
  const sorted = seed
    .filter((record) => options.filter === 'all' || record.status === options.filter)
    .sort(compareRecords);
  const boundary = options.cursor ? decodeCursor(options.cursor) : null;
  const eligible = boundary
    ? sorted.filter((record) => record.createdAt < boundary.createdAt)
    : sorted;
  const rows = eligible.slice(0, options.limit);
  const hasMore = eligible.length > rows.length;
  return {
    rows,
    nextCursor: hasMore && rows.length ? encodeCursor(rows[rows.length - 1]) : null,
    hasMore,
    limit: options.limit,
    filter: options.filter
  };
}
