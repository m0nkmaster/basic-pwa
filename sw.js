var CACHE_NAME = 'm0nkmaster';
var urlsToCache = [
  'data/stories.json'
];

self.addEventListener('install', function(event) {
  // Perform install steps - only happens once, at start

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

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'data/stories.json';
  if (e.request.url.indexOf(dataUrl) === 0) {
    // Put data handler code here
    console.log = 'We have a data request';
  } else {
    console.log = 'Not a JSON request, just let through';
    e.respondWith(
        caches.match(event.request).then(function(response) {
        if (response) {
          console.log('Found ' + e.request.url + ' response in cache:', response);
          return response;
        }
        console.log('No response found in cache. About to fetch from network...');

        return fetch(event.request).then(function(response) {
          console.log('Response from network is:', response);

          return response;
        }).catch(function(error) {
          console.error('Fetching failed:', error);

          throw error;
        });
      })
    )
  }
 });
