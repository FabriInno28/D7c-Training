const CACHE_NAME = "on-top-all-worlds-v1";
const CORE_FILES = [
  "./",
  "./index.html",
  "./styles.css?v=20260830-all-worlds",
  "./app.js?v=20260830-all-worlds",
  "./training.json?v=20260830-all-worlds",
  "./manifest.webmanifest",
  "./world.jpg?v=20260830-all-worlds",
  "./s01-kniebeuge.jpg?v=20260830-all-worlds",
  "./s01-rueckwaertsschritt.jpg?v=20260830-all-worlds",
  "./s01-einbeinige-beuge.jpg?v=20260830-all-worlds",
  "./s01-beckenheben.jpg?v=20260830-all-worlds",
  "./s02-fels-stehen.jpg?v=20260830-all-worlds",
  "./s02-starker-oberkoerper.jpg?v=20260830-all-worlds",
  "./s02-gewicht-verlagern.jpg?v=20260830-all-worlds",
  "./s02-stabil-bewegen.jpg?v=20260830-all-worlds",
  "./s03-tiefe-position.jpg?v=20260830-all-worlds",
  "./s03-seitlich-druecken.jpg?v=20260830-all-worlds",
  "./s03-stopp-halten.jpg?v=20260830-all-worlds",
  "./s03-vor-zurueck.jpg?v=20260830-all-worlds",
  "./s04-locker-werden.jpg?v=20260830-all-worlds",
  "./s04-gross-bewegen.jpg?v=20260830-all-worlds",
  "./s04-drehen.jpg?v=20260830-all-worlds",
  "./s04-fliessend-bewegen.jpg?v=20260830-all-worlds",
  "./s05-knie-hoch.jpg?v=20260830-all-worlds",
  "./s05-schnelle-fuesse.jpg?v=20260830-all-worlds",
  "./s05-seitlich-tippen.jpg?v=20260830-all-worlds",
  "./s05-schnell-ruhig.jpg?v=20260830-all-worlds",
  "./tiefe-hocke.jpg?v=20260830-all-worlds",
  "./seitenstuetze.jpg?v=20260830-all-worlds",
  "./beckenlift.jpg?v=20260830-all-worlds",
  "./superman.jpg?v=20260830-all-worlds",
  "./s07-startsignal.jpg?v=20260830-all-worlds",
  "./s07-richtung-waehlen.jpg?v=20260830-all-worlds",
  "./s07-drehen-bereit.jpg?v=20260830-all-worlds",
  "./s07-stopp.jpg?v=20260830-all-worlds",
  "./s08-einbeinstand.jpg?v=20260830-all-worlds",
  "./s08-blick-bewegen.jpg?v=20260830-all-worlds",
  "./s08-arme-bewegen.jpg?v=20260830-all-worlds",
  "./s08-balance-bewegung.jpg?v=20260830-all-worlds",
  "./s09-tiefe-hocke.jpg?v=20260830-all-worlds",
  "./s09-ruecken-rund-lang.jpg?v=20260830-all-worlds",
  "./s09-huefte-oeffnen.jpg?v=20260830-all-worlds",
  "./s09-kindstellung.jpg?v=20260830-all-worlds"
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
