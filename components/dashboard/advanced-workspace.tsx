'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, CalendarDays, ChartNoAxesCombined, Download, Info, SlidersHorizontal } from 'lucide-react';
import { Card, Metric, SectionTitle } from '@/components/ui/primitives';
import { advancedSummary, brokerPerformance, breakdown, filterMatches, type Dimension } from '@/lib/analytics/advanced';
import { tradingDate } from '@/lib/analytics/daily';
import { displayMoney as exactMoney } from '@/lib/analytics/format';
import { exportMatchedCsv } from '@/lib/analytics/export';
import type { MatchingResult } from '@/lib/analytics/matching';
import { AccountChart } from './account-chart';
import {PeriodComparison} from './period-comparison';
import { PerformanceCalendar } from './performance-calendar';

const dimensions: { value: Dimension; label: string }[] = [
  { value: 'instrument', label: 'Instruments' }, { value: 'option', label: 'CE / PE' },
  { value: 'hour', label: 'Entry hour' }, { value: 'weekday', label: 'Entry weekday' }, { value: 'side', label: 'Long / short' }, { value: 'holding', label: 'Holding time' },
];
export function AdvancedWorkspace({ result, includeExample = false, demo = false }: {
  result: MatchingResult; includeExample?: boolean; demo?: boolean;
}) {
  const [start, setStart] = useState(''), [end, setEnd] = useState('');
  const [symbol, setSymbol] = useState(''), [side, setSide] = useState(''), [option, setOption] = useState('');
  const [tab, setTab] = useState('overview'), [dimension, setDimension] = useState<Dimension>('instrument');
  const [selectedDay, setSelectedDay] = useState('');
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [metricInfoOpen,setMetricInfoOpen]=useState(false);
  const symbols = useMemo(() => [...new Set(result.matches.map(match => match.symbol))].sort(), [result.matches]);
  const filtered = useMemo(() => filterMatches(result.matches, { start, end, symbol, side, option }), [result.matches, start, end, symbol, side, option]);
  const brokers = useMemo(() => brokerPerformance(filtered), [filtered]);
  const summary = useMemo(() => advancedSummary(filtered), [filtered]);
  const rows = useMemo(() => breakdown(filtered, dimension), [filtered, dimension]);
  const dayMatches = selectedDay ? filtered.filter(match => tradingDate(match.exitTime) === selectedDay) : [];
  const invalidRange = !!start && !!end && start > end;
  function reset() { setStart(''); setEnd(''); setSymbol(''); setSide(''); setOption(''); setSelectedDay(''); }
  function download() {
    const url = URL.createObjectURL(new Blob([exportMatchedCsv(filtered)], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'trademirror-analysis.csv';
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const journalLink = `${demo ? '/demo/trades' : '/trades'}?${new URLSearchParams({ ...(includeExample ? { examples: 'include' } : {}), ...(selectedDay ? { day: selectedDay } : {}) })}`;
  return <div className="advanced-workspace">
    <Card className="analysis-filter-card"><div className="analysis-filter-title"><SlidersHorizontal size={16}/><b>Analysis scope</b><span className="analysis-scope-count">{filtered.length === result.matches.length ? `${filtered.length} matched slices` : `${filtered.length} / ${result.matches.length} slices`}</span>{[start,end,symbol,side,option,selectedDay].some(Boolean) && <button className="text-button scope-reset" onClick={reset}>Reset filters</button>}<div className="metric-info" onMouseEnter={()=>setMetricInfoOpen(true)} onMouseLeave={()=>setMetricInfoOpen(false)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setMetricInfoOpen(false);}} onKeyDown={event=>{if(event.key==='Escape')setMetricInfoOpen(false);}}><button type="button" className="metric-info-button" aria-label="How these metrics are calculated" aria-expanded={metricInfoOpen} aria-controls="metric-calculation-info" onFocus={()=>setMetricInfoOpen(true)} onClick={()=>setMetricInfoOpen(true)}><Info size={16}/><span>Metrics</span></button><div id="metric-calculation-info" className="metric-info-popover" hidden={!metricInfoOpen}><div className="metric-info-heading"><strong>How metrics work</strong><button type="button" className="text-button" aria-label="Close metric information" onClick={()=>setMetricInfoOpen(false)}>Close</button></div><p>FIFO matching runs on the complete selected import history before exit-date filters. Money uses exact decimal arithmetic; averages round to eight decimal places and profit factor to two. Win rate uses matching slices, not independent trades. Drawdown starts at zero and follows closed-slice gross P&L in exit order; simultaneous exits use a deterministic tie break. It excludes open mark-to-market P&L, account capital and charges. Historical patterns do not predict future performance.</p></div></div></div>
      <button className="button secondary scope-toggle" aria-expanded={filtersOpen} aria-controls="analysis-scope-fields" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16}/>{filtersOpen?'Hide filters':'Filters & export'}{[start,end,symbol,side,option].filter(Boolean).length>0&&<span className="scope-count">{[start,end,symbol,side,option].filter(Boolean).length}</span>}</button><div id="analysis-scope-fields" className={filtersOpen?'analysis-filters mobile-expanded':'analysis-filters'}>
        <label>Exit date from<input type="date" value={start} onChange={event => { setStart(event.target.value); setSelectedDay(''); }}/></label>
        <label>Exit date to<input type="date" value={end} min={start || undefined} onChange={event => { setEnd(event.target.value); setSelectedDay(''); }}/></label>
        <label>Instrument<select value={symbol} onChange={event => { setSymbol(event.target.value); setSelectedDay(''); }}><option value="">All instruments</option>{symbols.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Option type<select value={option} onChange={event => { setOption(event.target.value); setSelectedDay(''); }}><option value="">All types</option><option>CE</option><option>PE</option><option>Other</option></select></label>
        <label>Position side<select value={side} onChange={event => { setSide(event.target.value); setSelectedDay(''); }}><option value="">All sides</option><option>LONG</option><option>SHORT</option></select></label>
        <button className="button secondary" disabled={!filtered.length} onClick={download}><Download size={14}/>Export scope</button>
      </div>{invalidRange && <p role="alert">Choose an end date on or after the start date.</p>}
    </Card>
    <div className="analysis-tabs" role="tablist" aria-label="Performance workspace">
      {[['overview', 'Overview', ChartNoAxesCombined], ['calendar', 'Calendar', CalendarDays], ['breakdowns', 'Breakdowns', Activity], ['comparison', 'Compare periods', CalendarDays]].map(([value, label, Icon]) => {
        const TabIcon = Icon as typeof Activity;
        return <button key={value as string} role="tab" aria-selected={tab === value} className={tab === value ? 'selected' : ''} onClick={() => setTab(value as string)}><TabIcon size={16}/>{label as string}</button>;
      })}
    </div>
    {!filtered.length && <Card><SectionTitle title="No matched exits in this scope" subtitle="Adjust filters or save more executions. Open imported quantities are shown separately below."/></Card>}
    <div className="metric-grid advanced-metrics">
      <Metric label="Realized gross P&L" value={exactMoney(summary.grossPnl)} positive={!summary.grossPnl.startsWith('-')} note="Filtered matched exits · before charges"/>
      <Metric label="Win rate" value={summary.winRate === null ? '—' : summary.winRate + '%'} note={`${summary.wins} wins / ${summary.losses} losses / ${summary.breakeven} flat`}/>
      <Metric label="Profit factor" value={summary.profitFactor || (summary.wins ? 'No losses' : '—')} note="Gross winning P&L ÷ absolute losing P&L"/>
      <Metric label="Avg P&L per slice" value={summary.expectancy === null ? '—' : exactMoney(summary.expectancy)} note="Average gross result · before charges"/>
      {!demo && <>
      <Metric label="Average winner" value={summary.averageWin === null ? '—' : exactMoney(summary.averageWin)} note="Winning FIFO slices · before charges"/>
      <Metric label="Average loser" value={summary.averageLoss === null ? '—' : exactMoney(summary.averageLoss)} note="Losing FIFO slices · before charges"/>
      <Metric label="Max gross drawdown" value={filtered.length ? exactMoney(summary.maxDrawdown) : '—'} note="Closed-slice cumulative decline · not account equity"/>
      <Metric label="Average holding time" value={summary.averageHoldMinutes === null ? '—' : summary.averageHoldMinutes + ' min'} note={`${summary.slices} slices across ${summary.activeDays} exit days`}/>
      </>}
    </div>
    {tab === 'overview' && <>
      <div className="analysis-main-grid"><Card><SectionTitle title={demo ? "Gross performance" : "Your gross performance curve"} subtitle="Daily and cumulative results · IST exit dates"/><AccountChart days={summary.days}/></Card>
        <Card className="distribution-card"><SectionTitle title={demo ? "Win / loss" : "Outcome distribution"} subtitle="FIFO slices, not whole positions"/><div className="distribution-total"><strong>{summary.slices}</strong><span>matched slices</span></div><div className="outcome-track" aria-label={`${summary.wins} winning, ${summary.losses} losing, ${summary.breakeven} breakeven`}><span style={{ flex: summary.wins }} className="wins"/><span style={{ flex: summary.losses }} className="losses"/><span style={{ flex: summary.breakeven }} className="flats"/></div><dl className="analysis-key-values"><div><dt>Winning slices</dt><dd className="positive">{summary.wins}</dd></div><div><dt>Losing slices</dt><dd className="negative">{summary.losses}</dd></div>{!demo && <><div><dt>Gross winning P&L</dt><dd>{exactMoney(summary.grossProfit)}</dd></div><div><dt>Gross losing P&L</dt><dd>{exactMoney(summary.grossLoss === '0' ? '0' : '-' + summary.grossLoss)}</dd></div><div><dt>Net P&L</dt><dd>{demo?'Unavailable in demo':<Link className="text-link" href="/costs">Review broker statements →</Link>}</dd></div></>}</dl><Link className="text-link" href={journalLink}>Open execution journal →</Link></Card></div>
      <div className="analysis-highlight-grid">{[
        { label: 'Best day', date: summary.bestDay?.date, value: summary.bestDay?.grossPnl },
        { label: 'Worst day', date: summary.worstDay?.date, value: summary.worstDay?.grossPnl },
      ].map(item => <Card key={item.label}><small>{item.label}</small><strong className={`highlight-value ${item.value?.startsWith('-') ? 'negative' : 'positive'}`}>{item.value === undefined ? '—' : exactMoney(item.value)}</strong><p>{item.date ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(item.date+'T00:00:00Z')) : 'No matched exits'} · IST exit date</p></Card>)}
      <Card><small>Trading days</small><strong className="highlight-value day-balance"><span className="positive">{summary.greenDays} profit</span><span className="day-divider">/</span><span className="negative">{summary.redDays} loss</span></strong><p>{summary.activeDays - summary.greenDays - summary.redDays} breakeven · {summary.activeDays} active days</p></Card></div>
      <div className={demo ? 'demo-support-grid' : 'account-support-stack'}><Card><SectionTitle title="By broker" subtitle="Realized P&L · before charges"/>
        <div className="broker-performance-grid">{brokers.map(row => <article className="broker-performance-item" key={row.broker}>
          <div className="broker-performance-heading"><h3>{row.broker === 'DEMO' ? 'Demo broker' : row.broker}</h3><span>{row.slices} slices{demo ? ' · sample' : ''}</span></div>
          <dl><div><dt>Profit</dt><dd className="positive">{exactMoney(row.grossProfit)}</dd></div>
          <div><dt>Loss</dt><dd className={row.grossLoss === '0' ? '' : 'negative'}>{exactMoney(row.grossLoss === '0' ? '0' : '-' + row.grossLoss)}</dd></div>
          <div className="broker-performance-total"><dt>Total gross</dt><dd className={row.grossPnl.startsWith('-') ? 'negative' : row.grossPnl === '0' ? '' : 'positive'}>{exactMoney(row.grossPnl)}</dd></div></dl>
          <p>{row.wins} wins · {row.losses} losses{row.breakeven ? ` · ${row.breakeven} flat` : ''}</p>
        </article>)}</div>{!brokers.length && <p className="fineprint">No broker results in this scope. Import executions to see their broker here.</p>}

      </Card>
      <Card><SectionTitle title="Instrument contribution" subtitle="Contracts ranked by realized gross P&L"/><BreakdownTable rows={breakdown(filtered, 'instrument').slice(0, demo ? 5 : 8)} onInstrument={value => { setSymbol(value); setTab('breakdowns'); }}/></Card></div>
    </>}
    {tab === 'calendar' && <Card><SectionTitle title="Trading calendar" subtitle="See the day, then inspect the executions behind it"/><PerformanceCalendar days={summary.days} selected={selectedDay} onSelect={setSelectedDay}/>
      {selectedDay && <div className="calendar-detail"><SectionTitle title={selectedDay + ' · execution review'} subtitle={`${dayMatches.length} matched slices in the current scope`} action={<button className="text-button" onClick={() => setSelectedDay('')}>Close day</button>}/><div className="table-scroll"><table><thead><tr><th>Instrument</th><th>Side</th><th>Quantity</th><th>Gross P&L</th></tr></thead><tbody>{dayMatches.slice(0, 25).map(match => <tr key={match.id}><td>{match.symbol}</td><td>{match.side}</td><td>{match.quantity}</td><td className={match.grossPnl.startsWith('-') ? 'negative' : 'positive'}>{exactMoney(match.grossPnl)}</td></tr>)}</tbody></table></div><p className="fineprint">Showing the first 25 slices for this day.</p><Link className="button secondary" href={journalLink}>Open this day in journal →</Link></div>}
    </Card>}
    {tab === 'breakdowns' && <Card><SectionTitle title="Find your performance patterns" subtitle="Observed gross results; comparisons do not prove an edge"/><div className="tabs" role="tablist" aria-label="Breakdown dimension">{dimensions.map(item => <button role="tab" aria-selected={dimension === item.value} className={dimension === item.value ? 'selected' : ''} onClick={() => setDimension(item.value)} key={item.value}>{item.label}</button>)}</div><BreakdownTable rows={rows} onInstrument={dimension === 'instrument' ? setSymbol : undefined}/><p className="fineprint">Entry hour and weekday use IST entry timestamps. Option type comes from the contract suffix; unsupported names are Other. Win rates include breakeven slices in the denominator. Holding time measures elapsed entry-to-exit time per FIFO slice, including nights and weekends. Each interval includes its lower boundary and excludes its upper boundary; invalid or reversed timestamps are Unavailable. These are historical groups, not recommended exit times.</p></Card>}
    {tab === 'comparison' && <PeriodComparison includeExample={includeExample} matches={filtered} journalHref={demo ? '/demo/trades' : '/trades'}/>}

  </div>;
}
function BreakdownTable({ rows, onInstrument }: { rows: ReturnType<typeof breakdown>; onInstrument?: (value: string) => void }) {
  const max = Math.max(1, ...rows.map(row => Math.abs(Number(row.grossPnl))));
  return <div className="table-scroll"><table className="breakdown-table"><thead><tr><th>Group</th><th>Gross contribution</th><th>FIFO slices</th><th>Win rate</th><th>Gross P&L</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><td>{onInstrument ? <button className="text-button" onClick={() => onInstrument(row.label)}>{row.label}</button> : row.label}</td><td><div className="contribution-track"><span className={row.grossPnl.startsWith('-') ? 'losses' : 'wins'} style={{ width: Math.max(2, Math.abs(Number(row.grossPnl)) / max * 100) + '%' }}/></div></td><td>{row.slices}</td><td>{(row.wins / row.slices * 100).toFixed(1)}%</td><td className={row.grossPnl.startsWith('-') ? 'negative' : 'positive'}>{exactMoney(row.grossPnl)}</td></tr>)}</tbody></table>{!rows.length && <p>No matching slices in this scope.</p>}</div>;
}
