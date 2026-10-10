import {reviewRange} from '@/lib/journal/range';
import {sliceIdentity} from '@/lib/journal/annotation';
import { AccountJournal } from '@/components/trades/account-journal';
import { Card } from '@/components/ui/primitives';
import { advancedDemo } from '@/data/advanced-demo';
export default async function DemoJournal({searchParams}:{searchParams:Promise<{day?:string;tag?:string;start?:string;end?:string}>}){
 const {day,tag,start,end}=await searchParams;const range=reviewRange([],start,end);const initialDay=day&&/^\d{4}-\d{2}-\d{2}$/.test(day)?day:'';
 return <><div className="page-heading"><div><span className="eyebrow">SYNTHETIC EXECUTION HISTORY</span><h1>Explore the journal.</h1><p>Try search, filters and CSV export with illustrative data.</p></div></div><Card><AccountJournal demo key={initialDay+':'+(tag||'')+':'+range.start+':'+range.end} result={advancedDemo} initialDay={initialDay} initialStart={range.start} initialEnd={range.end} initialTag={tag?.slice(0,40)} initialTags={Object.fromEntries(advancedDemo.matches.map((m,i)=>[sliceIdentity(m),i%3===0?['breakout']:i%3===1?['planned exit']:[]]))}/></Card></>;
}
