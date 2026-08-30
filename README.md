# 10 Minuten on Top

Zehn Minuten Ganzkörpertraining für 11 bis 12 Jährige im eigenen Zimmer.

## Aktueller Umfang

Die neue Einstiegsseite führt zu neun vollständig ausgearbeiteten Ganzkörpertrainings:

1. Ganzkörper Start
2. Stabil und schnell
3. Kraft in Bewegung
4. Mobil und wach
5. Beine und Tempo
6. Starke Mitte
7. Reaktion und Kontrolle
8. Leicht und stabil
9. Ruhig und beweglich

Alle Trainings kombinieren Kraft, Beweglichkeit, Schnelligkeit, Balance und Fokus in einem automatisch geführten Ablauf von exakt zehn Minuten. Die Übungsübersichten erklären Ausgangsposition, Bewegung, Qualitätsmerkmal und Seitenwechsel ausführlich. Während des Timers bleiben die Hinweise kurz und direkt. Trainings 2 bis 9 beginnen mit einer geführten Startminute, führen zweimal durch vier Bewegungen und enden mit einer ruhigen Schlussminute.

## Technischer Aufbau

- `training.json` enthält alle neun Trainings und ihre Übungen.
- `app.js` steuert Einstiegsseite, Routen, den durchgehenden Zehn Minuten Ablauf, Signaltöne und die bisherigen Einzeltrainer.
- `styles.css` enthält das responsive Layout für Smartphone und Desktop.
- `service-worker.js` macht Einstiegsseite, Trainings und Illustrationen nach dem ersten vollständigen Laden offline nutzbar.
- Die Trainings sind direkt über `#training-1` bis `#training-9` erreichbar.

Die Anwendung ist statisch und wird über GitHub Pages ausgeliefert.
