'use client';
import {useState} from 'react';
export function PrintControls({backHref}:{backHref:string}){
 const [error,setError]=useState('');
 return <div className="print-toolbar"><div className="action-row"><button className="button primary" onClick={()=>{setError('');try{window.print();}catch{setError('Print could not open. Use your browser’s Print command.');}}}>Print / Save PDF</button><a className="button secondary" href={backHref}>Back to Reports</a></div><p>Use your browser’s Save as PDF destination to keep a file. No file is sent to a PDF provider.</p>{error&&<p role="alert">{error}</p>}</div>;
}
