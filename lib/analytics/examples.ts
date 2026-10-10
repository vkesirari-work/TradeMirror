import type { Fill } from './matching';

// Only the two executions in our published synthetic fixture are excluded.
export function isExampleExecution(fill: Fill): boolean {
  let identity: unknown;
  try { identity = JSON.parse(fill.id); } catch { return false; }
  if (!Array.isArray(identity) || identity.length !== 4) return false;
  if (fill.broker !== 'ZERODHA' || fill.symbol !== 'NIFTY26OCT25000CE' ||
      identity[0] !== 'NFO' || identity[1] !== 'FO' || identity[2] !== '2026-10-07' ||
      Number(fill.quantity) !== 75) return false;
  return (identity[3] === 'EXAMPLE-001' && fill.side === 'BUY' && Number(fill.price) === 124.5 &&
    Date.parse(fill.executedAt) === Date.parse('2026-10-07T09:24:00+05:30')) ||
    (identity[3] === 'EXAMPLE-002' && fill.side === 'SELL' && Number(fill.price) === 148 &&
    Date.parse(fill.executedAt) === Date.parse('2026-10-07T09:38:00+05:30'));
}
