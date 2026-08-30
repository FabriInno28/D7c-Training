# 10 Minuten on Top

Auslieferbare Trainingswelt für Fussballerinnen und Fussballer von 10 bis 12 Jahren.

## Aktueller Umfang

Die Weltkarte ist der Einstieg und führt zu neun Trainingsstationen:

1. Fester Stand
2. Starker Körper
3. Zweikampf bereit
4. Beweglich bleiben
5. Schnell wie eine Welle
6. Stark wie ein Fels
7. Reaktionskünstler
8. Balance-Profi
9. Runterfahren

Jede Station enthält vier Übungen und einen ruhigen Abschluss. Die insgesamt 36 Übungen verwenden eine durchgängige Figur, eigenständige Landschaften und stationsbezogene Farbakzente.

## Technischer Aufbau

- `training.json` enthält alle neun Trainings und ihre Übungen.
- `app.js` steuert Weltkarte, Routen, Timer, Signaltöne und Abschlüsse.
- `styles.css` enthält das responsive Layout für Smartphone und Desktop.
- `service-worker.js` macht Weltkarte, Trainings und alle Illustrationen nach dem ersten vollständigen Laden offline nutzbar.
- Die Trainings sind direkt über `#training-1` bis `#training-9` erreichbar.

Die Anwendung ist statisch und wird über GitHub Pages ausgeliefert.
