import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{stripTypeScriptTypes}from'node:module';
const uri=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const daily=uri((await readFile(new URL('../lib/analytics/daily.ts',import.meta.url),'utf8')).replace(/^import type .*;$/gm,''));
const source=(await readFile(new URL('../lib/analytics/advanced.ts',import.meta.url),'utf8')).replace(/^import type .*;$/gm,'').replace("'./daily'",JSON.stringify(daily));
const{advancedSummary,filterMatches,breakdown,reportPeriods}=await import(uri(source));
const match=(id,pnl,day='2026-10-07')=>({id:String(id),symbol:'NIFTY26OCT25000CE',broker:'ZERODHA',side:'LONG',quantity:'75',entryPrice:'100',exitPrice:'101',entryId:'entry-'+id,exitId:'exit-'+id,entryTime:day+'T09:00:00+05:30',exitTime:day+'T09:'+String(id+10).padStart(2,'0')+':00+05:30',grossPnl:pnl});
test('advanced metrics retain exact gross values and define closed-slice drawdown, averages and profit factor',()=>{
 const summary=advancedSummary([match(1,'100','2026-10-05'),match(2,'-150','2026-10-06'),match(3,'50','2026-10-07')]);
 assert.equal(summary.grossPnl,'0');assert.equal(summary.grossProfit,'150');assert.equal(summary.grossLoss,'150');assert.equal(summary.profitFactor,'1.00');assert.equal(summary.averageWin,'75');assert.equal(summary.averageLoss,'-150');assert.equal(summary.expectancy,'0');assert.equal(summary.maxDrawdown,'150');assert.equal(summary.winRate,'66.7');assert.equal(summary.bestDay.date,'2026-10-05');assert.equal(summary.worstDay.date,'2026-10-06');assert.equal(summary.averageHoldMinutes,'12.0');
 const precise=advancedSummary([match(1,'99999999999999.99'),match(2,'-99999999999999.98'),match(3,'0.00000001')]);assert.equal(precise.grossPnl,'0.01000001');assert.equal(precise.expectancy,'0.00333334');
});
test('empty, all-flat and no-loss scopes avoid invented ratios and averages',()=>{
 const empty=advancedSummary([]);assert.equal(empty.winRate,null);assert.equal(empty.profitFactor,null);assert.equal(empty.expectancy,null);assert.equal(empty.bestDay,null);
 const win=advancedSummary([match(1,'1')]);assert.equal(win.profitFactor,null);assert.equal(win.averageLoss,null);assert.equal(win.maxDrawdown,'0');
 const flat=advancedSummary([match(1,'0')]);assert.equal(flat.breakeven,1);assert.equal(flat.averageWin,null);assert.equal(flat.profitFactor,null);
});
test('filters use IST exit dates without rematching and breakdowns use IST entry time and exact totals',()=>{
 const rows=[match(1,'1'),{...match(2,'-2'),symbol:'SENSEX26OCT80000PE',side:'SHORT',entryTime:'2026-10-07T18:45:00Z',exitTime:'2026-10-07T19:00:00Z'}];
 const filtered=filterMatches(rows,{start:'2026-10-08',end:'2026-10-08',symbol:'',side:'SHORT',option:'PE'});assert.equal(filtered.length,1);assert.equal(filtered[0],rows[1]);
 assert.deepEqual(breakdown(filtered,'weekday'),[{label:'Thursday',slices:1,wins:0,grossPnl:'-2'}]);assert.equal(breakdown(filtered,'hour')[0].label,'00:00–01:00');assert.equal(breakdown(rows,'option').reduce((n,r)=>n+Number(r.grossPnl),0),-1);
 assert.equal(filterMatches(rows,{start:'2026-10-09',end:'2026-10-01',symbol:'',side:'',option:''}).length,0);
});

test('weekly reports respect Monday boundaries and IST exit dates without changing source slices',()=>{
 const rows=[match(1,'1','2026-10-04'),match(2,'2','2026-10-05'),{...match(3,'3'),exitTime:'2026-10-11T18:45:00Z'}];
 const weeks=reportPeriods(rows,'weekly');assert.deepEqual(weeks.map(w=>[w.date,w.summary.grossPnl]),[['2026-10-12','3'],['2026-10-05','2'],['2026-09-28','1']]);assert.equal(weeks[0].rows[0],rows[2]);assert.equal(reportPeriods(rows,'daily')[0].date,'2026-10-12');
});
