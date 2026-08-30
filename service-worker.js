const CACHE_NAME = "on-top-all-worlds-v2";
const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css?v=20260830-all-worlds-2",
  "./app.js?v=20260830-all-worlds-2",
  "./training.json?v=20260830-all-worlds-2",
  "./manifest.webmanifest",
  "./world.jpg?v=20260830-all-worlds-2",
  "./s01-kniebeuge.jpg?v=20260830-all-worlds-2",
  "./s01-rueckwaertsschritt.jpg?v=20260830-all-worlds-2",
  "./s01-einbeinige-beuge.jpg?v=20260830-all-worlds-2",
  "./s01-beckenheben.jpg?v=20260830-all-worlds-2",
  "./s02-fels-stehen.jpg?v=20260830-all-worlds-2",
  "./s02-starker-oberkoerper.jpg?v=20260830-all-worlds-2",
  "./s02-gewicht-verlagern.jpg?v=20260830-all-worlds-2",
  "./s02-stabil-bewegen.jpg?v=20260830-all-worlds-2",
  "./s03-tiefe-position.jpg?v=20260830-all-worlds-2",
  "./s03-seitlich-druecken.jpg?v=20260830-all-worlds-2",
  "./s03-stopp-halten.jpg?v=20260830-all-worlds-2",
  "./s03-vor-zurueck.jpg?v=20260830-all-worlds-2",
  "./s04-locker-werden.jpg?v=20260830-all-worlds-2",
  "./s04-gross-bewegen.jpg?v=20260830-all-worlds-2",
  "./s04-drehen.jpg?v=20260830-all-worlds-2",
  "./s04-fliessend-bewegen.jpg?v=20260830-all-worlds-2",
  "./s05-knie-hoch.jpg?v=20260830-all-worlds-2",
  "./s05-schnelle-fuesse.jpg?v=20260830-all-worlds-2",
  "./s05-seitlich-tippen.jpg?v=20260830-all-worlds-2",
  "./s05-schnell-ruhig.jpg?v=20260830-all-worlds-2",
  "./tiefe-hocke.jpg?v=20260830-all-worlds-2",
  "./seitenstuetze.jpg?v=20260830-all-worlds-2",
  "./beckenlift.jpg?v=20260830-all-worlds-2",
  "./superman.jpg?v=20260830-all-worlds-2",
  "./s07-startsignal.jpg?v=20260830-all-worlds-2",
  "./s07-richtung-waehlen.jpg?v=20260830-all-worlds-2",
  "./s07-drehen-bereit.jpg?v=20260830-all-worlds-2",
  "./s07-stopp.jpg?v=20260830-all-worlds-2",
  "./s08-einbeinstand.jpg?v=20260830-all-worlds-2",
  "./s08-blick-bewegen.jpg?v=20260830-all-worlds-2",
  "./s08-arme-bewegen.jpg?v=20260830-all-worlds-2",
  "./s08-balance-bewegung.jpg?v=20260830-all-worlds-2",
  "./s09-tiefe-hocke.jpg?v=20260830-all-worlds-2",
  "./s09-ruecken-rund-lang.jpg?v=20260830-all-worlds-2",
  "./s09-huefte-oeffnen.jpg?v=20260830-all-worlds-2",
  "./s09-kindstellung.jpg?v=20260830-all-worlds-2"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
