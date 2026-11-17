const BUILD = '1794566028';
const CODE = 'nexa-code-' + BUILD;
const MEDIA = 'nexa-media';
const ALL_FILES = [
"./assets/css/typefaces.css",
"./assets/audio/warm-fireplace.mp3",
"./assets/audio/calm-lofi.mp3",
"./assets/audio/ocean-waves.mp3",
"./assets/audio/soft-rain.mp3",
"./assets/audio/deep-space.mp3",
"./assets/css/board.css",
"./assets/css/nexa.css",
"./assets/img/backdrop.svg",
"./assets/img/nexa-favicon.ico",
"./assets/img/scene-aurora.webp",
"./assets/img/scene-dawn.webp",
"./assets/img/scene-starfield.webp",
"./assets/img/scene-sunset.webp",
"./assets/img/emblem.webp",
"./assets/img/nexa-badge-96.png",
"./assets/img/nexa-icon-256.png",
"./assets/img/nexa-icon-512.png",
"./assets/img/nexa-icon-64.png",
"./assets/img/nexa-notif-192.png",
"./assets/img/nexa-tab-32.png",
"./assets/img/nexa-tab-64.png",
"./assets/img/greeting-bg.webp",
"./assets/js/preload.js",
"./assets/js/board-host.js",
"./assets/js/board-stickers.js",
"./assets/js/board-engine.js",
"./assets/js/nexa.js",
"./assets/js/pdf-core.js",
"./assets/js/push-settings.js",
"./assets/js/color-picker.js",
"./assets/js/pdf-worker.js",
"./assets/js/vendor/docx-reader.js",
"./assets/js/vendor/pdf-editor.js",
"./index.html",
"./app.webmanifest",
"./version.json"
];
const PRECACHE = ['./', './index.html'];
const MEDIA_RE = /\.(?:mp3|ogg|wav|m4a|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|otf|mp4|webm)$/i;
const CODE_RE = /\.(?:html|js|css|webmanifest|json)$/i;
const RECHECK_MS = 12 * 60 * 60 * 1000;
const MEDIA_WAIT = 15000;

const CODE_FILES = Array.from(new Set(ALL_FILES.concat(PRECACHE))).filter(f => f === './' || (f !== './version.json' && CODE_RE.test(f)));
const MEDIA_FILES = ALL_FILES.filter(f => f !== './version.json' && !CODE_RE.test(f));

const SCOPE = self.registration.scope;
const ALLOWED = new Set(ALL_FILES.concat(['./', './index.html']).map(f => new URL(f, SCOPE).pathname));
const stripQuery = u => { const x = new URL(u); x.search = ''; x.hash = ''; return x.href; };

async function pruneCaches() {
  let removed = 0;
  for (const name of [CODE, MEDIA]) {
    const cache = await caches.open(name);
    for (const k of await cache.keys()) {
      const u = new URL(k.url);
      if (u.search || !ALLOWED.has(u.pathname)) { if (await cache.delete(k)) removed++; }
    }
  }
  return removed;
}

async function fillMedia() {
  const media = await caches.open(MEDIA);
  await Promise.allSettled(MEDIA_FILES.map(async f => {
    const req = new Request(f, { mode: 'same-origin' });
    if (await media.match(req)) return;
    const res = await fetch(f, { cache: 'reload' });
    if (res.ok) await media.put(req, stamp(res));
  }));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await caches.delete(CODE);
    try {
      const entries = await Promise.all(CODE_FILES.map(async f => {
        const res = await fetch(f, { cache: 'reload' });
        if (!res.ok) throw new Error('install ' + f + ' ' + res.status);
        return [f, res];
      }));
      const code = await caches.open(CODE);
      for (const [f, res] of entries) await code.put(new Request(f, { mode: 'same-origin' }), res);
    } catch (e) {
      await caches.delete(CODE);
      throw e;
    }
    await Promise.race([fillMedia().catch(() => {}), new Promise(r => setTimeout(r, MEDIA_WAIT))]);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CODE && k !== MEDIA).map(k => caches.delete(k)));
    await pruneCaches().catch(() => {});
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  const d = event.data || {};
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
  else if (d.type === 'PRUNE') {
    const port = event.ports && event.ports[0];
    event.waitUntil(pruneCaches().then(n => { if (port) port.postMessage({ removed: n }); }).catch(() => { if (port) port.postMessage({ removed: 0 }); }));
  }
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/version.json')) return;

  if (req.headers.has('range')) {
    event.respondWith(rangeResponse(req));
    return;
  }

  const isCode = req.mode === 'navigate' || CODE_RE.test(url.pathname) || url.pathname.endsWith('/');
  if (isCode) event.respondWith(codeResponse(req));
  else if (MEDIA_RE.test(url.pathname)) event.respondWith(staleWhileRevalidate(req, MEDIA, RECHECK_MS));
});

function stamp(res) {
  if (!res || res.type === 'opaque' || !res.body) return res;
  const headers = new Headers(res.headers);
  headers.set('x-nx-time', String(Date.now()));
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

async function codeResponse(req) {
  const cache = await caches.open(CODE);
  const fresh = req.cache === 'no-cache' || req.cache === 'reload' || req.cache === 'no-store';
  let hit = await cache.match(req, { ignoreSearch: true });
  if (!hit && req.mode === 'navigate') hit = await cache.match('./index.html');
  if (hit && !fresh) return hit;
  try {
    return await fetch(req);
  } catch (e) {
    if (hit) return hit;
    throw e;
  }
}

async function staleWhileRevalidate(req, name, maxAge) {
  const cache = await caches.open(name);
  const hit = await cache.match(stripQuery(req.url));
  if (hit) {
    const t = Number(hit.headers.get('x-nx-time') || 0);
    if (!maxAge || Date.now() - t < maxAge) return hit;
  }
  const net = fetch(req, maxAge ? { cache: 'no-cache' } : undefined).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(stripQuery(req.url), maxAge ? stamp(res.clone()) : res.clone());
    return res;
  }).catch(() => hit);
  return hit || net;
}

async function rangeResponse(req) {
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(stripQuery(req.url));
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (!hit || !m) return fetch(req);
  const buf = await hit.arrayBuffer();
  const size = buf.byteLength;
  let start = m[1] === '' ? size - Number(m[2]) : Number(m[1]);
  let end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (!(start >= 0) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Length': String(end - start + 1),
      'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
      'Accept-Ranges': 'bytes'
    }
  });
}

const NOTIF_ICON = './assets/img/nexa-notif-192.png?v=8';
const NOTIF_BADGE = './assets/img/nexa-badge-96.png?v=8';

function kvOp(mode, fn) {
  return new Promise((ok, no) => {
    const open = indexedDB.open('nexa-sw', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('kv');
    open.onerror = () => no(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('kv', mode);
      const req = fn(tx.objectStore('kv'));
      tx.oncomplete = () => { db.close(); ok(req && req.result); };
      tx.onerror = tx.onabort = () => { db.close(); no(tx.error); };
    };
  });
}
const kvGet = k => kvOp('readonly', s => s.get(k)).catch(() => undefined);
const kvPut = (k, v) => kvOp('readwrite', s => s.put(v, k)).catch(() => {});

async function showDueReminders() {
  const sched = await kvGet('sched');
  if (!sched || !Array.isArray(sched.items)) return;
  const fired = (await kvGet('fired')) || {};
  const now = Date.now();
  let changed = false;
  for (const it of sched.items) {
    if (!it || fired[it.key]) continue;
    if (now >= it.ts && now < it.ts + (it.win || 0)) {
      const missed = it.msg2 && now - it.ts > 30 * 60000;
      try {
        await self.registration.showNotification('NEXA', {
          body: missed ? it.msg2 : it.msg,
          tag: it.tag,
          icon: NOTIF_ICON,
          badge: NOTIF_BADGE,
          lang: sched.lang || 'en',
          dir: sched.lang === 'ar' ? 'rtl' : 'ltr',
          vibrate: [200, 100, 200],
          renotify: true,
          requireInteraction: !!it.ri,
          data: { go: it.go || null }
        });
        fired[it.key] = 1;
        changed = true;
      } catch (e) {}
    }
  }
  if (changed) await kvPut('fired', fired);
}

self.addEventListener('periodicsync', event => {
  if (event.tag === 'nexa-check') event.waitUntil(showDueReminders());
});


self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = {}; }
  event.waitUntil((async () => {
    if (d.key) {
      const f = (await kvGet('fired')) || {};
      f[d.key] = 1;
      await kvPut('fired', f);
    }
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.some(c => c.visibilityState === 'visible')) return;
    await self.registration.showNotification('NEXA', {
      body: d.body || 'NEXA',
      tag: d.tag || 'nexa-push',
      icon: NOTIF_ICON,
      badge: NOTIF_BADGE,
      lang: d.lang || 'en',
      dir: d.lang === 'ar' ? 'rtl' : 'ltr',
      vibrate: [200, 100, 200],
      renotify: true,
      requireInteraction: !!d.ri,
      data: { go: d.go || null }
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const go = (event.notification.data && event.notification.data.go) || null;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) {
      try { await c.focus(); } catch (e) {}
      c.postMessage({ type: 'go', go });
      return;
    }
    const w = await self.clients.openWindow('./');
    if (w) setTimeout(() => { try { w.postMessage({ type: 'go', go }); } catch (e) {} }, 2000);
  })());
});
