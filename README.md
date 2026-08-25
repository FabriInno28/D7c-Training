# D7c Training – 10 Minuten zu Hause

Trainings-App für die D7c (Jungs, 11/12 Jahre). Kein Material, kein Lärm,
zu Hause trainierbar. Komplett eigenes Design, keine Stockfotos – alle
Übungen sind selbst gezeichnete SVG-Piktogramme (`icons.js`) in den
Vereinsfarben Gelb/Schwarz.

## Struktur

- 3 feste Trainings-Päckchen zur Auswahl: **Training A / B / C**.
- Jedes Päckchen enthält genau 4 Übungen, je eine aus:
  Kraft · Schnellkraft · Balance · Aufmerksamkeit.
- 3 Runden pro Päckchen, kurze Pausen zwischen Übungen und Runden.
- Jedes Päckchen endet mit einer Atemübung.
- Sichtbarer Timer führt durch die ganze Session (auch einzelne Übungen
  separat startbar).
- Keine Level, keine Challenges, keine Fortschrittsanzeige – bewusst eine
  feste, gute Auswahl statt Steigerung, damit strukturiert trainiert werden
  kann.

## Dateien

- `training-data.json` – einzige Datenquelle für alle drei Päckchen
  (Reihenfolge, Übungen, Zeiten, Cues, Icon-Zuordnung).
- `icons.js` – Bibliothek aller Übungs-Piktogramme (reines SVG, kein
  Bild-Asset nötig).
- `app.js` – rendert Startseite und Training rein aus `training-data.json`
  und `icons.js`, steuert den Timer.
- `styles.css` – dunkles Design, Gelb (`--yellow: #FFD400`) als Akzent auf
  Schwarz (`--bg: #0b0c0c`).

## Deployment

Alle Dateien liegen flach im Root und sind GitHub-Pages-tauglich
(`.nojekyll` vorhanden). PWA-fähig über `manifest.webmanifest` und
`service-worker.js`.
