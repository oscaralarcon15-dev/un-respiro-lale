'use strict';
const CACHE_NAME='lale-shell-d7532a719ad0';
const SHELL=['./','./index.html','./lale-offline.html'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('lale-shell-') && key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  const base=new URL('./',self.location.href);
  if(url.origin!==base.origin || ![base.pathname,base.pathname+'index.html',base.pathname+'lale-offline.html'].includes(url.pathname)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try {
      const response=await fetch(request);
      if(!response.ok) throw new Error('Page unavailable');
      if((response.headers.get('Content-Type')||'').includes('text/html')) await cache.put(request,response.clone());
      return response;
    } catch(error) {
      const saved=await cache.match(request,{ignoreSearch:true}) || await cache.match(new URL('./',base).href) || await cache.match(new URL('index.html',base).href);
      if(saved) return saved;
      throw error;
    }
  })());
});
