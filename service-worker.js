const CACHE_NAME = "on-top-alle-trainings-v3";
const REVISION = "20260830-alle-trainings-v3";
const CORE_FILES = [
  "./",
  "./index.html",
  `./styles.css?v=${REVISION}`,
  `./app.js?v=${REVISION}`,
  `./training.json?v=${REVISION}`,
  "./manifest.webmanifest",
  `./t01-ausfallschritt-drehung.jpg?v=${REVISION}`,
  `./t01-kniebeuge-knieheben.jpg?v=${REVISION}`,
  `./t01-liegestuetz.jpg?v=${REVISION}`,
  `./t01-linienschritte.jpg?v=${REVISION}`,
  `./t01-standwaage.jpg?v=${REVISION}`,
  `./t01-atmung-fokus.jpg?v=${REVISION}`,
  `./s02-fels-stehen.jpg?v=${REVISION}`,
  `./s02-starker-oberkoerper.jpg?v=${REVISION}`,
  `./s02-gewicht-verlagern.jpg?v=${REVISION}`,
  `./s02-stabil-bewegen.jpg?v=${REVISION}`,
  `./s03-tiefe-position.jpg?v=${REVISION}`,
  `./s03-seitlich-druecken.jpg?v=${REVISION}`,
  `./s03-stopp-halten.jpg?v=${REVISION}`,
  `./s03-vor-zurueck.jpg?v=${REVISION}`,
  `./s04-locker-werden.jpg?v=${REVISION}`,
  `./s04-gross-bewegen.jpg?v=${REVISION}`,
  `./s04-drehen.jpg?v=${REVISION}`,
  `./s04-fliessend-bewegen.jpg?v=${REVISION}`,
  `./s05-knie-hoch.jpg?v=${REVISION}`,
  `./s05-schnelle-fuesse.jpg?v=${REVISION}`,
  `./s05-seitlich-tippen.jpg?v=${REVISION}`,
  `./s05-schnell-ruhig.jpg?v=${REVISION}`,
  `./tiefe-hocke.jpg?v=${REVISION}`,
  `./seitenstuetze.jpg?v=${REVISION}`,
  `./beckenlift.jpg?v=${REVISION}`,
  `./superman.jpg?v=${REVISION}`,
  `./s07-startsignal.jpg?v=${REVISION}`,
  `./s07-richtung-waehlen.jpg?v=${REVISION}`,
  `./s07-drehen-bereit.jpg?v=${REVISION}`,
  `./s07-stopp.jpg?v=${REVISION}`,
  `./s08-einbeinstand.jpg?v=${REVISION}`,
  `./s08-blick-bewegen.jpg?v=${REVISION}`,
  `./s08-arme-bewegen.jpg?v=${REVISION}`,
  `./s08-balance-bewegung.jpg?v=${REVISION}`,
  `./s09-tiefe-hocke.jpg?v=${REVISION}`,
  `./s09-ruecken-rund-lang.jpg?v=${REVISION}`,
  `./s09-huefte-oeffnen.jpg?v=${REVISION}`,
  `./s09-kindstellung.jpg?v=${REVISION}`
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
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
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
        if (!response || response.status !== 200 || response.type !== "basic") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
