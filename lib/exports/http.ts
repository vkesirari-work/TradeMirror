export const privateExportHeaders={
 'Cache-Control':'private, no-store, max-age=0',
 'X-Content-Type-Options':'nosniff',
};
export function exportError(error:string,status:number){
 return Response.json({error},{status,headers:privateExportHeaders});
}
export function jsonAttachment(value:unknown,filename:string){
 if(!/^[a-z0-9-]+\.json$/.test(filename))throw new Error('Unsupported export filename.');
 return new Response(JSON.stringify(value,null,2),{headers:{...privateExportHeaders,
  'Content-Type':'application/json; charset=utf-8',
  'Content-Disposition':`attachment; filename="${filename}"`,
 }});
}
