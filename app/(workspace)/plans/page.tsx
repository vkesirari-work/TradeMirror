import {getSignedInUser} from '@/lib/auth/session';
import {redirect} from 'next/navigation';
import {Card} from '@/components/ui/primitives';
import {PlanLibrary} from '@/components/trades/plan-library';
export default async function Plans(){if(!await getSignedInUser())redirect('/login');return <><div className="page-heading"><div><span className="eyebrow">YOUR SETUPS, YOUR QUESTIONS</span><h1>Trading plans.</h1><p>Reusable checklist templates; existing notes retain their own questions.</p></div></div><Card><PlanLibrary/></Card></>;}
