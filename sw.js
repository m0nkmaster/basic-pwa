'use strict';

const CACHE_VERSION = 1;
const TEMPLATE_URL = 'template.html'
const DATA_URL = 'data/stories.json'
const CURRENT_CACHES = {
  data: 'data-cache-v' + CACHE_VERSION,
  templates: 'templates-cache-v' + CACHE_VERSION
};

self.addEventListener('install', event => {
  event.waitUntil(
    // We can't use cache.add() here, since we want OFFLINE_URL to be the cache key, but
    // the actual URL we end up requesting might include a cache-busting parameter.
    fetch(TEMPLATE_URL).then(function(response) {
      return caches.open(CURRENT_CACHES.templates).then(function(cache) {
        return cache.put(TEMPLATE_URL, response);
      });
    })
  );

  event.waitUntil(
    // We can't use cache.add() here, since we want OFFLINE_URL to be the cache key, but
    // the actual URL we end up requesting might include a cache-busting parameter.
    fetch(DATA_URL).then(function(response) {
      return caches.open(CURRENT_CACHES.data).then(function(cache) {
        return cache.put(DATA_URL, response);
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  // Active worker won't be treated as activated until promise resolves successfully.
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) == -1) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', event => {
    console.log('Handling fetch event for', event.request.url);

    // Handle stories
    if (event.request.url.match(/stories\/[\d]+\.html/i)) {
        event.respondWith(
          fetch(event.request).catch(error => {
            // The catch is only triggered if fetch() throws an exception, which will most likely
            // happen due to the server being unreachable.
            // If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
            // range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
            // errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response

            // 1) Get JSON, Get template, Replace placeholders in the template with the JSON, return to user

            console.log('Fetch failed; returning offline page instead.', error);

            // get html from cache
            //  {{headllines}} {{body}}

            //GET TEMPLATE FROM CACHE

            return caches.match(DATA_URL).then(data => {
                return data.json().then(function(json) {

                    var template = `
                    <html>
                      <head>
                        <title>{{headline}} - PWS - ServiceWorker</title>
                      </head>
                      <body>

                        <h1>{{headline}}</h1>

                        <p>{{body}}</p>
                      </body>
                    </html>
                    `;

                  // do something with your JSON
                  var final = template.replace("{{headline}}", json.stories["1234"].headline);
                  final = template.replace("{{body}}", json.stories["1234"].body);
                  return new Response(final, { "headers" : {"Content-Type" : "text/html" }});
                  //return caches.match(TEMPLATE_URL);
                });
            });

          })
        );
    }

});
