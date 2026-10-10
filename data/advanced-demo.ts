import { matchExecutions, type Fill } from '@/lib/analytics/matching';

// Explicitly synthetic executions; never persisted to any account.
const dates = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-28',
  '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-05', '2026-10-06', '2026-10-07'];
const contracts = ['NIFTY26OCT25000CE', 'BANKNIFTY26OCT56000PE', 'SENSEX26OCT80000CE', 'NIFTY26OCT24500PE'];
const times = ['09:24', '10:08', '12:18', '14:12'];
const deltas = [8, -6, 12, -10, 4, -3, 15, -9];
const fills: Fill[] = dates.flatMap((date, day) => contracts.flatMap((symbol, index) => {
  const entry = `${date}T${times[index]}:00+05:30`;
  const short = (day + index) % 4 === 0;
  const entryPrice = 100 + index * 50;
  const delta = deltas[(day * 3 + index) % deltas.length];
  const exitPrice = entryPrice + delta * (short ? -1 : 1);
  const id = `demo-${day}-${index}`;
  const common = { broker: 'DEMO', symbol, exchange: index === 2 ? 'BFO' : 'NFO', segment: 'FO', quantity: String([65, 30, 20, 65][index]) };
  return [
    { ...common, id: id + '-entry', side: short ? 'SELL' as const : 'BUY' as const, price: String(entryPrice), executedAt: entry },
    { ...common, id: id + '-exit', side: short ? 'BUY' as const : 'SELL' as const, price: String(exitPrice), executedAt: new Date(Date.parse(entry) + [14, 22, 31, 28][index] * 60000).toISOString() },
  ];
}));
export const advancedDemo = matchExecutions(fills);
