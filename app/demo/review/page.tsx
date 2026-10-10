import { AccountReview } from '@/components/dashboard/account-review';
import { advancedDemo } from '@/data/advanced-demo';
export default function DemoReview(){return <><div className="page-heading"><div><span className="eyebrow">COMPUTED DEMO REVIEW</span><h1>Your history, explained.</h1><p>See how recorded metrics become specific questions for a review.</p></div></div><AccountReview result={advancedDemo} journalHref="/demo/trades"/></>;}
