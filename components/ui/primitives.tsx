import type { ReactNode } from 'react';
import { CheckCheck, Clock3, ArrowUpRight } from 'lucide-react';
import type { ReportStatus } from '@/types';
export function StatusBadge({status}:{status:ReportStatus}) { return <span className={`badge ${status==='FINAL'?'green':'amber'}`}>{status==='FINAL'?<CheckCheck size={12}/>:<Clock3 size={12}/>} {status==='FINAL'?'Finalized':'Provisional'}</span>; }
export function Card({children,className=''}:{children:ReactNode;className?:string}) {return <section className={`card ${className}`}>{children}</section>;}
export function SectionTitle({title,subtitle,action}:{title:string;subtitle?:string;action?:ReactNode}) {return <div className="section-title"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>;}
export function Metric({label,value,note,positive}:{label:string;value:string;note?:string;positive?:boolean}) {return <Card className="metric"><div className="metric-label">{label}<ArrowUpRight size={15}/></div><strong className={positive===undefined?'':positive?'positive':'negative'}>{value}</strong><span>{note||'Sample trading data'}</span></Card>;}
export function EmptyState({title,body}:{title:string;body:string}) {return <Card className="empty"><h2>{title}</h2><p>{body}</p></Card>;}
