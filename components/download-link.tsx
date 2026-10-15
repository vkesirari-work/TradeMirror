'use client';
import {useId,useState} from 'react';
import {downloadRequested} from '@/lib/exports/feedback';
export function DownloadLink({href,children}:{href:string;children:React.ReactNode}){
 const [requestedHref,setRequestedHref]=useState<string|null>(null);const id=useId();const requested=requestedHref===href;
 return <span className="download-control"><a className="button secondary" href={href} aria-describedby={requested?id:undefined} onClick={()=>setRequestedHref(href)}>{children}</a>{requested&&<span id={id} role="status" className="download-feedback">{downloadRequested}</span>}</span>;
}
