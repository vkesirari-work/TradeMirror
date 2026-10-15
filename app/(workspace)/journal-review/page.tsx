import {redirect} from 'next/navigation';
import {getSignedInUser} from '@/lib/auth/session';
import Link from 'next/link';
import {exportJournal} from '@/app/journal/export';
import {readReviewExport} from '@/lib/journal/review';
import {JournalReview} from '@/components/trades/journal-review';
export const dynamic='force-dynamic';
export default async function SavedJournal(){
 if(!await getSignedInUser())redirect('/login');
 const response=await exportJournal();let entries;try{if(response.data)entries=readReviewExport(response.data);}catch{ /* Fail closed: no partial review. */ }
 return <><div className="page-heading"><div><span className="eyebrow">YOUR SAVED DECISIONS</span><h1>Journal review.</h1><p>Private notes, tags and retained evidence.</p></div><Link className="button secondary" href="/trades">Open execution journal</Link></div>{entries?<JournalReview entries={entries}/>:<p className="inline-notice" role="alert">{response.error||'Saved journal review could not be validated. No partial entries are shown. Refresh to retry.'}</p>}</>;
}
