import Link from 'next/link';
import { advancedSummary, breakdown } from '@/lib/analytics/advanced';
import { exactMoney } from '@/lib/analytics/format';
import type { MatchingResult } from '@/lib/analytics/matching';
import { Card, SectionTitle } from '@/components/ui/primitives';

export function AccountReview({ result, journalHref='/trades' }: { result: MatchingResult; journalHref?:string }) {
  const summary = advancedSummary(result.matches);
  const hours = breakdown(result.matches, 'hour');
  const options = breakdown(result.matches, 'option');
  const bestHour = hours[0];
  if (!summary.slices) return <Card><SectionTitle title="No matched exits to review" subtitle="Save a tradebook to see observations from your own history."/></Card>;
  const observations = [
    { title: 'Look beyond win rate', label: 'RESULT DISTRIBUTION', body: `${summary.wins} winning and ${summary.losses} losing FIFO slices produced ${exactMoney(summary.grossPnl)} gross. Your average winner was ${summary.averageWin === null ? 'unavailable' : exactMoney(summary.averageWin)} and average loser ${summary.averageLoss === null ? 'unavailable' : exactMoney(summary.averageLoss)}.`, prompt: 'Review the size of your wins and losses alongside their frequency.' },
    { title: 'Inspect the strongest recorded hour', label: 'ENTRY TIMING · IST', body: bestHour ? `${bestHour.label} entries contributed ${exactMoney(bestHour.grossPnl)} across ${bestHour.slices} slices. This is the highest gross contribution among your recorded entry-hour groups, even if the amount is negative.` : 'There are no entry-hour groups.', prompt: 'Compare the underlying executions and sample counts. A historical ranking does not establish a profitable edge.' },
    { title: 'Review the difficult stretch', label: 'GROSS DRAWDOWN', body: `The largest decline from a previous closed-slice cumulative peak was ${exactMoney(summary.maxDrawdown)}. This excludes open market values, account capital and broker costs.`, prompt: 'Review the executions in losing periods and record what changed in your process.' },
    { title: 'Compare option types with context', label: 'CONTRACT TYPE', body: options.map(group => `${group.label}: ${exactMoney(group.grossPnl)} across ${group.slices} slices`).join(' · '), prompt: 'Compare sample sizes, instruments and entry times before attributing the difference to CE or PE.' },
    { title: 'Keep the source limits visible', label: 'DATA COMPLETENESS', body: `${result.positions.length} unmatched lots remain in the imported history. Broker charges, planned stops/targets and intratrade market prices have not been supplied.`, prompt: 'Tradebook data alone cannot establish revenge trading, missed targets, MFE/MAE or rule violations.' },
  ];
  return <><p className="inline-notice">Computed observations from your saved executions. These are descriptive reviews, not AI-generated advice or predictions.</p><div className="two-col insights-grid">{observations.map((item, index) => <Card key={item.title}><div className="spread"><span className="eyebrow">{item.label}</span><span className="insight-number">{String(index + 1).padStart(2, '0')}</span></div><h2>{item.title}</h2><p>{item.body}</p><p className="review-question">{item.prompt}</p><Link className="text-link" href={journalHref}>Inspect saved executions →</Link></Card>)}</div></>;
}
