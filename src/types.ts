export type StatusFilter = 'all' | 'open';
export type CaseStatus = 'open' | 'closed';
export interface CaseRecord {
  id: string;
  createdAt: string;
  status: CaseStatus;
  title: string;
  queue: string;
}
export interface PageCursor {
  createdAt: string;
  id: string;
}
export interface CasePage {
  rows: CaseRecord[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  filter: StatusFilter;
}
