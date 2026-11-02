import type { CaseRecord, CasePage, PageCursor, StatusFilter } from './types.js';

/** The server accepts an opaque, URL-safe cursor containing both sort keys. */
export function encodeCursor(record: CaseRecord): string {
  const cursor: PageCursor = { createdAt: record.createdAt, id: record.id };
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

export function decodeCursor(raw: string): PageCursor {
  const cursor: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  if (!cursor || typeof cursor !== 'object' ||
      typeof (cursor as PageCursor).createdAt !== 'string' ||
      typeof (cursor as PageCursor).id !== 'string') {
    throw new Error('Invalid cursor');
  }
  return cursor as PageCursor;
}

export function compareRecords(a: CaseRecord, b: CaseRecord): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}

export function listCases(
  seed: CaseRecord[], options: { filter: StatusFilter; limit: number; cursor?: string }
): CasePage {
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
