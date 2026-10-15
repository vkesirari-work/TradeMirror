import {createHash} from 'node:crypto';
import {advancedDemo} from '@/data/advanced-demo';
import {sliceIdentity} from '@/lib/journal/annotation';
import {JournalReview} from '@/components/trades/journal-review';
import type {ReviewEntry} from '@/lib/journal/review';
export default function DemoSavedJournal(){const entries:ReviewEntry[]=advancedDemo.matches.slice(0,3).map((match,i)=>({slice_key:createHash('sha256').update(sliceIdentity(match)).digest('hex'),notes:['Waited for confirmation before entry.','Review why I changed the exit.','Illustrative retained note without current evidence.'][i],tags:i===0?['breakout']:['review'],plan_items:['Entry confirmed','Risk budget recorded'],checklist:[i===0,i!==1],revision:1,evidence:i===2?null:match,connection:i===2?'unlinked':'linked'}));return <><div className="page-heading"><div><span className="eyebrow">SYNTHETIC JOURNAL REVIEW</span><h1>Review recorded decisions.</h1><p>Three illustrative entries. No account reads or writes.</p></div></div><JournalReview demo entries={entries}/></>;}
