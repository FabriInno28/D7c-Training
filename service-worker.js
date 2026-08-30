const CACHE_NAME = "on-top-all-nine-v1";
const REVISION = "20260830-all-nine-v1";

const IMAGE_FILES = [
  "t01-ausfallschritt-drehung.jpg",
  "t01-kniebeuge-knieheben.jpg",
  "t01-liegestuetz.jpg",
  "t01-linienschritte.jpg",
  "t01-standwaage.jpg",
  "t01-atmung-fokus.jpg",
  "t02-kniebeuge-fersenheben.jpg",
  "t02-baerenstand-schultertip.jpg",
  "t02-bruecke-beinwechsel.jpg",
  "t02-bergsteiger.jpg",
  "t02-seitstuetz-armoeffnung.jpg",
  "t02-ausatmen.jpg",
  "t03-hueftoeffner.jpg",
  "t03-skater-halt.jpg",
  "t03-stuetz-seitwaertsschritt.jpg",
  "t03-quadrat-schritte.jpg",
  "t03-sprinterstand.jpg",
  "t03-puls-beruhigen.jpg",
  "t04-tiefe-kniebeuge-streckung.jpg",
  "t04-walkout.jpg",
  "t04-seitlicher-ausfallschritt.jpg",
  "t04-sprinter-wechsel.jpg",
  "t04-schwimmer.jpg",
  "t04-langer-ruecken.jpg",
  "t05-vierfuessler-welle.jpg",
  "t05-dead-bug.jpg",
  "t05-seitstuetz-durchdrehen.jpg",
  "t05-baeren-schritte.jpg",
  "t05-knie-ellbogen-sprint.jpg",
  "t05-bauchatmung.jpg",
  "t06-sprunggelenk-wippe.jpg",
  "t06-wandsitz-fersenheben.jpg",
  "t06-einbeiniger-beckenlift.jpg",
  "t06-seitliche-tipp-schritte.jpg",
  "t06-flieger-armzug.jpg",
  "t06-beine-locker.jpg",
  "t07-drehschritt-armzug.jpg",
  "t07-tief-stopp.jpg",
  "t07-kniehebelauf-freeze.jpg",
  "t07-zwei-schritte-seitlich.jpg",
  "t07-plank-handwechsel.jpg",
  "t07-blickpunkt.jpg",
  "t08-cross-crawl.jpg",
  "t08-rueckstuetz-griff.jpg",
  "t08-bird-dog.jpg",
  "t08-boxer-schritte.jpg",
  "t08-uhrzeiger-stand.jpg",
  "t08-rueckwaerts-zaehlen.jpg",
  "t09-kniestand-stand.jpg",
  "t09-inchworm-schultertip.jpg",
  "t09-90-90-hueftwechsel.jpg",
  "t09-boxerfuesse.jpg",
  "t09-ganzkoerperstreckung.jpg",
  "t09-vier-ein-sechs-aus.jpg"
];

const CORE_FILES = [
  "./",
  "./index.html",
  `./styles.css?v=${REVISION}`,
  `./app.js?v=${REVISION}`,
  `./training.json?v=${REVISION}`,
  "./manifest.webmanifest",
  ...IMAGE_FILES.map(file => `./${file}?v=${REVISION}`)
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
