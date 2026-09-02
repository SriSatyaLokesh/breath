const CACHE_NAME = 'swaasa-pwa-v1';
const ASSETS_TO_CACHE = [
	'./',
	'./index.html',
	'./site.webmanifest',
	'./icon.svg',
	'./favicon-32x32.png',
	'./apple-touch-icon.png',
	'./pwa-192x192.png',
	'./pwa-512x512.png',
	'./maskable-icon-512x512.png',
	'./robots.txt',
	'./sitemap.xml'
];

// Install Event - Pre-cache core static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('[Service Worker] Pre-caching offline assets');
			return cache.addAll(ASSETS_TO_CACHE);
		}).then(() => self.skipWaiting())
	);
});

// Activate Event - Clean up stale old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== CACHE_NAME) {
						console.log('[Service Worker] Removing old cache:', cache);
						return caches.delete(cache);
					}
				})
			);
		}).then(() => self.clients.claim())
	);
});

// Fetch Event - Stale-While-Revalidate caching strategy for offline support
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
		return;
	}

	event.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(event.request).then((cachedResponse) => {
				const fetchPromise = fetch(event.request).then((networkResponse) => {
					if (networkResponse && networkResponse.status === 200) {
						cache.put(event.request, networkResponse.clone());
					}
					return networkResponse;
				}).catch(() => {
					return cachedResponse;
				});

				return cachedResponse || fetchPromise;
			});
		})
	);
});
