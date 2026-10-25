const BUILD="11e081c54cfa9b70-gh10";
const CACHE="my-compass-app-"+BUILD;
const BASE=new URL("./",self.location).pathname;
const REL=["offline.html","offline.js","offline.css","ics-export.js","ics-export.js?v=10","manifest.webmanifest","manifest.webmanifest?v=7","favicon.svg","apple-touch-icon.png","apple-touch-icon.png?v=6","icons/icon-152.png","icons/icon-167.png","icons/icon-152.png?v=6","icons/icon-167.png?v=6","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
const KEYS=REL.map(p=>BASE+p);
self.addEventListener("install",event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{
  for(const key of KEYS){
   const response=await fetch(key,{cache:"reload"});
   if(!response.ok)throw new Error("Offline asset unavailable: "+key);
   const headers=new Headers(response.headers);headers.delete("content-encoding");headers.delete("content-length");
   await cache.put(key,new Response(await response.arrayBuffer(),{status:200,headers}));
  }
 }catch(error){await caches.delete(CACHE);throw error;}
 if(!self.registration.active)await self.skipWaiting();
})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith("my-compass-app-")&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener("message",event=>{if(event.data==="SKIP_WAITING")void self.skipWaiting();});
self.addEventListener("fetch",event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
 const key=url.pathname+url.search;
 if(KEYS.includes(key)||KEYS.includes(url.pathname)){event.respondWith((async()=>{const cache=await caches.open(CACHE);return (await cache.match(key))||(await cache.match(url.pathname))||fetch(request);})());return;}
 if(request.mode==="navigate"&&(!/\.[^/]+$/.test(url.pathname)||url.pathname===BASE+"index.html")){event.respondWith((async()=>{const c=await caches.open(CACHE);return (await c.match(BASE+"offline.html"))||fetch(request);})());}
});
