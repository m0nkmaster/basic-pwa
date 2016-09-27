var CACHE_NAME = 'm0nkmaster';
var urlsToCache = [
  '',
  'data/stories.json'
];

self.addEventListener('install', function(event) {
  // Perform install steps

  console.log("Hi I'm the service worker you've heard so much about");

  console.log('Doing cache setup');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  console.log("Fetch event happened");
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        console.log("Cache hit");
        if (response) {
          return response;
        }
        console.log("Cache miss");
        return fetch(event.request);
      }
    )
  );
});
