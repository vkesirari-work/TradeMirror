'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GrossDay } from '@/lib/analytics/daily';
import { exactMoney } from '@/lib/analytics/format';

export function PerformanceCalendar({ days, selected, onSelect }: {
  days: GrossDay[]; selected: string; onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(() => (days.at(-1)?.date || new Date().toISOString().slice(0, 10)).slice(0, 7));
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthNumber - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const byDate = new Map(days.map(day => [day.date, day]));
  function move(direction: number) {
    setMonth(new Date(Date.UTC(year, monthNumber - 1 + direction, 1)).toISOString().slice(0, 7));
  }
  return <><div className="calendar-heading">
    <div><h3>{first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h3><small>Exit dates · IST · realized gross</small></div>
    <div className="calendar-controls"><button aria-label="Previous calendar month" className="icon-button" onClick={() => move(-1)}><ChevronLeft size={18}/></button><button aria-label="Next calendar month" className="icon-button" onClick={() => move(1)}><ChevronRight size={18}/></button></div>
  </div><div className="performance-calendar">
    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span className="calendar-weekday" key={day}>{day}</span>)}
    {Array.from({ length: offset }, (_, i) => <div className="calendar-blank" key={'blank-' + i}/>)}
    {Array.from({ length: total }, (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, '0')}`;
      const data = byDate.get(date);
      return <button key={date} disabled={!data} aria-pressed={selected === date}
        aria-label={`${date}: ${data ? exactMoney(data.grossPnl) + ', ' + data.slices + ' FIFO slices' : 'no matched exits'}`}
        className={`calendar-day ${data ? data.grossPnl.startsWith('-') ? 'loss-day' : data.grossPnl === '0' ? 'flat-day' : 'win-day' : ''} ${selected === date ? 'chosen' : ''}`}
        onClick={() => onSelect(selected === date ? '' : date)}>
        <span>{i + 1}</span><b>{data ? exactMoney(data.grossPnl) : '—'}</b><small>{data ? data.slices + ' slices' : 'No exits'}</small>
      </button>;
    })}
  </div><p className="fineprint">Click an active day to inspect its matching slices. Blank days have no matched exits in the selected history.</p></>;
}
