const CACHE = 'mis-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'postpaid-white.png', 'postpaid-black.png', 'prepaid-white.png', 'prepaid-black.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const big = u.pathname.endsWith('.wasm') || u.hostname === 'cdn.jsdelivr.net';
  if (big) { // model and engine: cache after first download
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(e.request)) || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })));
    return;
  }
  if (u.origin === location.origin) // app files: network first so updates show, cache when offline
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});
