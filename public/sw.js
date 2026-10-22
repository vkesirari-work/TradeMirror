/* TradeMirror PWA: no private response, API, export, auth or account-data caching. */
const CACHE='trademirror-public-v2';
const ASSETS=['/offline.html','/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png','/icons/apple-touch-icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('trademirror-public-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(ASSETS.includes(url.pathname)&&!url.search){event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(url.pathname)||fetch(request);})());return;}
 if(request.mode==='navigate'&&!url.pathname.startsWith('/api/')&&!url.pathname.startsWith('/auth/')){
  event.respondWith((async()=>{try{return await fetch(request,{cache:'no-store'});}catch{return await caches.match('/offline.html')||new Response('TradeMirror needs an internet connection.',{status:503,headers:{'Content-Type':'text/plain'}});}})());
 }
});
