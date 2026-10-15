export const privateExportHeaders={
 'Cache-Control':'private, no-store, max-age=0',
 'X-Content-Type-Options':'nosniff',
};
function escapeHtml(value:string){return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
type ErrorContext={request:Request;backHref:'/reports'|'/demo/reports'|'/settings'|'/costs';backLabel:string};
export function exportError(error:string,status:number,context?:ErrorContext){
 const headers={...privateExportHeaders,Vary:'Accept'};
 if(!context?.request.headers.get('accept')?.includes('text/html'))return Response.json({error},{status,headers});
 const url=new URL(context.request.url);
 const retry=escapeHtml(url.pathname+url.search);
 const action=status===401?'<a href="/login">Log in</a>':`<a href="${retry}">Retry download</a>`;
 const body=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Download unavailable | TradeMirror</title><style>body{margin:0;background:#0e1528;color:#e5e9f4;font:16px/1.7 system-ui,sans-serif}main{max-width:620px;margin:10vh auto;padding:28px}h1{line-height:1.2;font-size:30px}p{color:#c0c9dd;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:12px;color:#20143f;background:#c4b5fd;text-decoration:none}a:focus-visible{outline:3px solid white;outline-offset:4px}.back{background:#25304b;color:#e5e9f4}</style></head><body><main><p>TradeMirror · ${status}</p><h1>${status===401?'Log in to download':'Download unavailable'}</h1><p>${escapeHtml(error)}</p><p>No file was downloaded. Your saved data is unchanged.</p><div class="actions">${action}<a class="back" href="${context.backHref}">${escapeHtml(context.backLabel)}</a></div></main></body></html>`;
 return new Response(body,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}});
}
export function jsonAttachment(value:unknown,filename:string){
 if(!/^[a-z0-9-]+\.json$/.test(filename))throw new Error('Unsupported export filename.');
 return new Response(JSON.stringify(value,null,2),{headers:{...privateExportHeaders,
  'Content-Type':'application/json; charset=utf-8',
  'Content-Disposition':`attachment; filename="${filename}"`,
 }});
}
