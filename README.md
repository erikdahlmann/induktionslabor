# Induktionslabor – Änderung des Magnetfelds oder der Fläche

Selbstlern-Website für eine Unterrichtsstunde (Physik Oberstufe) zum Kapitel
„Induktion durch Änderung des Magnetfelds oder der Fläche“.

## Aufbau der Seite

Die Seite ist in **Reiter** aufgeteilt (Theorie, Labor, Auswertung, Aufgaben, Hintergrund, Export).
Der Reiter steht im URL-Hash, `#labor` öffnet also direkt den Versuch.

1. **Theorie** – magnetischer Fluss, Induktionsgesetz, vier Animationen
   (Fluss, B(t) → U(t), Flächenänderung, Lenzsche Regel), Selbstcheck mit vier Fragen.
2. **Labor (3D, WebGL)** – Feldspule mit Dreieck-/Sinus-/Gleichstrom, Induktionsspule im Inneren,
   Hall-Sonde, Netzgerät mit Display, analoges Voltmeter, Oszilloskop-Spur.
   Zweiter Modus: Leiterschleife wird aus einem Magnetfeld gezogen.
3. **Auswertung** – Messtabelle, U-Ḃ-Diagramm, Ausgleichsgerade, Vergleich der Steigung mit n·A.
4. **Aufgaben** – fünf Aufgaben mit Selbstkontrolle (Toleranz 2–3 %) und Lösungsweg.
5. **Hintergrund** – Alltagsbeispiele mit Illustrationen, Geschichte, typische Fehler.
6. **Export** – PDF-Druck, HTML-Datei, CSV der Messwerte, Zwischenstand im Browser.

## Bilder

Sechs Illustrationen von ChatGPT über Codex. Prompts in `_planung/bildprompts.md`,
Rohdateien (1536 × 1024 PNG) in `_planung/bilder-roh/` – beides nicht im Repo.
Im Repo liegen nur die verkleinerten JPEGs in `bilder/`:

```
sips -s format jpeg -s formatOptions 72 -Z 1280 _planung/bilder-roh/01-titel.png --out bilder/titel.jpg
```

## Physikalisches Modell

- Feldspule: N = 1000 Windungen auf l = 30 cm, B = µ₀·N/l·I (≈ 4,19 mT pro Ampere).
- Dreieckstrom: Ḃ = 2·f·B_max, Sinus: Ḃ_max = 2πf·B_max.
- Induzierte Spannung: U = −n·A·Ḃ beziehungsweise U = −n·B·b·v.
- Beim Übernehmen eines Messwerts wird ein Rauschen von ±2 % addiert,
  damit die Ausgleichsgerade eine echte Aufgabe bleibt.

Mit der Spule n = 150, A = 21 cm² und f = 0,12 Hz ergibt sich Ḃ ≈ 1,2 mT/s und U ≈ 380 µV –
dieselbe Größenordnung wie im Schulbuchversuch.

## Technik

- Eine `index.html`, Module in `js/`, Stil in `css/stil.css`.
- `lib/three.module.js` (Three.js), `lib/jsm/controls/OrbitControls.js`, `lib/katex/` – alles lokal.
- ES-Module brauchen einen Webserver, nicht per Doppelklick öffnen.

Vorschau starten:

```
python3 -m http.server 8884 --directory .
```

Dann http://localhost:8884 öffnen. Eintrag `induktionslabor` in `~/Claude/.claude/launch.json`.

Zum Vorführen liegt der Simulationszustand unter `window.labor.zustand`.
