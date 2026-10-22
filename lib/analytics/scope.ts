import type { AnalysisFilters } from './advanced';

export function journalScopeQuery(filters: AnalysisFilters, day = '', includeExample = false): string {
  return new URLSearchParams({
    ...(includeExample ? { examples: 'include' } : {}),
    ...(day ? { day } : { ...(filters.start ? { start: filters.start } : {}), ...(filters.end ? { end: filters.end } : {}) }),
    ...(filters.symbol ? { symbol: filters.symbol } : {}),
    ...(filters.side ? { side: filters.side } : {}),
    ...(filters.option ? { option: filters.option } : {}),
  }).toString();
}
export function readJournalScope(query: { symbol?: string; side?: string; option?: string }) {
  return {
    initialSymbol: typeof query.symbol === 'string' && query.symbol.length <= 200 ? query.symbol : '',
    initialSide: ['LONG', 'SHORT'].includes(query.side || '') ? query.side! : 'ALL',
    initialOption: ['CE', 'PE', 'Other'].includes(query.option || '') ? query.option! : '',
  };
}
