# 10 Minuten on Top

Neun unterschiedliche Ganzkörpertrainings für 11- bis 12-jährige Jungs im eigenen Zimmer.

## Trainings

1. Ganzkörper Start
2. Kraft Basis
3. Schnell und leise
4. Beweglich und kraftvoll
5. Rumpf und Haltung
6. Beine und Balance
7. Reaktion und Tempo
8. Koordination
9. Reset und Fokus

Jede Einheit dauert exakt zehn Minuten: fünf Bewegungen in Runde eins, vier gesteigerte Bewegungen in Runde zwei und eine ruhige Schlussminute. Kraft, Beweglichkeit, Schnelligkeit, Balance und Konzentration werden mit unterschiedlichen Schwerpunkten verbunden.

Alle 54 Comicillustrationen zeigen dieselbe Figur in demselben Zimmer. Die Übungen brauchen keine Geräte und sind für wenig Platz ausgelegt.

## Technischer Aufbau

- `training.json` enthält alle neun Trainings mit je fünf Übungen und einem Abschluss.
- `app.js` steuert Übersicht, Trainingsseiten und den automatisch geführten Zehn-Minuten-Timer.
- `styles.css` enthält das responsive Layout für Smartphone und Desktop.
- `service-worker.js` macht die Anwendung nach dem ersten vollständigen Laden offline nutzbar.
- Die Trainings sind direkt über `#training-1` bis `#training-9` erreichbar.

Die Anwendung ist statisch und wird über GitHub Pages ausgeliefert.
