import type { Match } from './matching';
import { decimal, exactUnits, summarizeMatches, tradingDate } from './daily';

export interface AnalysisFilters {
  start: string; end: string; symbol: string; side: string; option: string;
}
export interface Breakdown { label: string; slices: number; wins: number; grossPnl: string }
export type Dimension = 'instrument' | 'option' | 'weekday' | 'hour' | 'side';

export function optionType(symbol: string): string {
  return /CE$/i.test(symbol) ? 'CE' : /PE$/i.test(symbol) ? 'PE' : 'Other';
}
export function filterMatches(matches: Match[], filters: AnalysisFilters): Match[] {
  return matches.filter(match => {
    const date = tradingDate(match.exitTime);
    return (!filters.start || date >= filters.start) && (!filters.end || date <= filters.end) &&
      (!filters.symbol || match.symbol === filters.symbol) &&
      (!filters.side || match.side === filters.side) &&
      (!filters.option || optionType(match.symbol) === filters.option);
  });
}
function roundedDivision(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < BigInt(0);
  const absolute = negative ? -numerator : numerator;
  const rounded = (absolute + denominator / BigInt(2)) / denominator;
  return negative ? -rounded : rounded;
}
function ratio(numerator: bigint, denominator: bigint): string | null {
  if (denominator === BigInt(0)) return null;
  const hundredths = roundedDivision(numerator * BigInt(100), denominator);
  return `${hundredths / BigInt(100)}.${(hundredths % BigInt(100)).toString().padStart(2, '0')}`;
}
export function advancedSummary(matches: Match[]) {
  let gross = BigInt(0), profit = BigInt(0), loss = BigInt(0), peak = BigInt(0), drawdown = BigInt(0);
  let wins = 0, losses = 0, breakeven = 0, holdSeconds = 0;
  let best: Match | null = null, worst: Match | null = null;
  const ordered = [...matches].sort((a, b) => Date.parse(a.exitTime) - Date.parse(b.exitTime) || a.id.localeCompare(b.id));
  for (const match of ordered) {
    const value = exactUnits(match.grossPnl);
    gross += value;
    if (value > BigInt(0)) { profit += value; wins++; }
    else if (value < BigInt(0)) { loss -= value; losses++; }
    else breakeven++;
    if (gross > peak) peak = gross;
    if (peak - gross > drawdown) drawdown = peak - gross;
    if (!best || value > exactUnits(best.grossPnl)) best = match;
    if (!worst || value < exactUnits(worst.grossPnl)) worst = match;
    holdSeconds += Math.max(0, Date.parse(match.exitTime) - Date.parse(match.entryTime)) / 1000;
  }
  const days = summarizeMatches(ordered);
  const byPerformance = [...days].sort((a, b) => exactUnits(a.grossPnl) < exactUnits(b.grossPnl) ? -1 : exactUnits(a.grossPnl) > exactUnits(b.grossPnl) ? 1 : a.date.localeCompare(b.date));
  return {
    grossPnl: decimal(gross), grossProfit: decimal(profit), grossLoss: decimal(loss),
    wins, losses, breakeven, slices: matches.length,
    winRate: matches.length ? (wins / matches.length * 100).toFixed(1) : null,
    profitFactor: ratio(profit, loss),
    averageWin: wins ? decimal(roundedDivision(profit, BigInt(wins))) : null,
    averageLoss: losses ? decimal(-roundedDivision(loss, BigInt(losses))) : null,
    expectancy: matches.length ? decimal(roundedDivision(gross, BigInt(matches.length))) : null,
    maxDrawdown: decimal(drawdown),
    averageHoldMinutes: matches.length ? (holdSeconds / matches.length / 60).toFixed(1) : null,
    days, activeDays: days.length, greenDays: days.filter(d => exactUnits(d.grossPnl) > BigInt(0)).length,
    redDays: days.filter(d => exactUnits(d.grossPnl) < BigInt(0)).length,
    bestDay: byPerformance.at(-1) || null, worstDay: byPerformance[0] || null,
    bestSlice: best, worstSlice: worst,
  };
}
export function breakdown(matches: Match[], dimension: Dimension): Breakdown[] {
  const grouped = new Map<string, { gross: bigint; slices: number; wins: number }>();
  for (const match of matches) {
    const ist = new Date(Date.parse(match.entryTime) + 330 * 60000);
    const label = dimension === 'instrument' ? match.symbol : dimension === 'option' ? optionType(match.symbol) :
      dimension === 'side' ? match.side : dimension === 'hour' ? `${String(ist.getUTCHours()).padStart(2, '0')}:00–${String(ist.getUTCHours() + 1).padStart(2, '0')}:00` :
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][ist.getUTCDay()];
    const item = grouped.get(label) || { gross: BigInt(0), slices: 0, wins: 0 };
    const value = exactUnits(match.grossPnl);
    item.gross += value; item.slices++; if (value > BigInt(0)) item.wins++;
    grouped.set(label, item);
  }
  const rows = [...grouped].map(([label, item]) => ({ label, slices: item.slices, wins: item.wins, grossPnl: decimal(item.gross) }));
  return rows.sort((a, b) => dimension === 'hour' ? a.label.localeCompare(b.label) :
    exactUnits(a.grossPnl) > exactUnits(b.grossPnl) ? -1 : exactUnits(a.grossPnl) < exactUnits(b.grossPnl) ? 1 : a.label.localeCompare(b.label));
}
export function reportPeriods(matches: Match[], mode: 'daily' | 'weekly') {
  const grouped = new Map<string, Match[]>();
  for (const match of matches) {
    const date = new Date(tradingDate(match.exitTime) + 'T00:00:00Z');
    if (mode === 'weekly') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    const key = date.toISOString().slice(0, 10);
    const rows = grouped.get(key) || []; rows.push(match); grouped.set(key, rows);
  }
  return [...grouped].sort(([a], [b]) => b.localeCompare(a)).map(([date, rows]) => ({ date, rows, summary: advancedSummary(rows) }));
}
