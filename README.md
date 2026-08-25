# D7c Training – 10 Minuten zu Hause

Trainings-App für die D7c (Jungs, 11/12 Jahre). Kein Material, kein Lärm,
zu Hause trainierbar.

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

Übungen ohne Foto (kognitive Aufmerksamkeitsübungen) zeigen ein Icon statt
Bild.

## Daten

`training-data.json` ist die einzige Datenquelle für alle drei Päckchen
(Reihenfolge, Übungen, Zeiten, Cues). `app.js` rendert Startseite und
Training rein aus dieser Datei.

## Vereinsfarben

Gelb (`--yellow: #FFD400`) / Schwarz (`--ink: #0b0c0c`), definiert in
`styles.css`.

## Deployment

Alle Dateien liegen flach im Root und sind GitHub-Pages-tauglich
(`.nojekyll` vorhanden). PWA-fähig über `manifest.webmanifest` und
`service-worker.js`.
