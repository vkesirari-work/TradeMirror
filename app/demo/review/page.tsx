import {StrategyReview} from '@/components/dashboard/strategy-review';
import {sliceIdentity} from '@/lib/journal/annotation';
import { AccountReview } from '@/components/dashboard/account-review';
import { advancedDemo } from '@/data/advanced-demo';
export default function DemoReview(){return <><div className="page-heading"><div><span className="eyebrow">COMPUTED DEMO REVIEW</span><h1>Your history, explained.</h1><p>See how recorded metrics become specific questions for a review.</p></div></div><StrategyReview demo matches={advancedDemo.matches} tags={Object.fromEntries(advancedDemo.matches.map((m,i)=>[sliceIdentity(m),i%3===0?['breakout']:i%3===1?['planned exit']:[]]))}/><AccountReview result={advancedDemo} journalHref="/demo/trades"/></>;}
