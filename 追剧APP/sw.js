// Service Worker for 追剧 PWA
const CACHE_NAME = 'zhuiju-v2';
const ASSETS = [
  '/zhuiju.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/hls.js@1',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 对 API 请求不做缓存，直接走网络
  if (event.request.url.includes('api.apibdzy.com') ||
      event.request.url.includes('allorigins') ||
      event.request.url.includes('corsproxy') ||
      event.request.url.includes('cors-anywhere')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // 只缓存静态资源
        if (response.ok && (event.request.url.includes('.js') || event.request.url.includes('.css') || event.request.url.includes('.png') || event.request.url.includes('.ico'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
