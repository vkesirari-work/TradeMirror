'use client';
import { useState } from 'react';
import { Link2,ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
export function BrokerCard(){const [notice,setNotice]=useState(false);return <Card className="broker-card"><div className="spread"><div className="broker-logo">Z</div><span className="badge neutral">Not connected</span></div><h2>Zerodha</h2><p>Bring your executed trades into one clear view. Automatic syncing will be available in a future phase.</p><div className="broker-features"><span><Link2 size={15}/>Broker-ready architecture</span><span><ArrowUpRight size={15}/>Provisional → finalized reports</span></div><button className="button secondary full-width" onClick={()=>setNotice(true)}>Connect Zerodha <ArrowUpRight size={15}/></button>{notice&&<p className="inline-notice" role="status">Broker connections aren’t available in this preview. No account or credentials are requested.</p>}<small>More brokers coming soon.</small></Card>;}
