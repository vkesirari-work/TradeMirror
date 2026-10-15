import {getSignedInUser} from '@/lib/auth/session';
import {redirect} from 'next/navigation';
import {KiteSync} from '@/components/brokers/kite-sync';
export default async function Connections(){const user=await getSignedInUser();if(!user)redirect('/login');const enabled=process.env.TRADEMIRROR_ENABLE_KITE_SYNC==='true'&&process.env.KITE_ALLOWED_USER_ID===user.id&&Boolean(process.env.KITE_API_KEY&&process.env.KITE_ACCESS_TOKEN&&process.env.KITE_BROKER_USER_ID);return <><div className="page-heading"><div><span className="eyebrow">IMPORT CONNECTIONS</span><h1>Broker connections.</h1><p>Visible previews and explicit saves.</p></div></div><KiteSync enabled={enabled}/></>;}
