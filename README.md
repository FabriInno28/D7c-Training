# 10 Minuten on Top

Zehn Minuten Ganzkörpertraining für 11 bis 12 Jährige im eigenen Zimmer.

## Aktueller Umfang

Die neue Einstiegsseite führt zu neun Trainingseinheiten. Training 1 ist vollständig im neuen System umgesetzt:

1. Ganzkörper Start
2. Starker Körper
3. Zweikampf bereit
4. Beweglich bleiben
5. Schnell wie eine Welle
6. Stark wie ein Fels
7. Reaktionskünstler
8. Balance-Profi
9. Runterfahren

Training 1 kombiniert Beweglichkeit, Kraft, Schnelligkeit, Balance und Fokus in einem automatisch geführten Ablauf von exakt zehn Minuten. Fünf neue, zusammenhängende Comicillustrationen und ein eigenes Schlussmotiv zeigen die Bewegungen im selben Zimmer mit derselben Figur.

Trainings 2 bis 9 bleiben als bisherige Versionen erreichbar und sind in der Oberfläche klar als noch nicht überarbeitet gekennzeichnet.

## Technischer Aufbau

- `training.json` enthält alle neun Trainings und ihre Übungen.
- `app.js` steuert Einstiegsseite, Routen, den durchgehenden Zehn Minuten Ablauf, Signaltöne und die bisherigen Einzeltrainer.
- `styles.css` enthält das responsive Layout für Smartphone und Desktop.
- `service-worker.js` macht Einstiegsseite, Trainings und Illustrationen nach dem ersten vollständigen Laden offline nutzbar.
- Die Trainings sind direkt über `#training-1` bis `#training-9` erreichbar.

Die Anwendung ist statisch und wird über GitHub Pages ausgeliefert.
