/* カード明細 支出分析 — Service Worker（オフライン動作用）
   明細データは一切キャッシュ・送信しません。アプリ本体の静的ファイルのみをキャッシュします。
   デプロイ後の取りこぼしを防ぐため、同一オリジンのGETは「ネットワーク優先・キャッシュ更新」。
   （オフライン時のみキャッシュにフォールバック） */
const CACHE = 'expense-v15';
const ASSETS = [
  'expense.html',
  'css/expense.css',
  'js/expense.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネットワーク優先：常に最新を取りに行き、成功したらキャッシュも更新。
// 失敗（オフライン）時のみキャッシュ、なければトップページを返す。
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 他オリジンは介入しない
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('expense.html')))
  );
});
