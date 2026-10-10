import {ReviewRange} from '@/components/dashboard/review-range';
import {reviewRange} from '@/lib/journal/range';
import {StrategyReview} from '@/components/dashboard/strategy-review';
import {sliceIdentity} from '@/lib/journal/annotation';
import { AccountReview } from '@/components/dashboard/account-review';
import { advancedDemo } from '@/data/advanced-demo';
export default async function DemoReview({searchParams}:{searchParams:Promise<{start?:string;end?:string}>}){const query=await searchParams;const range=reviewRange(advancedDemo.matches,query.start,query.end);return <><div className="page-heading"><div><span className="eyebrow">COMPUTED DEMO REVIEW</span><h1>Your history, explained.</h1><p>See how recorded metrics become specific questions for a review.</p></div></div><ReviewRange start={range.start} end={range.end} error={range.error} href="/demo/review"/><StrategyReview start={range.start} end={range.end} demo error={range.error} matches={range.matches} tags={Object.fromEntries(advancedDemo.matches.map((m,i)=>[sliceIdentity(m),i%3===0?['breakout']:i%3===1?['planned exit']:[]]))}/><AccountReview result={advancedDemo} journalHref="/demo/trades"/></>;}
