import { AccountJournal } from '@/components/trades/account-journal';
import { Card } from '@/components/ui/primitives';
import { advancedDemo } from '@/data/advanced-demo';
export default async function DemoJournal({searchParams}:{searchParams:Promise<{day?:string}>}){
 const {day}=await searchParams;const initialDay=day&&/^\d{4}-\d{2}-\d{2}$/.test(day)?day:'';
 return <><div className="page-heading"><div><span className="eyebrow">SYNTHETIC EXECUTION HISTORY</span><h1>Explore the journal.</h1><p>Try search, filters and CSV export with illustrative data.</p></div></div><Card><AccountJournal key={initialDay} result={advancedDemo} initialDay={initialDay}/></Card></>;
}
